import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/db/prisma"

// GET /api/metrics — 聚合所有项目的最新指标
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id, status: { in: ["active", "launched"] } },
    include: { metrics: { orderBy: { date: "desc" }, take: 1 } },
  })

  // 汇总所有项目的最新指标
  let totalMrr = 0, totalDau = 0, totalRevenue = 0, totalCost = 0
  for (const p of projects) {
    const m = p.metrics[0]
    if (m) {
      totalMrr += m.mrr
      totalDau += m.dau
      totalRevenue += m.revenue
      totalCost += m.cost
    }
  }

  return NextResponse.json({
    mrr: totalMrr,
    dau: totalDau,
    revenue: totalRevenue,
    cost: totalCost,
    profit: totalRevenue - totalCost,
    profitMargin: totalRevenue > 0 ? Math.round(((totalRevenue - totalCost) / totalRevenue) * 100) : 0,
    projectCount: projects.length,
  })
}

// POST /api/metrics — 录入/更新某项目今日指标
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const body = await req.json()
  const { projectId, mrr, dau, revenue, cost, ltv } = body

  if (!projectId) return NextResponse.json({ error: "projectId 必填" }, { status: 400 })

  const project = await prisma.project.findFirst({ where: { id: projectId, userId: session.user.id } })
  if (!project) return NextResponse.json({ error: "项目不存在" }, { status: 404 })

  // 今天的日期（只取年月日）
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const metric = await prisma.productMetrics.upsert({
    where: { projectId_date: { projectId, date: today } },
    update: {
      mrr: mrr ?? 0,
      dau: dau ?? 0,
      revenue: revenue ?? 0,
      cost: cost ?? 0,
      ltv: ltv ?? 0,
    },
    create: {
      projectId,
      date: today,
      mrr: mrr ?? 0,
      dau: dau ?? 0,
      revenue: revenue ?? 0,
      cost: cost ?? 0,
      ltv: ltv ?? 0,
    },
  })

  return NextResponse.json(metric)
}
