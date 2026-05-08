import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/', '/about', '/terms', '/privacy', '/contact', '/auth/signin', '/auth/signup', '/auth/forgot-password']
const protectedPaths = ['/dashboard', '/marketplace', '/wallet', '/listings', '/profile', '/meters', '/notifications', '/onboarding']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('__session')?.value

  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith('/auth'))
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  const isAdminPath = pathname.startsWith('/admin')

  if (isPublicPath) {
    return NextResponse.next()
  }

  if (!sessionCookie && (isProtectedPath || isAdminPath)) {
    const url = new URL('/auth/signin', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  if (isAdminPath && sessionCookie) {
    const response = NextResponse.next()
    response.headers.set('x-is-admin', 'pending')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}