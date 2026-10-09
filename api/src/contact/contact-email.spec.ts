import { buildContactEmail } from './contact-email.js';

const mail = {
  from: "Jake's Portfolio <portfolio@jakekillpack.com>",
  to: 'owner@example.com',
  subjectPrefix: '[QA] ',
};

describe('buildContactEmail', () => {
  const email = buildContactEmail(
    {
      name: 'Jane Visitor',
      email: 'jane@example.com',
      body: 'Loved the site.\nLet us talk.',
    },
    mail,
  );

  it('sends from the site to the owner, with replies going to the visitor', () => {
    expect(email.from).toBe(mail.from);
    expect(email.to).toBe('owner@example.com');
    expect(email.replyTo).toEqual({
      name: 'Jane Visitor',
      address: 'jane@example.com',
    });
  });

  it('keeps the subject the Laravel site used, behind the environment prefix', () => {
    expect(email.subject).toBe('[QA] Viewer Contact - Jane Visitor');
  });

  it('includes the name, message, and return address in the text', () => {
    expect(email.text).toContain("You're a hit!");
    expect(email.text).toContain('Jane Visitor');
    expect(email.text).toContain('Loved the site.\nLet us talk.');
    expect(email.text).toContain('jane@example.com');
  });

  it('strips line breaks and control characters from the name, so it cannot inject headers', () => {
    const sneaky = buildContactEmail(
      {
        name: 'Eve\r\nBcc: victim@example.com\u0000',
        email: 'eve@example.com',
        body: 'hi',
      },
      mail,
    );
    expect(sneaky.subject).toBe(
      '[QA] Viewer Contact - Eve Bcc: victim@example.com',
    );
    expect(sneaky.replyTo.name).toBe('Eve Bcc: victim@example.com');
  });
});
