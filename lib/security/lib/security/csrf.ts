import { NextRequest, NextResponse } from "next/server"

export function verifyCsrf(request: NextRequest) {
  const csrfToken = request.headers.get("x-csrf-token")
  const sessionToken = request.cookies.get("next-auth.csrf-token")?.value?.split("|")[0]

  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    return false
  }
  return true
}
