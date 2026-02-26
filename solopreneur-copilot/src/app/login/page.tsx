'use client'

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Zap, Mail, Lock, Github, Loader2, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setIsLoading(false)

    if (result?.error) {
      setError("邮箱或密码错误，请重试")
    } else {
      router.push("/")
      router.refresh()
    }
  }

  const handleGithubLogin = async () => {
    setIsGithubLoading(true)
    await signIn("github", { callbackUrl: "/" })
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
          <h1 className="text-2xl font-bold text-white">超级个体创业 OS</h1>
          <p className="mt-1 text-sm text-slate-400">专注变现 · 极速构建 · 以终为始</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-[#1C2630] p-8 shadow-2xl">
          <h2 className="mb-6 text-xl font-bold text-white">登录账户</h2>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="text-xs font-medium text-slate-400">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入密码"
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#137FEC] py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isLoading ? "登录中..." : "立即登录"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-700" />
            <span className="text-xs text-slate-500">或使用以下方式</span>
            <div className="h-px flex-1 bg-slate-700" />
          </div>

          {/* GitHub */}
          <button
            onClick={handleGithubLogin}
            disabled={isGithubLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGithubLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Github className="h-4 w-4" />
            )}
            使用 GitHub 登录
          </button>

          {/* Register link */}
          <p className="mt-6 text-center text-sm text-slate-500">
            还没有账户？{" "}
            <Link href="/register" className="font-medium text-[#137FEC] hover:text-blue-400 transition-colors">
              免费注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
