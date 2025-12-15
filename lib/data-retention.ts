import { prisma } from "./db"

/**
 * Clean up old audit logs (retention: 90 days)
 */
export async function cleanupAuditLogs() {
  const retentionDays = 90
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  const result = await prisma.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  })

  console.log(`Cleaned up ${result.count} audit logs older than ${retentionDays} days`)
  return result.count
}

/**
 * Clean up old activity logs (retention: 90 days)
 */
export async function cleanupActivityLogs() {
  const retentionDays = 90
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  const result = await prisma.activityLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  })

  console.log(`Cleaned up ${result.count} activity logs older than ${retentionDays} days`)
  return result.count
}

/**
 * Process scheduled account deletions (after 30-day grace period)
 */
export async function processScheduledDeletions() {
  const now = new Date()
  
  const usersToDelete = await prisma.user.findMany({
    where: {
      deletedAtScheduled: {
        lte: now,
      },
      deletedAt: null, // Not already deleted
    },
  })

  for (const user of usersToDelete) {
    // Soft delete: mark as deleted
    await prisma.user.update({
      where: { id: user.id },
      data: {
        deletedAt: now,
        email: `deleted_${user.id}@deleted.local`, // Anonymize email
        name: null,
        image: null,
        password: null, // Remove password hash
      },
    })

    // Delete related data
    await prisma.session.deleteMany({
      where: { userId: user.id },
    })

    await prisma.account.deleteMany({
      where: { userId: user.id },
    })

    await prisma.apiKey.deleteMany({
      where: { userId: user.id },
    })

    // Note: Projects and other data may be kept for business purposes
    // Adjust based on your data retention policy

    console.log(`Processed deletion for user ${user.id}`)
  }

  return usersToDelete.length
}

/**
 * Run all cleanup tasks
 */
export async function runDataRetentionCleanup() {
  try {
    const auditCount = await cleanupAuditLogs()
    const activityCount = await cleanupActivityLogs()
    const deletionCount = await processScheduledDeletions()

    return {
      auditLogs: auditCount,
      activityLogs: activityCount,
      deletedAccounts: deletionCount,
    }
  } catch (error) {
    console.error("Data retention cleanup failed:", error)
    throw error
  }
}
