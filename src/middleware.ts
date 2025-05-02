import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const session = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // Jika pengguna sudah login dan mencoba mengakses halaman login/register
  if (
    session &&
    (request.nextUrl.pathname.startsWith("/auth/login") || request.nextUrl.pathname.startsWith("/auth/register"))
  ) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Jika pengguna belum login dan mencoba mengakses halaman yang memerlukan autentikasi
  if (!session && request.nextUrl.pathname.startsWith("/owner")) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/auth/:path*", "/owner/:path*"],
}
