import { Injectable } from '@nestjs/common';
import { getParameter } from '@aws-lambda-powertools/parameters/ssm';

// Reads a secret by its Parameter Store name.
export interface SecretSource {
  get(name: string): Promise<string>;
}

// The one place the API reads secrets (see "Secrets" in the rebuild plan).
// Values stay in memory, cached for 5 minutes so a rotated key takes effect
// without a redeploy. Never copy a value into process.env or a log line.
@Injectable()
export class SecretsService implements SecretSource {
  async get(name: string): Promise<string> {
    const value = await getParameter(name, { decrypt: true, maxAge: 300 });
    if (!value) {
      throw new Error(`Parameter ${name} is empty or missing`);
    }
    return value;
  }
}
