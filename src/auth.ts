import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";
import Naver from "next-auth/providers/naver";
import { prisma } from "@/lib/db";

function getEnv(name: string) {
	return process.env[name] ?? "placeholder";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(prisma),
	providers: [
		Google({
			clientId: getEnv("AUTH_GOOGLE_ID"),
			clientSecret: getEnv("AUTH_GOOGLE_SECRET"),
			allowDangerousEmailAccountLinking: true,
		}),
		Kakao({
			clientId: getEnv("AUTH_KAKAO_ID"),
			clientSecret: getEnv("AUTH_KAKAO_SECRET"),
			allowDangerousEmailAccountLinking: true,
		}),
		Naver({
			clientId: getEnv("AUTH_NAVER_ID"),
			clientSecret: getEnv("AUTH_NAVER_SECRET"),
			allowDangerousEmailAccountLinking: true,
		}),
	],
	secret: process.env.AUTH_SECRET ?? "sam-check-dev-auth-secret",
	trustHost: true,
	session: {
		strategy: "jwt",
	},
	callbacks: {
		async signIn({ user, account }) {
			if (
				(account?.provider === "kakao" || account?.provider === "naver") &&
				!user.email
			) {
				return "/auth/error?error=EmailRequired";
			}

			return true;
		},
		async jwt({ token, trigger }) {
			if (trigger === "signIn" || trigger === "signUp") {
				token.id = token.sub;

				if (token.sub) {
					const dbUser = await prisma.user.findUnique({
						where: { id: token.sub },
						select: { role: true },
					});

					token.role = dbUser?.role ?? "STUDENT";
				}
			}

			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.role = token.role as string;
			}

			return session;
		},
	},
	pages: {
		signIn: "/auth/login",
		error: "/auth/error",
	},
});
