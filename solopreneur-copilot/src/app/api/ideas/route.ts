import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/db/prisma"

// GET /api/ideas — 获取当前用户所有创意
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")

  const ideas = await prisma.idea.findMany({
    where: {
      userId: session.user.id,
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(ideas)
}

// POST /api/ideas — 新建创意
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  const body = await req.json()
  const { title, description, canvasTarget, canvasPain, canvasMvp, canvasRevenue } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: "创意标题不能为空" }, { status: 400 })
  }

  const idea = await prisma.idea.create({
    data: {
      userId: session.user.id,
      title: title.trim(),
      description: description ?? null,
      canvasTarget: canvasTarget ?? null,
      canvasPain: canvasPain ?? null,
      canvasMvp: canvasMvp ?? null,
      canvasRevenue: canvasRevenue ?? null,
      status: "pending",
    },
  })

  // 记录活动
  await prisma.userActivity.create({
    data: {
      userId: session.user.id,
      actionType: "create_idea",
      description: `新建创意：${idea.title}`,
      metadata: { ideaId: idea.id },
    },
  })

  return NextResponse.json(idea, { status: 201 })
}
