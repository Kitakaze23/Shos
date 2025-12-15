#!/usr/bin/env tsx

/**
 * Data retention cleanup script
 * Run this as a cron job (e.g., daily)
 * 
 * Usage: npx tsx scripts/cleanup-retention.ts
 */

import { runDataRetentionCleanup } from "../lib/data-retention"

async function main() {
  console.log("Starting data retention cleanup...")
  console.log(new Date().toISOString())

  try {
    const result = await runDataRetentionCleanup()
    console.log("Cleanup completed:", result)
    process.exit(0)
  } catch (error) {
    console.error("Cleanup failed:", error)
    process.exit(1)
  }
}

main()
