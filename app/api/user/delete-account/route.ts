import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { password } = deleteAccountSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        password: true,
      },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 400 }
      )
    }

    const bcrypt = require("bcryptjs")
    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 400 }
      )
    }

    // Schedule deletion (30-day grace period)
    const deletedAtScheduled = new Date()
    deletedAtScheduled.setDate(deletedAtScheduled.getDate() + 30)

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        deletedAtScheduled,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "account_deletion_scheduled",
        description: "Account deletion scheduled (30-day grace period)",
        ipAddress: request.headers.get("x-forwarded-for") || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
      },
    })

    return NextResponse.json({
      message: "Account deletion scheduled. You have 30 days to restore your account.",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Delete account error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
