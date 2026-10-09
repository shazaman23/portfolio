// Shared helpers for the end-to-end tests, which run in the api container
// against LocalStack and Mailhog (compose.yaml):
//
//   docker compose up -d localstack mailhog
//   docker compose run --rm api npm run test:e2e

// A random day far in the future, so each test run gets its own contact-send
// counters and never collides with real local use or an earlier run.
export function uniqueFutureDay(): Date {
  const daysAhead = 365 * 100 + Math.floor(Math.random() * 365 * 500);
  return new Date(Date.UTC(2026, 0, 1) + daysAhead * 24 * 60 * 60 * 1000);
}

interface MailhogMessage {
  Content: { Headers: Record<string, string[]>; Body: string };
}

// Waits for Mailhog to receive a message containing the given text.
export async function findMail(
  text: string,
  timeoutMs = 5000,
): Promise<MailhogMessage[]> {
  const url = `http://mailhog:8025/api/v2/search?kind=containing&query=${encodeURIComponent(text)}`;
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const { items } = (await (await fetch(url)).json()) as {
      items: MailhogMessage[];
    };
    if (items.length > 0 || Date.now() > deadline) return items;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}
