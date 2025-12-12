/**
 * @fileoverview Integration tests for the Health endpoint.
 *
 * Tests the /health endpoint which provides server status information.
 *
 * @module tests/integration/health.test
 */

import { describe, it, expect } from "vitest";
import request from "supertest";
import { createTestApp } from "./helpers/testApp.js";

describe("Health Endpoint", () => {
  const app = createTestApp();

  describe("GET /health", () => {
    it("should return 200 OK with success response", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should return status ok", async () => {
      const response = await request(app).get("/health");

      expect(response.body.data.status).toBe("ok");
    });

    it("should return env as test", async () => {
      const response = await request(app).get("/health");

      expect(response.body.data.env).toBe("test");
    });

    it("should return a valid timestamp", async () => {
      const response = await request(app).get("/health");

      expect(response.body.data.timestamp).toBeDefined();
      const timestamp = new Date(response.body.data.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });

    it("should return proper JSON content-type", async () => {
      const response = await request(app).get("/health");

      expect(response.headers["content-type"]).toMatch(/application\/json/);
    });
  });
});
