import fs from "fs";
import multer from "multer";
import path from "path";
import { env } from "../config/env";
import { AppError } from "../errors/app-error";

// Ensure the upload directory exists
if (!fs.existsSync(env.UPLOAD_DIR)) {
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: (error: Error | null, destination: string) => void) => {
    cb(null, env.UPLOAD_DIR);
  },
  filename: (_req: any, _file: any, cb: (error: Error | null, filename: string) => void) => {
    // We'll rename the file inside the service using the Application UUID
    cb(null, `temp-${Date.now()}-${Math.round(Math.random() * 1e9)}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (_req: any, file: any, cb: multer.FileFilterCallback) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new AppError(422, "INVALID_FILE_TYPE", "Only PDF files are allowed."));
    }
    cb(null, true);
  },
});
