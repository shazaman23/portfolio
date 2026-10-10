import html from '../index.html?raw';
import { describe, expect, it } from 'vitest';

const doc = new DOMParser().parseFromString(html, 'text/html');

describe('index.html', () => {
  it('has a meta description for search results', () => {
    // getAttribute rather than toHaveAttribute: jest-dom rejects elements
    // from a DOMParser document.
    expect(
      doc.head
        .querySelector('meta[name="description"]')
        ?.getAttribute('content'),
    ).toBe(
      'Jake Killpack, software engineer: my projects, a little about me, and how to reach me.',
    );
  });

  it('loads no fonts from Google; Raleway is bundled', () => {
    expect(html).not.toContain('fonts.googleapis.com');
    expect(html).not.toContain('fonts.gstatic.com');
  });
});
