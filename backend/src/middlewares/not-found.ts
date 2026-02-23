import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(404, "NOT_FOUND", `Route not found: ${req.method} ${req.originalUrl}`));
};
