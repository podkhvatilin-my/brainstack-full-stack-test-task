import { type FastifyPluginAsync } from "fastify";

export const routes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/health", async () => {
    return { status: "ok" };
  });
};
