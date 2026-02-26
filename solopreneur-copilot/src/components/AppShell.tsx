'use client'

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/Sidebar"

const NO_SIDEBAR_PATHS = ["/login", "/register"]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showSidebar = !NO_SIDEBAR_PATHS.includes(pathname)

  if (!showSidebar) {
    return <div className="min-h-screen bg-[#0D1520]">{children}</div>
  }

  return (
    <div className="flex h-screen w-full bg-[#101922] text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}
