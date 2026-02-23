import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { apiV1Router } from "./routes/v1";
import { errorHandler } from "./middlewares/error-handler";
import { notFoundHandler } from "./middlewares/not-found";
import { rateLimit } from "./middlewares/rate-limit";
import { requestContext } from "./middlewares/request-context";
import { securityHeaders } from "./middlewares/security-headers";

export const createApp = () => {
  const app = express();

  app.disable("x-powered-by");
  app.use(requestContext);
  app.use(securityHeaders);
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "X-Request-Id"],
      credentials: false,
      maxAge: 600,
    }),
  );
  app.use(rateLimit);
  app.use(express.json({ limit: "1mb" }));

  app.use("/api/v1", apiV1Router);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
