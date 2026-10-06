import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { configureApp } from '../app.factory.js';
import type { Experience } from './experience.js';
import { ExperiencesController } from './experiences.controller.js';
import { ExperiencesRepository } from './experiences.repository.js';

const dropdown: Experience = {
  id: '1',
  brand: 'UK2',
  title: 'Dropdown Cart',
  problem: 'p',
  description: 'd',
  url: 'https://www.uk2.net/',
  myPart: 'Developed',
  screenshot: 'uk2-dropdown.webp',
  demoText: null,
  noMobile: false,
};
const benegov: Experience = {
  ...dropdown,
  id: '5',
  brand: 'Benegov',
  title: 'Website',
  url: null,
};

describe('experiences endpoints', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const repository = {
      list: async () => [dropdown, benegov],
      get: async (id: string) => [dropdown, benegov].find((e) => e.id === id),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [ExperiencesController],
      providers: [{ provide: ExperiencesRepository, useValue: repository }],
    }).compile();
    app = configureApp(moduleRef.createNestApplication());
    await app.init();
  });

  afterAll(() => app.close());

  it('GET /api/experiences lists them, cacheable for 5 minutes', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/experiences')
      .expect(200);

    expect(res.body).toEqual([dropdown, benegov]);
    expect(res.headers['cache-control']).toBe('public, max-age=300');
  });

  it('GET /api/experiences/:id returns one, cacheable for 5 minutes', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/experiences/5')
      .expect(200);

    expect(res.body).toEqual(benegov);
    expect(res.headers['cache-control']).toBe('public, max-age=300');
  });

  it('GET /api/experiences/:id answers 404 for an unknown id, not cacheable', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/experiences/99')
      .expect(404);

    expect(res.body.message).toMatch(/not found/i);
    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('answers 404 JSON for an unknown API path', async () => {
    const res = await request(app.getHttpServer()).get('/api/nope').expect(404);

    expect(res.headers['content-type']).toMatch(/json/);
  });
});
