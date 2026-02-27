import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/db/prisma"
import { getDailyReviewReply, generateDailyReport, type ChatMessage } from "@/lib/ai/volcano"

// GET /api/daily — 获取当前用户所有历史复盘日志
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  const logs = await prisma.dailyLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
      select: {
      id: true,
      createdAt: true,
      aiReportMd: true,
      q1: true,
      q2: true,
      q3: true,
      q4: true,
      q5: true,
      q6: true,
      q7: true,
      q8: true,
    },
  })

  return NextResponse.json(logs)
}

// POST /api/daily — 发送消息，获取 AI 回复
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  const body = await req.json()
  const { messages, logId, isComplete } = body as {
    messages: ChatMessage[]
    logId?: string
    isComplete?: boolean
  }

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "messages 参数缺失" }, { status: 400 })
  }

  try {
    // 如果六问全部完成，生成日报并保存
    if (isComplete) {
      const today = new Date().toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      const reportMd = await generateDailyReport(messages, today)

      // 从对话中提取八问答案（跳过第一条触发消息"开始今日复盘"）
      const userMessages = messages.filter((m) => m.role === "user").slice(1)
      const [q1, q2, q3, q4, q5, q6, q7, q8] = userMessages.map((m) => m.content)

      let log
      if (logId) {
        log = await prisma.dailyLog.update({
          where: { id: logId },
          data: {
            aiReportMd: reportMd,
            q1: q1 ?? null,
            q2: q2 ?? null,
            q3: q3 ?? null,
            q4: q4 ?? null,
            q5: q5 ?? null,
            q6: q6 ?? null,
            q7: q7 ?? null,
            q8: q8 ?? null,
          },
        })
      } else {
        log = await prisma.dailyLog.create({
          data: {
            userId: session.user.id,
            aiReportMd: reportMd,
            q1: q1 ?? null,
            q2: q2 ?? null,
            q3: q3 ?? null,
            q4: q4 ?? null,
            q5: q5 ?? null,
            q6: q6 ?? null,
            q7: q7 ?? null,
            q8: q8 ?? null,
          },
        })
      }

      // 更新 dayStreak（今日已完成复盘）
      await prisma.user.update({
        where: { id: session.user.id },
        data: { dayStreak: { increment: 1 } },
      })

      // 记录用户活动
      await prisma.userActivity.create({
        data: {
          userId: session.user.id,
          actionType: "daily_log",
          description: `完成每日复盘，AI 日报已生成`,
        },
      })

      return NextResponse.json({ reply: reportMd, logId: log.id, isReport: true })
    }

    // 普通对话：获取 AI 下一问
    const reply = await getDailyReviewReply(messages)

    // 首次发消息时创建草稿日志
    let currentLogId = logId
    if (!logId && messages.length === 1) {
      const draft = await prisma.dailyLog.create({
        data: { userId: session.user.id },
      })
      currentLogId = draft.id
    }

    return NextResponse.json({ reply, logId: currentLogId })
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI 服务异常"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
