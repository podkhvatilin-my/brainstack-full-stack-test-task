import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import imageStorage from "./plugins/imageStorage.js";
import { routes } from "./routes/index.js";

const fastify = Fastify({
  logger: true,
});

await fastify.register(cors, {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN || false
    : true,
});
await fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});
await fastify.register(imageStorage);

await fastify.register(routes, { prefix: '/api' });

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

    await fastify.listen({ port, host: "0.0.0.0" });
    console.log(`Server running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
