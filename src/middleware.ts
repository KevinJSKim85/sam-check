import { NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { auth } from "@/auth";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export default auth((request) => {
	if (request.nextUrl.pathname.startsWith("/api")) {
		return NextResponse.next();
	}

	return intlMiddleware(request);
});

export const config = {
	matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
