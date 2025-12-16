import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Errors, handleError } from "@/lib/errors";
import { runDataRetentionCleanup } from "@/lib/data-retention";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return handleError(Errors.unauthorized());
    }

    // Check if user is admin (you may want to add an admin role check)
    // For now, we'll restrict to specific admin emails
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

    if (!adminEmails.includes(session.user.email || "")) {
      return handleError(Errors.forbidden("Admin access required"));
    }

    const result = await runDataRetentionCleanup();

    return NextResponse.json({
      message: "Data retention cleanup completed",
      ...result,
    });
  } catch (error) {
    return handleError(error);
  }
}
