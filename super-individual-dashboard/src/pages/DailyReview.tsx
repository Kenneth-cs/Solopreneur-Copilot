import React from "react";
import { Card } from "@/components/ui/Card";
import {
  MessageSquare,
  Send,
  RefreshCw,
  History,
  Share2,
  Copy,
  Code,
  GitCommit,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function DailyReview() {
  return (
    <div className="grid h-[calc(100vh-8rem)] gap-6 lg:grid-cols-[2fr_1fr]">
      {/* Chat Section */}
      <div className="flex flex-col rounded-xl border border-slate-800 bg-[#101922]">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#137FEC]">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">灵魂六问</h2>
              <p className="text-xs text-slate-500">2023年10月24日 • 星期二</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800">
              <History className="h-3 w-3" />
              查看历史
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800">
              <RefreshCw className="h-3 w-3" />
              重新开始
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* Supervisor Message */}
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <span className="text-xs font-bold text-white">AI</span>
            </div>
            <div className="flex max-w-[80%] flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">虚拟主管</span>
                <span className="text-xs text-slate-500">09:30 AM</span>
              </div>
              <div className="rounded-r-xl rounded-bl-xl border border-slate-700 bg-[#1A232E] p-4 text-sm text-slate-300 shadow-sm">
                <p className="mb-2">
                  早上好！让我们开始今天的灵魂拷问。这是一个关于商业本质的检查。
                </p>
                <p className="font-bold text-white">
                  问题 1/6：你今天赚钱了吗？
                </p>
                <p>
                  如果没有直接收入，你在为了赚钱做什么具体的准备？请量化你的进度。
                </p>
              </div>
            </div>
          </div>

          {/* User Message */}
          <div className="flex flex-row-reverse gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700">
              <span className="text-xs font-bold text-white">ME</span>
            </div>
            <div className="flex max-w-[80%] flex-col gap-1 items-end">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">09:35 AM</span>
                <span className="text-sm font-bold text-white">我</span>
              </div>
              <div className="rounded-l-xl rounded-br-xl border border-[#137FEC]/20 bg-[#137FEC]/10 p-4 text-sm text-slate-300 shadow-sm">
                <p>
                  今天还没有直接收入。但是优化了支付流程的 UX，根据 A/B 测试数据，这预计能提高 5% 的转化率。我还联系了 3 个潜在的高意向客户，并发送了产品 Demo。
                </p>
              </div>
            </div>
          </div>

          {/* Supervisor Message 2 */}
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <span className="text-xs font-bold text-white">AI</span>
            </div>
            <div className="flex max-w-[80%] flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">虚拟主管</span>
                <span className="text-xs text-slate-500">09:36 AM</span>
              </div>
              <div className="rounded-r-xl rounded-bl-xl border border-slate-700 bg-[#1A232E] p-4 text-sm text-slate-300 shadow-sm">
                <p className="mb-2">
                  很好的切入点，关注转化率是正确的方向。但要注意不要陷入“假装工作”的陷阱。
                </p>
                <p className="font-bold text-white">
                  问题 2/6：你今天写的代码，具象化的商业价值是什么？
                </p>
                <p>
                  请避免使用“重构”、“优化”等模糊词汇，尝试用“减少了用户等待时间 X 秒”、“支持了 X 场景的付费功能”来描述。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-800 p-4">
          <div className="relative rounded-xl border border-slate-700 bg-[#1A232E]">
            <textarea
              placeholder="在这里输入你的回答... (支持 Markdown)"
              className="h-24 w-full resize-none bg-transparent p-4 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            <div className="flex items-center justify-between border-t border-slate-700/50 px-4 py-2">
              <div className="flex gap-2 text-slate-500">
                <button className="hover:text-white">
                  <span className="font-bold">B</span>
                </button>
                <button className="hover:text-white">
                  <span className="italic">I</span>
                </button>
                <button className="hover:text-white">
                  <Code className="h-4 w-4" />
                </button>
              </div>
              <button className="flex items-center gap-2 rounded-lg bg-[#137FEC] px-4 py-1.5 text-sm font-bold text-white hover:bg-blue-600">
                发送 <Send className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Preview Section */}
      <div className="flex flex-col border-l border-slate-800 bg-[#101922] pl-6">
        <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#137FEC]" />
            <h3 className="font-bold text-white">智能日报预览</h3>
          </div>
          <span className="rounded bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-500 uppercase tracking-wider border border-green-500/20">
            Generating
          </span>
        </div>

        <Card className="relative flex-1 overflow-hidden border-slate-800 bg-[#1A232E] p-0">
          <div className="bg-gradient-to-r from-[#1A232E] to-[#252E39] p-6 border-b border-slate-800">
            <div className="flex justify-between text-xs text-[#137FEC]">
              <span>#BUILDINPUBLIC</span>
              <span className="text-slate-500">Oct 24, 2023</span>
            </div>
            <h2 className="mt-2 text-lg font-bold text-white">
              独立开发第 128 天：专注转化率优化
            </h2>
            <div className="mt-4 flex gap-2">
              <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-400 border border-blue-500/20">
                #SaaS
              </span>
              <span className="rounded bg-purple-500/10 px-2 py-0.5 text-[10px] text-purple-400 border border-purple-500/20">
                #UX
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <CheckCircle2 className="h-3 w-3" /> 核心进展
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                今天虽然没有直接入账，但在转化漏斗的关键环节做出了改进。重点在于支付流程的 UX 优化（预期提升 5% 转化）以及高意向客户的触达。
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-[#101922] p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-3">
                <GitCommit className="h-3 w-3" /> 相关提交 (Linked via GitHub)
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-xs">
                  <span className="font-mono text-[#137FEC]">a1b2c3d</span>
                  <span className="text-slate-400">feat(checkout): simplify stripe payment element style</span>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <span className="font-mono text-[#137FEC]">e5f6g7h</span>
                  <span className="text-slate-400">fix(ui): mobile responsive issue on pricing page</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-slate-500 uppercase mb-1">代码时长</div>
                <div className="text-lg font-mono font-medium text-white">6h 24m</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase mb-1">主要产出</div>
                <div className="text-lg font-mono font-medium text-white">UX 优化</div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 w-full border-t border-slate-800 bg-[#101922] p-4">
            <div className="mb-2 text-xs font-bold text-slate-500 uppercase">分享至</div>
            <div className="flex gap-2 mb-4">
              <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#1DA1F2]/20 bg-[#1DA1F2]/10 py-2 text-sm font-medium text-[#1DA1F2] hover:bg-[#1DA1F2]/20">
                <Share2 className="h-4 w-4" /> X / Twitter
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-[#252E39] py-2 text-sm font-medium text-white hover:bg-slate-700">
                <Copy className="h-4 w-4" /> 复制图片
              </button>
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#137FEC] py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600">
              <Rocket className="h-4 w-4" /> Build in Public 发布
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Rocket(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}
