import Fastify from "fastify";
import { registerPlugins } from "./plugins";
import { routes } from "./routes";

const fastify = Fastify({
  logger: true,
});

await registerPlugins(fastify);

await fastify.register(routes, { prefix: "/api" });

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
