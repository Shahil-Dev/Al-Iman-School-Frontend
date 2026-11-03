import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const role = request.cookies.get("userRole")?.value || "";
  const { pathname } = request.nextUrl;

  const normalizedPath = pathname.toLowerCase();

  // 1. Admission public route check
  if (normalizedPath.startsWith("/admission") && !normalizedPath.startsWith("/dashboard/admissions")) {
    return NextResponse.next();
  }

  // 2. Dashboard Auth Guard Check
  const isDashboardRoute = normalizedPath.startsWith("/dashboard");

  if (isDashboardRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Login Page Redirect Check (If already logged in, send to respective role home)
  if (normalizedPath === "/login" && token) {
    if (role === "STUDENT") {
      return NextResponse.redirect(new URL("/Dashboard/studentDashboard", request.url));
    }
    if (role === "PARENT") {
      return NextResponse.redirect(new URL("/Dashboard/parentDashboard", request.url));
    }
    return NextResponse.redirect(new URL("/Dashboard", request.url));
  }

  // 4. Role-Based Access Control (Strict RBAC Routing)
  if (isDashboardRoute && role) {
    // STUDENT Security Guard
    if (role === "STUDENT") {
      const allowedForStudent = [
        "/dashboard/studentdashboard",
        "/dashboard/profile",
      ];
      const isAllowed = allowedForStudent.some((path) =>
        normalizedPath === path || normalizedPath.startsWith(path + "/")
      );
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/Dashboard/studentDashboard", request.url));
      }
    }

    // PARENT Security Guard
    if (role === "PARENT") {
      const allowedForParent = [
        "/dashboard/parentdashboard",
        "/dashboard/reviews",
        "/dashboard/profile",
      ];
      const isAllowed = allowedForParent.some((path) =>
        normalizedPath === path || normalizedPath.startsWith(path + "/")
      );
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/Dashboard/parentDashboard", request.url));
      }
    }

    // TEACHER Security Guard
    if (role === "TEACHER") {
      const allowedForTeacher = [
        "/dashboard/teacherdashboard",
        "/dashboard/marks",
        "/dashboard/attendance",
        "/dashboard/my-routine",
        "/dashboard/notices",
        "/dashboard/profile",
      ];
      const isAllowed = allowedForTeacher.some((path) =>
        normalizedPath === path || normalizedPath.startsWith(path + "/")
      );
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/Dashboard/TeacherDashboard", request.url));
      }
    }

    // ACCOUNTS Security Guard
    if (role === "ACCOUNTS") {
      const allowedForAccounts = [
        "/dashboard/accounts",
        "/dashboard/admissions",
        "/dashboard/payments",
        "/dashboard/payroll",
        "/dashboard/profile",
      ];
      const isAllowed = allowedForAccounts.some((path) =>
        normalizedPath === path || normalizedPath.startsWith(path + "/")
      );
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/Dashboard/accounts", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/Dashboard/:path*",
    "/dashboard/:path*",
    "/login",
  ],
};