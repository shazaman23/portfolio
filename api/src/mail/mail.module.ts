import { Module } from '@nestjs/common';
import { APP_CONFIG, type AppConfig } from '../config.js';
import { SecretsService } from '../secrets/secrets.service.js';
import { MailgunMailer } from './mailgun.mailer.js';
import { MAILER, type Mailer } from './mailer.js';
import { SmtpMailer } from './smtp.mailer.js';

// MAIL_TRANSPORT picks the mailer: mailgun in Lambda, smtp (Mailhog) locally.
@Module({
  providers: [
    SecretsService,
    {
      provide: MAILER,
      inject: [APP_CONFIG, SecretsService],
      useFactory: (config: AppConfig, secrets: SecretsService): Mailer =>
        config.mail.transport === 'mailgun'
          ? new MailgunMailer(config.mail.mailgun!, secrets)
          : new SmtpMailer(config.mail.smtp!),
    },
  ],
  exports: [MAILER],
})
export class MailModule {}
