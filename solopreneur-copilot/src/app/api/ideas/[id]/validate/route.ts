import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/db/prisma"
import { getVCScore } from "@/lib/ai/volcano"

// POST /api/ideas/:id/validate — 触发毒舌 VC AI 评分
export async function POST(
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

  try {
    const result = await getVCScore(idea)

    // 根据评分自动流转状态
    const status =
      result.verdict === "approved"
        ? "approved"
        : result.verdict === "rejected"
        ? "rejected"
        : "pending"

    const updated = await prisma.idea.update({
      where: { id },
      data: {
        vcScore: result.score,
        vcComment: result.comment,
        vcStrengths: result.strengths ?? [],
        vcWeaknesses: result.weaknesses ?? [],
        status,
      },
    })

    // 记录活动
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        actionType: "validate_idea",
        description: `验证创意「${idea.title}」，得分 ${result.score}`,
        metadata: { ideaId: id, score: result.score, verdict: result.verdict },
      },
    })

    return NextResponse.json({ ...updated, strengths: result.strengths, weaknesses: result.weaknesses })
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI 评分失败"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
