import { describe, expect, it } from 'vitest';
import { getExperience, getExperiences, sendContact } from './api';
import { experience, jsonResponse, sentJson, stubFetch } from './test/fixtures';

const form = {
  name: 'Ada',
  email: 'ada@example.com',
  body: 'Hello',
  website: '',
};

describe('getExperiences', () => {
  it('returns the experiences from /api/experiences', async () => {
    const all = [experience(), experience({ id: '2' })];
    const fetch = stubFetch(() => jsonResponse(200, all));

    await expect(getExperiences()).resolves.toEqual(all);
    expect(fetch).toHaveBeenCalledWith('/api/experiences', expect.anything());
  });

  it('throws when the API fails', async () => {
    stubFetch(() => jsonResponse(500, { message: 'Internal server error' }));

    await expect(getExperiences()).rejects.toThrow('500');
  });
});

describe('getExperience', () => {
  it('returns one experience', async () => {
    const one = experience({ id: '2' });
    const fetch = stubFetch(() => jsonResponse(200, one));

    await expect(getExperience('2')).resolves.toEqual(one);
    expect(fetch).toHaveBeenCalledWith('/api/experiences/2', expect.anything());
  });

  it('returns null for an unknown id', async () => {
    stubFetch(() => jsonResponse(404, { message: 'Not Found' }));

    await expect(getExperience('9')).resolves.toBeNull();
  });

  it('encodes the id into the path', async () => {
    const fetch = stubFetch(() => jsonResponse(404, {}));

    await getExperience('../contact');
    expect(fetch).toHaveBeenCalledWith(
      '/api/experiences/..%2Fcontact',
      expect.anything(),
    );
  });

  it('throws when the API fails', async () => {
    stubFetch(() => jsonResponse(503, {}));

    await expect(getExperience('1')).rejects.toThrow('503');
  });
});

describe('sendContact', () => {
  it('posts the form as JSON, honeypot included', async () => {
    const fetch = stubFetch(() =>
      jsonResponse(200, { message: 'Thanks! Your message has been sent.' }),
    );

    await expect(sendContact(form)).resolves.toEqual({ status: 'sent' });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('/api/contact');
    expect(init?.method).toBe('POST');
    expect(new Headers(init?.headers).get('Content-Type')).toBe(
      'application/json',
    );
    expect(sentJson(init)).toEqual(form);
  });

  it('returns the field errors from a 400', async () => {
    stubFetch(() =>
      jsonResponse(400, {
        message: 'The given data was invalid.',
        errors: {
          name: ['The name field is required.'],
          email: ['The email must be a valid email address.'],
          website: ['website must be a string'],
        },
      }),
    );

    await expect(sendContact(form)).resolves.toEqual({
      status: 'invalid',
      errors: {
        name: ['The name field is required.'],
        email: ['The email must be a valid email address.'],
      },
    });
  });

  it('reports the daily limit on a 429', async () => {
    stubFetch(() => jsonResponse(429, { message: 'limit' }));

    await expect(sendContact(form)).resolves.toEqual({ status: 'limited' });
  });

  it('reports a failure on a 502', async () => {
    stubFetch(() => jsonResponse(502, { message: 'failed' }));

    await expect(sendContact(form)).resolves.toEqual({ status: 'failed' });
  });

  it('reports a failure on a 400 without field errors', async () => {
    stubFetch(() => new Response('<html>Bad Request</html>', { status: 400 }));

    await expect(sendContact(form)).resolves.toEqual({ status: 'failed' });
  });

  it('reports a failure when the request never gets a response', async () => {
    stubFetch(() => {
      throw new TypeError('Failed to fetch');
    });

    await expect(sendContact(form)).resolves.toEqual({ status: 'failed' });
  });
});
