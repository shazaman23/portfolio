import type { MailgunConfig } from '../config.js';
import type { SecretSource } from '../secrets/secrets.service.js';
import type { EmailMessage, Mailer } from './mailer.js';

// Sends through Mailgun's HTTP API (the same account and domain the Laravel
// site used), with a domain sending key: it can only send mail for
// jakekillpack.com, unlike the account's API keys. The key comes from
// Parameter Store on each send; the secrets helper caches it for 5 minutes.
export class MailgunMailer implements Mailer {
  constructor(
    private readonly config: MailgunConfig,
    private readonly secrets: SecretSource,
  ) {}

  async send(message: EmailMessage): Promise<void> {
    const sendingKey = await this.secrets.get(this.config.sendingKeyParameter);
    const form = new URLSearchParams({
      from: message.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      'h:Reply-To': `${quote(message.replyTo.name)} <${message.replyTo.address}>`,
    });

    // Mailgun's HTTP auth username is "api" for every kind of key.
    const response = await fetch(
      `${this.config.baseUrl}/v3/${this.config.domain}/messages`,
      {
        method: 'POST',
        headers: {
          authorization: `Basic ${Buffer.from(`api:${sendingKey}`).toString('base64')}`,
        },
        body: form,
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!response.ok) {
      // Mailgun's body explains the failure; it never echoes the key.
      const detail = (await response.text()).slice(0, 300);
      throw new Error(`Mailgun send failed with ${response.status}: ${detail}`);
    }
  }
}

// RFC 5322 quoted string for a display name.
function quote(name: string): string {
  return `"${name.replace(/(["\\])/g, '\\$1')}"`;
}
