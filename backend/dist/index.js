"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const prisma_1 = require("./lib/prisma");
const app = (0, app_1.createApp)();
const server = app.listen(env_1.env.PORT, () => {
    logger_1.logger.info(`Server running on port ${env_1.env.PORT}`);
});
const shutdown = async (signal) => {
    logger_1.logger.info(`Received ${signal}. Starting graceful shutdown...`);
    server.close(async (closeError) => {
        if (closeError) {
            logger_1.logger.error("Failed to close HTTP server cleanly", closeError);
            process.exit(1);
        }
        try {
            await prisma_1.prisma.$disconnect();
            logger_1.logger.info("Prisma disconnected. Shutdown complete.");
            process.exit(0);
        }
        catch (disconnectError) {
            logger_1.logger.error("Failed during Prisma disconnect", disconnectError);
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
