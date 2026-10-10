import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { jsonResponse, sentJson, stubFetch } from '../test/fixtures';
import { ContactMe } from './ContactMe';

const inputs = () => ({
  name: screen.getByLabelText('Name:'),
  email: screen.getByLabelText('Return Email:'),
  body: screen.getByLabelText('How can I help?'),
});

async function fillAndSend(user: ReturnType<typeof userEvent.setup>) {
  const { name, email, body } = inputs();
  await user.type(name, 'Ada Lovelace');
  await user.type(email, 'ada@example.com');
  await user.type(body, 'Hello there');
  await user.click(screen.getByRole('button', { name: 'Send Message' }));
}

function expectFieldsKept() {
  const { name, email, body } = inputs();
  expect(name).toHaveValue('Ada Lovelace');
  expect(email).toHaveValue('ada@example.com');
  expect(body).toHaveValue('Hello there');
}

describe('ContactMe', () => {
  it('is the Contact Me section, the target of the #contact-me links', () => {
    const { container } = render(<ContactMe />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Contact Me' }),
    ).toBeInTheDocument();
    expect(container.querySelector('section#contact-me')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'contact@jakekillpack.com' }),
    ).toHaveAttribute('href', 'mailto:contact@jakekillpack.com');
  });

  it('sends the form, then clears it and flashes a thank-you', async () => {
    const fetch = stubFetch(() =>
      jsonResponse(200, { message: 'Thanks! Your message has been sent.' }),
    );
    const user = userEvent.setup();
    render(<ContactMe />);

    await fillAndSend(user);

    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('/api/contact');
    expect(sentJson(init)).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      body: 'Hello there',
      website: '',
    });
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Thanks! Your message has been sent.',
    );
    const { name, email, body } = inputs();
    expect(name).toHaveValue('');
    expect(email).toHaveValue('');
    expect(body).toHaveValue('');
  });

  it('ties each field error to its field and keeps what was typed', async () => {
    stubFetch(() =>
      jsonResponse(400, {
        message: 'The given data was invalid.',
        errors: {
          name: ['The name must not be greater than 150 characters.'],
          body: ['The body field is required.'],
        },
      }),
    );
    const user = userEvent.setup();
    render(<ContactMe />);

    await fillAndSend(user);

    expect(
      await screen.findByText(
        'The name must not be greater than 150 characters.',
      ),
    ).toBeInTheDocument();
    const { name, email, body } = inputs();
    expect(name).toHaveAccessibleDescription(
      'The name must not be greater than 150 characters.',
    );
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(body).toHaveAccessibleDescription('The body field is required.');
    expect(body).toHaveAttribute('aria-invalid', 'true');
    expect(email).not.toHaveAttribute('aria-invalid');
    expect(email).not.toHaveAttribute('aria-describedby');
    expectFieldsKept();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('clears old errors on the next try', async () => {
    let attempt = 0;
    stubFetch(() =>
      ++attempt === 1
        ? jsonResponse(400, {
            errors: { name: ['The name field is required.'] },
          })
        : jsonResponse(200, {}),
    );
    const user = userEvent.setup();
    render(<ContactMe />);

    await fillAndSend(user);
    expect(
      await screen.findByText('The name field is required.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(await screen.findByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('The name field is required.')).toBeNull();
  });

  it('points to the email address once the daily limit is reached', async () => {
    stubFetch(() => jsonResponse(429, { message: 'limit' }));
    const user = userEvent.setup();
    render(<ContactMe />);

    await fillAndSend(user);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(
      'The contact form has reached its limit for today. Please email contact@jakekillpack.com instead.',
    );
    expect(within(alert).getByRole('link')).toHaveAttribute(
      'href',
      'mailto:contact@jakekillpack.com',
    );
    expectFieldsKept();
  });

  it('points to the email address when the message could not be sent', async () => {
    stubFetch(() => jsonResponse(502, { message: 'failed' }));
    const user = userEvent.setup();
    render(<ContactMe />);

    await fillAndSend(user);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(
      "Sorry, your message couldn't be sent. Please email contact@jakekillpack.com instead.",
    );
    expect(within(alert).getByRole('link')).toHaveAttribute(
      'href',
      'mailto:contact@jakekillpack.com',
    );
    expectFieldsKept();
  });

  it('disables the button while sending', async () => {
    let respond: (response: Response) => void = () => {};
    stubFetch(() => new Promise<Response>((resolve) => (respond = resolve)));
    const user = userEvent.setup();
    render(<ContactMe />);

    await fillAndSend(user);
    expect(screen.getByRole('button', { name: 'Send Message' })).toBeDisabled();

    respond(jsonResponse(200, {}));
    expect(await screen.findByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Message' })).toBeEnabled();
  });

  it('has a honeypot field that people can neither see nor tab to', () => {
    const { container } = render(<ContactMe />);

    const honeypot = container.querySelector<HTMLInputElement>(
      'input[name="website"]',
    )!;
    expect(honeypot).toHaveAttribute('tabindex', '-1');
    expect(honeypot).toHaveAttribute('autocomplete', 'off');
    // Hidden from assistive tech too, and moved off-screen rather than
    // display: none, which some bots skip.
    const wrapper = honeypot.closest('[aria-hidden="true"]')!;
    expect(wrapper).toHaveClass('absolute', '-left-[10000px]');
    expect(wrapper).not.toHaveClass('hidden');
  });

  it('sends whatever a bot puts in the honeypot', async () => {
    const fetch = stubFetch(() => jsonResponse(200, {}));
    const user = userEvent.setup();
    const { container } = render(<ContactMe />);

    await user.type(
      container.querySelector<HTMLInputElement>('input[name="website"]')!,
      'https://spam.example',
    );
    await fillAndSend(user);

    expect(sentJson(fetch.mock.calls[0][1])).toMatchObject({
      website: 'https://spam.example',
    });
  });
});
