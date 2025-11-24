import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten()
      });
    }
    // attach parsed data to request for downstream handlers
    req.validated = result.data;
    next();
  };
};
