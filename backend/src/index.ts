import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./lib/prisma";
import { startQueue, stopQueue, createWorker } from "./lib/queue";
import { extractSignalsWorker } from "./workers/extractSignals.worker";

const startServer = async () => {
  await startQueue();
  createWorker("extract-signals", extractSignalsWorker);

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
        await stopQueue();
        await prisma.$disconnect();
        logger.info("All services disconnected. Shutdown complete.");
        process.exit(0);
      } catch (disconnectError) {
        logger.error("Failed during service disconnect", disconnectError);
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
};

void startServer();
