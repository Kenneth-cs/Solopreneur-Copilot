import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/db/prisma"

// PATCH /api/ideas/:id — 更新画布字段或状态
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const idea = await prisma.idea.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!idea) {
    return NextResponse.json({ error: "创意不存在" }, { status: 404 })
  }

  const allowedFields = [
    "title", "description", "canvasTarget", "canvasPain",
    "canvasMvp", "canvasRevenue", "status", "vcScore", "vcComment", "marketReport",
  ]
  const data: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (body[key] !== undefined) data[key] = body[key]
  }

  const updated = await prisma.idea.update({ where: { id }, data })
  return NextResponse.json(updated)
}

// DELETE /api/ideas/:id — 删除创意
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  const { id } = await params

  const idea = await prisma.idea.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!idea) {
    return NextResponse.json({ error: "创意不存在" }, { status: 404 })
  }

  await prisma.idea.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
