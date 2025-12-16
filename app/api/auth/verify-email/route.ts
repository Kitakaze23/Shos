import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(new URL("/auth/error?error=InvalidToken", request.url))
  }

  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.redirect(new URL("/auth/error?error=InvalidToken", request.url))
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      })
      return NextResponse.redirect(new URL("/auth/error?error=TokenExpired", request.url))
    }

    // Verify email
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    })

    // Delete verification token
    await prisma.verificationToken.delete({
      where: { token },
    })

    return NextResponse.redirect(new URL("/auth/signin?verified=true", request.url))
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.redirect(new URL("/auth/error?error=VerificationFailed", request.url))
  }
}
