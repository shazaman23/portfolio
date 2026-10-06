import type { Transporter } from 'nodemailer';
import type { SmtpConfig } from '../config.js';
import type { EmailMessage, Mailer } from './mailer.js';

// Local development only: plain SMTP to Mailhog, which catches everything.
// nodemailer loads on the first send, so the Lambda bundle can leave it out
// (see scripts/bundle.mjs); Lambda always uses Mailgun.
export class SmtpMailer implements Mailer {
  private transport?: Promise<Transporter>;

  constructor(private readonly config: SmtpConfig) {}

  async send(message: EmailMessage): Promise<void> {
    this.transport ??= import('nodemailer').then(({ createTransport }) =>
      createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: false,
      }),
    );
    await (
      await this.transport
    ).sendMail({
      from: message.from,
      to: message.to,
      replyTo: message.replyTo,
      subject: message.subject,
      text: message.text,
    });
  }
}
