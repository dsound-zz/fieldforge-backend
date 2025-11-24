import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";
import { logger } from "../config/logger";

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn({ err }, "Handled application error");
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }

  logger.error({ err }, "Unhandled error");
  return res.status(500).json({ message: "Internal server error" });
};
