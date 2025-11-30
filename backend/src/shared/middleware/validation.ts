/**
 * @fileoverview Zod schema validation middleware for Express.
 *
 * Provides a factory function that creates middleware for validating
 * request body, query parameters, or path parameters against Zod schemas.
 *
 * @module shared/middleware/validation
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/shared/middleware/validation.ts
import type { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

/** Target location for validation (body, query, or params) */
type ValidateTarget = "body" | "query" | "params";

/**
 * Creates a validation middleware for the specified Zod schema and target.
 *
 * On successful validation, the parsed data replaces the original data,
 * ensuring type coercion and default values are applied.
 *
 * @param schema - Zod schema to validate against
 * @param target - Request property to validate (default: "body")
 * @returns Express middleware function
 *
 * @example
 * ```typescript
 * router.post("/", validate(createUserSchema), createUser);
 * router.get("/", validate(listUsersSchema, "query"), listUsers);
 * ```
 */
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
