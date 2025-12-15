import { type FastifyInstance } from "fastify";
import envPlugin from "./env.js";
import corsPlugin from "./cors.js";
import multipartPlugin from "./multipart.js";
import errorHandlerPlugin from "./error-handler.js";

export async function registerPlugins(fastify: FastifyInstance): Promise<void> {
  await fastify.register(envPlugin);
  await fastify.register(errorHandlerPlugin);
  await fastify.register(corsPlugin);
  await fastify.register(multipartPlugin);

  if (process.env.NODE_ENV !== "production") {
    fastify.log.info("All plugins registered successfully");
  }
}
