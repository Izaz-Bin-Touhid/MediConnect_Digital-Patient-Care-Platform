import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface MailMessage {
  to: string;
  subject: string;
  text: string;
}

@Injectable()
export class MailService {
  constructor(private readonly config: ConfigService) {}

  async send(message: MailMessage): Promise<void> {
    const endpoint = this.config.get<string>('MAIL_DELIVERY_URL');
    const from = this.config.get<string>('MAIL_FROM');
    if (!endpoint || !from) {
      throw new ServiceUnavailableException('Mail delivery is not configured');
    }

    try {
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
