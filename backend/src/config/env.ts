import dotenv from "dotenv";

dotenv.config();

const getRequired = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 4000),
  DATABASE_URL: getRequired("DATABASE_URL"),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "*",
};
