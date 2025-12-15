import { type FastifyPluginAsync } from "fastify";

const healthRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get("/health", {
    schema: {
      description: "Health check endpoint",
      tags: ["health"],
      response: {
        200: {
          type: "object",
          properties: {
            status: { type: "string" },
            timestamp: { type: "number" },
          },
        },
      },
    },
    handler: async () => {
      return {
        status: "ok",
        timestamp: Date.now(),
      };
    },
  });
};

export default healthRoute;
