import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module.js';
import { ContactController } from './contact.controller.js';
import { ContactService } from './contact.service.js';
import { DynamoSendCap, SEND_CAP } from './send-cap.js';

@Module({
  imports: [MailModule],
  controllers: [ContactController],
  providers: [ContactService, { provide: SEND_CAP, useClass: DynamoSendCap }],
})
export class ContactModule {}
