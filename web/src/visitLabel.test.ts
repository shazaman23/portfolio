import { describe, expect, it } from 'vitest';
import { visitLabel } from './visitLabel';

describe('visitLabel', () => {
  it('names the site by its domain, without www', () => {
    expect(visitLabel('https://www.uk2.net/')).toBe('Visit uk2.net');
  });

  it('ignores the path and the hash', () => {
    expect(
      visitLabel('https://www.uk2.net/domain-names/bulk-domain-registration/'),
    ).toBe('Visit uk2.net');
    expect(visitLabel('https://www.uk2.net/#disclaimer-section')).toBe(
      'Visit uk2.net',
    );
  });

  it('keeps any other subdomain', () => {
    expect(visitLabel('https://app.example.com/start')).toBe(
      'Visit app.example.com',
    );
  });

  it('shows the URL itself when it cannot be parsed', () => {
    expect(visitLabel('https://')).toBe('Visit https://');
  });
});
