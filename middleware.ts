import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";
import { NextRequest, NextResponse } from "next/server";

export default createMiddleware(routing);

export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  // matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
