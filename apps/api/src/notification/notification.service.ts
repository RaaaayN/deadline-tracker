import { Injectable } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';

interface MailConfig {
  host: string;
  port: number;
  user?: string;
  pass?: string;
  from: string;
}

@Injectable()
export class NotificationService {
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor() {
    const config = this.loadConfig();
    if (!config) {
      this.transporter = null;
      this.from = 'no-reply@localhost';
      return;
    }

    this.from = config.from;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: false,
      auth: config.user && config.pass ? { user: config.user, pass: config.pass } : undefined,
    });
  }

  async sendEmailReminder(to: string, subject: string, text: string): Promise<void> {
    if (!this.transporter) {
      throw new Error('SMTP transporter not configured');
    }

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      text,
    });
  }

  private loadConfig(): MailConfig | null {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 0);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM;

    if (!host || !port || !from) {
      return null;
    }

    return { host, port, user, pass, from };
  }
}

