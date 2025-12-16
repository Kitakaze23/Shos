import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Errors, handleError } from "@/lib/errors"
import { generateMonthlyReport } from "@/lib/reports"
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
        operatingParams: {
          where: { month: null },
        },
      },
    })

    if (!project) {
      return handleError(Errors.notFound("Project"))
    }

    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get("month")
    const year = searchParams.get("year")
    const cacheKey = CacheKeys.calculation(params.id, "monthly", month && year ? `${year}-${month}` : undefined)

    // Check cache
    const cached = cache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    // Generate report
    const targetDate = month && year
      ? new Date(parseInt(year), parseInt(month) - 1, 1)
      : new Date()

    const report = generateMonthlyReport(project as any, targetDate)

    // Cache result
    cache.set(cacheKey, report, CacheTTL.CALCULATION)

    return NextResponse.json(report)
  } catch (error) {
    return handleError(error)
  }
}
