import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { Errors, handleError } from "@/lib/errors"
import { createAuditLog } from "@/lib/audit"
import { invalidateProjectCache } from "@/lib/cache"

const updateOrgSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  currency: z.string().length(3).optional(),
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

    const organization = await prisma.organization.findFirst({
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
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
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
        },
        projects: {
          include: {
            _count: {
              select: {
                equipment: true,
                members: true,
              },
            },
          },
        },
        _count: {
          select: {
            projects: true,
            members: true,
          },
        },
      },
    })

    if (!organization) {
      return handleError(Errors.notFound("Organization"))
    }

    return NextResponse.json(organization)
  } catch (error) {
    return handleError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return handleError(Errors.unauthorized())
    }

    // Check if user is owner or admin
    const organization = await prisma.organization.findFirst({
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

    if (!organization) {
      return handleError(Errors.forbidden("You don't have permission to update this organization"))
    }

    const body = await request.json()
    const data = updateOrgSchema.parse(body)

    const before = { ...organization }
    const updated = await prisma.organization.update({
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
            projects: true,
            members: true,
          },
        },
      },
    })

    // Invalidate cache for all projects in this org
    const projects = await prisma.project.findMany({
      where: { organizationId: params.id },
      select: { id: true },
    })
    projects.forEach((p) => invalidateProjectCache(p.id))

    await createAuditLog({
      userId: session.user.id,
      action: "update",
      entityType: "organization",
      entityId: organization.id,
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
      return handleError(Errors.unauthorized())
    }

    // Only owner can delete
    const organization = await prisma.organization.findFirst({
      where: {
        id: params.id,
        ownerId: session.user.id,
      },
    })

    if (!organization) {
      return handleError(Errors.forbidden("Only the owner can delete the organization"))
    }

    await prisma.organization.delete({
      where: { id: params.id },
    })

    await createAuditLog({
      userId: session.user.id,
      action: "delete",
      entityType: "organization",
      entityId: organization.id,
      changesBefore: { name: organization.name },
    })

    return NextResponse.json({ message: "Organization deleted successfully" })
  } catch (error) {
    return handleError(error)
  }
}
