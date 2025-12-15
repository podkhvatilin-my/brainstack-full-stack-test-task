import Fastify, {
  type FastifyInstance,
  type FastifyServerOptions,
} from "fastify";
import { registerPlugins } from "./plugins/index.js";
import { registerRoutes } from "./routes/index.js";

export async function build(
  opts: FastifyServerOptions = {}
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL || "info" },
    ...opts,
  });

  await registerPlugins(app);
  await registerRoutes(app);

  return app;
}
