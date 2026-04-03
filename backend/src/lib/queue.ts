import PgBoss from "pg-boss";
import { env } from "../config/env";
import { logger } from "../config/logger";

let boss: PgBoss | null = null;

export const startQueue = async () => {
  if (boss) return boss;

  boss = new PgBoss(env.DATABASE_URL);

  boss.on("error", (error: unknown) => logger.error("Queue error", { error }));

  await boss.start();
  logger.info("Job queue started");
  
  return boss;
};

export const getQueue = () => {
  if (!boss) {
    throw new Error("Queue not initialized. Call startQueue() first.");
  }
  return boss;
};

export const stopQueue = async () => {
  if (boss) {
    await boss.stop();
    logger.info("Job queue stopped");
    boss = null;
  }
};
