'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Zap, Mail, Lock, User, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const passwordStrength = () => {
    if (password.length === 0) return null
    if (password.length < 8) return { level: 1, text: "太短", color: "bg-red-500" }
    if (password.length < 12) return { level: 2, text: "一般", color: "bg-yellow-500" }
    return { level: 3, text: "强", color: "bg-green-500" }
  }
  const strength = passwordStrength()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "注册失败")
        setIsLoading(false)
        return
      }

      // 注册成功后自动登录
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        router.push("/login")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch {
      setError("网络错误，请重试")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0D1520] px-4">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#137FEC]/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#137FEC] to-blue-700 shadow-lg shadow-blue-500/30">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">开始你的创业之旅</h1>
          <p className="mt-1 text-sm text-slate-400">创建账户，开始验证你的第一个 Idea</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-[#1C2630] p-8 shadow-2xl">
          <h2 className="mb-6 text-xl font-bold text-white">创建账户</h2>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Benefits */}
          <div className="mb-6 space-y-2">
            {["免费使用核心功能", "AI 每日复盘助手", "创意验证与 VC 评分"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                {item}
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">昵称（可选）</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="你的创业代号"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-[#137FEC]/60 focus:ring-1 focus:ring-[#137FEC]/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">邮箱地址</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-[#137FEC]/60 focus:ring-1 focus:ring-[#137FEC]/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">密码（至少 8 位）</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="设置一个强密码"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 py-3 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition focus:border-[#137FEC]/60 focus:ring-1 focus:ring-[#137FEC]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Password strength */}
              {strength && (
                <div className="flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= strength.level ? strength.color : "bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">密码强度：{strength.text}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#137FEC] py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isLoading ? "创建中..." : "免费创建账户"}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-slate-500">
            已有账户？{" "}
            <Link href="/login" className="font-medium text-[#137FEC] hover:text-blue-400 transition-colors">
              直接登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
