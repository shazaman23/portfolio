export interface EmailMessage {
  from: string;
  to: string;
  replyTo: { name: string; address: string };
  subject: string;
  text: string;
}

// Sends one email or throws. Mailgun in Lambda, SMTP to Mailhog locally
// (see mail.module.ts).
export interface Mailer {
  send(message: EmailMessage): Promise<void>;
}

export const MAILER = Symbol('MAILER');
