import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import Decimal from "decimal.js"

export const dynamic = "force-dynamic";

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify permissions
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
    const data = updateMemberSchema.parse(body)

    const member = await prisma.projectMember.update({
      where: { id: params.memberId },
      data: data as any,
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
        action: "member_update",
        description: `Updated member in project`,
        metadata: { projectId: params.id, memberId: member.id },
      },
    })

    return NextResponse.json(member)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Update member error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify permissions
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

    const member = await prisma.projectMember.findUnique({
      where: { id: params.memberId },
    })

    if (!member || member.projectId !== params.id) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    // Don't allow removing the owner
    if (member.role === "owner") {
      return NextResponse.json(
        { error: "Cannot remove project owner" },
        { status: 400 }
      )
    }

    await prisma.projectMember.delete({
      where: { id: params.memberId },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "member_remove",
        description: `Removed member from project`,
        metadata: { projectId: params.id, memberId: member.id },
      },
    })

    return NextResponse.json({ message: "Member removed successfully" })
  } catch (error) {
    console.error("Remove member error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
