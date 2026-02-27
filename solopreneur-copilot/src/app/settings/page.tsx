'use client'

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import {
  User, Mail, Lock, Shield, Zap, Calendar,
  Lightbulb, ListTodo, BookOpen, CheckCircle2,
  Save, Eye, EyeOff, AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface UserInfo {
  id: string
  name: string | null
  email: string
  plan: string
  dayStreak: number
  createdAt: string
}

interface Stats {
  ideas: number
  projects: number
  dailyLogs: number
}

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [stats, setStats] = useState<Stats>({ ideas: 0, projects: 0, dailyLogs: 0 })
  const [loading, setLoading] = useState(true)

  // 编辑昵称
  const [nameVal, setNameVal] = useState("")
  const [savingName, setSavingName] = useState(false)

  // 修改密码
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" })
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false })
  const [savingPw, setSavingPw] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [uRes, iRes, pRes, dRes] = await Promise.all([
          fetch("/api/user/me"),
          fetch("/api/ideas"),
          fetch("/api/projects"),
          fetch("/api/daily"),
        ])
        if (uRes.ok) {
          const u = await uRes.json()
          setUser(u)
          setNameVal(u.name ?? "")
        }
        const ideas = iRes.ok ? await iRes.json() : []
        const projects = pRes.ok ? await pRes.json() : []
        const daily = dRes.ok ? await dRes.json() : []
        setStats({
          ideas: Array.isArray(ideas) ? ideas.length : 0,
          projects: Array.isArray(projects) ? projects.length : 0,
          dailyLogs: Array.isArray(daily) ? daily.length : 0,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const saveName = async () => {
    if (!nameVal.trim()) { toast.error("昵称不能为空"); return }
    setSavingName(true)
    try {
      const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameVal.trim() }),
      })
      if (!res.ok) throw new Error("保存失败")
      const updated = await res.json()
      setUser(prev => prev ? { ...prev, name: updated.name } : prev)
      await updateSession({ name: updated.name })
      toast.success("昵称已更新")
    } catch {
      toast.error("保存失败，请重试")
    } finally {
      setSavingName(false)
    }
  }

  const savePassword = async () => {
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      toast.error("请填写全部密码字段"); return
    }
    if (pwForm.next !== pwForm.confirm) {
      toast.error("两次输入的新密码不一致"); return
    }
    if (pwForm.next.length < 6) {
      toast.error("新密码至少 6 位"); return
    }
    setSavingPw(true)
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "修改失败")
      toast.success("密码已修改，下次登录请使用新密码")
      setPwForm({ current: "", next: "", confirm: "" })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "修改失败")
    } finally {
      setSavingPw(false)
    }
  }

  // 头像：显示名字首字或邮箱首字
  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "??"

  const planLabel = user?.plan === "pro" ? "Pro 计划" : "免费计划"
  const planColor = user?.plan === "pro" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" : "text-slate-400 bg-slate-700/50 border-slate-600"
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })
    : "–"

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#137FEC] border-t-transparent" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-2xl space-y-8"
    >
      {/* 页头 */}
      <div>
        <h1 className="text-3xl font-bold text-white">个人中心</h1>
        <p className="mt-1 text-slate-400">管理你的账号信息与安全设置</p>
      </div>

      {/* 个人资料卡 */}
      <Card className="p-6">
        <div className="flex items-center gap-5">
          {/* 默认头像 */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#137FEC] to-blue-700 text-2xl font-black text-white shadow-lg shadow-blue-500/20">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xl font-bold text-white">{user?.name ?? "未设置昵称"}</p>
            <p className="mt-0.5 truncate text-sm text-slate-400">{user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", planColor)}>
                {planLabel}
              </span>
              <span className="rounded-full border border-[#137FEC]/30 bg-[#137FEC]/10 px-2.5 py-0.5 text-xs font-medium text-[#137FEC]">
                连续创业 {user?.dayStreak ?? 0} 天
              </span>
            </div>
          </div>
        </div>

        {/* 统计数据 */}
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-800 pt-6">
          {[
            { icon: Lightbulb, label: "创意验证", value: stats.ideas, color: "text-yellow-400" },
            { icon: ListTodo, label: "进行项目", value: stats.projects, color: "text-[#137FEC]" },
            { icon: BookOpen, label: "复盘记录", value: stats.dailyLogs, color: "text-green-400" },
          ].map(item => (
            <div key={item.label} className="flex flex-col items-center gap-1 rounded-xl bg-slate-800/50 py-4">
              <item.icon className={cn("h-5 w-5", item.color)} />
              <span className="text-2xl font-black text-white">{item.value}</span>
              <span className="text-xs text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>

        {/* 加入时间 */}
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-800/30 px-4 py-2.5 text-sm text-slate-500">
          <Calendar className="h-4 w-4" />
          加入时间：{joinDate}
        </div>
      </Card>

      {/* 修改昵称 */}
      <Card className="p-6">
        <div className="mb-5 flex items-center gap-2">
          <User className="h-5 w-5 text-[#137FEC]" />
          <h2 className="text-base font-bold text-white">基本信息</h2>
        </div>
        <div className="space-y-4">
          {/* 邮箱（只读） */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Mail className="h-3.5 w-3.5" /> 邮箱地址
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/30 px-4 py-2.5">
              <span className="flex-1 text-sm text-slate-400">{user?.email}</span>
              <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] text-slate-500">不可修改</span>
            </div>
          </div>
          {/* 昵称 */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <User className="h-3.5 w-3.5" /> 昵称
            </label>
            <div className="flex gap-2">
              <input
                value={nameVal}
                onChange={e => setNameVal(e.target.value)}
                onKeyDown={e => e.key === "Enter" && saveName()}
                placeholder="输入你的昵称"
                maxLength={20}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#137FEC]/50 focus:outline-none transition-colors"
              />
              <button
                onClick={saveName}
                disabled={savingName || nameVal.trim() === (user?.name ?? "")}
                className="flex items-center gap-2 rounded-lg bg-[#137FEC] px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-40 transition-colors"
              >
                <Save className="h-4 w-4" />
                {savingName ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* 修改密码 */}
      <Card className="p-6">
        <div className="mb-5 flex items-center gap-2">
          <Lock className="h-5 w-5 text-[#137FEC]" />
          <h2 className="text-base font-bold text-white">修改密码</h2>
        </div>
        <div className="space-y-4">
          {(["current", "next", "confirm"] as const).map((field) => {
            const labels = { current: "当前密码", next: "新密码", confirm: "确认新密码" }
            const placeholders = { current: "输入当前密码", next: "至少 6 位", confirm: "再次输入新密码" }
            return (
              <div key={field} className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">{labels[field]}</label>
                <div className="relative">
                  <input
                    type={showPw[field] ? "text" : "password"}
                    value={pwForm[field]}
                    onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                    placeholder={placeholders[field]}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2.5 pl-4 pr-10 text-sm text-white placeholder-slate-500 focus:border-[#137FEC]/50 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => ({ ...p, [field]: !p[field] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPw[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )
          })}

          {/* 强度提示 */}
          {pwForm.next && pwForm.confirm && pwForm.next !== pwForm.confirm && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              两次输入的新密码不一致
            </div>
          )}
          {pwForm.next && pwForm.confirm && pwForm.next === pwForm.confirm && pwForm.next.length >= 6 && (
            <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2 text-xs text-green-400">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              密码一致，可以保存
            </div>
          )}

          <button
            onClick={savePassword}
            disabled={savingPw || !pwForm.current || !pwForm.next || !pwForm.confirm}
            className="w-full rounded-lg bg-[#137FEC] py-2.5 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-40 transition-colors"
          >
            {savingPw ? "修改中..." : "确认修改密码"}
          </button>
        </div>
      </Card>

      {/* 账号与计划 */}
      <Card className="p-6">
        <div className="mb-5 flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#137FEC]" />
          <h2 className="text-base font-bold text-white">账号与计划</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/30 px-5 py-4">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-[#137FEC]" />
              <div>
                <p className="text-sm font-bold text-white">{planLabel}</p>
                <p className="text-xs text-slate-500">
                  {user?.plan === "pro" ? "已解锁全部 AI 功能" : "每日 AI 验证次数有限"}
                </p>
              </div>
            </div>
            {user?.plan !== "pro" && (
              <button
                onClick={() => toast.info("Pro 计划即将开放，敬请期待")}
                className="rounded-lg bg-gradient-to-r from-[#137FEC] to-blue-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:opacity-90 transition-opacity"
              >
                升级 Pro
              </button>
            )}
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 divide-y divide-slate-800">
            {[
              { label: "账号 ID", value: user?.id?.slice(0, 16) + "..." ?? "–" },
              { label: "注册邮箱", value: user?.email ?? "–" },
              { label: "加入时间", value: joinDate },
              { label: "连续复盘", value: `${user?.dayStreak ?? 0} 天` },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between px-4 py-3">
                <span className="text-xs text-slate-500">{row.label}</span>
                <span className="text-xs font-medium text-slate-300">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
