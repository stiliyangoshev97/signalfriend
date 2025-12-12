/**
 * @fileoverview Unit tests for ApiError utility class.
 *
 * Tests the custom error class used for API responses
 * with HTTP status codes and factory methods.
 *
 * @module tests/unit/utils/ApiError.test
 */

import { describe, it, expect } from "vitest";
import { ApiError } from "../../../src/shared/utils/ApiError.js";

describe("ApiError", () => {
  describe("constructor", () => {
    it("should create an error with status code and message", () => {
      const error = new ApiError(400, "Bad request");
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Bad request");
    });

    it("should create an error with details", () => {
      const details = { field: "email", issue: "invalid format" };
      const error = new ApiError(400, "Validation error", details);
      expect(error.details).toEqual(details);
    });

    it("should set the error name to ApiError", () => {
      const error = new ApiError(500, "Server error");
      expect(error.name).toBe("ApiError");
    });

    it("should be an instance of Error", () => {
      const error = new ApiError(404, "Not found");
      expect(error).toBeInstanceOf(Error);
    });

    it("should be an instance of ApiError", () => {
      const error = new ApiError(403, "Forbidden");
      expect(error).toBeInstanceOf(ApiError);
    });

    it("should have a stack trace", () => {
      const error = new ApiError(500, "Error");
      expect(error.stack).toBeDefined();
    });
  });

  describe("static factory methods", () => {
    describe("badRequest", () => {
      it("should create a 400 error with default message", () => {
        const error = ApiError.badRequest();
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Bad request");
      });

      it("should create a 400 error with custom message", () => {
        const error = ApiError.badRequest("Invalid input");
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid input");
      });

      it("should create a 400 error with details", () => {
        const details = { errors: [{ field: "name", message: "required" }] };
        const error = ApiError.badRequest("Validation failed", details);
        expect(error.statusCode).toBe(400);
        expect(error.details).toEqual(details);
      });
    });

    describe("unauthorized", () => {
      it("should create a 401 error with default message", () => {
        const error = ApiError.unauthorized();
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe("Unauthorized");
      });

      it("should create a 401 error with custom message", () => {
        const error = ApiError.unauthorized("Invalid token");
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe("Invalid token");
      });
    });

    describe("forbidden", () => {
      it("should create a 403 error with default message", () => {
        const error = ApiError.forbidden();
        expect(error.statusCode).toBe(403);
        expect(error.message).toBe("Forbidden");
      });

      it("should create a 403 error with custom message", () => {
        const error = ApiError.forbidden("Admin access required");
        expect(error.statusCode).toBe(403);
        expect(error.message).toBe("Admin access required");
      });
    });

    describe("notFound", () => {
      it("should create a 404 error with default message", () => {
        const error = ApiError.notFound();
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Not found");
      });

      it("should create a 404 error with custom message", () => {
        const error = ApiError.notFound("Signal not found");
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Signal not found");
      });
    });

    describe("conflict", () => {
      it("should create a 409 error with default message", () => {
        const error = ApiError.conflict();
        expect(error.statusCode).toBe(409);
        expect(error.message).toBe("Conflict");
      });

      it("should create a 409 error with custom message", () => {
        const error = ApiError.conflict("Display name already taken");
        expect(error.statusCode).toBe(409);
        expect(error.message).toBe("Display name already taken");
      });
    });

    describe("tooManyRequests", () => {
      it("should create a 429 error with default message", () => {
        const error = ApiError.tooManyRequests();
        expect(error.statusCode).toBe(429);
        expect(error.message).toBe("Too many requests");
      });

      it("should create a 429 error with custom message", () => {
        const error = ApiError.tooManyRequests("Rate limit exceeded. Try again in 60 seconds.");
        expect(error.statusCode).toBe(429);
        expect(error.message).toBe("Rate limit exceeded. Try again in 60 seconds.");
      });
    });

    describe("internal", () => {
      it("should create a 500 error with default message", () => {
        const error = ApiError.internal();
        expect(error.statusCode).toBe(500);
        expect(error.message).toBe("Internal server error");
      });

      it("should create a 500 error with custom message", () => {
        const error = ApiError.internal("Database connection failed");
        expect(error.statusCode).toBe(500);
        expect(error.message).toBe("Database connection failed");
      });
    });
  });

  describe("error handling", () => {
    it("should be throwable", () => {
      expect(() => {
        throw ApiError.badRequest("Test error");
      }).toThrow(ApiError);
    });

    it("should be catchable with correct properties", () => {
      try {
        throw ApiError.notFound("Resource not found");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        if (error instanceof ApiError) {
          expect(error.statusCode).toBe(404);
          expect(error.message).toBe("Resource not found");
        }
      }
    });

    it("should preserve stack trace", () => {
      const error = ApiError.internal("Test");
      expect(error.stack).toContain("ApiError");
    });
  });
});
