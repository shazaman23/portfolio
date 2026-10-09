import { Inject, Injectable } from '@nestjs/common';
import {
  type DynamoDBDocumentClient,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { APP_CONFIG, type AppConfig } from '../config.js';
import { CLOCK, DYNAMODB, type Clock } from '../aws/dynamodb.js';

// Takes one of today's contact sends, or reports the day is used up.
export interface SendCap {
  tryReserve(): Promise<boolean>;
}

export const SEND_CAP = Symbol('SEND_CAP');

const TWO_DAYS_IN_SECONDS = 2 * 24 * 60 * 60;

// The hard ceiling on contact email (DAILY_SEND_CAP per UTC day), so a bot
// can't run up Mailgun charges on the shared account. One counter item per
// day lives in the experiences table; a conditional ADD makes the check and
// the increment one atomic step, so concurrent requests can't overshoot.
// DynamoDB's TTL deletes old counters.
@Injectable()
export class DynamoSendCap implements SendCap {
  constructor(
    @Inject(DYNAMODB) private readonly db: DynamoDBDocumentClient,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    @Inject(CLOCK) private readonly now: Clock,
  ) {}

  async tryReserve(): Promise<boolean> {
    const now = this.now();
    try {
      await this.db.send(
        new UpdateCommand({
          TableName: this.config.tableName,
          Key: {
            id: `contact-sends#${now.toISOString().slice(0, 10)}`,
          },
          UpdateExpression:
            'ADD #count :one SET #kind = :kind, #expiresAt = :expiresAt',
          ConditionExpression: 'attribute_not_exists(#count) OR #count < :cap',
          ExpressionAttributeNames: {
            '#count': 'count',
            '#kind': 'kind',
            '#expiresAt': 'expiresAt',
          },
          ExpressionAttributeValues: {
            ':one': 1,
            ':cap': this.config.dailySendCap,
            ':kind': 'counter',
            ':expiresAt':
              Math.floor(now.getTime() / 1000) + TWO_DAYS_IN_SECONDS,
          },
        }),
      );
      return true;
    } catch (error) {
      if ((error as Error).name === 'ConditionalCheckFailedException') {
        return false;
      }
      throw error;
    }
  }
}
