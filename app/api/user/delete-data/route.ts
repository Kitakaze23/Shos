import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Errors, handleError } from "@/lib/errors"
import { createAuditLog } from "@/lib/audit"

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return handleError(Errors.unauthorized())
    }

    const userId = session.user.id
    const body = await request.json()
    const { confirm } = body

    if (confirm !== "DELETE") {
      return handleError(
        Errors.validation("Please type 'DELETE' to confirm data deletion")
      )
    }

    // Schedule account for deletion (30-day grace period)
    const scheduledDeletion = new Date()
    scheduledDeletion.setDate(scheduledDeletion.getDate() + 30)

    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAtScheduled: scheduledDeletion,
      },
    })

    // Log the deletion request
    await prisma.activityLog.create({
      data: {
        userId,
        action: "account_deletion_requested",
        description: "User requested account deletion (30-day grace period)",
        metadata: {
          scheduledDeletion: scheduledDeletion.toISOString(),
        },
      },
    })

    await createAuditLog({
      userId,
      action: "delete_data_request",
      entityType: "user",
      entityId: userId,
      changesAfter: {
        deletedAtScheduled: scheduledDeletion.toISOString(),
      },
    })

    return NextResponse.json({
      message: "Account deletion scheduled. You have 30 days to cancel.",
      scheduledDeletion: scheduledDeletion.toISOString(),
    })
  } catch (error) {
    return handleError(error)
  }
}
