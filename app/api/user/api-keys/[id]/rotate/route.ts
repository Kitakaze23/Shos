import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Errors, handleError } from "@/lib/errors"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { createAuditLog } from "@/lib/audit"

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return handleError(Errors.unauthorized())
    }

    // Find the API key
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!apiKey) {
      return handleError(Errors.notFound("API key"))
    }

    // Generate new API key
    const newKey = `sk_${crypto.randomBytes(32).toString("hex")}`
    const keyHash = await bcrypt.hash(newKey, 12)

    // Update the API key
    const updated = await prisma.apiKey.update({
      where: { id: params.id },
      data: {
        keyHash,
        lastUsedAt: null, // Reset last used
      },
    })

    // Log the rotation
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "api_key_rotated",
        description: `Rotated API key: ${apiKey.name}`,
        metadata: {
          apiKeyId: params.id,
        },
      },
    })

    await createAuditLog({
      userId: session.user.id,
      action: "rotate",
      entityType: "api_key",
      entityId: params.id,
    })

    // Return the new key (only shown once)
    return NextResponse.json({
      message: "API key rotated successfully",
      apiKey: newKey, // Only returned once, user must save it
      warning: "Save this key now. It will not be shown again.",
    })
  } catch (error) {
    return handleError(error)
  }
}
