import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor(private configService: ConfigService) {
    this.from = this.configService.get<string>('mail.from')!;
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      secure: false,
      auth: {
        user: this.configService.get<string>('mail.user'),
        pass: this.configService.get<string>('mail.pass'),
      },
    });
  }

  async send(options: SendMailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}`,
        error as Error,
      );
    }
  }

  sendWelcomeEmail(to: string, fullName: string, tempPassword: string) {
    return this.send({
      to,
      subject: 'Welcome to RSMS',
      html: `<p>Hi ${fullName},</p>
<p>Your RSMS account has been created.</p>
<p>Email: ${to}<br/>Temporary Password: ${tempPassword}</p>
<p>Please log in and change your password.</p>`,
    });
  }

  sendOtpEmail(to: string, otp: string, expiryMinutes: number) {
    return this.send({
      to,
      subject: 'RSMS Password Reset OTP',
      html: `<p>Your OTP code is: <strong>${otp}</strong></p>
<p>This code expires in ${expiryMinutes} minutes.</p>`,
    });
  }

  sendComplaintStatusEmail(to: string, title: string, status: string) {
    return this.send({
      to,
      subject: `Complaint Update: ${title}`,
      html: `<p>Your complaint "${title}" status has been updated to <strong>${status}</strong>.</p>`,
    });
  }

  sendVisitorArrivalEmail(to: string, visitorName: string) {
    return this.send({
      to,
      subject: 'Visitor Arrival Notice',
      html: `<p>Your visitor <strong>${visitorName}</strong> has arrived at the gate.</p>`,
    });
  }

  sendBillGeneratedEmail(
    to: string,
    month: number,
    year: number,
    amount: number,
    dueDate: string,
  ) {
    return this.send({
      to,
      subject: `Bill Generated for ${month}/${year}`,
      html: `<p>A new bill of <strong>${amount}</strong> has been generated for ${month}/${year}.</p>
<p>Due date: ${dueDate}</p>`,
    });
  }

  sendBillReminderEmail(to: string, amount: number, dueDate: string) {
    return this.send({
      to,
      subject: 'Payment Reminder',
      html: `<p>This is a reminder that your bill of <strong>${amount}</strong> is due on ${dueDate}.</p>`,
    });
  }

  sendAnnouncementEmail(to: string, title: string, body: string) {
    return this.send({
      to,
      subject: `Announcement: ${title}`,
      html: `<p>${body}</p>`,
    });
  }
}
