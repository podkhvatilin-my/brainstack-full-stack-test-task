import { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";

const CONFIG = {
  isProduction: process.env.NODE_ENV === "production",
  cors: {
    origin: process.env.CORS_ORIGIN || false,
  },
  rateLimit: {
    maxRequests: 100,
    timeWindow: "15 minutes",
  },
  multipart: {
    maxFileSize: 10 * 1024 * 1024, // 10 MB
  },
};

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
    max: CONFIG.rateLimit.maxRequests,
    timeWindow: CONFIG.rateLimit.timeWindow,
  });

  await fastify.register(cors, {
    origin: CONFIG.isProduction ? CONFIG.cors.origin : true,
    credentials: true,
  });

  await fastify.register(multipart, {
    limits: {
      fileSize: CONFIG.multipart.maxFileSize,
    },
  });
}
