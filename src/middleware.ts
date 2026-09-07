import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Route Access Control Configuration
const roleRoutes: Record<string, string[]> = {
  SUPER_ADMIN: [
    "/dashboard/admin",
    "/dashboard/accounts",
    "/dashboard/teacher",
    "/dashboard/student",
  ],
  ADMIN: [
    "/dashboard/admin",
    "/dashboard/accounts",
    "/dashboard/teacher",
    "/dashboard/student",
  ],
  TEACHER: ["/dashboard/teacher"],
  STUDENT: ["/dashboard/student"],
  PARENT: ["/dashboard/student"],
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const userRole = request.cookies.get("userRole")?.value; // Stored upon login
  const { pathname } = request.nextUrl;

  // Protect Dashboard Routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check Role Access
    if (userRole && roleRoutes[userRole]) {
      const hasPermission = roleRoutes[userRole].some((route) =>
        pathname.startsWith(route),
      );
      if (!hasPermission) {
        return NextResponse.redirect(
          new URL(`/dashboard/${userRole.toLowerCase()}`, request.url),
        );
      }
    }
  }

  // Redirect Authenticated Users away from Login
  if (pathname === "/login" && token && userRole) {
    return NextResponse.redirect(
      new URL(`/dashboard/${userRole.toLowerCase()}`, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
