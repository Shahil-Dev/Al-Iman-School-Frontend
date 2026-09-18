import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  const privateRoutes = [
    "/dashboard",
    "/public/notices",
    "/public/teachers",
    "/public/admission",
    "/notices",
    "/teachers",
    "/admission",
  ];

  const isPrivateKeyRoute = privateRoutes.some((route) =>
    pathname.toLowerCase().startsWith(route.toLowerCase())
  );


  if (isPrivateKeyRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }


  if (pathname.toLowerCase() === "/login" && token) {
    return NextResponse.redirect(new URL("/Dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/Dashboard/:path*",
    "/Public/notices/:path*",
    "/Public/teachers/:path*",
    "/Public/admission/:path*",
    "/notices/:path*",
    "/teachers/:path*",
    "/admission/:path*",
    "/login",
  ],
};