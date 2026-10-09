import { Module } from '@nestjs/common';
import { ContactModule } from './contact/contact.module.js';
import { CoreModule } from './core.module.js';
import { ExperiencesModule } from './experiences/experiences.module.js';

@Module({
  imports: [CoreModule, ExperiencesModule, ContactModule],
})
export class AppModule {}
