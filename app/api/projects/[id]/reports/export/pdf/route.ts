import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generatePDFReport, generateFileName } from "@/lib/exports/pdf"
import { generateMonthlyReport, generateAnnualForecast, generateDepreciationSchedule } from "@/lib/reports"

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
        owner: {
          select: {
            companyName: true,
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

    const searchParams = request.nextUrl.searchParams
    const reportType = searchParams.get("type") || "monthly"
    const watermark = searchParams.get("watermark") || undefined

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

    // Generate PDF
    const pdfBlob = await generatePDFReport(exportData, {
      title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Financial Report`,
      projectName: project.name,
      companyName: project.owner.companyName || undefined,
      watermark,
    })

    const fileName = generateFileName("Financial_Report", project.name, "pdf")

    return new NextResponse(pdfBlob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error("PDF export error:", error)
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    )
  }
}
