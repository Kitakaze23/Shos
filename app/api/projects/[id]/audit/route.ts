import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Errors, handleError } from "@/lib/errors"
import { getAuditLogs } from "@/lib/audit"

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return handleError(Errors.unauthorized())
    }

    // Verify project access
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        OR: [
          { ownerId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
          {
            shares: {
              some: {
                sharedWithUserId: session.user.id,
                revokedAt: null,
                permissionLevel: { in: ["admin", "edit"] },
              },
            },
          },
        ],
      },
    })

    if (!project) {
      return handleError(Errors.notFound("Project"))
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const logs = await getAuditLogs(params.id, limit, offset)

    return NextResponse.json(logs)
  } catch (error) {
    return handleError(error)
  }
}
