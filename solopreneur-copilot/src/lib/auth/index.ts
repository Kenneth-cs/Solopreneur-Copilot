import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import prisma from "@/lib/db/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    // 邮箱 + 密码登录
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.passwordHash) return null

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!passwordMatch) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
        }
      },
    }),
    // GitHub OAuth
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
      }
      // 每次 session 更新或首次登录时，从 DB 同步最新 plan/dayStreak
      if (token.id && (trigger === "signIn" || trigger === "update" || !token.plan)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { plan: true, dayStreak: true },
        })
        if (dbUser) {
          token.plan = dbUser.plan
          token.dayStreak = dbUser.dayStreak
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.plan = (token.plan as string) ?? "free"
        session.user.dayStreak = (token.dayStreak as number) ?? 0
      }
      return session
    },
  },
  events: {
    // 新用户首次 OAuth 登录后，记录 dayStreak 初始化
    async createUser({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { dayStreak: 1 },
      })
    },
  },
})
