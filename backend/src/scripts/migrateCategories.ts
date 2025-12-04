/**
 * @fileoverview Migration script to update categories to new mainGroup structure
 * 
 * This script:
 * 1. Maps existing flat categories to the new mainGroup structure
 * 2. Creates all new subcategories
 * 3. Updates signals to point to the correct new category
 * 
 * Usage:
 *   npx tsx src/scripts/migrateCategories.ts --dry-run  # Preview changes
 *   npx tsx src/scripts/migrateCategories.ts            # Apply changes
 */

import { connectDatabase, disconnectDatabase } from "../shared/config/database.js";
import { Category, DEFAULT_CATEGORIES, MAIN_GROUPS } from "../features/categories/category.model.js";
import { Signal } from "../features/signals/signal.model.js";
import { logger } from "../shared/config/logger.js";

// Parse CLI arguments
const isDryRun = process.argv.includes("--dry-run");

/**
 * Mapping from old category slugs to new category slugs
 * This maps existing signals to appropriate new subcategories
 */
const OLD_TO_NEW_CATEGORY_MAP: Record<string, string> = {
  // Old "Crypto" -> New "Crypto > Other" (generic fallback)
  "crypto": "crypto-other",
  // Old "Forex" -> New "Traditional Finance > Forex - Majors"
  "forex": "tradfi-forex-majors",
  // Old "Stocks" -> New "Traditional Finance > US Stocks - General"
  "stocks": "tradfi-stocks-general",
  // Old "Commodities" -> New "Traditional Finance > Commodities - Metals"
  "commodities": "tradfi-commodities-metals",
  // Old "Sports" -> New "Macro / Other > Sports"
  "sports": "macro-sports",
  // Old "Esports" -> New "Macro / Other > Sports" (merging into sports)
  "esports": "macro-sports",
  // Old "Other" -> New "Macro / Other > Other"
  "other": "macro-other",
};

