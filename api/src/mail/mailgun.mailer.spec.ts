import { createServer, type IncomingMessage, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { MailgunMailer } from './mailgun.mailer.js';
import type { EmailMessage } from './mailer.js';

// A stand-in for Mailgun's API that records each request and answers with
// whatever status the test sets.
interface Captured {
  method?: string;
  url?: string;
  authorization?: string;
  contentType?: string;
  form: URLSearchParams;
}

let server: Server;
let baseUrl: string;
let captured: Captured;
let status = 200;

beforeAll(async () => {
  server = createServer((req: IncomingMessage, res) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      captured = {
        method: req.method,
        url: req.url,
        authorization: req.headers.authorization,
        contentType: req.headers['content-type'],
        form: new URLSearchParams(body),
      };
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(
        JSON.stringify(
          status === 200
            ? { id: '<abc@jakekillpack.com>', message: 'Queued.' }
            : { message: 'Forbidden' },
        ),
      );
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));
beforeEach(() => (status = 200));

const message: EmailMessage = {
  from: "Jake's Portfolio <portfolio@jakekillpack.com>",
  to: 'owner@example.com',
  replyTo: { name: 'Jane "JV" Visitor', address: 'jane@example.com' },
  subject: '[QA] Viewer Contact - Jane "JV" Visitor',
  text: 'Hello there',
};

const secrets = {
  get: async (name: string) =>
    name === '/portfolio/qa/mailgun/sending-key' ? 'key-123' : 'wrong',
};

function mailer() {
  return new MailgunMailer(
    {
      domain: 'jakekillpack.com',
      sendingKeyParameter: '/portfolio/qa/mailgun/sending-key',
      baseUrl,
    },
    secrets,
  );
}

describe('MailgunMailer', () => {
  it("posts the message to the domain's messages endpoint with the key from Parameter Store", async () => {
    await mailer().send(message);

    expect(captured.method).toBe('POST');
    expect(captured.url).toBe('/v3/jakekillpack.com/messages');
    expect(captured.authorization).toBe(
      `Basic ${Buffer.from('api:key-123').toString('base64')}`,
    );
    expect(captured.contentType).toMatch(/^application\/x-www-form-urlencoded/);
  });

  it('sends from, to, subject, text, and a quoted Reply-To', async () => {
    await mailer().send(message);

    expect(captured.form.get('from')).toBe(message.from);
    expect(captured.form.get('to')).toBe('owner@example.com');
    expect(captured.form.get('subject')).toBe(message.subject);
    expect(captured.form.get('text')).toBe('Hello there');
    expect(captured.form.get('h:Reply-To')).toBe(
      '"Jane \\"JV\\" Visitor" <jane@example.com>',
    );
  });

  it('throws on a non-2xx response without exposing the key', async () => {
    status = 401;
    const error = await mailer()
      .send(message)
      .catch((e: Error) => e);

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toMatch(/Mailgun.*401/);
    expect((error as Error).message).not.toContain('key-123');
  });
});
