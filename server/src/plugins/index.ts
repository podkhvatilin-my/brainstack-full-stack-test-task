import { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import sse from "@fastify/sse";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import imageStorage from "./image-storage.plugin";

export async function registerPlugins(fastify: FastifyInstance) {
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:"],
      },
    },
  });

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: "15 minutes",
  });

  await fastify.register(cors, {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CORS_ORIGIN || false
        : true,
    credentials: true,
  });

  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB
    },
  });

  await fastify.register(sse);
  await fastify.register(imageStorage);
}
