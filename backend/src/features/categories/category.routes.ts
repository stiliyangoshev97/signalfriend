/**
 * @fileoverview Express router configuration for Category endpoints.
 *
 * Route definitions:
 * - GET /api/categories - Public, list all categories
 * - GET /api/categories/:slug - Public, get category by slug
 * - POST /api/categories - Auth required, create category
 * - PUT /api/categories/:slug - Auth required, update category
 * - DELETE /api/categories/:slug - Auth required, delete category
 *
 * @module features/categories/category.routes
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/features/categories/category.routes.ts
import { Router } from "express";
import {
  listCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./category.controller.js";
import { validate } from "../../shared/middleware/validation.js";
import { authenticate } from "../../shared/middleware/auth.js";
import {
  listCategoriesSchema,
  getCategoryBySlugSchema,
  createCategorySchema,
  updateCategorySchema,
} from "./category.schemas.js";

/** Express router instance for category routes */
const router = Router();

// ============================================================================
// Public Routes
// ============================================================================

/** GET /api/categories - List all categories (filter by ?active=true) */
router.get("/", validate(listCategoriesSchema, "query"), listCategories);

/** GET /api/categories/:slug - Get a single category by slug */
router.get("/:slug", validate(getCategoryBySlugSchema, "params"), getCategoryBySlug);

// ============================================================================
// Protected Routes (Admin only in production)
// ============================================================================
// TODO: Add isAdmin middleware when admin system is implemented

/** POST /api/categories - Create a new category */
router.post("/", authenticate, validate(createCategorySchema), createCategory);

/** PUT /api/categories/:slug - Update an existing category */
router.put("/:slug", authenticate, validate(getCategoryBySlugSchema, "params"), validate(updateCategorySchema), updateCategory);

/** DELETE /api/categories/:slug - Delete a category */
router.delete("/:slug", authenticate, validate(getCategoryBySlugSchema, "params"), deleteCategory);

export const categoryRoutes = router;
