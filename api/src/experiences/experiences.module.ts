import { Module } from '@nestjs/common';
import { ExperiencesController } from './experiences.controller.js';
import { ExperiencesRepository } from './experiences.repository.js';

@Module({
  controllers: [ExperiencesController],
  providers: [ExperiencesRepository],
})
export class ExperiencesModule {}
