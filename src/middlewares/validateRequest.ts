import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validateRequest =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors ?? error.message,
      });
    }
  };