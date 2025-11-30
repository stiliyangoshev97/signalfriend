/**
 * @fileoverview Business logic service for Category operations.
 *
 * Provides CRUD operations for categories with:
 * - Duplicate checking for name and slug
 * - Proper error handling with ApiError
 * - Database operations via Mongoose
 *
 * @module features/categories/category.service
 */
// filepath: /Users/stiliyangoshev/Desktop/Coding/Full Projects/SignalFriend/backend/src/features/categories/category.service.ts
import { Category, ICategory } from "./category.model.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import type { CreateCategoryInput, UpdateCategoryInput } from "./category.schemas.js";

/**
 * Service class for Category business logic.
 * All methods are static for stateless operation.
 */
export class CategoryService {
  /**
   * Retrieves all categories, optionally filtered by active status.
   *
   * @param activeOnly - If true, only returns active categories
   * @returns Promise resolving to array of categories sorted by sortOrder, then name
   */
  static async getAll(activeOnly?: boolean): Promise<ICategory[]> {
    const filter = activeOnly ? { isActive: true } : {};
    return Category.find(filter).sort({ sortOrder: 1, name: 1 });
  }

  /**
   * Retrieves a single category by its URL-friendly slug.
   *
   * @param slug - The category slug to look up
   * @returns Promise resolving to the category document
   * @throws {ApiError} 404 if category not found
   */
  static async getBySlug(slug: string): Promise<ICategory> {
    const category = await Category.findOne({ slug });
    if (!category) {
      throw ApiError.notFound(`Category '${slug}' not found`);
    }
    return category;
  }

  /**
   * Retrieves a single category by its MongoDB ObjectId.
   *
   * @param id - The category ObjectId
   * @returns Promise resolving to the category document
   * @throws {ApiError} 404 if category not found
   */
  static async getById(id: string): Promise<ICategory> {
    const category = await Category.findById(id);
    if (!category) {
      throw ApiError.notFound("Category not found");
    }
    return category;
  }

  /**
   * Creates a new category in the database.
   * Validates that neither name nor slug already exist.
   *
   * @param data - The category data to create
   * @returns Promise resolving to the created category document
   * @throws {ApiError} 409 if name or slug already exists
   */
  static async create(data: CreateCategoryInput): Promise<ICategory> {
    // Check for duplicate name or slug
    const existing = await Category.findOne({
      $or: [{ name: data.name }, { slug: data.slug }],
    });

    if (existing) {
      if (existing.name === data.name) {
        throw ApiError.conflict(`Category with name '${data.name}' already exists`);
      }
      throw ApiError.conflict(`Category with slug '${data.slug}' already exists`);
    }

    const category = new Category(data);
    await category.save();
    return category;
  }

  /**
   * Updates an existing category by slug.
   * Validates that the new name (if provided) doesn't conflict with existing categories.
   *
   * @param slug - The slug of the category to update
   * @param data - The fields to update
   * @returns Promise resolving to the updated category document
   * @throws {ApiError} 404 if category not found
   * @throws {ApiError} 409 if new name conflicts with existing category
   */
  static async update(slug: string, data: UpdateCategoryInput): Promise<ICategory> {
    const category = await Category.findOne({ slug });
    if (!category) {
      throw ApiError.notFound(`Category '${slug}' not found`);
    }

    // Check for duplicate name if name is being updated
    if (data.name && data.name !== category.name) {
      const existing = await Category.findOne({ name: data.name });
      if (existing) {
        throw ApiError.conflict(`Category with name '${data.name}' already exists`);
      }
    }

    Object.assign(category, data);
    await category.save();
    return category;
  }

  /**
   * Deletes a category by slug.
   *
   * @param slug - The slug of the category to delete
   * @throws {ApiError} 404 if category not found
   * @todo Check if any signals use this category before deleting
   */
  static async delete(slug: string): Promise<void> {
    const category = await Category.findOne({ slug });
    if (!category) {
      throw ApiError.notFound(`Category '${slug}' not found`);
    }

    // TODO: Check if any signals use this category
    // const signalCount = await Signal.countDocuments({ categoryId: category._id });
    // if (signalCount > 0) {
    //   throw ApiError.conflict(`Cannot delete category with ${signalCount} signals`);
    // }

    await category.deleteOne();
  }

  /**
   * Checks if a category exists by its MongoDB ObjectId.
   *
   * @param id - The category ObjectId to check
   * @returns Promise resolving to true if category exists, false otherwise
   */
  static async exists(id: string): Promise<boolean> {
    const count = await Category.countDocuments({ _id: id });
    return count > 0;
  }
}
