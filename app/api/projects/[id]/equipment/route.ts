import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import Decimal from "decimal.js"
import { Errors, handleError } from "@/lib/errors"
import { createAuditLog } from "@/lib/audit"
import { invalidateProjectCache } from "@/lib/cache"

const createEquipmentSchema = z.object({
  name: z.string().min(1, "Equipment name is required"),
  category: z.string().min(1, "Category is required"),
  purchasePrice: z.union([z.string(), z.number()]).transform((val) => new Decimal(val).toString()),
  acquisitionDate: z.string().transform((str) => new Date(str)),
  serviceLifeYears: z.number().int().min(1, "Service life must be at least 1 year"),
  salvageValue: z.union([z.string(), z.number()]).optional().nullable().transform((val) => 
    val ? new Decimal(val).toString() : null
  ),
  serialNumber: z.string().optional().nullable(),
  registrationNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  depreciationMethod: z.enum(["straight_line", "units_of_production"]).default("straight_line"),
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
              },
            },
          },
        ],
      },
    })

    if (!project) {
      return handleError(Errors.notFound("Project"))
    }

    const equipment = await prisma.equipment.findMany({
      where: {
        projectId: params.id,
        archived: false,
      },
      include: {
        photos: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(equipment)
  } catch (error) {
    console.error("Get equipment error:", error)
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

    // Verify project access and permissions
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
    const data = createEquipmentSchema.parse(body)

    // Auto-calculate salvage value if not provided (10% of purchase price)
    const purchasePrice = new Decimal(data.purchasePrice)
    const salvageValue = data.salvageValue 
      ? new Decimal(data.salvageValue)
      : purchasePrice.mul(0.1)

    const equipment = await prisma.equipment.create({
      data: {
        projectId: params.id,
        name: data.name,
        category: data.category,
        purchasePrice: purchasePrice.toString(),
        acquisitionDate: data.acquisitionDate,
        serviceLifeYears: data.serviceLifeYears,
        salvageValue: salvageValue.toString(),
        serialNumber: data.serialNumber || null,
        registrationNumber: data.registrationNumber || null,
        notes: data.notes || null,
        depreciationMethod: data.depreciationMethod,
      },
      include: {
        photos: true,
      },
    })

    // Invalidate cache
    invalidateProjectCache(params.id)

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "equipment_create",
        description: `Added equipment "${equipment.name}" to project`,
        metadata: { projectId: params.id, equipmentId: equipment.id },
      },
    })

    await createAuditLog({
      projectId: params.id,
      userId: session.user.id,
      action: "create",
      entityType: "equipment",
      entityId: equipment.id,
      changesAfter: { name: equipment.name, category: equipment.category },
    })

    return NextResponse.json(equipment, { status: 201 })
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
