import { connectDatabase, disconnectDatabase } from "../shared/config/database.js";
import { Category, DEFAULT_CATEGORIES } from "../features/categories/category.model.js";
import { logger } from "../shared/config/logger.js";

async function seedCategories(): Promise<void> {
  try {
    await connectDatabase();

    logger.info("Seeding categories...");

    for (const categoryData of DEFAULT_CATEGORIES) {
      const existing = await Category.findOne({ slug: categoryData.slug });

      if (existing) {
        logger.info(`Category "${categoryData.name}" already exists, skipping`);
        continue;
      }

      const category = new Category({
        ...categoryData,
        isActive: true,
      });

      await category.save();
      logger.info(`Created category: ${categoryData.name}`);
    }

    logger.info("✅ Category seeding completed");
  } catch (error) {
    logger.error({ err: error }, "❌ Category seeding failed");
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

seedCategories();
