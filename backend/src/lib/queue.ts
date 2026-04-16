import { Queue, Worker, Processor } from "bullmq";
import Redis from "ioredis";
import { env } from "../config/env";
import { logger } from "../config/logger";

const connection = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  maxRetriesPerRequest: null,
});

let signalsQueue: Queue | null = null;
let activeWorkers: Worker[] = [];

export const startQueue = async () => {
  if (signalsQueue) return signalsQueue;

  signalsQueue = new Queue("extract-signals", { connection });
  logger.info("Job queue started");
  
  return signalsQueue;
};

export const getQueue = () => {
  if (!signalsQueue) {
    throw new Error("Queue not initialized. Call startQueue() first.");
  }
  return signalsQueue;
};

export const createWorker = (queueName: string, processor: Processor) => {
  const worker = new Worker(queueName, processor, { connection });
  
  worker.on("failed", (job, err) => {
    logger.error(`Job \${job?.id} failed`, { error: err });
  });

  activeWorkers.push(worker);
  return worker;
};

export const stopQueue = async () => {
  logger.info("Stopping queue and workers...");
  for (const worker of activeWorkers) {
    await worker.close();
  }
  if (signalsQueue) {
    await signalsQueue.close();
    signalsQueue = null;
  }
  await connection.quit();
  logger.info("Job queue stopped");
};
