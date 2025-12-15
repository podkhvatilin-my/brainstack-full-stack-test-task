import { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";

const CONFIG = {
  multipart: {
    maxFileSize: 10 * 1024 * 1024, // 10 MB
  },
};

export async function registerPlugins(fastify: FastifyInstance) {
  await fastify.register(cors, {
    origin: true,
  });

  await fastify.register(multipart, {
    limits: {
      fileSize: CONFIG.multipart.maxFileSize,
    },
  });
}
