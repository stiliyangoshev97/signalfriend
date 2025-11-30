/**
 * @fileoverview Express route handlers for Category endpoints.
 *
 * Provides controllers for CRUD operations on categories:
 * - GET /api/categories - List all categories
 * - GET /api/categories/:slug - Get category by slug
 * - POST /api/categories - Create category (auth required)
 * - PUT /api/categories/:slug - Update category (auth required)
 * - DELETE /api/categories/:slug - Delete category (auth required)
 *
 * @module features/categories/category.controller
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/features/categories/category.controller.ts
import type { Request, Response } from "express";
import { CategoryService } from "./category.service.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import type {
  ListCategoriesQuery,
  GetCategoryBySlugParams,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.schemas.js";

/**
 * GET /api/categories
 * Lists all categories, optionally filtered by active status.
 *
 * @query {boolean} [active] - If "true", only returns active categories
 * @returns {Object} JSON response with array of categories
 */
export const listCategories = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { active } = req.query as unknown as ListCategoriesQuery;

  const categories = await CategoryService.getAll(active);

  res.json({
    success: true,
    data: categories,
  });
});

/**
 * GET /api/categories/:slug
 * Retrieves a single category by its URL-friendly slug.
 *
 * @param {string} slug - The category slug from URL params
 * @returns {Object} JSON response with category data
 * @throws {404} If category not found
 */
export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params as GetCategoryBySlugParams;

  const category = await CategoryService.getBySlug(slug);

  res.json({
    success: true,
    data: category,
  });
});

/**
 * POST /api/categories
 * Creates a new category. Requires authentication (admin only in production).
 *
 * @body {CreateCategoryInput} Category data (name, slug, description, icon, isActive, sortOrder)
 * @returns {Object} JSON response with created category (201 status)
 * @throws {409} If category name or slug already exists
 */
export const createCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = req.body as CreateCategoryInput;

  const category = await CategoryService.create(data);

  res.status(201).json({
    success: true,
    data: category,
  });
});

/**
 * PUT /api/categories/:slug
 * Updates an existing category. Requires authentication (admin only in production).
 *
 * @param {string} slug - The category slug from URL params
 * @body {UpdateCategoryInput} Fields to update (all optional)
 * @returns {Object} JSON response with updated category
 * @throws {404} If category not found
 * @throws {409} If new name conflicts with existing category
 */
export const updateCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params as GetCategoryBySlugParams;
  const data = req.body as UpdateCategoryInput;

  const category = await CategoryService.update(slug, data);

  res.json({
    success: true,
    data: category,
  });
});

/**
 * DELETE /api/categories/:slug
 * Deletes a category. Requires authentication (admin only in production).
 *
 * @param {string} slug - The category slug from URL params
 * @returns {Object} JSON response with success message
 * @throws {404} If category not found
 */
export const deleteCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params as GetCategoryBySlugParams;

  await CategoryService.delete(slug);

  res.json({
    success: true,
    message: "Category deleted successfully",
  });
});
