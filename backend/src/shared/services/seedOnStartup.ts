/**
 * @fileoverview Automatic database seeding on server startup
 * 
 * Seeds essential data (categories) if they don't exist or if
 * the category schema has changed (detected by count mismatch).
 * This ensures a fresh deployment has all required data without
 * needing to run manual scripts.
 * 
 * @module shared/services/seedOnStartup
 */

import { Category, DEFAULT_CATEGORIES } from "../../features/categories/category.model.js";
import { logger } from "../config/logger.js";

/**
 * Current version of the category schema.
 * Increment this when DEFAULT_CATEGORIES changes significantly
 * to force a reseed on existing deployments.
 */
const CATEGORY_SCHEMA_VERSION = 2; // v2 = prediction market categories (29 categories)

/**
 * Seeds default categories if none exist or if schema has changed.
 * Detects changes by comparing expected vs actual category count
 * and checking for new mainGroup values.
 * 
 * @returns Promise that resolves when seeding is complete
 */
export async function seedCategoriesIfEmpty(): Promise<void> {
  try {
    const existingCount = await Category.countDocuments();
    const expectedCount = DEFAULT_CATEGORIES.length;
    
    // Check if we need to reseed due to schema change
    const needsReseed = await shouldReseedCategories(existingCount, expectedCount);
    
    if (existingCount > 0 && !needsReseed) {
      logger.debug(`📂 Categories up-to-date (${existingCount} found), skipping seed`);
      return;
    }

    if (needsReseed && existingCount > 0) {
      logger.info(`📂 Category schema changed (${existingCount} → ${expectedCount}), reseeding...`);
      await Category.deleteMany({});
    } else {
      logger.info("📂 No categories found, seeding defaults...");
    }
    
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

    logger.info(`✅ Seeded ${created} default categories (schema v${CATEGORY_SCHEMA_VERSION})`);
  } catch (error) {
    // Log but don't crash - categories can be added manually if needed
    logger.error({ err: error }, "⚠️ Failed to seed categories (non-fatal)");
  }
}

/**
 * Determines if categories need to be reseeded due to schema changes.
 * Checks for:
 * - Count mismatch between existing and expected categories
 * - New mainGroup values that don't exist in the database
 */
async function shouldReseedCategories(existingCount: number, expectedCount: number): Promise<boolean> {
  // If counts differ significantly, reseed
  if (existingCount !== expectedCount) {
    return true;
  }
  
  // Check if all expected mainGroups exist
  const expectedMainGroups = [...new Set(DEFAULT_CATEGORIES.map(c => c.mainGroup))];
  const existingMainGroups = await Category.distinct('mainGroup');
  
  // If there are new mainGroups, reseed
  const newGroups = expectedMainGroups.filter(g => !existingMainGroups.includes(g));
  if (newGroups.length > 0) {
    logger.info(`📂 New category groups detected: ${newGroups.join(', ')}`);
    return true;
  }
  
  return false;
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
