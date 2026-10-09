import { Global, Module } from '@nestjs/common';
import { APP_CONFIG, loadConfig } from './config.js';
import { CLOCK, DYNAMODB, createDocumentClient } from './aws/dynamodb.js';

// App-wide providers: settings, the DynamoDB client, and the clock (which
// tests replace). Config is read once at startup, so a missing variable stops
// the boot with a clear error instead of failing a request later.
@Global()
@Module({
  providers: [
    { provide: APP_CONFIG, useFactory: () => loadConfig() },
    { provide: DYNAMODB, useFactory: createDocumentClient },
    { provide: CLOCK, useValue: () => new Date() },
  ],
  exports: [APP_CONFIG, DYNAMODB, CLOCK],
})
export class CoreModule {}
