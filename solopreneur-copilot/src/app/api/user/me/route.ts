import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/db/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      plan: true,
      dayStreak: true,
      createdAt: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  const body = await req.json()
  const allowed = ["name", "avatarUrl"]
  const data: Record<string, string> = {}
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key]
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { id: true, name: true, email: true, avatarUrl: true, plan: true, dayStreak: true },
  })

  return NextResponse.json(updated)
}
