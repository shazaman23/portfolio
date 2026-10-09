import { HttpException } from '@nestjs/common';
import type { MailConfig } from '../config.js';
import type { EmailMessage, Mailer } from '../mail/mailer.js';
import { ContactService } from './contact.service.js';
import type { SendCap } from './send-cap.js';

const mail: MailConfig = {
  transport: 'mailgun',
  from: "Jake's Portfolio <portfolio@jakekillpack.com>",
  to: 'owner@example.com',
  subjectPrefix: '[QA] ',
};

class FakeSendCap implements SendCap {
  reservations = 0;
  constructor(private remaining: number) {}
  async tryReserve() {
    this.reservations++;
    if (this.remaining <= 0) return false;
    this.remaining--;
    return true;
  }
}

class FakeMailer implements Mailer {
  sent: EmailMessage[] = [];
  failWith?: Error;
  async send(message: EmailMessage) {
    if (this.failWith) throw this.failWith;
    this.sent.push(message);
  }
}

const submission = {
  name: 'Jane Visitor',
  email: 'jane@example.com',
  body: 'Hello!',
};

function setup(remaining = 25) {
  const cap = new FakeSendCap(remaining);
  const mailer = new FakeMailer();
  const service = new ContactService(
    { tableName: 't', dailySendCap: 25, mail },
    cap,
    mailer,
  );
  return { cap, mailer, service };
}

async function statusOf(promise: Promise<unknown>) {
  const error = await promise.catch((e: unknown) => e);
  return error instanceof HttpException
    ? { status: error.getStatus(), body: error.getResponse() }
    : error;
}

describe('ContactService', () => {
  it('reserves a send and emails the owner', async () => {
    const { cap, mailer, service } = setup();

    await service.submit(submission);

    expect(cap.reservations).toBe(1);
    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0].subject).toBe('[QA] Viewer Contact - Jane Visitor');
    expect(mailer.sent[0].replyTo.address).toBe('jane@example.com');
  });

  it('drops a submission with the honeypot filled, without sending or counting it', async () => {
    const { cap, mailer, service } = setup();

    await service.submit({ ...submission, website: 'http://spam.example' });

    expect(cap.reservations).toBe(0);
    expect(mailer.sent).toHaveLength(0);
  });

  it("answers 429 and points to contact@ once the day's cap is used up", async () => {
    const { mailer, service } = setup(0);

    const result = await statusOf(service.submit(submission));

    expect(result).toMatchObject({ status: 429 });
    expect(JSON.stringify(result)).toContain('contact@jakekillpack.com');
    expect(mailer.sent).toHaveLength(0);
  });

  it('answers 502 and points to contact@ when the email provider fails', async () => {
    const { mailer, service } = setup();
    mailer.failWith = new Error('Mailgun send failed with 401: Forbidden');

    const result = await statusOf(service.submit(submission));

    expect(result).toMatchObject({ status: 502 });
    expect(JSON.stringify(result)).toContain('contact@jakekillpack.com');
    expect(JSON.stringify(result)).not.toContain('Mailgun');
  });
});
