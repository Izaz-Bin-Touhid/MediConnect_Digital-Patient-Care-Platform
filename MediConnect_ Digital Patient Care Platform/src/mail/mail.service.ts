import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

interface MailMessage {
  to: string;
  subject: string;
  text: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  async notifyCoordinatorApproval(to: string): Promise<void> {
    if (
      !this.config.get('SMTP_HOST') &&
      !this.config.get('MAIL_DELIVERY_URL')
    ) {
      return;
    }
    try {
      await this.send({
        to,
        subject: 'Your MediConnect Coordinator account is ready',
        text: 'Your Coordinator application has been approved. Use this email address and the password provided by your administrator to sign in.',
      });
    } catch {
      this.logger.warn('Coordinator approval email could not be delivered');
    }
  }

  async send(message: MailMessage): Promise<void> {
    const endpoint = this.config.get<string>('MAIL_DELIVERY_URL');
    const from = this.config.get<string>('MAIL_FROM');
    const host = this.config.get<string>('SMTP_HOST');
    if ((!endpoint && !host) || !from) {
      throw new ServiceUnavailableException('Mail delivery is not configured');
    }

    try {
      if (host) {
        const user = this.config.get<string>('SMTP_USER');
        const pass = this.config.get<string>('SMTP_PASSWORD');
        const port = Number(this.config.get('SMTP_PORT') || 587);
        const transport = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: user && pass ? { user, pass } : undefined,
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 5000,
        });
        await transport.sendMail({ from, ...message });
        return;
      }
      if (!endpoint) {
        throw new Error('Mail delivery endpoint is missing');
      }
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, ...message }),
        signal: AbortSignal.timeout(5000),
        redirect: 'error',
      });
      if (!response.ok) {
        throw new Error('Mail delivery request failed');
      }
    } catch {
      throw new ServiceUnavailableException('Mail delivery failed');
    }
  }
}
