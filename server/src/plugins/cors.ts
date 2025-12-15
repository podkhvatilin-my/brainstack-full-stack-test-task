import { type FastifyPluginAsync } from "fastify";
import cors from "@fastify/cors";
import fp from "fastify-plugin";

const corsPlugin: FastifyPluginAsync = async (fastify) => {
  const corsOrigin = process.env.CORS_ORIGIN || "*";

  await fastify.register(cors, {
    origin: corsOrigin === "*" ? true : corsOrigin,
    credentials: true,
  });
};

export default fp(corsPlugin);
