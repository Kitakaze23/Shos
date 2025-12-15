import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Errors, handleError } from "@/lib/errors"
import Decimal from "decimal.js"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return handleError(Errors.unauthorized())
    }

    const userId = session.user.id

    // Export all user data (GDPR compliance)
    const userData = {
      user: await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          defaultCurrency: true,
          companyName: true,
          companyRole: true,
          createdAt: true,
          updatedAt: true,
          lastLogin: true,
        },
      }),
      projects: await prisma.project.findMany({
        where: { ownerId: userId },
        include: {
          equipment: true,
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
      }),
      projectMemberships: await prisma.projectMember.findMany({
        where: { userId },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      }),
      activityLogs: await prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 1000, // Last 1000 activities
      }),
      apiKeys: await prisma.apiKey.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          lastUsedAt: true,
          expiresAt: true,
          createdAt: true,
        },
      }),
      organizations: await prisma.organization.findMany({
        where: { ownerId: userId },
        include: {
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
        },
      }),
      organizationMemberships: await prisma.organizationMember.findMany({
        where: { userId },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      }),
      exportedAt: new Date().toISOString(),
    }

    // Convert Decimal values to strings for JSON serialization
    const serializedData = JSON.parse(
      JSON.stringify(userData, (key, value) => {
        if (value instanceof Decimal) {
          return value.toString()
        }
        if (value instanceof Date) {
          return value.toISOString()
        }
        return value
      })
    )

    return NextResponse.json(serializedData, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="user-data-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    })
  } catch (error) {
    return handleError(error)
  }
}
