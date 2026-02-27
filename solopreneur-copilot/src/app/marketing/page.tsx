'use client'

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Package,
  Users,
  DollarSign,
  TrendingUp,
  MoreVertical,
  Activity,
  Database,
  GitCommit,
  Shield,
  CreditCard,
  RefreshCw,
  Plus,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

const products = [
  {
    name: "AI 写作助手",
    version: "v3.1.2 • 稳定版",
    status: "上线",
    users: "12,400",
    mrr: "¥4,200",
    ltv: "¥120",
    icon: "bg-gradient-to-br from-purple-500 to-indigo-500",
    initial: "AI",
  },
  {
    name: "代码片段 X",
    version: "v1.0.4 • 测试版",
    status: "测试",
    users: "3,100",
    mrr: "¥800",
    ltv: "¥45",
    icon: "bg-gradient-to-br from-blue-500 to-cyan-500",
    initial: "CS",
  },
  {
    name: "设计资产中心",
    version: "v2.2.0 • 旧版",
    status: "上线",
    users: "8,200",
    mrr: "¥3,100",
    ltv: "¥95",
    icon: "bg-gradient-to-br from-pink-500 to-rose-500",
    initial: "DA",
  },
  {
    name: "个人 CRM",
    version: "v0.9.1 • 补丁版",
    status: "维护",
    users: "1,500",
    mrr: "¥450",
    ltv: "¥30",
    icon: "bg-gradient-to-br from-orange-500 to-amber-500",
    initial: "SC",
  },
];

const chartData12M = [
  { name: "1月", revenue: 4000, cost: 2400 },
  { name: "2月", revenue: 3000, cost: 1398 },
  { name: "3月", revenue: 2000, cost: 9800 },
  { name: "4月", revenue: 2780, cost: 3908 },
  { name: "5月", revenue: 1890, cost: 4800 },
  { name: "6月", revenue: 2390, cost: 3800 },
  { name: "7月", revenue: 3490, cost: 4300 },
  { name: "8月", revenue: 4000, cost: 2400 },
  { name: "9月", revenue: 3000, cost: 1398 },
  { name: "10月", revenue: 2000, cost: 9800 },
  { name: "11月", revenue: 2780, cost: 3908 },
  { name: "12月", revenue: 1890, cost: 4800 },
];

const chartData30D = Array.from({ length: 30 }, (_, i) => ({
  name: `${i + 1}`,
  revenue: Math.floor(Math.random() * 5000) + 1000,
  cost: Math.floor(Math.random() * 3000) + 500,
}));

const chartData7D = Array.from({ length: 7 }, (_, i) => ({
  name: `第${i + 1}天`,
  revenue: Math.floor(Math.random() * 5000) + 1000,
  cost: Math.floor(Math.random() * 3000) + 500,
}));

