import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./lib/prisma";

const app = createApp();
const server = app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
});

const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  server.close(async (closeError) => {
    if (closeError) {
      logger.error("Failed to close HTTP server cleanly", closeError);
      process.exit(1);
    }

    try {
      await prisma.$disconnect();
      logger.info("Prisma disconnected. Shutdown complete.");
      process.exit(0);
    } catch (disconnectError) {
      logger.error("Failed during Prisma disconnect", disconnectError);
      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
