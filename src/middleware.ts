import { NextRequest, NextResponse } from "next/server";


export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  // Protect Dashboard Routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Prevent logged-in users from accessing the login page
  if (pathname === "/login" && token) {
    const userRole = request.cookies.get("userRole")?.value || "STUDENT";
    const rolePath = userRole.toLowerCase().replace(/_/g, "-");
    return NextResponse.redirect(new URL(`/dashboard/${rolePath}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};