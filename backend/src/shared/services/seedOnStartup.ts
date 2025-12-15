/**
 * @fileoverview Automatic database seeding on server startup
 * 
 * Seeds essential data (categories) if they don't exist.
 * This ensures a fresh deployment has all required data without
 * needing to run manual scripts.
 * 
 * @module shared/services/seedOnStartup
 */

import { Category, DEFAULT_CATEGORIES } from "../../features/categories/category.model.js";
import { logger } from "../config/logger.js";

/**
 * Seeds default categories if none exist in the database.
 * This is idempotent - it only creates categories that don't already exist.
 * 
 * @returns Promise that resolves when seeding is complete
 */
export async function seedCategoriesIfEmpty(): Promise<void> {
  try {
    const existingCount = await Category.countDocuments();
    
    if (existingCount > 0) {
      logger.debug(`📂 Categories already exist (${existingCount} found), skipping seed`);
      return;
    }

    logger.info("📂 No categories found, seeding defaults...");
    
    let created = 0;
    for (const categoryData of DEFAULT_CATEGORIES) {
      // Double-check in case of race condition
      const existing = await Category.findOne({ slug: categoryData.slug });
      if (existing) continue;

      const category = new Category({
        ...categoryData,
        isActive: true,
      });
      await category.save();
      created++;
    }

    logger.info(`✅ Seeded ${created} default categories`);
  } catch (error) {
    // Log but don't crash - categories can be added manually if needed
    logger.error({ err: error }, "⚠️ Failed to seed categories (non-fatal)");
  }
}

/**
 * Runs all startup seed operations.
 * Add additional seed functions here as needed.
 */
export async function runStartupSeeds(): Promise<void> {
  await seedCategoriesIfEmpty();
  // Add other seeds here as needed:
  // await seedOtherDataIfEmpty();
}
