// Upserts content/experiences.json into the table named by TABLE_NAME. Runs on
// every local start (compose.yaml) and every deploy.
//
//   TABLE_NAME=portfolio-experiences-qa npm run seed
//
// With --request-file <path> it writes the BatchWriteItem requests as JSON
// for `aws dynamodb batch-write-item` instead of sending them, so a deploy
// run by hand keeps its AWS credentials in the AWS CLI rather than in Node.
//
// It only adds and overwrites: an experience removed from the file stays in
// the table until it's deleted by hand. The deploy role can write items but
// not scan for stale ones.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { marshall } from '@aws-sdk/util-dynamodb';
import { createDocumentClient } from './aws/dynamodb.js';
import { parseExperiences, seedRequests } from './experiences/content.js';
import { seedTable } from './experiences/seed-table.js';

const { values: args } = parseArgs({
  options: { 'request-file': { type: 'string' } },
});
const tableName = process.env.TABLE_NAME;
if (!tableName) {
  throw new Error('Set TABLE_NAME to the table to seed');
}
const file =
  process.env.CONTENT_FILE ??
  resolve(process.cwd(), '../content/experiences.json');
const experiences = parseExperiences(JSON.parse(await readFile(file, 'utf8')));

if (args['request-file']) {
  const batches = seedRequests(experiences, tableName);
  if (batches.length !== 1)
    throw new Error('--request-file supports up to 25 experiences (one batch)');
  const request = {
    [tableName]: batches[0][tableName].map(({ PutRequest }) => ({
      PutRequest: { Item: marshall(PutRequest.Item) },
    })),
  };
  await writeFile(args['request-file'], JSON.stringify(request, null, 2));
  console.log(
    `Wrote ${experiences.length} experience puts for ${tableName} to ${args['request-file']}`,
  );
} else {
  await seedTable(createDocumentClient(), tableName, experiences);
  console.log(
    `Seeded ${experiences.length} experiences into ${tableName} from ${file}`,
  );
}
