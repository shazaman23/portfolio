import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ContactRequest } from './contact.dto.js';
import { ContactService } from './contact.service.js';

// Replaces the Laravel site's POST /send.
@Controller('contact')
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Post()
  @HttpCode(200)
  async submit(@Body() request: ContactRequest) {
    await this.contact.submit(request);
    return { message: 'Thanks! Your message has been sent.' };
  }
}
