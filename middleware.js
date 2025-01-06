import { NextResponse } from "next/server";

export function middleware(request) {
  const publicRoutes = ["/", "/login", "/register"];
  const adminRoutes = [
    "/admin/orders",
    "/admin/products",
    "/admin/warehouses",
    "/admin/users",
    "/admin",
  ];
  const userRoutes = ["/orders", "/users"];

  const token = request.cookies.get("token")?.value; // Retrieve the token from cookies
  const userCookie = request.cookies.get("user")?.value;
  const user = userCookie ? JSON.parse(userCookie) : null;

  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);
  const isAdminRoute = adminRoutes.includes(request.nextUrl.pathname);
  const isUserRoute = userRoutes.includes(request.nextUrl.pathname);

  if (!token && !isPublicRoute) {
    // Redirect unauthenticated users to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    token &&
    isPublicRoute &&
    ["/login", "/register"].includes(request.nextUrl.pathname)
  ) {
    // Redirect authenticated users away from login/register
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (token) {
    if (isAdminRoute && user.role !== "SUPER_ADMIN") {
      // Redirect non-admin users from admin routes
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (isUserRoute && user.role !== "CUSTOMER") {
      // Redirect non-customers from user routes
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
