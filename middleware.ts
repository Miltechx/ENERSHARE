import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rate limiting store (in production, use Redis)
const rateLimit = new Map()

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const ip = request.ip || "anonymous"
    const key = `${ip}-${request.nextUrl.pathname}`
    const now = Date.now()
    const windowMs = 60 * 1000 // 1 minute
    const maxRequests = 60 // 60 requests per minute

    const record = rateLimit.get(key) || { count: 0, resetTime: now + windowMs }

    if (now > record.resetTime) {
      record.count = 1
      record.resetTime = now + windowMs
    } else {
      record.count++
    }

    rateLimit.set(key, record)

    if (record.count > maxRequests) {
      return new NextResponse("Too Many Requests", { status: 429 })
    }
  }

  return response
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
}
