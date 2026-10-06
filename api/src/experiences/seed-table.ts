import {
  BatchWriteCommand,
  type DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import type { Experience } from './experience.js';
import { seedRequests } from './content.js';

// Upserts experiences into a table, retrying anything DynamoDB leaves
// unprocessed. Used by `npm run seed` and the end-to-end tests.
export async function seedTable(
  db: DynamoDBDocumentClient,
  tableName: string,
  experiences: Experience[],
): Promise<void> {
  for (const batch of seedRequests(experiences, tableName)) {
    let pending = batch[tableName];
    for (let attempt = 1; pending.length > 0; attempt++) {
      if (attempt > 5)
        throw new Error(
          `${pending.length} items still unprocessed after 5 attempts`,
        );
      const result = await db.send(
        new BatchWriteCommand({
          RequestItems: { [tableName]: pending },
        }),
      );
      pending = (result.UnprocessedItems?.[tableName] ?? []) as typeof pending;
    }
  }
}
