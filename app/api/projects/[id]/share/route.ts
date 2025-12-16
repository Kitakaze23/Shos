import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { Errors, handleError } from "@/lib/errors"
import { createAuditLog } from "@/lib/audit"

export const dynamic = "force-dynamic";

const shareProjectSchema = z.object({
  sharedWithUserId: z.string().min(1, "User ID is required"),
  permissionLevel: z.enum(["view", "edit", "admin"]).default("view"),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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
      return handleError(Errors.forbidden("You don't have permission to share this project"))
    }

    const body = await request.json()
    const data = shareProjectSchema.parse(body)

    // Check if already shared
    const existing = await prisma.projectShare.findFirst({
      where: {
        projectId: params.id,
        sharedWithUserId: data.sharedWithUserId,
        revokedAt: null,
      },
    })

    if (existing) {
      return handleError(Errors.conflict("Project is already shared with this user"))
    }

    const share = await prisma.projectShare.create({
      data: {
        projectId: params.id,
        sharedWithUserId: data.sharedWithUserId,
        sharedByUserId: session.user.id,
        permissionLevel: data.permissionLevel,
      },
      include: {
        sharedWithUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    await createAuditLog({
      projectId: params.id,
      userId: session.user.id,
      action: "share",
      entityType: "project",
      entityId: params.id,
      changesAfter: {
        sharedWithUserId: data.sharedWithUserId,
        permissionLevel: data.permissionLevel,
      },
    })

    return NextResponse.json(share, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleError(
        Errors.validation(
          "Validation failed",
          error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          }))
        )
      )
    }
    return handleError(error)
  }
}

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
        ],
      },
    })

    if (!project) {
      return handleError(Errors.notFound("Project"))
    }

    const shares = await prisma.projectShare.findMany({
      where: {
        projectId: params.id,
        revokedAt: null,
      },
      include: {
        sharedWithUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        sharedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { sharedAt: "desc" },
    })

    return NextResponse.json(shares)
  } catch (error) {
    return handleError(error)
  }
}
