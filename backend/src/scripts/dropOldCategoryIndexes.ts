/**
 * Script to drop old category indexes before migration
 */
import { connectDatabase, disconnectDatabase } from "../shared/config/database.js";
import mongoose from "mongoose";
import { logger } from "../shared/config/logger.js";

async function dropOldIndexes() {
  try {
    await connectDatabase();
    
    const db = mongoose.connection.db!;
    const collection = db.collection("categories");
    
    // List all indexes
    const indexes = await collection.indexes();
    logger.info("Current indexes:");
    indexes.forEach(idx => logger.info(`  - ${idx.name}: ${JSON.stringify(idx.key)}`));
    
    // Drop the name_1 unique index if it exists
    try {
      await collection.dropIndex("name_1");
      logger.info("✅ Dropped name_1 index");
    } catch (e: any) {
      logger.info(`Could not drop name_1: ${e.message}`);
    }
    
    logger.info("Done! Now run the migration script.");
  } catch (error) {
    logger.error({ err: error }, "Failed to drop indexes");
  } finally {
    await disconnectDatabase();
  }
}

dropOldIndexes();
