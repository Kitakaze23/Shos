import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Errors, handleError } from "@/lib/errors"
import { generateAnnualForecast } from "@/lib/reports"
import { cache, CacheKeys, CacheTTL } from "@/lib/cache"

export const dynamic = "force-dynamic";

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
      include: {
        equipment: {
          where: { archived: false },
        },
        operatingParams: {
          where: { month: null },
        },
      },
    })

    if (!project) {
      return handleError(Errors.notFound("Project"))
    }

    const searchParams = request.nextUrl.searchParams
    const startMonth = parseInt(searchParams.get("startMonth") || String(new Date().getMonth() + 1))
    const startYear = parseInt(searchParams.get("startYear") || String(new Date().getFullYear()))
    const cacheKey = CacheKeys.calculation(params.id, "annual", `${startYear}-${startMonth}`)

    // Check cache
    const cached = cache.get(cacheKey)
    if (cached) {
      return NextResponse.json({ forecast: cached })
    }

    // Generate forecast
    const forecast = generateAnnualForecast(project as any, startMonth, startYear)

    // Cache result
    cache.set(cacheKey, forecast, CacheTTL.CALCULATION)

    return NextResponse.json({ forecast })
  } catch (error) {
    return handleError(error)
  }
}
