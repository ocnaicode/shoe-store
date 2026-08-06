import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
