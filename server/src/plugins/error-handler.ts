import { type FastifyPluginAsync, type FastifyError } from "fastify";
import fp from "fastify-plugin";

const errorHandlerPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.setErrorHandler((error: FastifyError, request, reply) => {
    fastify.log.error(
      {
        err: error,
        url: request.url,
        method: request.method,
      },
      "Request error"
    );

    if (error.validation) {
      return reply.status(400).send({
        error: "Validation Error",
        message: error.message,
        validation: error.validation,
      });
    }

    const statusCode = error.statusCode || 500;
    const message =
      statusCode === 500 && process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : error.message;

    return reply.status(statusCode).send({
      error: error.name || "Error",
      message,
      ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
    });
  });

  await fastify.setNotFoundHandler((request, reply) => {
    fastify.log.warn(
      {
        url: request.url,
        method: request.method,
      },
      "Route not found"
    );

    return reply.status(404).send({
      error: "Not Found",
      message: `Route ${request.method}:${request.url} not found`,
    });
  });
};

export default fp(errorHandlerPlugin);
