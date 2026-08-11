import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PREFIXES = [
  "/",
  "/auth",
  "/favicon.ico",
  "/favicon.svg",
  "/logo-mark.svg",
  "/logo.png",
  "/robots.txt",
];

function isPublicPath(pathname: string) {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some(
    (p) => p !== "/" && (pathname === p || pathname.startsWith(`${p}/`)),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Skip Supabase session refresh on public marketing/auth assets for lower latency.
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
