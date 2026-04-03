import { Router } from "express";
import { uploadApplicationHandler, getApplicationHandler, downloadApplicationFileHandler } from "./applications.controller";
import { upload } from "../../lib/storage";

export const applicationsRouter = Router();

applicationsRouter.post("/", upload.single("file"), uploadApplicationHandler);
applicationsRouter.get("/:id", getApplicationHandler);
applicationsRouter.get("/:id/file", downloadApplicationFileHandler);
