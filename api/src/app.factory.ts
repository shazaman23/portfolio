import {
  BadRequestException,
  type INestApplication,
  ValidationPipe,
  type ValidationError,
} from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

// Shared setup for every way the app runs: the local server (main.ts), the
// Lambda handler (lambda.ts), and tests. Routes live under /api, matching the
// CloudFront /api/* behavior.
export function configureApp<T extends INestApplication>(app: T): T {
  app.setGlobalPrefix('api');

  const express = app.getHttpAdapter().getInstance();
  express.disable('x-powered-by');

  // Nothing is cacheable unless a route says so (experiences set 5 minutes),
  // so errors and form responses never sit in CloudFront's cache.
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException(laravelStyleErrors(errors)),
    }),
  );

  return app;
}

// The same 400 body shape Laravel's validator produced, so the frontend can
// show one message under each field.
function laravelStyleErrors(errors: ValidationError[]) {
  const byField: Record<string, string[]> = {};
  for (const error of errors) {
    const constraints = error.constraints ?? {};
    // A missing field reports only "required", the way Laravel does.
    byField[error.property] = constraints.isNotEmpty
      ? [constraints.isNotEmpty]
      : constraints.isString
        ? [constraints.isString]
        : Object.values(constraints);
  }
  return { message: 'The given data was invalid.', errors: byField };
}
