import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { performanceMiddleware } from "@/middleware-performance"

export const dynamic = "force-dynamic";

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional().nullable(),
  currency: z.string().length(3, "Currency must be 3 characters"),
})

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: List all projects for the authenticated user
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Array of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function GET(request: NextRequest) {
  const perf = performanceMiddleware(request)
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const projects = await prisma.project.findMany({
      where: {
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
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            equipment: true,
            members: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    const response = NextResponse.json(projects)
    return perf.recordSuccess(response)
  } catch (error) {
    console.error("Get projects error:", error)
    perf.recordError(500, "INTERNAL_ERROR", "An error occurred")
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - currency
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Fleet Management"
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: "Main fleet cost tracking"
 *               currency:
 *                 type: string
 *                 length: 3
 *                 example: "RUB"
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  const perf = performanceMiddleware(request)
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = createProjectSchema.parse(body)

    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description || null,
        currency: data.currency,
        ownerId: session.user.id,
        costAllocationMethod: "by_hours",
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            equipment: true,
            members: true,
          },
        },
      },
    })

    // Add owner as project member
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: session.user.id,
        role: "owner",
        ownershipShare: 100,
        joinedAt: new Date(),
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "project_create",
        description: `Created project "${project.name}"`,
        ipAddress: request.headers.get("x-forwarded-for") || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
      },
    })

    const response = NextResponse.json(project, { status: 201 })
    return perf.recordSuccess(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      perf.recordError(400, "VALIDATION_ERROR", error.errors[0].message)
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Create project error:", error)
    perf.recordError(500, "INTERNAL_ERROR", "An error occurred")
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
