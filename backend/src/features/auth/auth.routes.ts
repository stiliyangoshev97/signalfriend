import { Router } from "express";
import { getNonce, verify, me } from "./auth.controller.js";
import { validate } from "../../shared/middleware/validation.js";
import { authenticate } from "../../shared/middleware/auth.js";
import { authRateLimiter } from "../../shared/middleware/rateLimiter.js";
import { getNonceSchema, verifySchema } from "./auth.schemas.js";

const router = Router();

// GET /auth/nonce?address=0x...
router.get("/nonce", authRateLimiter, validate(getNonceSchema, "query"), getNonce);

// POST /auth/verify
router.post("/verify", authRateLimiter, validate(verifySchema), verify);

// GET /auth/me (protected)
router.get("/me", authenticate, me);

export const authRoutes = router;
