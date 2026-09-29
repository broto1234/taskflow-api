import transporter from '../lib/mailer.js';

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
) {
  return transporter.sendMail({
    from: 'TaskFlow <no-reply@taskflow.local>',
    to,
    subject,
    text,
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail(
    to,
    'Welcome to TaskFlow!',
    `Hello ${name},\n\nWelcome to TaskFlow! Your account has been created successfully.\n\nThanks,\nThe TaskFlow Team`,
  );
}

export async function sendPasswordResetEmail(
  to: string,
  token: string,
) {
  return sendEmail(
    to,
    'Reset your TaskFlow password',
    `Your password reset token is:

${token}

This token expires in 15 minutes.

If you did not request a password reset, you can ignore this email.`,
  );
}