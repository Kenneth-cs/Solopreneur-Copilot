'use client'

import React, { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import {
  Lightbulb, Rocket, Trash2, Lock, AlertTriangle, Target,
  Users, Zap, TrendingUp, CheckCircle2, XCircle, Clock,
  Plus, RefreshCw, ChevronRight, Star,
} from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// ─── 类型 ──────────────────────────────────────────────────
interface Idea {
  id: string
  title: string
  description: string | null
  canvasTarget: string | null
  canvasPain: string | null
  canvasMvp: string | null
  canvasRevenue: string | null
  vcScore: number | null
  vcComment: string | null
  status: string
  createdAt: string
}

type Step = "list" | "canvas" | "validating" | "result"

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:  { label: "待验证", color: "text-slate-400 bg-slate-700/50",  icon: Clock },
  approved: { label: "高潜力", color: "text-green-400 bg-green-500/10",  icon: CheckCircle2 },
  rejected: { label: "已粉碎", color: "text-red-400 bg-red-500/10",      icon: XCircle },
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 70 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444"
  const data = [{ value: score }, { value: 100 - score }]
  return (
    <div className="relative flex h-44 w-full items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="70%" startAngle={180} endAngle={0}
            innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
            <Cell fill={color} />
            <Cell fill="#1e293b" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-8 flex flex-col items-center">
        <span className="text-4xl font-bold text-white">{score}</span>
        <span className="text-xs text-slate-500">/ 100</span>
      </div>
    </div>
  )
}

