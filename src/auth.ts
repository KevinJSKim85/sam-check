import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";
import { prisma } from "@/lib/db";

function getEnv(name: string) {
	return process.env[name] ?? "placeholder";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(prisma),
	providers: [
		Credentials({
			name: "Email",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				const rawEmail = credentials?.email;
				const rawPassword = credentials?.password;
				const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
				const password = typeof rawPassword === "string" ? rawPassword : "";

				if (!email || !password) {
					return null;
				}

				const user = await prisma.user.findUnique({
					where: { email },
					select: {
						id: true,
						email: true,
						name: true,
						image: true,
						role: true,
						emailVerified: true,
						password: true,
					},
				});

				if (!user?.password) {
					return null;
				}

				const isPasswordValid = await compare(password, user.password);

				if (!isPasswordValid) {
					return null;
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					image: user.image,
					role: user.role,
					emailVerified: user.emailVerified,
				};
			},
		}),
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
	],
	secret: process.env.AUTH_SECRET ?? "sam-check-dev-auth-secret",
	trustHost: true,
	session: {
		strategy: "jwt",
	},
	callbacks: {
		async signIn({ user, account }) {
			if (account?.provider === "credentials" && user.email) {
				const credentialUser = await prisma.user.findUnique({
					where: { email: user.email },
					select: { emailVerified: true },
				});

				if (!credentialUser?.emailVerified) {
					return `/auth/verify-email?status=required&email=${encodeURIComponent(user.email)}`;
				}
			}

			if (account?.provider === "kakao" && !user.email) {
				return "/auth/error?error=EmailRequired";
			}

			// Auto-promote users to ADMIN if their email is in ADMIN_EMAILS env var
			if (user.email && user.id) {
				const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim()) || [];
				if (adminEmails.includes(user.email)) {
					await prisma.user.update({
						where: { id: user.id },
						data: { role: "ADMIN" },
					});
				}
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
