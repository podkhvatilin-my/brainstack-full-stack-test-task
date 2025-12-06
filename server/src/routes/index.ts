import { type FastifyPluginAsync } from "fastify";
import { imagesRoute } from "./images.js";

export const routes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/health", async () => {
    return { status: "ok" };
  });

  fastify.register(imagesRoute, { prefix: "/images" });
};
