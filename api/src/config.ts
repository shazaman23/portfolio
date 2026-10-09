// Typed settings read from environment variables. Terraform sets them on the
// Lambda (modules/site/lambda.tf); docker/compose.yaml sets them locally.
// Secrets are never here: MAILGUN_SENDING_KEY_PARAMETER is the parameter's name,
// and the key itself is read from Parameter Store at runtime.

export interface MailgunConfig {
  domain: string;
  sendingKeyParameter: string;
  baseUrl: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
}

export interface MailConfig {
  transport: 'mailgun' | 'smtp';
  from: string;
  to: string;
  subjectPrefix: string;
  mailgun?: MailgunConfig;
  smtp?: SmtpConfig;
}

export interface AppConfig {
  tableName: string;
  dailySendCap: number;
  mail: MailConfig;
}

export const APP_CONFIG = Symbol('APP_CONFIG');

type Env = Record<string, string | undefined>;

export function loadConfig(env: Env = process.env): AppConfig {
  const transport = env.MAIL_TRANSPORT ?? 'mailgun';
  if (transport !== 'mailgun' && transport !== 'smtp') {
    throw new Error(
      `MAIL_TRANSPORT must be mailgun or smtp, not "${transport}"`,
    );
  }

  const required = ['TABLE_NAME', 'DAILY_SEND_CAP', 'MAIL_FROM', 'MAIL_TO'];
  required.push(
    ...(transport === 'mailgun'
      ? ['MAILGUN_DOMAIN', 'MAILGUN_SENDING_KEY_PARAMETER']
      : ['SMTP_HOST', 'SMTP_PORT']),
  );
  const missing = required.filter((name) => !env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  const dailySendCap = Number(env.DAILY_SEND_CAP);
  if (!Number.isInteger(dailySendCap) || dailySendCap < 1) {
    throw new Error(
      `DAILY_SEND_CAP must be a positive whole number, not "${env.DAILY_SEND_CAP}"`,
    );
  }

  const mail: MailConfig = {
    transport,
    from: env.MAIL_FROM!,
    to: env.MAIL_TO!,
    subjectPrefix: env.MAIL_SUBJECT_PREFIX ?? '',
  };
  if (transport === 'mailgun') {
    mail.mailgun = {
      domain: env.MAILGUN_DOMAIN!,
      sendingKeyParameter: env.MAILGUN_SENDING_KEY_PARAMETER!,
      baseUrl: env.MAILGUN_BASE_URL ?? 'https://api.mailgun.net',
    };
  } else {
    mail.smtp = { host: env.SMTP_HOST!, port: Number(env.SMTP_PORT) };
  }

  return { tableName: env.TABLE_NAME!, dailySendCap, mail };
}
