import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/db/prisma"

// GET /api/projects
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      idea: { select: { title: true, vcScore: true } },
      metrics: { orderBy: { date: "desc" }, take: 1 },
    },
  })
  return NextResponse.json(projects)
}

// POST /api/projects — 从 Idea 立项 或 直接新建
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const body = await req.json()
  const { ideaId, name, description, deadline, tasks } = body

  if (!name?.trim()) return NextResponse.json({ error: "项目名称不能为空" }, { status: 400 })

  // 如果来自 Idea，检查归属权
  if (ideaId) {
    const idea = await prisma.idea.findFirst({ where: { id: ideaId, userId: session.user.id } })
    if (!idea) return NextResponse.json({ error: "创意不存在" }, { status: 404 })
    // 标记 Idea 为已立项
    await prisma.idea.update({ where: { id: ideaId }, data: { status: "approved" } })
  }

  const project = await prisma.project.create({
    data: {
      userId: session.user.id,
      ideaId: ideaId ?? undefined,
      name: name.trim(),
      description: description ?? null,
      deadline: deadline ? new Date(deadline) : null,
      tasks: tasks ?? [],
      status: "active",
    },
    include: { idea: { select: { title: true, vcScore: true } } },
  })

  await prisma.userActivity.create({
    data: {
      userId: session.user.id,
      actionType: "create_project",
      description: `立项：${project.name}`,
      metadata: { projectId: project.id },
    },
  })

  return NextResponse.json(project, { status: 201 })
}
