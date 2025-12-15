import { type FastifyInstance } from "fastify";
import healthRoute from "./health.js";
import palmistryRoute from "./palmistry.js";

export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  await fastify.register(
    async (app) => {
      await app.register(healthRoute);
      await app.register(palmistryRoute);
    },
    { prefix: "/api" }
  );
}
