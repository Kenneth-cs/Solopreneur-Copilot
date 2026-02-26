import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/db/prisma"

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "邮箱和密码不能为空" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "密码至少 8 位" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "该邮箱已注册" }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        passwordHash,
        dayStreak: 1,
        plan: "free",
      },
    })

    return NextResponse.json(
      { message: "注册成功", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("[REGISTER ERROR]", error)
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
