import { useState, type ChangeEvent, type FormEvent } from 'react';
import { sendContact, type ContactErrors, type ContactForm } from '../api';
import { FlashAlert } from './FlashAlert';

const EMAIL = 'contact@jakekillpack.com';
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
    <div id="contact-me" className="row contact-me">
      {flash !== null && (
        <FlashAlert key={flash} message={SENT} onDone={() => setFlash(null)} />
      )}

      <div className="d-flex flex-column w-100 text-center">
        <h2 className="main-title font-weight-bold">Contact Me</h2>

        <span className="main-email">
          <i className="fi flaticon-email"></i>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </span>

        <p>
          Need help with a project? Looking to hire? Fill in the form or use the
          link above to send me a message.
        </p>

        <p>I'll get back to you in a flash!</p>

        <form className="email-form text-left" onSubmit={(e) => void submit(e)}>
          <div className="form-row">
            <div className="form-group col simple-set mobile-pop">
              <label htmlFor="inputName">Name: </label>
              <FieldErrors messages={errors.name} />
              <input
                id="inputName"
                className="form-control"
                type="text"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={update}
                required
              />
            </div>

            <div className="form-group col simple-set mobile-pop">
              <label htmlFor="inputEmail">Return Email: </label>
              <FieldErrors messages={errors.email} />
              <input
                id="inputEmail"
                className="form-control"
                type="email"
                name="email"
                placeholder="johndoe@example.com"
                value={form.email}
                onChange={update}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="inputBody">How can I help?</label>
            <FieldErrors messages={errors.body} />
            <textarea
              id="inputBody"
              className="form-control"
              name="body"
              rows={10}
              cols={40}
              placeholder="John Doe's story..."
              value={form.body}
              onChange={update}
              required
            ></textarea>
          </div>

          {/* Honeypot: people never see it, so the API drops any message
              that fills it in. */}
          <div className="contact-website" aria-hidden="true">
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
            <div className="alert alert-danger" role="alert">
              <p className="mb-0 px-3 py-2">
                {failure === 'limited'
                  ? 'The contact form has reached its limit for today.'
                  : "Sorry, your message couldn't be sent."}{' '}
                Please email{' '}
                <a className="alert-link" href={`mailto:${EMAIL}`}>
                  {EMAIL}
                </a>{' '}
                instead.
              </p>
            </div>
          )}

          <button type="submit" className="btn btn-info" disabled={sending}>
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}

function FieldErrors({ messages }: { messages?: string[] }) {
  if (!messages?.length) {
    return null;
  }
  return (
    <div className="alert alert-danger">
      <ul>
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
