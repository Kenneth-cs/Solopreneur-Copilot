'use client'

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  Users,
  DollarSign,
  Zap,
  Clock,
  Play,
  Lightbulb,
  RefreshCw,
  CheckSquare,
  Square,
  ArrowRight,
  Edit3,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";


interface IdeaItem {
  id: string
  title: string
  vcScore: number | null
  status: string
  createdAt: string
}

interface Metrics {
  mrr: number
  dau: number
  revenue: number
  profit: number
  profitMargin: number
}

export default function Dashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [projects, setProjects] = useState<{id: string; name: string}[]>([]);
  const [metricsForm, setMetricsForm] = useState({ projectId: "", mrr: "", dau: "", revenue: "", cost: "" });
  const [savingMetrics, setSavingMetrics] = useState(false);

  const fetchData = async () => {
    const [ideasRes, metricsRes, projectsRes] = await Promise.all([
      fetch("/api/ideas").catch(() => null),
      fetch("/api/metrics").catch(() => null),
      fetch("/api/projects").catch(() => null),
    ]);
    if (ideasRes?.ok) { const d = await ideasRes.json(); Array.isArray(d) && setIdeas(d.slice(0, 3)); }
    if (metricsRes?.ok) { const d = await metricsRes.json(); setMetrics(d); }
    if (projectsRes?.ok) { const d = await projectsRes.json(); Array.isArray(d) && setProjects(d.map((p: {id: string; name: string}) => ({ id: p.id, name: p.name }))); }
  };

  useEffect(() => { fetchData(); }, []);

  const saveMetrics = async () => {
    if (!metricsForm.projectId) { toast.error("请选择项目"); return; }
    setSavingMetrics(true);
    try {
      await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: metricsForm.projectId,
          mrr: Number(metricsForm.mrr) || 0,
          dau: Number(metricsForm.dau) || 0,
          revenue: Number(metricsForm.revenue) || 0,
          cost: Number(metricsForm.cost) || 0,
        }),
      });
      toast.success("指标已保存");
      setShowMetricsModal(false);
      fetchData();
    } catch { toast.error("保存失败"); }
    finally { setSavingMetrics(false); }
  };
  const [tasks, setTasks] = useState([
    { id: 1, text: "完成核心 API 对接", completed: true },
    { id: 2, text: "前端编辑器组件开发", completed: false },
    { id: 3, text: "准备内测邀请码系统", completed: false },
  ]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData().finally(() => { setIsRefreshing(false); toast.success("数据已更新"); });
  };

  const handleEnterEnv = () => {
    toast.success("正在启动开发环境...", {
      description: "AI 写作助手 V1.0 环境准备中",
    });
  };

  const handleViewDetails = () => {
    router.push("/project-management");
  };

  const handleNewValidation = () => {
    router.push("/idea-validator");
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">仪表盘概览</h1>
          <p className="mt-2 text-slate-400">
            欢迎回来 {session?.user?.name ?? ""}，这是你构建帝国的第{" "}
            <span className="font-bold text-[#137FEC]">{session?.user?.dayStreak ?? 1}</span> 天。
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 rounded-lg border border-slate-700 bg-[#1C2127] px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          {isRefreshing ? "刷新中..." : "刷新数据"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            name: "MRR (月经常性收入)",
            value: metrics ? `¥${metrics.mrr.toLocaleString()}` : "–",
            sub: metrics?.mrr ? "已录入真实数据" : "暂无数据，点击录入",
            icon: DollarSign,
            path: "/marketing",
          },
          {
            name: "活跃用户 (DAU)",
            value: metrics ? metrics.dau.toLocaleString() : "–",
            sub: metrics?.dau ? "今日活跃用户" : "暂无数据，点击录入",
            icon: Users,
            path: "/marketing",
          },
          {
            name: "净利润",
            value: metrics ? `¥${metrics.profit.toLocaleString()}` : "–",
            sub: metrics?.profitMargin ? `利润率 ${metrics.profitMargin}%` : "暂无数据，点击录入",
            icon: TrendingUp,
            path: "/marketing",
          },
        ].map((stat, index) => (
          <motion.div key={stat.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
            onClick={() => router.push(stat.path)}>
            <Card className="relative overflow-hidden hover:border-[#137FEC]/50 transition-colors cursor-pointer group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{stat.name}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{stat.value}</span>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-800/50 p-2 group-hover:bg-[#137FEC]/10 transition-colors">
                  <stat.icon className="h-5 w-5 text-slate-400 group-hover:text-[#137FEC] transition-colors" />
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500">{stat.sub}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 录入指标入口 */}
      <div className="flex justify-end">
        <button onClick={() => setShowMetricsModal(true)}
          className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          <Edit3 className="h-4 w-4" /> 录入今日指标
        </button>
      </div>

      {/* Current Focus */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#137FEC]" />
          <h2 className="text-xl font-bold text-white">当前聚焦</h2>
        </div>
        <Card className="flex flex-col gap-6 lg:flex-row hover:border-slate-700 transition-colors">
          {/* Image Placeholder */}
          <div className="h-64 w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 lg:w-[400px] relative group">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#137FEC]/20 group-hover:scale-110 transition-transform duration-300">
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
              
              <div className="mt-4 space-y-2">
                {tasks.map((task) => (
                  <div 
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    {task.completed ? (
                      <CheckSquare className="h-4 w-4 text-[#137FEC]" />
                    ) : (
                      <Square className="h-4 w-4 text-slate-500 group-hover:text-slate-400" />
                    )}
                    <span className={cn("text-sm transition-colors", task.completed ? "text-slate-500 line-through" : "text-slate-300 group-hover:text-white")}>
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>
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
                  <span className="text-base font-bold text-[#137FEC]">
                    {Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-700">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-[#137FEC]" 
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleEnterEnv}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#137FEC] py-3 text-base font-medium text-white hover:bg-blue-600 transition-colors active:scale-[0.98]"
                >
                  <Play className="h-4 w-4 fill-current" />
                  进入开发环境
                </button>
                <button 
                  onClick={handleViewDetails}
                  className="flex items-center justify-center rounded-lg border border-slate-600 bg-transparent px-4 py-3 text-base font-medium text-slate-300 hover:bg-slate-800 transition-colors active:scale-[0.98]"
                >
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
          <button className="flex items-center gap-1 text-sm font-medium text-[#137FEC] hover:text-blue-400 transition-colors">
            全部历史 <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b border-slate-800 bg-slate-900/50 px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div>创意名称</div>
            <div>验证日期</div>
            <div>AI 评分</div>
            <div className="text-right">状态</div>
          </div>
          <div className="divide-y divide-slate-800">
            {ideas.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-sm text-slate-500">
                还没有创意记录，去验证你的第一个想法吧
              </div>
            ) : ideas.map((idea) => {
              const score = idea.vcScore
              const barColor = score === null ? "bg-slate-600" : score >= 70 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500"
              const scoreColor = score === null ? "text-slate-400" : score >= 70 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500"
              const statusLabel = idea.status === "approved" ? "高潜力" : idea.status === "rejected" ? "已粉碎" : "待验证"
              const statusColor = idea.status === "approved" ? "text-green-500 bg-green-500/10" : idea.status === "rejected" ? "text-red-400 bg-red-500/10" : "text-slate-400 bg-slate-700/50"
              return (
                <div key={idea.id}
                  onClick={() => router.push("/idea-validator")}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 group-hover:bg-slate-700 transition-colors">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                    </div>
                    <p className="font-bold text-white truncate">{idea.title}</p>
                  </div>
                  <div className="text-sm text-slate-400">
                    {new Date(idea.createdAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("text-sm font-bold", scoreColor)}>
                      {score ?? "–"}
                    </span>
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-700">
                      <div className={cn("h-full", barColor)} style={{ width: `${score ?? 0}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", statusColor)}>
                      {statusLabel}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="border-t border-slate-800 p-4">
            <button 
              onClick={handleNewValidation}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-600 py-3 text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-colors hover:bg-slate-800/50"
            >
              <Lightbulb className="h-5 w-5" />
              开始新的创意验证
            </button>
          </div>
        </Card>
      </div>
      {/* 录入指标弹窗 */}
      <AnimatePresence>
        {showMetricsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowMetricsModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#101922] p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">录入今日指标</h3>
                <button onClick={() => setShowMetricsModal(false)}><X className="h-5 w-5 text-slate-500 hover:text-white" /></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">选择项目 *</label>
                  {projects.length === 0 ? (
                    <p className="text-sm text-slate-500">还没有项目，请先在项目管理页面创建</p>
                  ) : (
                    <select value={metricsForm.projectId} onChange={e => setMetricsForm(p => ({ ...p, projectId: e.target.value }))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white focus:outline-none">
                      <option value="">请选择...</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "mrr", label: "MRR 月收入 (¥)", placeholder: "例: 1200" },
                    { key: "dau", label: "DAU 日活用户", placeholder: "例: 340" },
                    { key: "revenue", label: "今日收入 (¥)", placeholder: "例: 50" },
                    { key: "cost", label: "今日成本 (¥)", placeholder: "例: 20" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key} className="space-y-1">
                      <label className="text-xs text-slate-500">{label}</label>
                      <input
                        type="number" min="0" placeholder={placeholder}
                        value={metricsForm[key as keyof typeof metricsForm]}
                        onChange={e => setMetricsForm(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#137FEC]/50" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setShowMetricsModal(false)} className="flex-1 rounded-lg border border-slate-700 py-2.5 text-sm text-slate-400 hover:bg-slate-800">取消</button>
                <button onClick={saveMetrics} disabled={savingMetrics || !metricsForm.projectId}
                  className="flex-1 rounded-lg bg-[#137FEC] py-2.5 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-50">
                  {savingMetrics ? "保存中..." : "保存"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
