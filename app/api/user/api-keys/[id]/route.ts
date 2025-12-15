import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function DELETE(
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

    const apiKey = await prisma.apiKey.findUnique({
      where: { id: params.id },
    })

    if (!apiKey || apiKey.userId !== session.user.id) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      )
    }

    await prisma.apiKey.delete({
      where: { id: params.id },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "api_key_deleted",
        description: `API key "${apiKey.name}" deleted`,
        ipAddress: request.headers.get("x-forwarded-for") || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
      },
    })

    return NextResponse.json({ message: "API key deleted successfully" })
  } catch (error) {
    console.error("Delete API key error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
