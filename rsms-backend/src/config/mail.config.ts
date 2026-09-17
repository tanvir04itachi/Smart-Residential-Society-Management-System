import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.MAIL_HOST ?? 'smtp.gmail.com',
  port: Number(process.env.MAIL_PORT ?? 587),
  user: process.env.MAIL_USER ?? '',
  pass: process.env.MAIL_PASS ?? '',
  from: process.env.MAIL_FROM ?? 'RSMS System <no-reply@rsms.local>',
  otpRecipient: process.env.OTP_RECIPIENT ?? '',
}));
