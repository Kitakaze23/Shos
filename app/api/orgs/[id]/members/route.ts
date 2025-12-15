import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { Errors, handleError } from "@/lib/errors"
import { createAuditLog } from "@/lib/audit"

const addMemberSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(["owner", "admin", "member"]).default("member"),
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

    // Verify access
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
    })

    if (!organization) {
      return handleError(Errors.notFound("Organization"))
    }

    const members = await prisma.organizationMember.findMany({
      where: { organizationId: params.id },
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
      orderBy: { joinedAt: "asc" },
    })

    return NextResponse.json(members)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return handleError(Errors.unauthorized())
    }

    // Verify permissions (only owner/admin can add members)
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
      return handleError(Errors.forbidden("You don't have permission to add members"))
    }

    const body = await request.json()
    const data = addMemberSchema.parse(body)

    // Find user by userId or email
    let userId = data.userId
    if (!userId && data.email) {
      const user = await prisma.user.findUnique({
        where: { email: data.email },
      })
      if (!user) {
        return handleError(Errors.notFound("User not found with that email"))
      }
      userId = user.id
    }

    if (!userId) {
      return handleError(Errors.validation("User ID or email is required"))
    }

    // Check if member already exists
    const existing = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: params.id,
          userId,
        },
      },
    })

    if (existing) {
      return handleError(Errors.conflict("User is already a member of this organization"))
    }

    const member = await prisma.organizationMember.create({
      data: {
        organizationId: params.id,
        userId,
        role: data.role,
      },
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
    })

    await createAuditLog({
      userId: session.user.id,
      action: "member_add",
      entityType: "organization_member",
      entityId: member.id,
      changesAfter: { userId, role: data.role },
    })

    return NextResponse.json(member, { status: 201 })
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
