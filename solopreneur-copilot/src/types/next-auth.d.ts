import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      plan: string
      dayStreak: number
    } & DefaultSession["user"]
  }

  interface JWT {
    id?: string
    plan?: string
    dayStreak?: number
  }
}
