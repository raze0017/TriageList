import { Router } from "express";
import { createJdHandler, listJdHandler } from "./jd.controller";

export const jdRouter = Router();

jdRouter.post("/", createJdHandler);
jdRouter.get("/", listJdHandler);
