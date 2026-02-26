import React from "react";
import { Card } from "@/components/ui/Card";
import {
  TrendingUp,
  Users,
  DollarSign,
  Zap,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive,
  Play,
  Info,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    name: "MRR (月经常性收入)",
    value: "¥12,500",
    change: "+15%",
    trend: "up",
    description: "较上月增长 ¥1,630",
    icon: DollarSign,
  },
  {
    name: "活跃用户",
    value: "1,240",
    change: "+5%",
    trend: "up",
    description: "昨日新增 12 位用户",
    icon: Users,
  },
  {
    name: "净利润",
    value: "¥8,900",
    change: "+12%",
    trend: "up",
    description: "利润率 71.2%",
    icon: TrendingUp,
  },
];

const ideas = [
  {
    name: "Notion 待办插件",
    category: "SaaS / B2C",
    date: "2 小时前",
    score: 85,
    status: "High Potential",
    statusColor: "text-green-500 bg-green-500/10",
    barColor: "bg-green-500",
    icon: CheckCircle2,
  },
  {
    name: "宠物社交 App",
    category: "Mobile / C2C",
    date: "昨天",
    score: 62,
    status: "Needs Research",
    statusColor: "text-yellow-500 bg-yellow-500/10",
    barColor: "bg-yellow-500",
    icon: AlertCircle,
  },
  {
    name: "二手书聚合平台",
    category: "Marketplace",
    date: "3 天前",
    score: 45,
    status: "Archived",
    statusColor: "text-slate-400 bg-slate-400/10",
    barColor: "bg-slate-400",
    icon: Archive,
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">仪表盘概览</h1>
        <p className="mt-2 text-slate-400">
          欢迎回来，这是你构建帝国的第 <span className="font-bold text-[#137FEC]">142</span> 天。
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.name} className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">{stat.name}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">
                    {stat.value}
                  </span>
                  <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-xs font-medium text-green-500">
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="rounded-lg bg-slate-800/50 p-2">
                <stat.icon className="h-5 w-5 text-slate-400" />
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">{stat.description}</p>
          </Card>
        ))}
      </div>

      {/* Current Focus */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#137FEC]" />
          <h2 className="text-xl font-bold text-white">当前聚焦</h2>
        </div>
        <Card className="flex flex-col gap-6 lg:flex-row">
          {/* Image Placeholder */}
          <div className="h-64 w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 lg:w-[400px]">
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#137FEC]/20">
                  <Zap className="h-8 w-8 text-[#137FEC]" />
                </div>
                <p className="text-sm font-medium text-slate-400">AI Project Visualization</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="mb-2 inline-block rounded bg-[#137FEC]/20 px-2 py-1 text-xs font-bold text-[#137FEC]">
                    MVP 构建阶段
                  </span>
                  <h3 className="text-2xl font-bold text-white">
                    AI 写作助手 V1.0
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500">截止日期</p>
                  <p className="text-base font-medium text-white">10月 24日</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                主要目标：完成核心 API 对接与前端编辑器组件开发，准备内测邀请码系统。
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-slate-400" />
                    <span className="text-lg font-bold text-white">
                      3 天 4 小时
                    </span>
                    <span className="text-sm text-slate-400">剩余</span>
                  </div>
                  <span className="text-base font-bold text-[#137FEC]">75%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-700">
                  <div className="h-full w-[75%] bg-[#137FEC]" />
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#137FEC] py-3 text-base font-medium text-white hover:bg-blue-600 transition-colors">
                  <Play className="h-4 w-4 fill-current" />
                  进入开发环境
                </button>
                <button className="flex items-center justify-center rounded-lg border border-slate-600 bg-transparent px-4 py-3 text-base font-medium text-slate-300 hover:bg-slate-800 transition-colors">
                  查看详情
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Idea Validation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-bold text-white">最近创意验证</h2>
          </div>
          <button className="flex items-center gap-1 text-sm font-medium text-[#137FEC] hover:text-blue-400">
            全部历史 <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-slate-800 bg-slate-900/50 px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div>创意名称</div>
            <div>市场赛道</div>
            <div>验证日期</div>
            <div>AI 评分</div>
            <div className="text-right">状态</div>
          </div>
          <div className="divide-y divide-slate-800">
            {ideas.map((idea) => (
              <div
                key={idea.name}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800">
                    <idea.icon className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{idea.name}</p>
                    <p className="text-xs text-slate-500">生产力工具</p>
                  </div>
                </div>
                <div className="text-sm text-slate-400">{idea.category}</div>
                <div className="text-sm text-slate-400">{idea.date}</div>
                <div className="flex items-center gap-3">
                  <span className={cn("text-sm font-bold", idea.status === "High Potential" ? "text-green-500" : idea.status === "Needs Research" ? "text-yellow-500" : "text-red-500")}>
                    {idea.score}
                  </span>
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className={cn("h-full", idea.barColor)}
                      style={{ width: `${idea.score}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      idea.statusColor
                    )}
                  >
                    {idea.status === "High Potential" ? "高潜力" : idea.status === "Needs Research" ? "需调研" : "已归档"}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 p-4">
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-600 py-3 text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-colors">
              <Lightbulb className="h-5 w-5" />
              开始新的创意验证
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
