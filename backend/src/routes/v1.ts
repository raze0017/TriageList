import { Router } from "express";
import { openApiDocument } from "../docs/openapi";
import { healthRouter } from "../modules/health/health.routes";
import { createJdHandler } from "../modules/jd/jd.controller";
import { jdRouter } from "../modules/jd/jd.routes";

export const apiV1Router = Router();

apiV1Router.use("/health", healthRouter);
apiV1Router.use("/jds", jdRouter);
apiV1Router.post("/jd", createJdHandler);

apiV1Router.get("/docs", (_req, res) => {
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.status(200).json(openApiDocument);
});
