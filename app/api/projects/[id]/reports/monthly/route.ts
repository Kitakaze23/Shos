import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateMonthlyReport, generateTrendData, calculateFinancialHealthScore } from "@/lib/reports"

export const dynamic = "force-dynamic";

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
      include: {
        equipment: {
          where: { archived: false },
        },
        members: {
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
        operatingParams: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    const targetDate = month && year
      ? new Date(parseInt(year), parseInt(month) - 1, 1)
      : new Date()

    // Generate monthly report
    const monthlyReport = generateMonthlyReport(project as any, targetDate)

    // Generate 3-month trend
    const trendData = generateTrendData(project as any, 3)

    // Calculate health score
    const healthScore = calculateFinancialHealthScore(project as any, monthlyReport)

    return NextResponse.json({
      report: monthlyReport,
      trend: trendData,
      healthScore,
    })
  } catch (error) {
    console.error("Generate monthly report error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
