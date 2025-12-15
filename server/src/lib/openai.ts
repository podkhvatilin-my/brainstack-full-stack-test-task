import OpenAI from 'openai';

let client: OpenAI | null = null;

export function getOpenAI(apiKey: string): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey });
  }
  return client;
}
