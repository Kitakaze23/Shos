import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { rateLimit, corsHeaders, securityHeaders } from "@/lib/security"

// Apply security middleware
function applySecurityHeaders(request: NextRequest) {
  const response = NextResponse.next()
  
  // Apply security headers
  Object.entries(securityHeaders()).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Apply CORS headers for API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    const origin = request.headers.get("origin")
    Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }

  return response
}

// Rate limiting middleware
function applyRateLimit(request: NextRequest) {
  const rateLimitResult = rateLimit(request, 100, 60 * 1000) // 100 requests per minute

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          ...securityHeaders(),
        },
      }
    )
  }

  return null
}

// Main middleware
export default withAuth(
  function middleware(request: NextRequest) {
    // Apply rate limiting
    const rateLimitResponse = applyRateLimit(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Apply security headers
    const response = applySecurityHeaders(request)

    // Add rate limit headers
    const rateLimitResult = rateLimit(request, 100, 60 * 1000)
    response.headers.set("X-RateLimit-Limit", "100")
    response.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining))
    response.headers.set("X-RateLimit-Reset", String(rateLimitResult.resetTime))

    return response
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/:path*",
  ],
}
