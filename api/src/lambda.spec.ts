import { Body, Controller, Get, Module, Post } from '@nestjs/common';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { createHandler } from './lambda.js';

// A tiny module stands in for AppModule, so this tests the Lambda wrapper
// (event in, Nest in the middle, API Gateway response out) without AWS.
@Controller('ping')
class PingController {
  static boots = 0;
  constructor() {
    PingController.boots++;
  }

  @Get()
  ping() {
    return { pong: true };
  }

  @Post()
  echo(@Body() body: Record<string, unknown>) {
    return { received: body };
  }
}

@Module({ controllers: [PingController] })
class PingModule {}

// The shape API Gateway HTTP APIs send (payload format 2.0).
function event(
  method: string,
  path: string,
  body?: object,
): APIGatewayProxyEventV2 {
  return {
    version: '2.0',
    routeKey: '$default',
    rawPath: path,
    rawQueryString: '',
    headers: {
      host: 'abc123.execute-api.us-west-2.amazonaws.com',
      'content-type': 'application/json',
    },
    requestContext: {
      accountId: '123456789012',
      apiId: 'abc123',
      domainName: 'abc123.execute-api.us-west-2.amazonaws.com',
      domainPrefix: 'abc123',
      http: {
        method,
        path,
        protocol: 'HTTP/1.1',
        sourceIp: '198.51.100.1',
        userAgent: 'vitest',
      },
      requestId: 'req-1',
      routeKey: '$default',
      stage: '$default',
      time: '04/Oct/2026:00:00:00 +0000',
      timeEpoch: 1790000000000,
    },
    body: body ? JSON.stringify(body) : undefined,
    isBase64Encoded: false,
  };
}

const context = {} as Context;

describe('Lambda handler', () => {
  const handler = createHandler(PingModule);

  it('routes an HTTP API event through Nest, under the /api prefix', async () => {
    const res = await handler(event('GET', '/api/ping'), context);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body!)).toEqual({ pong: true });
    expect(res.headers?.['content-type']).toMatch(/json/);
  });

  it('passes a JSON body through', async () => {
    const res = await handler(
      event('POST', '/api/ping', { hello: 'world' }),
      context,
    );

    expect(res.statusCode).toBe(201);
    expect(JSON.parse(res.body!)).toEqual({ received: { hello: 'world' } });
  });

  it('answers 404 for an unknown path', async () => {
    const res = await handler(event('GET', '/api/nope'), context);

    expect(res.statusCode).toBe(404);
  });

  it('boots Nest once and reuses it across invocations', () => {
    expect(PingController.boots).toBe(1);
  });
});
