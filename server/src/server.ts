import { build } from "./app.js";

async function start() {
  const app = await build();

  try {
    await app.listen({
      port: app.config.PORT,
      host: app.config.HOST,
    });

    app.log.info(`Server listening on ${app.config.HOST}:${app.config.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  const closeGracefully = async (signal: string) => {
    app.log.info(`Received ${signal}, closing server gracefully`);

    try {
      await app.close();
      app.log.info("Server closed successfully");
      process.exit(0);
    } catch (err) {
      app.log.error(err, "Error during graceful shutdown");
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => closeGracefully("SIGTERM"));
  process.on("SIGINT", () => closeGracefully("SIGINT"));

  process.on("uncaughtException", (err) => {
    app.log.error(err, "Uncaught exception");
    process.exit(1);
  });

  process.on("unhandledRejection", (err) => {
    app.log.error(err, "Unhandled rejection");
    process.exit(1);
  });
}

start();
