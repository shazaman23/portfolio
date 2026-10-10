import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react';
import { sendContact, type ContactErrors, type ContactForm } from '../api';
import { EMAIL } from '../links';
import { FlashAlert } from './FlashAlert';
import { Icon } from './Icon';

const SENT = 'Thanks! Your message has been sent.';

const empty: ContactForm = { name: '', email: '', body: '', website: '' };

export function ContactMe() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [failure, setFailure] = useState<'limited' | 'failed' | null>(null);
  const [sending, setSending] = useState(false);
  // A new id restarts the flash if another message is sent while it shows.
  const [flash, setFlash] = useState<number | null>(null);

  const update = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    setErrors({});
    setFailure(null);

    const result = await sendContact(form);
    setSending(false);
    switch (result.status) {
      case 'sent':
        setForm(empty);
        setFlash((id) => (id ?? 0) + 1);
        break;
      case 'invalid':
        // Inputs keep their values, as old() did on the Laravel site.
        setErrors(result.errors);
        break;
      default:
        setFailure(result.status);
    }
  };

  return (
    <section
      id="contact-me"
      aria-labelledby="contact-me-title"
      className="bg-white"
    >
      {flash !== null && (
        <FlashAlert key={flash} message={SENT} onDone={() => setFlash(null)} />
      )}

      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2
          id="contact-me-title"
          className="text-4xl font-bold text-brand-navy sm:text-5xl"
        >
          Contact Me
        </h2>

        <p className="mt-6 text-lg">
          <Icon icon={faEnvelope} className="mr-2 text-brand-navy" />
          <a
            href={`mailto:${EMAIL}`}
            className="font-semibold text-brand-navy underline underline-offset-4"
          >
            {EMAIL}
          </a>
        </p>

        <p className="mt-4">
          Need help with a project? Looking to hire? Fill in the form or use the
          link above to send me a message.
        </p>

        <p className="mt-2">I'll get back to you in a flash!</p>

        <form
          className="relative mt-10 space-y-6 text-left"
          onSubmit={(e) => void submit(e)}
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="inputName" label="Name: " errors={errors.name}>
              {(described) => (
                <input
                  id="inputName"
                  className={INPUT}
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={update}
                  required
                  {...described}
                />
              )}
            </Field>

            <Field id="inputEmail" label="Return Email: " errors={errors.email}>
              {(described) => (
                <input
                  id="inputEmail"
                  className={INPUT}
                  type="email"
                  name="email"
                  placeholder="johndoe@example.com"
                  value={form.email}
                  onChange={update}
                  required
                  {...described}
                />
              )}
            </Field>
          </div>

          <Field id="inputBody" label="How can I help?" errors={errors.body}>
            {(described) => (
              <textarea
                id="inputBody"
                className={INPUT}
                name="body"
                rows={10}
                cols={40}
                placeholder="John Doe's story..."
                value={form.body}
                onChange={update}
                required
                {...described}
              ></textarea>
            )}
          </Field>

          {/* Honeypot: people never see it, so the API drops any message
              that fills it in. Off-screen rather than display: none, which
              some bots skip. */}
          <div
            className="absolute -left-[10000px] h-px w-px overflow-hidden"
            aria-hidden="true"
          >
            <label htmlFor="inputWebsite">Website</label>
            <input
              id="inputWebsite"
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={update}
            />
          </div>

          {failure && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800"
              role="alert"
            >
              <p>
                {failure === 'limited'
                  ? 'The contact form has reached its limit for today.'
                  : "Sorry, your message couldn't be sent."}{' '}
                Please email{' '}
                <a className="font-bold underline" href={`mailto:${EMAIL}`}>
                  {EMAIL}
                </a>{' '}
                instead.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="rounded-full bg-brand-navy px-8 py-3 font-bold text-white hover:bg-brand-navy/85 disabled:opacity-60"
            disabled={sending}
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}

// Borders are gray-500, 4.8:1 on white (inputs need 3:1).
const INPUT =
  'mt-1 w-full rounded-lg border border-gray-500 px-3 py-2 placeholder:text-gray-500 aria-invalid:border-red-700';

interface FieldProps {
  id: string;
  label: string;
  errors?: string[];
  // Renders the input, given the ARIA attributes that tie it to its errors.
  children: (described: {
    'aria-invalid'?: true;
    'aria-describedby'?: string;
  }) => ReactNode;
}

// A label, the field's errors from a 400 (above the input, as on the Laravel
// site), and the input, with the errors announced as its description.
function Field({ id, label, errors, children }: FieldProps) {
  const errorId = `${id}-errors`;
  const messages = errors?.length ? errors : null;
  return (
    <div>
      <label htmlFor={id} className="font-semibold">
        {label}
      </label>
      {messages && (
        <ul
          id={errorId}
          className="mt-1 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
        >
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
      {children(
        messages ? { 'aria-invalid': true, 'aria-describedby': errorId } : {},
      )}
    </div>
  );
}
