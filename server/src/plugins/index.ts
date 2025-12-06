import { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import sse from "@fastify/sse";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import imageStorage from "./image-storage.plugin";
import { MULTIPART, RATE_LIMIT } from "../config";

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
    max: RATE_LIMIT.MAX_REQUESTS,
    timeWindow: RATE_LIMIT.TIME_WINDOW,
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
      fileSize: MULTIPART.MAX_FILE_SIZE,
    },
  });

  await fastify.register(sse);
  await fastify.register(imageStorage);
}
