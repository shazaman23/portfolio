import type { MailConfig } from '../config.js';
import type { EmailMessage } from '../mail/mailer.js';

export interface ContactSubmission {
  name: string;
  email: string;
  body: string;
}

// Line breaks and other control characters in a header value could add
// headers of their own (Bcc:, for example), so the name loses them.
function headerSafe(value: string): string {
  return (
    value
      // Matching control characters is the point here.
      // oxlint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001f\u007f]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

// The notification the site owner receives. Same subject as the Laravel
// site; the environment prefix ("[QA] ") tells QA mail apart.
export function buildContactEmail(
  submission: ContactSubmission,
  mail: Pick<MailConfig, 'from' | 'to' | 'subjectPrefix'>,
): EmailMessage {
  const name = headerSafe(submission.name);

  return {
    from: mail.from,
    to: mail.to,
    replyTo: { name, address: submission.email },
    subject: `${mail.subjectPrefix}Viewer Contact - ${name}`,
    text: [
      "You're a hit!",
      '',
      'You have a new hit from your portfolio website!',
      '',
      name,
      '',
      submission.body,
      '',
      `The user's return address is ${submission.email}`,
    ].join('\n'),
  };
}
