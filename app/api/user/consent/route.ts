import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Errors, handleError } from "@/lib/errors"
import { getConsentPreferences, updateConsentPreferences } from "@/lib/consent"
import { z } from "zod"

const consentSchema = z.object({
  analytics: z.boolean().optional(),
  marketing: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return handleError(Errors.unauthorized())
    }

    const preferences = await getConsentPreferences(session.user.id)
    return NextResponse.json(preferences)
  } catch (error) {
    return handleError(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return handleError(Errors.unauthorized())
    }

    const body = await request.json()
    const data = consentSchema.parse(body)

    const result = await updateConsentPreferences(session.user.id, data)

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleError(
        Errors.validation(
          "Validation failed",
          error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          }))
        )
      )
    }
    return handleError(error)
  }
}