export default function Marketing() {
  const [period, setPeriod] = useState<"12M" | "30D" | "7D">("12M");
  const [isSyncing, setIsSyncing] = useState(false);

  const getChartData = () => {
    switch (period) {
      case "30D":
        return chartData30D;
      case "7D":
        return chartData7D;
      default:
        return chartData12M;
    }
  };

  const handleSync = () => {
    setIsSyncing(true);
    toast.info("正在同步数据...", {
      description: "从 Stripe, Google Analytics 和 GitHub 拉取最新数据",
    });
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("数据同步完成", {
        description: "所有指标已更新至最新状态",
      });
    }, 2000);
  };

  const handleAddProduct = () => {
    toast("添加新产品", {
      description: "请前往 Stripe Dashboard 创建新产品，系统会自动同步。",
      action: {
        label: "去 Stripe",
        onClick: () => window.open("https://dashboard.stripe.com", "_blank"),
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">矩阵基础设施</h1>
          <div className="mt-2 flex items-center gap-2 text-slate-400">
            <Activity className="h-4 w-4 text-[#137FEC]" />
            <span>Matrix Core - 集中式指挥中心</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-[#1C2127] px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isSyncing ? "同步中..." : "同步"}
          </button>
          <button 
            onClick={handleAddProduct}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-[#1C2127] px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" /> 添加产品
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          {
            name: "产品总数",
            value: "12",
            change: "+2",
            icon: Package,
            color: "text-green-500",
          },
          {
            name: "活跃用户",
            value: "45.2K",
            change: "+12%",
            icon: Users,
            color: "text-green-500",
          },
          {
            name: "总月收入 MRR",
            value: "¥12,450",
            change: "+8.5%",
            icon: DollarSign,
            color: "text-green-500",
          },
          {
            name: "净生命价值 LTV",
            value: "¥450",
            change: "+2.1%",
            icon: TrendingUp,
            color: "text-green-500",
          },
        ].map((stat) => (
          <Card key={stat.name} className="relative overflow-hidden bg-[#1C2127] hover:border-slate-600 transition-colors group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-400 transition-colors">
                  {stat.name}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">
                    {stat.value}
                  </span>
                  <span
                    className={cn(
                      "rounded bg-green-500/10 px-1.5 py-0.5 text-xs font-medium",
                      stat.color
                    )}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <stat.icon className="h-8 w-8 text-slate-700 opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all" />
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button className="flex items-center gap-2 border-b-2 border-[#137FEC] px-6 py-3 text-sm font-bold text-white">
          <Shield className="h-4 w-4" /> 身份验证
        </button>
        <button className="flex items-center gap-2 border-b-2 border-transparent px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors">
          <CreditCard className="h-4 w-4" /> 支付中心
        </button>
      </div>

      {/* Product Table */}
      <Card className="overflow-hidden bg-[#1C2127] p-0">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b border-slate-800 bg-[#181C22] px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          <div>产品名称</div>
          <div>状态</div>
          <div>用户数</div>
          <div>月收入</div>
          <div>生命价值</div>
          <div className="text-right">操作</div>
        </div>
        <div className="divide-y divide-slate-800">
          {products.map((product) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 px-6 py-4 hover:bg-slate-800/50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded font-bold text-white text-xs shadow-lg",
                    product.icon
                  )}
                >
                  {product.initial}
                </div>
                <div>
                  <p className="font-medium text-white group-hover:text-[#137FEC] transition-colors">{product.name}</p>
                  <p className="text-xs text-slate-500">{product.version}</p>
                </div>
              </div>
              <div>
                <span
                  className={cn(
                    "flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    product.status === "上线"
                      ? "bg-green-500/10 text-green-500"
                      : product.status === "测试"
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-orange-500/10 text-orange-500"
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full animate-pulse",
                      product.status === "上线"
                        ? "bg-green-500"
                        : product.status === "测试"
                        ? "bg-blue-500"
                        : "bg-orange-500"
                    )}
                  />
                  {product.status}
                </span>
              </div>
              <div className="text-sm text-slate-400">{product.users}</div>
              <div className="text-sm font-medium text-white">{product.mrr}</div>
              <div className="text-sm text-slate-400">{product.ltv}</div>
              <div className="text-right">
                <button className="rounded p-1 text-slate-500 hover:bg-slate-700 hover:text-white transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Chart */}
        <Card className="bg-[#1C2127] p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">
                综合收入与成本
              </h3>
              <p className="text-sm text-slate-400">
                全产品矩阵净利润走势
              </p>
            </div>
            <div className="flex gap-2 rounded-lg bg-slate-800/50 p-1">
              {(["12M", "30D", "7D"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "rounded px-3 py-1 text-xs font-medium transition-all",
                    period === p
                      ? "bg-[#1C2127] text-white shadow-sm"
                      : "text-slate-500 hover:text-white hover:bg-slate-700/50"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getChartData()}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#137FEC" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#137FEC" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#283039" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1C2127",
                    border: "1px solid #283039",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#137FEC"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  animationDuration={1000}
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorCost)"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#137FEC]" />
              <span className="text-sm text-slate-400">收入</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#10b981]" />
              <span className="text-sm text-slate-400">运营成本</span>
            </div>
          </div>
        </Card>

        {/* Infrastructure Health & Deployments */}
        <div className="space-y-6">
          <Card className="bg-[#1C2127] p-6">
            <h3 className="mb-6 text-lg font-bold text-white">
              基础设施状态
            </h3>
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-slate-400">CPU 使用率（矩阵核心）</span>
                  <span className="text-white">42%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "42%" }}
                    transition={{ duration: 1 }}
                    className="h-full bg-[#137FEC]" 
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-slate-400">数据库内存</span>
                  <span className="text-white">68%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "68%" }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-yellow-500" 
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-slate-400">API 延迟</span>
                  <span className="text-green-500">24ms</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "15%" }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="h-full bg-green-500" 
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-[#1C2127] to-[#181C22] p-6">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-500">
              自动化部署
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border border-slate-700 bg-slate-800/50 p-3 hover:bg-slate-800 transition-colors cursor-pointer">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-purple-500/10 text-purple-500">
                  <GitCommit className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">部署 Webhook</p>
                  <p className="text-xs text-slate-500">2小时前已更新</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border border-slate-700 bg-slate-800/50 p-3 hover:bg-slate-800 transition-colors cursor-pointer">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-500/10 text-blue-500">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">数据库备份</p>
                  <p className="text-xs text-slate-500">每日 00:00 自动执行</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
