import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateMonthlyReportEmail } from "@/lib/email-templates"
import { generateMonthlyReport } from "@/lib/reports"
import { sendVerificationEmail } from "@/lib/email"
import { Resend } from "resend"
import { z } from "zod"

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY)

const emailReportSchema = z.object({
  recipients: z.array(z.string().email()),
  reportType: z.enum(["monthly", "annual"]).default("monthly"),
  includeCharts: z.boolean().default(false),
})

export async function POST(
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
                role: { in: ["owner", "admin"] },
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
            name: true,
            companyName: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or insufficient permissions" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { recipients, reportType } = emailReportSchema.parse(body)

    // Generate report data
    const monthlyReport = generateMonthlyReport(project as any)

    // Generate email content
    const emailContent = generateMonthlyReportEmail(
      project.name,
      monthlyReport,
      session.user.name || undefined
    )

    // Send emails
    const emailResults = await Promise.allSettled(
      recipients.map(async (email) => {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "noreply@example.com",
          to: email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        })
      })
    )

    const successful = emailResults.filter((r) => r.status === "fulfilled").length
    const failed = emailResults.filter((r) => r.status === "rejected").length

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "report_email_sent",
        description: `Sent ${reportType} report to ${successful} recipient(s)`,
        metadata: {
          projectId: params.id,
          recipients,
          successful,
          failed,
        },
      },
    })

    return NextResponse.json({
      message: `Report sent to ${successful} recipient(s)`,
      successful,
      failed,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Email report error:", error)
    return NextResponse.json(
      { error: "Failed to send email report" },
      { status: 500 }
    )
  }
}
