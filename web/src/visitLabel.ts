// "Visit uk2.net" for https://www.uk2.net/anything. The API only checks that
// a URL starts with http(s)://, so one that can't be parsed shows as itself.
export function visitLabel(url: string): string {
  try {
    return `Visit ${new URL(url).hostname.replace(/^www\./, '')}`;
  } catch {
    return `Visit ${url}`;
  }
}
