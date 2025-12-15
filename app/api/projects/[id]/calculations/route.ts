import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import Decimal from "decimal.js"
import {
  calculateTotalFixedCosts,
  calculateMonthlyVariableCosts,
  calculateTotalMonthlyCost,
  calculateCostPerHour,
  calculateBreakEvenHours,
  calculateMonthlyDepreciation,
  calculateAnnualDepreciation,
  calculateAutoSalvageValue,
} from "@/lib/calculations"

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

    // Check project access
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
      include: {
        equipment: {
          where: { archived: false },
        },
        operatingParams: {
          where: { month: null },
          take: 1,
        },
        members: {
          where: { status: "active" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Calculate depreciation from all equipment
    let totalMonthlyDepreciation = new Decimal(0)
    for (const equipment of project.equipment) {
      const purchasePrice = new Decimal(equipment.purchasePrice.toString())
      const salvage = equipment.salvageValue
        ? new Decimal(equipment.salvageValue.toString())
        : calculateAutoSalvageValue(purchasePrice)
      const annualDep = calculateAnnualDepreciation(
        purchasePrice,
        salvage,
        equipment.serviceLifeYears
      )
      const monthlyDep = calculateMonthlyDepreciation(annualDep)
      totalMonthlyDepreciation = totalMonthlyDepreciation.plus(monthlyDep)
    }

    // Calculate fixed costs
    // Get current operating parameters (first one if array, or single object)
    const operatingParams = Array.isArray(project.operatingParams)
      ? project.operatingParams.find(p => !p.month) || project.operatingParams[0]
      : project.operatingParams
    
    if (!operatingParams) {
      return NextResponse.json({
        monthlyCost: 0,
        costPerHour: 0,
        breakEvenHours: 0,
        fixedCosts: 0,
        variableCosts: 0,
        depreciation: totalMonthlyDepreciation.toNumber(),
        costBreakdown: {
          fixed: 0,
          variable: 0,
          depreciation: totalMonthlyDepreciation.toNumber(),
        },
        teamAllocation: [],
      })
    }

    const otherExpenses = operatingParams.otherExpenses
      ? (operatingParams.otherExpenses as Array<{ description: string; amount: string | number }>)
          .map(exp => ({ amount: exp.amount.toString() }))
      : []

    const fixedCosts = calculateTotalFixedCosts(
      new Decimal(operatingParams.insuranceMonthly.toString()),
      new Decimal(operatingParams.staffSalariesMonthly.toString()),
      new Decimal(operatingParams.facilityRentMonthly.toString()),
      otherExpenses
    )

    const operatingHours = new Decimal(operatingParams.operatingHoursPerMonth.toString())
    
    const variableCosts = calculateMonthlyVariableCosts(
      new Decimal(operatingParams.fuelCostPerHour.toString()),
      new Decimal(operatingParams.maintenanceCostPerHour.toString()),
      operatingHours
    )

    const totalMonthlyCost = calculateTotalMonthlyCost(
      fixedCosts,
      variableCosts,
      totalMonthlyDepreciation
    )

    const costPerHour = calculateCostPerHour(
      totalMonthlyCost,
      operatingHours
    )

    const variableCostPerHour = operatingHours.gt(0)
      ? variableCosts.div(operatingHours)
      : new Decimal(0)

    const breakEvenHours = calculateBreakEvenHours(
      fixedCosts,
      totalMonthlyDepreciation,
      variableCostPerHour
    )

    // Calculate team allocation
    const totalHours = project.members.reduce(
      (sum, m) => sum.plus(new Decimal(m.operatingHoursPerMonth.toString())),
      new Decimal(0)
    )

    const teamAllocation = project.members.map((member) => {
      let allocatedCost = new Decimal(0)

      const memberHours = new Decimal(member.operatingHoursPerMonth.toString())
      const memberShare = new Decimal(member.ownershipShare.toString())
      
      if (project.costAllocationMethod === "by_hours" && totalHours.gt(0)) {
        allocatedCost = totalMonthlyCost.mul(memberHours).div(totalHours)
      } else if (project.costAllocationMethod === "equal") {
        const memberCount = project.members.length || 1
        allocatedCost = totalMonthlyCost.div(memberCount)
      } else if (project.costAllocationMethod === "percentage") {
        allocatedCost = totalMonthlyCost.mul(memberShare).div(100)
      }

      return {
        memberId: member.id,
        userId: member.userId,
        name: member.user?.name || member.user?.email || "Unknown",
        ownershipShare: member.ownershipShare.toNumber(),
        operatingHours: member.operatingHoursPerMonth.toNumber(),
        allocatedCost: allocatedCost.toNumber(),
        allocatedCostAnnual: allocatedCost.mul(12).toNumber(),
      }
    })

    const costBreakdown = {
      fixed: fixedCosts.toNumber(),
      variable: variableCosts.toNumber(),
      depreciation: totalMonthlyDepreciation.toNumber(),
    }

    return NextResponse.json({
      monthlyCost: totalMonthlyCost.toNumber(),
      costPerHour: costPerHour.toNumber(),
      breakEvenHours: breakEvenHours.toNumber(),
      fixedCosts: fixedCosts.toNumber(),
      variableCosts: variableCosts.toNumber(),
      depreciation: totalMonthlyDepreciation.toNumber(),
      costBreakdown,
      teamAllocation,
      currency: project.currency,
    })
  } catch (error) {
    console.error("Calculate financials error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
