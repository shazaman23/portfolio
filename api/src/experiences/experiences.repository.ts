import { Inject, Injectable } from '@nestjs/common';
import {
  type DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { APP_CONFIG, type AppConfig } from '../config.js';
import { DYNAMODB } from '../aws/dynamodb.js';
import { EXPERIENCE_KIND, type Experience } from './experience.js';

// Reads experiences from the environment's table. There are only a handful,
// so a filtered Scan is fine.
@Injectable()
export class ExperiencesRepository {
  constructor(
    @Inject(DYNAMODB) private readonly db: DynamoDBDocumentClient,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  async list(): Promise<Experience[]> {
    const items: Record<string, unknown>[] = [];
    let startKey: Record<string, unknown> | undefined;
    do {
      const page = await this.db.send(
        new ScanCommand({
          TableName: this.config.tableName,
          FilterExpression: '#kind = :kind',
          ExpressionAttributeNames: { '#kind': 'kind' },
          ExpressionAttributeValues: { ':kind': EXPERIENCE_KIND },
          ExclusiveStartKey: startKey,
        }),
      );
      items.push(...(page.Items ?? []));
      startKey = page.LastEvaluatedKey;
    } while (startKey);

    return items.map(toExperience).sort((a, b) => Number(a.id) - Number(b.id));
  }

  async get(id: string): Promise<Experience | undefined> {
    const { Item } = await this.db.send(
      new GetCommand({ TableName: this.config.tableName, Key: { id } }),
    );
    return Item?.kind === EXPERIENCE_KIND ? toExperience(Item) : undefined;
  }
}

function toExperience({
  kind: _kind,
  ...experience
}: Record<string, unknown>): Experience {
  return experience as unknown as Experience;
}
