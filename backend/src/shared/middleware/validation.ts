import type { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

type ValidateTarget = "body" | "query" | "params";

export function validate(schema: ZodSchema, target: ValidateTarget = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[target]);
      req[target] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        next(ApiError.badRequest("Validation failed", errors));
      } else {
        next(error);
      }
    }
  };
}
