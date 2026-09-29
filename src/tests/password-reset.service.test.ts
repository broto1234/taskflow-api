import { afterEach, describe, it, expect } from 'vitest';
import prisma from '../lib/prisma.js';
import { createPasswordResetToken, requestPasswordReset, resetPassword,} from '../services/password-reset.service.js';
import bcrypt from 'bcryptjs';

describe('Password Reset Service', () => {
  afterEach(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: 'reset-',
        },
      },
    });
  });

  it('should create a password reset token', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Reset Test User',
        email: `reset-${Date.now()}@example.com`,
        password: 'hashed-password',
      },
    });

    const resetToken = await createPasswordResetToken(user.id);

    expect(resetToken.token).toBeDefined();
    expect(resetToken.token).toHaveLength(64);
    expect(resetToken.userId).toBe(user.id);

    expect(resetToken.expiresAt.getTime()).toBeGreaterThan(
      Date.now(),
    );
  });

  it('should create a reset token for an existing user', async () => {
    const email = `reset-request-${Date.now()}@example.com`;

    const user = await prisma.user.create({
      data: {
        name: 'Reset Request User',
        email,
        password: 'hashed-password',
      },
    });

    const resetToken = await requestPasswordReset(email);

    expect(resetToken).toBeDefined();
    expect(resetToken?.userId).toBe(user.id);
    expect(resetToken?.token).toHaveLength(64);
  });

  it('should return undefined for a non-existent email', async () => {
    const result = await requestPasswordReset(
      'does-not-exist@example.com',
    );

    expect(result).toBeUndefined();
  });

  it('should reset the user password with a valid token', async () => {
    const email = `reset-password-${Date.now()}@example.com`;
    const oldPassword = 'old-password';
    const newPassword = 'new-password';

    const user = await prisma.user.create({
      data: {
        name: 'Reset Password User',
        email,
        password: await bcrypt.hash(oldPassword, 10),
      },
    });

    const resetToken = await createPasswordResetToken(user.id);

    await resetPassword(resetToken.token, newPassword);

    const deletedToken = await prisma.passwordResetToken.findUnique({
      where: {
        token: resetToken.token,
      },
    });

    expect(deletedToken).toBeNull();

    const updatedUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    expect(updatedUser).toBeDefined();
    expect(
      await bcrypt.compare(newPassword, updatedUser!.password),
    ).toBe(true);
  });

  it('should reject an expired reset token', async () => {
    const email = `reset-expired-${Date.now()}@example.com`;

    const user = await prisma.user.create({
      data: {
        name: 'Expired Token User',
        email,
        password: 'hashed-password',
      },
    });

    const expiredToken = await prisma.passwordResetToken.create({
      data: {
        token: `expired-${Date.now()}`,
        userId: user.id,
        expiresAt: new Date(Date.now() - 1000),
      },
    });

    await expect(
      resetPassword(expiredToken.token, 'new-password'),
    ).rejects.toThrow('Invalid or expired reset token');
  });

  it('should reject an invalid reset token', async () => {
    await expect(
      resetPassword(
        'this-token-does-not-exist',
        'new-password',
      ),
    ).rejects.toThrow('Invalid or expired reset token');
  });
});
