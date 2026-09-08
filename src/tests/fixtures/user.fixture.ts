import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma.js';

export const TEST_USERS = {
  john: {
    name: 'John Primary',
    email: 'john@exampleq.com',
    password: 'secret123',
    role: 'USER' as const,
  },
  otherUser: {
    name: 'John Secondary',
    email: 'john@example.com',
    password: 'secret123',
    role: 'USER' as const,
  },
  admin: {
    name: 'Satyo',
    email: 'satyo@gmail.com',
    password: 'password123',
    role: 'ADMIN' as const,
  },
};

export async function createTestUsers() {

  await prisma.task.deleteMany({
    where: {
      user: {
        email: {
          in: [
            TEST_USERS.john.email,
            TEST_USERS.otherUser.email,
            TEST_USERS.admin.email,
          ],
        },
      },
    },
  });

  await prisma.auditLog.deleteMany({
    where: {
      user: {
        email: {
          in: [
            TEST_USERS.john.email,
            TEST_USERS.otherUser.email,
            TEST_USERS.admin.email,
          ],
        },
      },
    },
  });


  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          TEST_USERS.john.email,
          TEST_USERS.otherUser.email,
          TEST_USERS.admin.email,
        ],
      },
    },
  });

  const johnPassword = await bcrypt.hash(TEST_USERS.john.password, 10);
  const otherUserPassword = await bcrypt.hash(
    TEST_USERS.otherUser.password,
    10
  );
  const adminPassword = await bcrypt.hash(TEST_USERS.admin.password, 10);

  const john = await prisma.user.create({
    data: {
      name: TEST_USERS.john.name,
      email: TEST_USERS.john.email,
      password: johnPassword,
      role: TEST_USERS.john.role,
    },
  });

  const otherUser = await prisma.user.create({
    data: {
      name: TEST_USERS.otherUser.name,
      email: TEST_USERS.otherUser.email,
      password: otherUserPassword,
      role: TEST_USERS.otherUser.role,
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: TEST_USERS.admin.name,
      email: TEST_USERS.admin.email,
      password: adminPassword,
      role: TEST_USERS.admin.role,
    },
  });

  return {
    john,
    otherUser,
    admin,
  };
}

export async function cleanupTestUsers() {
  await prisma.task.deleteMany({
    where: {
      user: {
        email: {
          in: [
            TEST_USERS.john.email,
            TEST_USERS.otherUser.email,
            TEST_USERS.admin.email,
          ],
        },
      },
    },
  });

  await prisma.auditLog.deleteMany({
    where: {
      user: {
        email: {
          in: [
            TEST_USERS.john.email,
            TEST_USERS.otherUser.email,
            TEST_USERS.admin.email,
          ],
        },
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          TEST_USERS.john.email,
          TEST_USERS.otherUser.email,
          TEST_USERS.admin.email,
        ],
      },
    },
  });
}