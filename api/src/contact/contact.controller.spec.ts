import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { configureApp } from '../app.factory.js';
import { ContactController } from './contact.controller.js';
import { ContactService } from './contact.service.js';

// The real controller and validation, with the service replaced by a
// recorder, so these tests cover exactly what reaches the service.
describe('POST /api/contact', () => {
  let app: INestApplication;
  const submitted: unknown[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ContactController],
      providers: [
        {
          provide: ContactService,
          useValue: {
            submit: async (s: unknown) => void submitted.push(s),
          },
        },
      ],
    }).compile();
    app = configureApp(moduleRef.createNestApplication());
    await app.init();
  });

  afterAll(() => app.close());
  beforeEach(() => (submitted.length = 0));

  const valid = {
    name: 'Jane Visitor',
    email: 'jane@example.com',
    body: 'Hello!',
  };
  const post = (body: object) =>
    request(app.getHttpServer()).post('/api/contact').send(body);

  it('accepts a valid submission with 200 and a confirmation', async () => {
    const res = await post(valid).expect(200);

    expect(res.body).toEqual({ message: expect.stringMatching(/sent/i) });
    expect(submitted).toEqual([valid]);
  });

  it('trims fields and drops unknown ones before they reach the service', async () => {
    await post({
      name: '  Jane Visitor ',
      email: ' jane@example.com ',
      body: ' Hello! ',
      admin: true,
    }).expect(200);

    expect(submitted).toEqual([valid]);
  });

  it('passes the honeypot field through to the service', async () => {
    await post({ ...valid, website: 'http://spam.example' }).expect(200);

    expect(submitted).toEqual([{ ...valid, website: 'http://spam.example' }]);
  });

  it("answers 400 with Laravel's messages, one per field, for missing fields", async () => {
    const res = await post({}).expect(400);

    expect(res.body).toEqual({
      message: 'The given data was invalid.',
      errors: {
        name: ['The name field is required.'],
        email: ['The email field is required.'],
        body: ['The body field is required.'],
      },
    });
    expect(submitted).toHaveLength(0);
  });

  it('treats whitespace-only fields as missing', async () => {
    const res = await post({ ...valid, name: '   ' }).expect(400);

    expect(res.body.errors).toEqual({
      name: ['The name field is required.'],
    });
  });

  it('rejects a name over 150 characters and an invalid email', async () => {
    const res = await post({
      ...valid,
      name: 'x'.repeat(151),
      email: 'not-an-email',
    }).expect(400);

    expect(res.body.errors).toEqual({
      name: ['The name must not be greater than 150 characters.'],
      email: ['The email must be a valid email address.'],
    });
  });

  it('rejects a message over 5000 characters', async () => {
    const res = await post({ ...valid, body: 'x'.repeat(5001) }).expect(400);

    expect(res.body.errors).toEqual({
      body: ['The body must not be greater than 5000 characters.'],
    });
  });

  it('rejects non-string fields', async () => {
    const res = await post({ ...valid, name: 42 }).expect(400);

    expect(res.body.errors).toEqual({
      name: ['The name must be a string.'],
    });
  });

  it('marks the response as not cacheable', async () => {
    const res = await post(valid);

    expect(res.headers['cache-control']).toBe('no-store');
  });
});
