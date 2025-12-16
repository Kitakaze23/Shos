import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { Errors, handleError } from "@/lib/errors"
import { invalidateProjectCache } from "@/lib/cache"
import { createAuditLog } from "@/lib/audit"

export const dynamic = "force-dynamic";

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  currency: z.string().length(3).optional(),
  costAllocationMethod: z.enum(["by_hours", "equal", "percentage"]).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return handleError(Errors.unauthorized())
    }

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
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        equipment: {
          where: { archived: false },
          orderBy: { createdAt: "desc" },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: { invitedAt: "asc" },
        },
        operatingParams: {
          where: { month: null },
          take: 1,
        },
        _count: {
          select: {
            equipment: true,
            members: true,
          },
        },
      },
    })

    if (!project) {
      return handleError(Errors.notFound("Project"))
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Get project error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is owner or admin
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
      return NextResponse.json(
        { error: "Project not found or insufficient permissions" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const data = updateProjectSchema.parse(body)

    const before = { ...project }
    const updated = await prisma.project.update({
      where: { id: params.id },
      data,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            equipment: true,
            members: true,
          },
        },
      },
    })

    // Invalidate cache
    invalidateProjectCache(params.id)

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "project_update",
        description: `Updated project "${updated.name}"`,
        ipAddress: request.headers.get("x-forwarded-for") || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
      },
    })

    await createAuditLog({
      projectId: params.id,
      userId: session.user.id,
      action: "update",
      entityType: "project",
      entityId: params.id,
      changesBefore: before,
      changesAfter: updated,
    })

    return NextResponse.json(updated)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Only owner can delete
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        ownerId: session.user.id,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or insufficient permissions" },
        { status: 404 }
      )
    }

    await prisma.project.delete({
      where: { id: params.id },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "project_delete",
        description: `Deleted project "${project.name}"`,
        ipAddress: request.headers.get("x-forwarded-for") || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
      },
    })

    return NextResponse.json({ message: "Project deleted successfully" })
  } catch (error) {
    console.error("Delete project error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
