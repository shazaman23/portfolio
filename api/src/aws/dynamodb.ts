import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export const DYNAMODB = Symbol('DYNAMODB');
export const CLOCK = Symbol('CLOCK');
export type Clock = () => Date;

// Region comes from AWS_REGION. Locally AWS_ENDPOINT_URL points every SDK
// client at LocalStack, so no code here knows which one it's talking to.
export function createDocumentClient(): DynamoDBDocumentClient {
  return DynamoDBDocumentClient.from(new DynamoDBClient({}), {
    marshallOptions: { removeUndefinedValues: true },
  });
}
