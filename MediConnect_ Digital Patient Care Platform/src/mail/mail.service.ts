import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendDoctorVerification(to: string, name: string, status: 'APPROVED' | 'REJECTED'): Promise<boolean> {
    if (this.config.get<string>('MAIL_ENABLED') !== 'true') {
      this.logger.warn('Verification email not sent: MAIL_ENABLED is false');
      return false;
    }

    try {
      const port = Number(this.config.get<string>('MAIL_PORT'));
      const transporter = createTransport({
        host: this.config.getOrThrow<string>('MAIL_HOST'),
        port,
        secure: port === 465,
        auth: {
          user: this.config.getOrThrow<string>('MAIL_USER'),
          pass: this.config.getOrThrow<string>('MAIL_PASSWORD'),
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
      });
      const info = await transporter.sendMail({
        from: this.config.getOrThrow<string>('MAIL_FROM'),
        to,
        subject: `MediConnect: Doctor profile ${status.toLowerCase()}`,
        text: `Hello ${name},\n\nYour MediConnect doctor profile has been ${status.toLowerCase()}.\nPlease log in to view your profile.\n\nMediConnect`,
      });
      if (!info.accepted.length) {
        this.logger.warn('Verification email was not accepted by the SMTP server');
        return false;
      }
      this.logger.log('Verification email accepted by SMTP server');
      return true;
    } catch {
      // Do not expose SMTP credentials or undo the completed verification.
      this.logger.warn('Verification email failed; profile verification is saved');
      return false;
    }
  }
}
