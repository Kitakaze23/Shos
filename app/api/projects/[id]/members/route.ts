import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import Decimal from "decimal.js"

export const dynamic = "force-dynamic";

const addMemberSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(["owner", "admin", "member", "viewer"]).default("member"),
  ownershipShare: z.union([z.string(), z.number()]).transform((val) => 
    new Decimal(val).toString()
  ),
  operatingHoursPerMonth: z.union([z.string(), z.number()]).transform((val) => 
    new Decimal(val).toString()
  ),
})

const updateMemberSchema = z.object({
  role: z.enum(["owner", "admin", "member", "viewer"]).optional(),
  ownershipShare: z.union([z.string(), z.number()]).optional().transform((val) => 
    val ? new Decimal(val).toString() : undefined
  ),
  operatingHoursPerMonth: z.union([z.string(), z.number()]).optional().transform((val) => 
    val ? new Decimal(val).toString() : undefined
  ),
  status: z.enum(["active", "inactive"]).optional(),
})

export async function GET(
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
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    const members = await prisma.projectMember.findMany({
      where: { projectId: params.id },
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
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("Get members error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}

export async function POST(
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

    // Verify permissions (only owner/admin can add members)
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
    const data = addMemberSchema.parse(body)

    // Find user by userId or email
    let userId = data.userId
    if (!userId && data.email) {
      const user = await prisma.user.findUnique({
        where: { email: data.email },
      })
      if (!user) {
        return NextResponse.json(
          { error: "User not found with that email" },
          { status: 404 }
        )
      }
      userId = user.id
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID or email is required" },
        { status: 400 }
      )
    }

    // Check if member already exists
    const existing = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: params.id,
          userId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "User is already a member of this project" },
        { status: 400 }
      )
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: params.id,
        userId,
        role: data.role,
        ownershipShare: data.ownershipShare,
        operatingHoursPerMonth: data.operatingHoursPerMonth,
        joinedAt: new Date(),
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

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "member_add",
        description: `Added member to project`,
        metadata: { projectId: params.id, memberId: member.id },
      },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Add member error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
