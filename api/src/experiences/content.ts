import { EXPERIENCE_KIND, type Experience } from './experience.js';

const STRING_FIELDS = [
  'brand',
  'title',
  'problem',
  'description',
  'myPart',
] as const;
const NULLABLE_STRING_FIELDS = ['url', 'demoText'] as const;
const ALL_FIELDS = new Set([
  'id',
  ...STRING_FIELDS,
  ...NULLABLE_STRING_FIELDS,
  'screenshot',
  'noMobile',
]);

// Checks content/experiences.json before it reaches a table, so a typo fails
// the seed (and the deploy) instead of breaking a page. Throws naming the
// first problem it finds.
export function parseExperiences(json: unknown): Experience[] {
  if (!Array.isArray(json)) {
    throw new Error('content/experiences.json must be an array');
  }

  const seen = new Set<string>();
  return json.map((item: Record<string, unknown>, index) => {
    const where = `item ${index + 1}`;
    const fail = (field: string, rule: string): never => {
      throw new Error(`content/experiences.json ${where}: ${field} ${rule}`);
    };

    for (const key of Object.keys(item)) {
      if (!ALL_FIELDS.has(key)) fail(key, 'is not a known field');
    }
    // Numeric ids keep the old /experience/{id} links working.
    if (typeof item.id !== 'string' || !/^\d+$/.test(item.id))
      fail('id', 'must be a numeric string, like "1"');
    const id = item.id as string;
    if (seen.has(id))
      throw new Error(`content/experiences.json has a duplicate id ${id}`);
    seen.add(id);

    for (const field of STRING_FIELDS) {
      if (typeof item[field] !== 'string' || item[field] === '')
        fail(field, 'must be a non-empty string');
    }
    for (const field of NULLABLE_STRING_FIELDS) {
      if (item[field] !== null && typeof item[field] !== 'string')
        fail(field, 'must be a string or null');
    }
    if (typeof item.url === 'string' && !/^https?:\/\//.test(item.url))
      fail('url', 'must start with http:// or https://');
    if (
      typeof item.screenshot !== 'string' ||
      !/^[a-z0-9-]+\.webp$/.test(item.screenshot)
    ) {
      fail('screenshot', 'must be a WebP file name, like "uk2-dropdown.webp"');
    }
    if (typeof item.noMobile !== 'boolean')
      fail('noMobile', 'must be true or false');

    return item as unknown as Experience;
  });
}

export type SeedBatch = Record<
  string,
  { PutRequest: { Item: Record<string, unknown> } }[]
>;

// BatchWriteItem requests that upsert every experience, tagged so the API
// can tell them from the send counters. BatchWriteItem takes up to 25 items.
export function seedRequests(
  experiences: Experience[],
  tableName: string,
): SeedBatch[] {
  const batches: SeedBatch[] = [];
  for (let i = 0; i < experiences.length; i += 25) {
    batches.push({
      [tableName]: experiences.slice(i, i + 25).map((experience) => ({
        PutRequest: {
          Item: { ...experience, kind: EXPERIENCE_KIND },
        },
      })),
    });
  }
  return batches;
}
