/**
 * @fileoverview Integra    it("should return proper error message for 404", async () => {
      const response = await request(app).get("/api/does-not-exist");

      expect(response.body.error).toBeDefined();
      expect(typeof response.body.error).toBe("string");
      expect(response.body.error.toLowerCase()).toContain("not found");
    });ests for the error handling middleware.
 *
 * Tests 404 handling and error response formatting.
 *
 * @module tests/integration/errorHandling.test
 */

import { describe, it, expect } from "vitest";
import request from "supertest";
import { createTestApp } from "./helpers/testApp.js";

describe("Error Handling", () => {
  const app = createTestApp();

  describe("404 Not Found", () => {
    it("should return 404 for non-existent route", async () => {
      const response = await request(app).get("/api/nonexistent");

      expect(response.status).toBe(404);
    });

    it("should return success false for 404", async () => {
      const response = await request(app).get("/api/unknown-endpoint");

      expect(response.body.success).toBe(false);
    });

    it("should return proper error message for 404", async () => {
      const response = await request(app).get("/api/does-not-exist");

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain("not found");
    });

    it("should return 404 for unregistered POST route", async () => {
      const response = await request(app)
        .post("/api/nonexistent")
        .send({ data: "test" });

      expect(response.status).toBe(404);
    });

    it("should return 404 for unregistered PUT route", async () => {
      const response = await request(app)
        .put("/api/nonexistent/123")
        .send({ data: "test" });

      expect(response.status).toBe(404);
    });

    it("should return 404 for unregistered DELETE route", async () => {
      const response = await request(app).delete("/api/nonexistent/123");

      expect(response.status).toBe(404);
    });
  });

  describe("JSON Response Format", () => {
    it("should return JSON content-type for errors", async () => {
      const response = await request(app).get("/api/nonexistent");

      expect(response.headers["content-type"]).toMatch(/application\/json/);
    });

    it("should have consistent error response structure", async () => {
      const response = await request(app).get("/api/nonexistent");

      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("error");
      expect(typeof response.body.error).toBe("string");
    });
  });
});
