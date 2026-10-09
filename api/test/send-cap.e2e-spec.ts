import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { createDocumentClient } from '../src/aws/dynamodb.js';
import { loadConfig } from '../src/config.js';
import { DynamoSendCap } from '../src/contact/send-cap.js';
import { uniqueFutureDay } from './support.js';

// The cap's guarantee lives in DynamoDB's conditional update, so it's tested
// against a real table (LocalStack), not a fake.
describe('DynamoSendCap (LocalStack)', () => {
  const db = createDocumentClient();
  const config = loadConfig();
  const capOf = (limit: number, day: Date) =>
    new DynamoSendCap(db, { ...config, dailySendCap: limit }, () => day);

  it('lets exactly the cap through when requests arrive at once', async () => {
    const cap = capOf(3, uniqueFutureDay());

    const results = await Promise.all(
      Array.from({ length: 20 }, () => cap.tryReserve()),
    );

    expect(results.filter(Boolean)).toHaveLength(3);
  });

  it('keeps the day in a counter item that expires two days later', async () => {
    const day = uniqueFutureDay();
    await capOf(5, day).tryReserve();
    await capOf(5, day).tryReserve();

    const key = `contact-sends#${day.toISOString().slice(0, 10)}`;
    const { Item } = await db.send(
      new GetCommand({ TableName: config.tableName, Key: { id: key } }),
    );

    expect(Item).toMatchObject({ id: key, kind: 'counter', count: 2 });
    expect(Item?.expiresAt).toBe(
      Math.floor(day.getTime() / 1000) + 2 * 24 * 60 * 60,
    );
  });

  it('starts each day fresh', async () => {
    const day = uniqueFutureDay();
    const nextDay = new Date(day.getTime() + 24 * 60 * 60 * 1000);
    await capOf(1, day).tryReserve();

    expect(await capOf(1, day).tryReserve()).toBe(false);
    expect(await capOf(1, nextDay).tryReserve()).toBe(true);
  });
});
