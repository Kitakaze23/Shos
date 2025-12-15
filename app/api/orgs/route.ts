import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { Errors, handleError } from "@/lib/errors"
import { createAuditLog } from "@/lib/audit"

const createOrgSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  description: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  currency: z.string().length(3).default("RUB"),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return handleError(Errors.unauthorized())
    }

    const organizations = await prisma.organization.findMany({
      where: {
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
        _count: {
          select: {
            projects: true,
            members: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json(organizations)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return handleError(Errors.unauthorized())
    }

    const body = await request.json()
    const data = createOrgSchema.parse(body)

    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        description: data.description || null,
        logoUrl: data.logoUrl || null,
        currency: data.currency,
        ownerId: session.user.id,
      },
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

    // Add owner as member
    await prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: session.user.id,
        role: "owner",
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "organization_create",
        description: `Created organization "${organization.name}"`,
      },
    })

    await createAuditLog({
      userId: session.user.id,
      action: "create",
      entityType: "organization",
      entityId: organization.id,
      changesAfter: { name: organization.name },
    })

    return NextResponse.json(organization, { status: 201 })
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
