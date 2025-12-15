import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateTwoFactorSecret, generateQRCode, verifyTwoFactorToken } from "@/lib/two-factor"
import { z } from "zod"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        twoFactorEnabled: true,
        email: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json({
        enabled: true,
      })
    }

    // Generate new secret for setup
    if (!user.email) {
      return NextResponse.json(
        { error: "User email is required for 2FA setup" },
        { status: 400 }
      )
    }
    
    const { secret, otpAuthUrl } = generateTwoFactorSecret(
      user.email,
      process.env.APP_NAME || "Fleet Cost Tracker"
    )

    const qrCode = await generateQRCode(otpAuthUrl || "")

    return NextResponse.json({
      enabled: false,
      secret,
      qrCode,
    })
  } catch (error) {
    console.error("Get 2FA error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}

const enable2FASchema = z.object({
  token: z.string().length(6, "Token must be 6 digits"),
  secret: z.string(),
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
    const { token, secret } = enable2FASchema.parse(body)

    // Verify token
    const isValid = verifyTwoFactorToken(secret, token)

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      )
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "2fa_enabled",
        description: "Two-factor authentication enabled",
        ipAddress: request.headers.get("x-forwarded-for") || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
      },
    })

    return NextResponse.json({ message: "2FA enabled successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Enable 2FA error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "2fa_disabled",
        description: "Two-factor authentication disabled",
        ipAddress: request.headers.get("x-forwarded-for") || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
      },
    })

    return NextResponse.json({ message: "2FA disabled successfully" })
  } catch (error) {
    console.error("Disable 2FA error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
