import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export default function middleware(request: NextRequest) {
	if (request.nextUrl.pathname.startsWith("/api")) {
		return NextResponse.next();
	}

	// Auth protection is at page/layout level (requireAuth/requireAdmin), not middleware
	return intlMiddleware(request);
}

export const config = {
	matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
