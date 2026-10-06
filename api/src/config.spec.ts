import { loadConfig } from './config.js';

const complete = {
  TABLE_NAME: 'portfolio-experiences-qa',
  DAILY_SEND_CAP: '25',
  MAIL_TRANSPORT: 'mailgun',
  MAIL_FROM: "Jake's Portfolio <portfolio@jakekillpack.com>",
  MAIL_TO: 'owner@example.com',
  MAIL_SUBJECT_PREFIX: '[QA] ',
  MAILGUN_DOMAIN: 'jakekillpack.com',
  MAILGUN_SENDING_KEY_PARAMETER: '/portfolio/qa/mailgun/sending-key',
};

describe('loadConfig', () => {
  it('reads a complete Mailgun environment', () => {
    const config = loadConfig(complete);

    expect(config.tableName).toBe('portfolio-experiences-qa');
    expect(config.dailySendCap).toBe(25);
    expect(config.mail).toEqual({
      transport: 'mailgun',
      from: "Jake's Portfolio <portfolio@jakekillpack.com>",
      to: 'owner@example.com',
      subjectPrefix: '[QA] ',
      mailgun: {
        domain: 'jakekillpack.com',
        sendingKeyParameter: '/portfolio/qa/mailgun/sending-key',
        baseUrl: 'https://api.mailgun.net',
      },
    });
  });

  it('reads an SMTP environment without Mailgun settings', () => {
    const {
      MAILGUN_DOMAIN: _domain,
      MAILGUN_SENDING_KEY_PARAMETER: _keyParameter,
      ...rest
    } = complete;
    const config = loadConfig({
      ...rest,
      MAIL_TRANSPORT: 'smtp',
      SMTP_HOST: 'mailhog',
      SMTP_PORT: '1025',
    });

    expect(config.mail.transport).toBe('smtp');
    expect(config.mail.smtp).toEqual({ host: 'mailhog', port: 1025 });
  });

  it('treats a missing subject prefix as none', () => {
    const { MAIL_SUBJECT_PREFIX: _prefix, ...rest } = complete;
    expect(loadConfig(rest).mail.subjectPrefix).toBe('');
  });

  it('names every missing variable at once', () => {
    expect(() => loadConfig({ MAIL_TRANSPORT: 'mailgun' })).toThrow(
      /TABLE_NAME.*DAILY_SEND_CAP.*MAIL_FROM.*MAIL_TO.*MAILGUN_DOMAIN.*MAILGUN_SENDING_KEY_PARAMETER/,
    );
  });

  it('rejects an unknown mail transport', () => {
    expect(() =>
      loadConfig({ ...complete, MAIL_TRANSPORT: 'carrier-pigeon' }),
    ).toThrow(/MAIL_TRANSPORT/);
  });

  it('rejects a send cap that is not a positive whole number', () => {
    expect(() => loadConfig({ ...complete, DAILY_SEND_CAP: 'lots' })).toThrow(
      /DAILY_SEND_CAP/,
    );
    expect(() => loadConfig({ ...complete, DAILY_SEND_CAP: '0' })).toThrow(
      /DAILY_SEND_CAP/,
    );
  });
});
