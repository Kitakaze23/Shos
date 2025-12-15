import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import Decimal from "decimal.js"

const updateEquipmentSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().optional(),
  purchasePrice: z.union([z.string(), z.number()]).optional().transform((val) => 
    val ? new Decimal(val).toString() : undefined
  ),
  acquisitionDate: z.string().optional().transform((str) => 
    str ? new Date(str) : undefined
  ),
  serviceLifeYears: z.number().int().min(1).optional(),
  salvageValue: z.union([z.string(), z.number()]).optional().nullable().transform((val) => 
    val !== undefined ? (val ? new Decimal(val).toString() : null) : undefined
  ),
  serialNumber: z.string().optional().nullable(),
  registrationNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  depreciationMethod: z.enum(["straight_line", "units_of_production"]).optional(),
  archived: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; equipmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const equipment = await prisma.equipment.findFirst({
      where: {
        id: params.equipmentId,
        projectId: params.id,
      },
      include: {
        photos: {
          orderBy: { order: "asc" },
        },
        project: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
    })

    if (!equipment) {
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(equipment)
  } catch (error) {
    console.error("Get equipment error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; equipmentId: string } }
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
                role: { in: ["owner", "admin", "member"] },
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
    const data = updateEquipmentSchema.parse(body)

    // If purchase price changed and salvage value not explicitly set, recalculate
    if (data.purchasePrice && data.salvageValue === undefined) {
      const purchasePrice = new Decimal(data.purchasePrice)
      data.salvageValue = purchasePrice.mul(0.1).toString()
    }

    const equipment = await prisma.equipment.update({
      where: { id: params.equipmentId },
      data: data as any,
      include: {
        photos: {
          orderBy: { order: "asc" },
        },
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "equipment_update",
        description: `Updated equipment "${equipment.name}"`,
        metadata: { projectId: params.id, equipmentId: equipment.id },
      },
    })

    return NextResponse.json(equipment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Update equipment error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; equipmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify permissions (only owner/admin can delete)
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

    const equipment = await prisma.equipment.findUnique({
      where: { id: params.equipmentId },
    })

    if (!equipment || equipment.projectId !== params.id) {
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 }
      )
    }

    // Soft delete (archive)
    await prisma.equipment.update({
      where: { id: params.equipmentId },
      data: { archived: true },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "equipment_delete",
        description: `Archived equipment "${equipment.name}"`,
        metadata: { projectId: params.id, equipmentId: equipment.id },
      },
    })

    return NextResponse.json({ message: "Equipment archived successfully" })
  } catch (error) {
    console.error("Delete equipment error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
