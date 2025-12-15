import "fastify";

declare module "fastify" {
  interface FastifyInstance {
    config: {
      PORT: number;
      HOST: string;
      NODE_ENV: string;
      LOG_LEVEL: string;
      CORS_ORIGIN: string;
      OPENAI_API_KEY: string;
    };
  }
}