// ─── 主页面 ────────────────────────────────────────────────
export default function IdeaValidator() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<Step>("list")
  const [currentIdea, setCurrentIdea] = useState<Idea | null>(null)
  const [strengths, setStrengths] = useState<string[]>([])
  const [weaknesses, setWeaknesses] = useState<string[]>([])

  // 画布表单
  const [form, setForm] = useState({
    title: "", description: "", canvasTarget: "",
    canvasPain: "", canvasMvp: "", canvasRevenue: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchIdeas = useCallback(async () => {
    try {
      const res = await fetch("/api/ideas")
      const data = await res.json()
      setIdeas(data)
    } catch {
      toast.error("加载创意列表失败")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchIdeas() }, [fetchIdeas])

  const handleStartNew = () => {
    setForm({ title: "", description: "", canvasTarget: "", canvasPain: "", canvasMvp: "", canvasRevenue: "" })
    setCurrentIdea(null)
    setStep("canvas")
  }

  const handleViewIdea = (idea: Idea) => {
    setCurrentIdea(idea)
    setStrengths([])
    setWeaknesses([])
    setStep("result")
  }

  const handleSubmitCanvas = async () => {
    if (!form.title.trim()) { toast.error("请输入创意标题"); return }
    setSubmitting(true)

    try {
      // 1. 创建创意
      const createRes = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!createRes.ok) throw new Error("创建失败")
      const idea: Idea = await createRes.json()
      setCurrentIdea(idea)
      setIdeas(prev => [idea, ...prev])
      setStep("validating")

      // 2. 触发 AI 评分
      const validateRes = await fetch(`/api/ideas/${idea.id}/validate`, { method: "POST" })
      if (!validateRes.ok) throw new Error("AI 评分失败")
      const validated = await validateRes.json()

      setCurrentIdea(validated)
      setStrengths(validated.strengths ?? [])
      setWeaknesses(validated.weaknesses ?? [])
      setIdeas(prev => prev.map(i => i.id === validated.id ? validated : i))
      setStep("result")
      toast.success("AI 评分完成！")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "验证失败")
      setStep("canvas")
    } finally {
      setSubmitting(false)
    }
  }

  const handleShred = async () => {
    if (!currentIdea) return
    try {
      await fetch(`/api/ideas/${currentIdea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      })
      setIdeas(prev => prev.map(i => i.id === currentIdea.id ? { ...i, status: "rejected" } : i))
      setCurrentIdea(prev => prev ? { ...prev, status: "rejected" } : null)
      toast.success("想法已粉碎，下一个一定更好！")
    } catch {
      toast.error("操作失败")
    }
  }

  const handleApprove = async () => {
    if (!currentIdea) return
    try {
      const res = await fetch(`/api/ideas/${currentIdea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      })
      const updated = await res.json()
      setIdeas(prev => prev.map(i => i.id === updated.id ? updated : i))
      setCurrentIdea(updated)
      toast.success("已标记为高潜力创意，准备进入 MVP 阶段！")
    } catch {
      toast.error("操作失败")
    }
  }

  const handleDeleteIdea = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await fetch(`/api/ideas/${id}`, { method: "DELETE" })
      setIdeas(prev => prev.filter(i => i.id !== id))
      if (currentIdea?.id === id) setStep("list")
      toast.success("已删除")
    } catch {
      toast.error("删除失败")
    }
  }

  const score = currentIdea?.vcScore ?? 0
  const canProceed = score >= 70

  return (
    <div className="space-y-8">
      {/* ── 头部 ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
            创意碎纸机 <span className="text-2xl text-[#137FEC]">Idea Validator</span>
          </h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            在投入开发之前，先用毒舌 VC AI 评分快速验证想法。只有高分的才值得做 MVP。
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchIdeas} className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button onClick={handleStartNew}
            className="flex items-center gap-2 rounded-lg bg-[#137FEC] px-5 py-2 text-sm font-bold text-white hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 active:scale-95">
            <Plus className="h-4 w-4" /> 新建创意
          </button>
        </div>
      </div>

      {/* ── 创意列表 ── */}
      {ideas.length > 0 && step === "list" && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">历史创意</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {ideas.map(idea => {
              const cfg = STATUS_CONFIG[idea.status] ?? STATUS_CONFIG.pending
              const Icon = cfg.icon
              return (
                <motion.div key={idea.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleViewIdea(idea)}
                  className="group relative cursor-pointer rounded-xl border border-slate-800 bg-[#1A232E] p-4 hover:border-[#137FEC]/40 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-white line-clamp-2 group-hover:text-[#137FEC] transition-colors">{idea.title}</p>
                    <button onClick={(e) => handleDeleteIdea(idea.id, e)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", cfg.color)}>
                      <Icon className="h-3 w-3" />{cfg.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {idea.vcScore !== null && (
                        <span className={cn("text-sm font-bold", idea.vcScore >= 70 ? "text-green-400" : idea.vcScore >= 50 ? "text-yellow-400" : "text-red-400")}>
                          {idea.vcScore}分
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-[#137FEC] transition-colors" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 空状态 ── */}
      {!loading && ideas.length === 0 && step === "list" && (
        <Card className="flex flex-col items-center justify-center gap-4 py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800">
            <Lightbulb className="h-7 w-7 text-yellow-500" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-white">还没有创意记录</p>
            <p className="mt-1 text-sm text-slate-500">点击「新建创意」开始你的第一次验证</p>
          </div>
          <button onClick={handleStartNew} className="flex items-center gap-2 rounded-lg bg-[#137FEC] px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-600 transition-colors">
            <Plus className="h-4 w-4" /> 开始验证
          </button>
        </Card>
      )}

      {/* ── 填写画布 ── */}
      <AnimatePresence>
        {step === "canvas" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-lg font-bold text-white">
                <Target className="h-5 w-5 text-[#137FEC]" /> 填写商业画布
              </div>

              <Card className="space-y-5 p-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300">创意标题 *</label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="用一句话描述你的产品想法..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:border-[#137FEC]/50 focus:outline-none transition-colors" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300">补充描述（可选）</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={2} placeholder="更详细的产品方向..."
                    className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:border-[#137FEC]/50 focus:outline-none transition-colors" />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
                      <Users className="h-4 w-4 text-[#137FEC]" /> 目标用户
                    </label>
                    <textarea value={form.canvasTarget} onChange={e => setForm(p => ({ ...p, canvasTarget: e.target.value }))}
                      rows={3} placeholder="谁会为这个产品付钱？描述具体人群..."
                      className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#137FEC]/50 focus:outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" /> 用户痛点
                    </label>
                    <textarea value={form.canvasPain} onChange={e => setForm(p => ({ ...p, canvasPain: e.target.value }))}
                      rows={3} placeholder="他们现在最头疼的问题是什么？"
                      className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#137FEC]/50 focus:outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
                      <Zap className="h-4 w-4 text-[#137FEC]" /> MVP 核心功能
                    </label>
                    <textarea value={form.canvasMvp} onChange={e => setForm(p => ({ ...p, canvasMvp: e.target.value }))}
                      rows={3} placeholder="最小可行产品只做哪 1-3 个功能？"
                      className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#137FEC]/50 focus:outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
                      <TrendingUp className="h-4 w-4 text-green-500" /> 变现模式
                    </label>
                    <textarea value={form.canvasRevenue} onChange={e => setForm(p => ({ ...p, canvasRevenue: e.target.value }))}
                      rows={3} placeholder="怎么赚钱？订阅/买断/广告/服务？"
                      className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#137FEC]/50 focus:outline-none transition-colors" />
                  </div>
                </div>
              </Card>

              <div className="flex gap-3">
                <button onClick={() => setStep("list")} className="rounded-lg border border-slate-700 px-5 py-3 text-sm text-slate-400 hover:bg-slate-800 transition-colors">
                  取消
                </button>
                <button onClick={handleSubmitCanvas} disabled={submitting || !form.title.trim()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#137FEC] py-3 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-[0.98]">
                  <Rocket className="h-4 w-4" /> 提交，让毒舌 VC 来评分
                </button>
              </div>
            </div>

            {/* 右侧提示 */}
            <Card className="h-fit p-6 space-y-4">
              <h3 className="font-bold text-white">填写技巧</h3>
              {[
                { icon: Users, title: "目标用户要具体", desc: "不要写「所有人」，要写「全职独立开发者，月收入5k+」" },
                { icon: AlertTriangle, title: "痛点要真实", desc: "AI 会验证这个痛点是否真实存在，别编" },
                { icon: Zap, title: "MVP 要极简", desc: "第一个版本最多 2 个核心功能，其他都是浪费" },
                { icon: TrendingUp, title: "变现要清晰", desc: "说清楚第一笔收入怎么来，不接受「以后再想」" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-3">
                  <Icon className="h-4 w-4 shrink-0 mt-0.5 text-[#137FEC]" />
                  <div>
                    <p className="text-sm font-medium text-slate-300">{title}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </Card>
          </motion.div>
        )}

        {/* ── AI 评分中 ── */}
        {step === "validating" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-[#137FEC]/20 border-t-[#137FEC] animate-spin" />
              <AlertTriangle className="absolute inset-0 m-auto h-8 w-8 text-[#137FEC]" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">毒舌 VC 正在审阅你的创意...</p>
              <p className="mt-1 text-sm text-slate-500">AI 正在分析市场可行性和商业逻辑，请稍候</p>
            </div>
          </motion.div>
        )}

        {/* ── 验证结果 ── */}
        {step === "result" && currentIdea && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            {/* 左：画布展示 */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-bold text-white">
                  <Target className="h-5 w-5 text-[#137FEC]" />
                  {currentIdea.title}
                </div>
                <button onClick={() => setStep("list")} className="text-sm text-slate-500 hover:text-white transition-colors">
                  ← 返回列表
                </button>
              </div>

              <Card className="grid gap-4 p-6 md:grid-cols-2">
                {[
                  { icon: Users, label: "目标用户", value: currentIdea.canvasTarget, color: "text-[#137FEC]" },
                  { icon: AlertTriangle, label: "用户痛点", value: currentIdea.canvasPain, color: "text-yellow-500" },
                  { icon: Zap, label: "MVP 核心功能", value: currentIdea.canvasMvp, color: "text-[#137FEC]" },
                  { icon: TrendingUp, label: "变现模式", value: currentIdea.canvasRevenue, color: "text-green-500" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="space-y-2">
                    <div className={cn("flex items-center gap-2 text-sm font-bold text-slate-300")}>
                      <Icon className={cn("h-4 w-4", color)} />{label}
                    </div>
                    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3 text-sm text-slate-300">
                      {value ?? <span className="text-slate-600 italic">未填写</span>}
                    </div>
                  </div>
                ))}
              </Card>

              {/* 优势/劣势 */}
              {(strengths.length > 0 || weaknesses.length > 0) && (
                <div className="grid gap-4 md:grid-cols-2">
                  {strengths.length > 0 && (
                    <Card className="p-4 border-green-500/20">
                      <p className="mb-2 flex items-center gap-2 text-sm font-bold text-green-400">
                        <CheckCircle2 className="h-4 w-4" /> 优势
                      </p>
                      <ul className="space-y-1.5">
                        {strengths.map((s, i) => (
                          <li key={i} className="text-xs text-slate-300 pl-2 border-l border-green-500/30">{s}</li>
                        ))}
                      </ul>
                    </Card>
                  )}
                  {weaknesses.length > 0 && (
                    <Card className="p-4 border-red-500/20">
                      <p className="mb-2 flex items-center gap-2 text-sm font-bold text-red-400">
                        <XCircle className="h-4 w-4" /> 主要问题
                      </p>
                      <ul className="space-y-1.5">
                        {weaknesses.map((w, i) => (
                          <li key={i} className="text-xs text-slate-300 pl-2 border-l border-red-500/30">{w}</li>
                        ))}
                      </ul>
                    </Card>
                  )}
                </div>
              )}
            </div>

            {/* 右：VC 评分 */}
            <Card className="flex flex-col items-center p-6 space-y-4">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <h3 className="text-lg font-bold text-white">毒舌 VC 评分</h3>
                </div>
                {currentIdea.vcScore !== null && (
                  <span className={cn("rounded px-2 py-0.5 text-xs font-bold border",
                    currentIdea.vcScore >= 70 ? "text-green-400 bg-green-500/10 border-green-500/20" :
                    currentIdea.vcScore >= 50 ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" :
                    "text-red-400 bg-red-500/10 border-red-500/20"
                  )}>
                    {STATUS_CONFIG[currentIdea.status]?.label ?? "待验证"}
                  </span>
                )}
              </div>

              {currentIdea.vcScore !== null ? (
                <>
                  <ScoreGauge score={currentIdea.vcScore} />

                  {currentIdea.vcComment && (
                    <div className="relative w-full rounded-xl bg-slate-800 p-4">
                      <div className="absolute -top-3 left-4 rounded bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        AI CRITIC
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-slate-300">
                        "{currentIdea.vcComment}"
                      </p>
                    </div>
                  )}

                  {/* 操作按钮 */}
                  {currentIdea.status !== "rejected" && currentIdea.status !== "approved" && (
                    <button onClick={handleShred}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-500 py-3 font-bold text-white hover:bg-red-600 transition-colors active:scale-[0.98]">
                      <Trash2 className="h-4 w-4" /> SHRED IT（粉碎想法）
                    </button>
                  )}

                  <div className={cn("w-full rounded-lg border p-4 transition-all",
                    canProceed ? "border-green-500/30 bg-green-500/5 cursor-pointer hover:border-green-500/50" : "border-slate-700 opacity-60"
                  )} onClick={canProceed && currentIdea.status !== "approved" ? handleApprove : undefined}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className={cn("h-4 w-4", canProceed ? "text-green-400" : "text-slate-500")} />
                        <span className={cn("text-sm font-medium", canProceed ? "text-green-400" : "text-slate-400")}>
                          {currentIdea.status === "approved" ? "已批准，准备立项！" : "进入 MVP 阶段"}
                        </span>
                      </div>
                      {canProceed ? <ChevronRight className="h-4 w-4 text-green-400" /> : <Lock className="h-4 w-4 text-slate-500" />}
                    </div>
                    {!canProceed && (
                      <p className="mt-1 text-xs text-slate-500">评分需 ≥ 70 才能解锁</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8">
                  <Clock className="h-8 w-8 text-slate-600" />
                  <p className="text-sm text-slate-500">尚未进行 AI 评分</p>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
