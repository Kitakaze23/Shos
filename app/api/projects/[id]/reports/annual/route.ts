import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateAnnualForecast } from "@/lib/reports"

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
    const startMonth = parseInt(searchParams.get("startMonth") || String(new Date().getMonth() + 1))
    const startYear = parseInt(searchParams.get("startYear") || String(new Date().getFullYear()))

    // Generate annual forecast
    const forecast = generateAnnualForecast(project as any, startMonth, startYear)

    return NextResponse.json({ forecast })
  } catch (error) {
    console.error("Generate annual forecast error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
