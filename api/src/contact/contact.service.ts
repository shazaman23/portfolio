import {
  BadGatewayException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { APP_CONFIG, type AppConfig } from '../config.js';
import { MAILER, type Mailer } from '../mail/mailer.js';
import { buildContactEmail } from './contact-email.js';
import type { ContactRequest } from './contact.dto.js';
import { SEND_CAP, type SendCap } from './send-cap.js';

const FALLBACK = 'Please email contact@jakekillpack.com instead.';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    @Inject(SEND_CAP) private readonly sendCap: SendCap,
    @Inject(MAILER) private readonly mailer: Mailer,
  ) {}

  async submit(request: ContactRequest): Promise<void> {
    // A filled honeypot means a bot. Answer as if it worked, so the bot
    // learns nothing, but don't send or count it.
    if (request.website) {
      this.logger.warn('Honeypot field filled; dropped the submission');
      return;
    }

    if (!(await this.sendCap.tryReserve())) {
      this.logger.warn('Daily contact send cap reached');
      throw new HttpException(
        {
          message: `The contact form has reached its limit for today. ${FALLBACK}`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    try {
      await this.mailer.send(buildContactEmail(request, this.config.mail));
    } catch (error) {
      // Logged for the alarms and CloudWatch; the visitor gets a plain message.
      this.logger.error(`Contact email failed: ${(error as Error).message}`);
      throw new BadGatewayException({
        message: `Sorry, your message couldn't be sent. ${FALLBACK}`,
      });
    }
  }
}
