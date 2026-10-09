import { readFileSync } from 'node:fs';
import { parseExperiences, seedRequests } from './content.js';

const valid = {
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

describe('parseExperiences', () => {
  it('accepts the real content/experiences.json', () => {
    const json = JSON.parse(
      readFileSync(
        new URL('../../../content/experiences.json', import.meta.url),
        'utf8',
      ),
    );

    const experiences = parseExperiences(json);

    expect(experiences.map((e) => e.id)).toEqual(['1', '2', '3', '4', '5']);
    expect(experiences.find((e) => e.brand === 'Benegov')?.url).toBeNull();
  });

  it('accepts a minimal valid entry', () => {
    expect(parseExperiences([valid])).toEqual([valid]);
  });

  it.each([
    ['a non-array file', { ...valid }, /array/],
    ['a missing field', [{ ...valid, title: undefined }], /item 1.*title/],
    ['a non-numeric id', [{ ...valid, id: 'one' }], /item 1.*id/],
    ['a duplicate id', [valid, { ...valid }], /duplicate id 1/],
    [
      'a screenshot that is not WebP',
      [{ ...valid, screenshot: 'uk2-dropdown.png' }],
      /item 1.*screenshot/,
    ],
    [
      'a url that is not http(s)',
      [{ ...valid, url: 'javascript:alert(1)' }],
      /item 1.*url/,
    ],
    [
      'noMobile that is not a boolean',
      [{ ...valid, noMobile: 'no' }],
      /item 1.*noMobile/,
    ],
    ['an unknown field', [{ ...valid, kind: 'experience' }], /item 1.*kind/],
  ])('rejects %s', (_case, input, message) => {
    expect(() => parseExperiences(input)).toThrow(message);
  });
});

describe('seedRequests', () => {
  const many = Array.from({ length: 30 }, (_, i) => ({
    ...valid,
    id: String(i + 1),
  }));

  it('turns experiences into BatchWriteItem puts tagged kind: experience', () => {
    const [batch] = seedRequests([valid], 'portfolio-experiences-qa');

    expect(batch).toEqual({
      'portfolio-experiences-qa': [
        { PutRequest: { Item: { ...valid, kind: 'experience' } } },
      ],
    });
  });

  it('splits into batches of 25, the BatchWriteItem limit', () => {
    const batches = seedRequests(many, 't');

    expect(batches.map((b) => b.t.length)).toEqual([25, 5]);
  });
});
