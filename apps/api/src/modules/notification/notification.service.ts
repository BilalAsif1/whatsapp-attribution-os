import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
    this.fromEmail = this.configService.get('EMAIL_FROM', 'WAO <noreply@yourdomain.com>');
  }

  async sendWelcomeEmail(to: string, name: string) {
    return this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject: 'Welcome to WhatsApp Attribution OS',
      html: `<h1>Welcome, ${name}!</h1><p>Your workspace is ready. Connect your WhatsApp Business API and Google Ads to start tracking real conversions.</p>`,
    });
  }

  async sendConversionAlert(to: string, data: { campaign: string; keyword?: string; revenue?: number }) {
    return this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject: `New conversion from ${data.campaign}`,
      html: `<p>A new WhatsApp conversation converted from campaign <strong>${data.campaign}</strong>${data.keyword ? ` (keyword: ${data.keyword})` : ''}${data.revenue ? ` — Revenue: $${data.revenue}` : ''}.</p>`,
    });
  }
}
