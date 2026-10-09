import { vi } from 'vitest';
import type { Experience } from '../api';

export function experience(overrides: Partial<Experience> = {}): Experience {
  return {
    id: '1',
    brand: 'UK2',
    title: 'Dropdown Cart',
    problem: 'The problem.',
    description: 'The description.',
    url: 'https://www.uk2.net/',
    myPart: 'Developed',
    screenshot: 'uk2-dropdown.webp',
    demoText: 'The demo text.',
    noMobile: false,
    ...overrides,
  };
}

export function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Stubs fetch with a handler and returns the stub, so tests can check what
// was requested.
export function stubFetch(
  handler: (url: string, init?: RequestInit) => Response | Promise<Response>,
) {
  // async, so a handler that throws rejects, the way fetch does. The app
  // always calls fetch with a string URL.
  const fetch = vi.fn(async (url: string, init?: RequestInit) =>
    handler(url, init),
  );
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

// The JSON body of a request made through stubFetch.
export function sentJson(init: RequestInit | undefined): unknown {
  return JSON.parse(init?.body as string);
}
