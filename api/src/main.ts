import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './app.factory.js';

// Local development: Nest as a plain HTTP server (docker/compose.yaml runs
// it in watch mode). In AWS the same app runs through lambda.ts.
async function bootstrap() {
  const app = configureApp(await NestFactory.create(AppModule));
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
