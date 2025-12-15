import { prisma } from "./db"

interface AuditLogData {
  projectId?: string
  userId: string
  action: string
  entityType: string
  entityId?: string
  changesBefore?: any
  changesAfter?: any
}

export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        projectId: data.projectId,
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        changesBefore: data.changesBefore ? JSON.parse(JSON.stringify(data.changesBefore)) : null,
        changesAfter: data.changesAfter ? JSON.parse(JSON.stringify(data.changesAfter)) : null,
      },
    })
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    console.error("Failed to create audit log:", error)
  }
}

export async function getAuditLogs(
  projectId: string,
  limit: number = 50,
  offset: number = 0
) {
  return prisma.auditLog.findMany({
    where: { projectId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  })
}
