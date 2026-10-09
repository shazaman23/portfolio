import { NestFactory } from '@nestjs/core';
import { configure as serverlessExpress } from '@codegenie/serverless-express';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Context,
} from 'aws-lambda';
import { AppModule } from './app.module.js';
import { configureApp } from './app.factory.js';

type HttpApiHandler = (
  event: APIGatewayProxyEventV2,
  context: Context,
) => Promise<APIGatewayProxyStructuredResultV2>;

// Boots Nest once per Lambda execution environment and reuses it for every
// later invocation, so only cold starts pay the startup cost. A failed boot
// isn't cached, so the next invocation retries it.
export function createHandler(rootModule: unknown): HttpApiHandler {
  let ready: Promise<HttpApiHandler> | undefined;

  async function boot(): Promise<HttpApiHandler> {
    const app = configureApp(await NestFactory.create(rootModule as never));
    await app.init();
    return serverlessExpress({
      app: app.getHttpAdapter().getInstance(),
    }) as unknown as HttpApiHandler;
  }

  return async (event, context) => {
    ready ??= boot().catch((error: unknown) => {
      ready = undefined;
      throw error;
    });
    return (await ready)(event, context);
  };
}

export const handler = createHandler(AppModule);
