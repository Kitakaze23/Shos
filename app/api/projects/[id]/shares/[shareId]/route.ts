import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Errors, handleError } from "@/lib/errors"
import { createAuditLog } from "@/lib/audit"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; shareId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return handleError(Errors.unauthorized())
    }

    // Verify project ownership or admin access
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        OR: [
          { ownerId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id,
                role: { in: ["owner", "admin"] },
              },
            },
          },
        ],
      },
    })

    if (!project) {
      return handleError(Errors.forbidden("You don't have permission to revoke shares"))
    }

    const share = await prisma.projectShare.findUnique({
      where: { id: params.shareId },
    })

    if (!share || share.projectId !== params.id) {
      return handleError(Errors.notFound("Share not found"))
    }

    // Revoke share (soft delete)
    await prisma.projectShare.update({
      where: { id: params.shareId },
      data: { revokedAt: new Date() },
    })

    await createAuditLog({
      projectId: params.id,
      userId: session.user.id,
      action: "share_revoke",
      entityType: "project_share",
      entityId: params.shareId,
      changesBefore: { sharedWithUserId: share.sharedWithUserId },
    })

    return NextResponse.json({ message: "Share revoked successfully" })
  } catch (error) {
    return handleError(error)
  }
}
