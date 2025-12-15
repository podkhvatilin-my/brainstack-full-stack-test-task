import { type FastifyPluginAsync } from "fastify";
import multipart from "@fastify/multipart";
import fp from "fastify-plugin";

const multipartPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB
    },
  });
};

export default fp(multipartPlugin);
