import { type FastifyPluginAsync } from "fastify";
import { palmReadingRoute } from "./palm-reading.routes";

export const routes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/health", async () => {
    return { status: "ok" };
  });

  fastify.register(palmReadingRoute, { prefix: "/palm-reading" });
};
