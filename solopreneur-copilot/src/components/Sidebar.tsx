'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Lightbulb,
  History,
  ListTodo,
  BarChart2,
  Settings,
  User,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    name: "仪表盘",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "创意验证器",
    path: "/idea-validator",
    icon: Lightbulb,
  },
  {
    name: "每日复盘",
    path: "/daily",
    icon: History,
  },
  {
    name: "项目管理",
    path: "/project-management",
    icon: ListTodo,
  },
  {
    name: "营销看板",
    path: "/marketing",
    icon: BarChart2,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-[#101922] border-r border-slate-800 text-slate-300">
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg">
          <User className="h-6 w-6 text-slate-200" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-white">超级个体</span>
          <span className="text-xs text-slate-500">专注变现 · 极速构建</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
              pathname === item.path
                ? "bg-[#137FEC] text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto space-y-4 px-4 pb-6">
        {/* Pro Plan Card */}
        <div className="relative overflow-hidden rounded-xl border border-slate-700 bg-gradient-to-b from-[#25303B] to-[#1C2630] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#137FEC]" />
            <span className="text-xs font-bold text-[#137FEC]">Pro 计划</span>
          </div>
          <p className="mb-3 text-xs text-slate-400">
            解锁更多 AI 验证次数与高级分析报表。
          </p>
          <button className="w-full rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-bold text-white hover:bg-white/10 transition-colors">
            升级账号
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-800 transition-colors cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
            USER
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-white">IndieHacker_01</span>
            <span className="text-xs text-slate-500">Free Plan</span>
          </div>
          <Settings className="ml-auto h-4 w-4 text-slate-500 hover:text-white" />
        </div>
      </div>
    </div>
  );
}