async function migrateCategories(): Promise<void> {
  try {
    await connectDatabase();

    if (isDryRun) {
      logger.info("🔍 DRY RUN MODE - No changes will be made\n");
    }

    // Step 1: Get existing categories and their IDs
    const existingCategories = await Category.find({});
    const oldCategoryMap = new Map<string, { _id: string; slug: string; name: string }>();
    
    for (const cat of existingCategories) {
      oldCategoryMap.set(cat.slug, { 
        _id: cat._id.toString(), 
        slug: cat.slug, 
        name: cat.name 
      });
    }

    logger.info(`Found ${existingCategories.length} existing categories`);
    existingCategories.forEach(cat => {
      logger.info(`  - ${cat.name} (${cat.slug})`);
    });

    // Step 2: Check for signals using old categories
    const signalsToMigrate: Array<{ signalId: string; oldCatSlug: string; newCatSlug: string }> = [];
    
    for (const [oldSlug, newSlug] of Object.entries(OLD_TO_NEW_CATEGORY_MAP)) {
      const oldCat = oldCategoryMap.get(oldSlug);
      if (oldCat) {
        const signals = await Signal.find({ categoryId: oldCat._id });
        for (const signal of signals) {
          signalsToMigrate.push({
            signalId: signal._id.toString(),
            oldCatSlug: oldSlug,
            newCatSlug: newSlug,
          });
        }
      }
    }

    logger.info(`\nFound ${signalsToMigrate.length} signals that need category migration`);

    // Step 3: Delete old categories (they'll be replaced)
    if (!isDryRun) {
      logger.info("\nDeleting old categories...");
      await Category.deleteMany({});
      logger.info("Old categories deleted");
    } else {
      logger.info("\nWould delete all old categories");
    }

    // Step 4: Create new categories with mainGroup structure
    logger.info("\nCreating new categories with mainGroup structure...");
    
    const newCategoryMap = new Map<string, string>(); // slug -> _id
    let created = 0;

    for (const categoryData of DEFAULT_CATEGORIES) {
      if (!isDryRun) {
        const category = new Category({
          ...categoryData,
          isActive: true,
        });
        await category.save();
        newCategoryMap.set(categoryData.slug, category._id.toString());
        logger.info(`Created: ${categoryData.mainGroup} > ${categoryData.name} (${categoryData.slug})`);
      } else {
        logger.info(`Would create: ${categoryData.mainGroup} > ${categoryData.name} (${categoryData.slug})`);
      }
      created++;
    }

    // Step 5: Update signals to point to new categories and set mainGroup
    if (signalsToMigrate.length > 0) {
      logger.info(`\nMigrating ${signalsToMigrate.length} signals to new categories...`);
      
      // Build a lookup for mainGroup by slug
      const mainGroupBySlug = new Map<string, string>();
      for (const cat of DEFAULT_CATEGORIES) {
        mainGroupBySlug.set(cat.slug, cat.mainGroup);
      }
      
      for (const migration of signalsToMigrate) {
        const newCategoryId = newCategoryMap.get(migration.newCatSlug);
        const mainGroup = mainGroupBySlug.get(migration.newCatSlug);
        
        if (!isDryRun && newCategoryId && mainGroup) {
          await Signal.updateOne(
            { _id: migration.signalId },
            { $set: { categoryId: newCategoryId, mainGroup } }
          );
          logger.info(`Migrated signal ${migration.signalId}: ${migration.oldCatSlug} -> ${migration.newCatSlug} (mainGroup: ${mainGroup})`);
        } else {
          logger.info(`Would migrate signal ${migration.signalId}: ${migration.oldCatSlug} -> ${migration.newCatSlug} (mainGroup: ${mainGroup})`);
        }
      }
    }

    // Step 6: Also update any signals that already have new category IDs but missing mainGroup
    logger.info("\nChecking for signals missing mainGroup...");
    const signalsMissingMainGroup = await Signal.find({ mainGroup: { $exists: false } });
    
    if (signalsMissingMainGroup.length > 0) {
      logger.info(`Found ${signalsMissingMainGroup.length} signals missing mainGroup`);
      
      for (const signal of signalsMissingMainGroup) {
        const category = await Category.findById(signal.categoryId);
        if (category && category.mainGroup) {
          if (!isDryRun) {
            await Signal.updateOne(
              { _id: signal._id },
              { $set: { mainGroup: category.mainGroup } }
            );
            logger.info(`Set mainGroup for signal ${signal._id}: ${category.mainGroup}`);
          } else {
            logger.info(`Would set mainGroup for signal ${signal._id}: ${category.mainGroup}`);
          }
        }
      }
    } else {
      logger.info("All signals have mainGroup set");
    }

    // Summary
    logger.info("\n" + "=".repeat(50));
    if (isDryRun) {
      logger.info("✅ Dry run complete!");
      logger.info(`   Would create ${created} categories`);
      logger.info(`   Would migrate ${signalsToMigrate.length} signals`);
      logger.info(`   Run without --dry-run to apply changes.`);
    } else {
      logger.info("✅ Migration completed successfully!");
      logger.info(`   Created ${created} categories`);
      logger.info(`   Migrated ${signalsToMigrate.length} signals`);
    }

    // Show new category structure
    logger.info("\nNew Category Structure:");
    const groupedCategories = DEFAULT_CATEGORIES.reduce<Record<string, string[]>>((acc, cat) => {
      if (!acc[cat.mainGroup]) acc[cat.mainGroup] = [];
      acc[cat.mainGroup]!.push(cat.name);
      return acc;
    }, {});

    for (const [group, subcats] of Object.entries(groupedCategories)) {
      logger.info(`\n  ${group}:`);
      subcats.forEach(name => logger.info(`    - ${name}`));
    }

  } catch (error) {
    logger.error({ err: error }, "❌ Migration failed");
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

migrateCategories();
