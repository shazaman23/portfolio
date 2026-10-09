// Calls to the portfolio API. In QA and production CloudFront serves it at
// /api/* on the site's own origin, so every URL here is relative.

// One work experience, as the API returns it (api/src/experiences/experience.ts).
export interface Experience {
  id: string;
  brand: string;
  title: string;
  problem: string;
  description: string;
  // null when the site no longer runs.
  url: string | null;
  myPart: string;
  // File name under /assets/img/screenshots/{desktop,mobile}/.
  screenshot: string;
  demoText: string | null;
  noMobile: boolean;
}

export const CONTACT_FIELDS = ['name', 'email', 'body'] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

export interface ContactForm {
  name: string;
  email: string;
  body: string;
  // Honeypot: hidden from people, so only bots fill it in.
  website: string;
}

export type ContactErrors = Partial<Record<ContactField, string[]>>;

export type ContactResult =
  | { status: 'sent' }
  | { status: 'invalid'; errors: ContactErrors }
  // The daily send cap was reached (429).
  | { status: 'limited' }
  // The email couldn't be sent (502), or the request failed some other way.
  | { status: 'failed' };

export async function getExperiences(
  signal?: AbortSignal,
): Promise<Experience[]> {
  const response = await fetch('/api/experiences', { signal });
  if (!response.ok) {
    throw new Error(`GET /api/experiences answered ${response.status}`);
  }
  return (await response.json()) as Experience[];
}

// null when there's no experience with that id.
export async function getExperience(
  id: string,
  signal?: AbortSignal,
): Promise<Experience | null> {
  const path = `/api/experiences/${encodeURIComponent(id)}`;
  const response = await fetch(path, { signal });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`GET ${path} answered ${response.status}`);
  }
  return (await response.json()) as Experience;
}

export async function sendContact(form: ContactForm): Promise<ContactResult> {
  let response: Response;
  try {
    response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
  } catch {
    return { status: 'failed' };
  }

  if (response.ok) {
    return { status: 'sent' };
  }
  if (response.status === 429) {
    return { status: 'limited' };
  }
  if (response.status === 400) {
    const errors = await fieldErrors(response);
    if (errors) {
      return { status: 'invalid', errors };
    }
  }
  return { status: 'failed' };
}

// The form's own fields from a Laravel-style 400 body
// ({ message, errors: { field: [...] } }), or null if there are none.
async function fieldErrors(response: Response): Promise<ContactErrors | null> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return null;
  }
  const all = (body as { errors?: Record<string, unknown> } | null)?.errors;
  if (!all || typeof all !== 'object') {
    return null;
  }

  const errors: ContactErrors = {};
  for (const field of CONTACT_FIELDS) {
    const messages = all[field];
    if (Array.isArray(messages) && messages.length > 0) {
      errors[field] = messages.map(String);
    }
  }
  return Object.keys(errors).length > 0 ? errors : null;
}
