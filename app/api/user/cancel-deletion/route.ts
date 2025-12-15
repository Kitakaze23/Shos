import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Errors, handleError } from "@/lib/errors"
import { createAuditLog } from "@/lib/audit"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return handleError(Errors.unauthorized())
    }

    const userId = session.user.id

    // Cancel scheduled deletion
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAtScheduled: null,
      },
    })

    // Log the cancellation
    await prisma.activityLog.create({
      data: {
        userId,
        action: "account_deletion_cancelled",
        description: "User cancelled scheduled account deletion",
      },
    })

    await createAuditLog({
      userId,
      action: "cancel_deletion",
      entityType: "user",
      entityId: userId,
    })

    return NextResponse.json({
      message: "Account deletion cancelled successfully",
    })
  } catch (error) {
    return handleError(error)
  }
}
