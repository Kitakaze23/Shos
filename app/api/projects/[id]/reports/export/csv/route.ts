import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateCSVReport, generateCSVFileName } from "@/lib/exports/csv"
import { generateMonthlyReport, generateAnnualForecast, generateDepreciationSchedule } from "@/lib/reports"

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

    // Generate report data
    const monthlyReport = generateMonthlyReport(project as any)
    const annualForecast = generateAnnualForecast(project as any)
    const depreciationSchedule = generateDepreciationSchedule(project as any)

    const exportData = {
      monthlyReport,
      annualForecast,
      depreciationSchedule,
      currency: project.currency,
    }

    // Generate CSV
    const csvContent = generateCSVReport(exportData, project.currency)
    const fileName = generateCSVFileName(project.name)

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error("CSV export error:", error)
    return NextResponse.json(
      { error: "Failed to generate CSV file" },
      { status: 500 }
    )
  }
}
