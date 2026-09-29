import { describe, it, expect, vi } from 'vitest';
import { sendEmail, sendWelcomeEmail,} from '../services/email.service.js';

const { sendMail } = vi.hoisted(() => ({
  sendMail: vi.fn(),
}));


vi.mock('../lib/mailer.js', () => ({
  default: {
    sendMail,
  },
}));

describe('Email Service', () => {
  it('should send an email', async () => {
    await sendEmail(
      'test@example.com',
      'Test email',
      'Hello from TaskFlow!',
    );

    expect(sendMail).toHaveBeenCalledWith({
      from: 'TaskFlow <no-reply@taskflow.local>',
      to: 'test@example.com',
      subject: 'Test email',
      text: 'Hello from TaskFlow!',
    });
  });
});

it('should send a welcome email', async () => {
  await sendWelcomeEmail('john@example.com', 'John');

  expect(sendMail).toHaveBeenCalledWith({
    from: 'TaskFlow <no-reply@taskflow.local>',
    to: 'john@example.com',
    subject: 'Welcome to TaskFlow!',
    text: 'Hello John,\n\nWelcome to TaskFlow! Your account has been created successfully.\n\nThanks,\nThe TaskFlow Team',
  });
});