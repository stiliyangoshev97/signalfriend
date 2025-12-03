/**
 * @fileoverview Script to seed default categories into the database
 * 
 * Usage:
 *   npx tsx src/scripts/seedCategories.ts --dry-run  # Preview changes
 *   npx tsx src/scripts/seedCategories.ts            # Apply changes
 */

import { connectDatabase, disconnectDatabase } from "../shared/config/database.js";
import { Category, DEFAULT_CATEGORIES } from "../features/categories/category.model.js";
import { logger } from "../shared/config/logger.js";

// Parse CLI arguments
const isDryRun = process.argv.includes("--dry-run");

async function seedCategories(): Promise<void> {
  try {
    await connectDatabase();

    if (isDryRun) {
      logger.info("🔍 DRY RUN MODE - No changes will be made\n");
    }
    logger.info("Seeding categories...");

    let created = 0;
    let skipped = 0;

    for (const categoryData of DEFAULT_CATEGORIES) {
      const existing = await Category.findOne({ slug: categoryData.slug });

      if (existing) {
        logger.info(`Category "${categoryData.name}" already exists, skipping`);
        skipped++;
        continue;
      }

      if (!isDryRun) {
        const category = new Category({
          ...categoryData,
          isActive: true,
        });
        await category.save();
        logger.info(`Created category: ${categoryData.name}`);
      } else {
        logger.info(`Would create category: ${categoryData.name}`);
      }
      created++;
    }

    if (isDryRun) {
      logger.info(`✅ Dry run complete! ${created} category(s) would be created, ${skipped} already exist.`);
      logger.info(`   Run without --dry-run to apply changes.`);
    } else {
      logger.info(`✅ Category seeding completed - ${created} created, ${skipped} skipped`);
    }
  } catch (error) {
    logger.error({ err: error }, "❌ Category seeding failed");
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

seedCategories();
