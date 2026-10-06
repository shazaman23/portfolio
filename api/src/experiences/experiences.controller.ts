import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import type { Experience } from './experience.js';
import { ExperiencesRepository } from './experiences.repository.js';

// CloudFront caches successful answers for 5 minutes (the AWS-managed
// CachingOptimized policy honors this header), which hides most cold starts.
// It's set only after a successful lookup: Nest's @Header decorator would
// also stamp it on a 404.
const CACHE_FIVE_MINUTES = 'public, max-age=300';

// Data for the home page and /experience/:id.
@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiences: ExperiencesRepository) {}

  @Get()
  async list(@Res({ passthrough: true }) res: Response): Promise<Experience[]> {
    const experiences = await this.experiences.list();
    res.setHeader('Cache-Control', CACHE_FIVE_MINUTES);
    return experiences;
  }

  @Get(':id')
  async get(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Experience> {
    const experience = await this.experiences.get(id);
    if (!experience) {
      throw new NotFoundException(`Experience ${id} not found`);
    }
    res.setHeader('Cache-Control', CACHE_FIVE_MINUTES);
    return experience;
  }
}
