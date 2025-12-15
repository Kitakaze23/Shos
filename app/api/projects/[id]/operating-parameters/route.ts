import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import Decimal from "decimal.js"

const updateOperatingParamsSchema = z.object({
  operatingHoursPerMonth: z.union([z.string(), z.number()]).transform((val) => 
    new Decimal(val).toString()
  ),
  fuelCostPerHour: z.union([z.string(), z.number()]).transform((val) => 
    new Decimal(val).toString()
  ),
  maintenanceCostPerHour: z.union([z.string(), z.number()]).transform((val) => 
    new Decimal(val).toString()
  ),
  insuranceMonthly: z.union([z.string(), z.number()]).transform((val) => 
    new Decimal(val).toString()
  ),
  staffSalariesMonthly: z.union([z.string(), z.number()]).transform((val) => 
    new Decimal(val).toString()
  ),
  facilityRentMonthly: z.union([z.string(), z.number()]).transform((val) => 
    new Decimal(val).toString()
  ),
  otherExpenses: z.array(z.object({
    description: z.string(),
    amount: z.union([z.string(), z.number()]),
  })).optional(),
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

    // Get current parameters (month = null)
    let operatingParams = await prisma.operatingParameters.findFirst({
      where: {
        projectId: params.id,
        month: null,
      },
    })

    // Create default if doesn't exist
    if (!operatingParams) {
      operatingParams = await prisma.operatingParameters.create({
        data: {
          projectId: params.id,
          month: null, // Current parameters
        },
      })
    }

    return NextResponse.json(operatingParams)
  } catch (error) {
    console.error("Get operating parameters error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const data = updateOperatingParamsSchema.parse(body)

    // Transform otherExpenses amounts to Decimal strings
    const otherExpenses = data.otherExpenses?.map(exp => ({
      description: exp.description,
      amount: new Decimal(exp.amount).toString(),
    }))

    // Find existing or create new
    const existing = await prisma.operatingParameters.findFirst({
      where: {
        projectId: params.id,
        month: null,
      },
    })

    const operatingParams = existing
      ? await prisma.operatingParameters.update({
          where: { id: existing.id },
          data: {
            operatingHoursPerMonth: data.operatingHoursPerMonth,
            fuelCostPerHour: data.fuelCostPerHour,
            maintenanceCostPerHour: data.maintenanceCostPerHour,
            insuranceMonthly: data.insuranceMonthly,
            staffSalariesMonthly: data.staffSalariesMonthly,
            facilityRentMonthly: data.facilityRentMonthly,
            otherExpenses: otherExpenses || [],
          },
        })
      : await prisma.operatingParameters.create({
          data: {
            projectId: params.id,
            month: null,
            operatingHoursPerMonth: data.operatingHoursPerMonth,
            fuelCostPerHour: data.fuelCostPerHour,
            maintenanceCostPerHour: data.maintenanceCostPerHour,
            insuranceMonthly: data.insuranceMonthly,
            staffSalariesMonthly: data.staffSalariesMonthly,
            facilityRentMonthly: data.facilityRentMonthly,
            otherExpenses: otherExpenses || [],
          },
        })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "operating_params_update",
        description: `Updated operating parameters for project`,
        metadata: { projectId: params.id },
      },
    })

    return NextResponse.json(operatingParams)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Update operating parameters error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
