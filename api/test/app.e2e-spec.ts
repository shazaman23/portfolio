import { readFileSync } from 'node:fs';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.factory.js';
import { CLOCK, createDocumentClient } from '../src/aws/dynamodb.js';
import { APP_CONFIG, loadConfig } from '../src/config.js';
import { DynamoSendCap } from '../src/contact/send-cap.js';
import { parseExperiences } from '../src/experiences/content.js';
import { seedTable } from '../src/experiences/seed-table.js';
import { SecretsService } from '../src/secrets/secrets.service.js';
import { findMail, uniqueFutureDay } from './support.js';

// The whole app as main.ts runs it, against LocalStack and Mailhog. Only the
// clock is replaced (and, for one test, the cap): every app gets its own
// future day, so test runs never share contact-send counters.
async function startApp({
  dailySendCap,
  day = uniqueFutureDay(),
}: { dailySendCap?: number; day?: Date } = {}) {
  const config = loadConfig();
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(CLOCK)
    .useValue(() => day)
    .overrideProvider(APP_CONFIG)
    .useValue({
      ...config,
      dailySendCap: dailySendCap ?? config.dailySendCap,
    })
    .compile();
  const app = configureApp(moduleRef.createNestApplication());
  await app.init();
  return app;
}

const content = parseExperiences(
  JSON.parse(
    readFileSync(
      new URL('../../content/experiences.json', import.meta.url),
      'utf8',
    ),
  ),
);

describe('API end to end (LocalStack + Mailhog)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await seedTable(createDocumentClient(), loadConfig().tableName, content);
    app = await startApp();
  });

  afterAll(() => app.close());

  describe('experiences', () => {
    it('lists the seeded content in order', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/experiences')
        .expect(200);

      expect(res.body).toEqual(content);
    });

    it('returns one by id', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/experiences/2')
        .expect(200);

      expect(res.body).toEqual(content[1]);
    });

    it("doesn't expose a send counter as an experience", async () => {
      const day = uniqueFutureDay();
      await new DynamoSendCap(
        createDocumentClient(),
        loadConfig(),
        () => day,
      ).tryReserve();
      const counterId = `contact-sends#${day.toISOString().slice(0, 10)}`;

      await request(app.getHttpServer())
        .get(`/api/experiences/${encodeURIComponent(counterId)}`)
        .expect(404);
      const list = await request(app.getHttpServer())
        .get('/api/experiences')
        .expect(200);
      expect(list.body).toHaveLength(content.length);
    });
  });

  describe('contact', () => {
    it('emails the owner through SMTP, from the site, with Reply-To the visitor', async () => {
      const token = `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      await request(app.getHttpServer())
        .post('/api/contact')
        .send({
          name: `Jane ${token}`,
          email: 'jane@example.com',
          body: `Hello from ${token}`,
        })
        .expect(200);

      const [mail] = await findMail(token);
      expect(mail).toBeDefined();
      const headers = mail.Content.Headers;
      expect(headers.Subject[0]).toBe(`[LOCAL] Viewer Contact - Jane ${token}`);
      expect(headers.From[0]).toContain('portfolio@jakekillpack.com');
      expect(headers.To[0]).toBe('portfolio-local@example.com');
      expect(headers['Reply-To'][0]).toContain('jane@example.com');
      expect(mail.Content.Body).toContain(`Hello from ${token}`);
    });

    it('drops a honeypot submission without sending it', async () => {
      const token = `honeypot-${Date.now()}`;

      await request(app.getHttpServer())
        .post('/api/contact')
        .send({
          name: token,
          email: 'bot@example.com',
          body: token,
          website: 'http://spam.example',
        })
        .expect(200);

      expect(await findMail(token, 1500)).toHaveLength(0);
    });

    it('answers 429 once the daily cap is used up', async () => {
      const capped = await startApp({ dailySendCap: 1 });
      const send = () =>
        request(capped.getHttpServer()).post('/api/contact').send({
          name: 'Cap Tester',
          email: 'cap@example.com',
          body: 'hi',
        });

      await send().expect(200);
      const res = await send().expect(429);

      expect(res.body.message).toContain('contact@jakekillpack.com');
      await capped.close();
    });
  });

  describe('secrets', () => {
    it('reads the fake Mailgun key from LocalStack Parameter Store', async () => {
      expect(
        await new SecretsService().get('/portfolio/local/mailgun/sending-key'),
      ).toBe('local-fake-mailgun-key');
    });
  });
});
