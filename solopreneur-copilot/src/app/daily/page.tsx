'use client'

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Send,
  RefreshCw,
  History,
  Share2,
  Copy,
  Bot,
  User,
  Rocket,
  CheckCircle2,
  FileText,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface UIMessage {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: string;
}

interface ApiMessage {
  role: "user" | "assistant";
  content: string;
}

interface HistoryLog {
  id: string;
  createdAt: string;
  aiReportMd: string | null;
  q1: string | null;
}

const now = () =>
  new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });

const TOTAL_QUESTIONS = 8;

// 简单 Markdown 渲染（粗体/标题/列表）
function SimpleMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("# ")) {
          return <h1 key={i} className="text-lg font-bold text-white mt-4 mb-2">{line.slice(2)}</h1>;
        }
        if (line.startsWith("## ")) {
          return <h2 key={i} className="text-base font-bold text-[#137FEC] mt-3 mb-1">{line.slice(3)}</h2>;
        }
        if (line.startsWith("### ")) {
          return <h3 key={i} className="text-sm font-bold text-slate-200 mt-2">{line.slice(4)}</h3>;
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return <p key={i} className="pl-3 before:content-['•'] before:mr-2 before:text-[#137FEC]">{line.slice(2)}</p>;
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
        // 处理行内粗体 **text**
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i}>
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function DailyReview() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [apiHistory, setApiHistory] = useState<ApiMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [logId, setLogId] = useState<string | undefined>();
  const [questionCount, setQuestionCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [reportMd, setReportMd] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const startSession = useCallback(async () => {
    if (hasStarted) return;
    setHasStarted(true);
    setIsTyping(true);
    setMessages([]);
    setApiHistory([]);
    setQuestionCount(0);
    setIsComplete(false);
    setReportMd(null);
    setLogId(undefined);

    try {
      const triggerMsg: ApiMessage = { role: "user", content: "开始今日复盘" };
      const res = await fetch("/api/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [triggerMsg] }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "启动失败");
      }

      const data = await res.json();
      const aiMsg: UIMessage = { id: "init", role: "ai", content: data.reply, timestamp: now() };
      setMessages([aiMsg]);
      setApiHistory([triggerMsg, { role: "assistant", content: data.reply }]);
      if (data.logId) setLogId(data.logId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "启动失败";
      toast.error(msg);
      setHasStarted(false);
    } finally {
      setIsTyping(false);
    }
  }, [hasStarted]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping || isComplete) return;

    const userContent = inputValue.trim();
    setInputValue("");

    const userMsg: UIMessage = { id: Date.now().toString(), role: "user", content: userContent, timestamp: now() };
    setMessages((prev) => [...prev, userMsg]);

    const newHistory: ApiMessage[] = [...apiHistory, { role: "user", content: userContent }];
    const newCount = questionCount + 1;
    const complete = newCount >= TOTAL_QUESTIONS;

    setIsTyping(true);
    try {
      const res = await fetch("/api/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory, logId, isComplete: complete }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "发送失败");
      }

      const data = await res.json();
      const aiMsg: UIMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.reply,
        timestamp: now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setApiHistory([...newHistory, { role: "assistant", content: data.reply }]);
      setQuestionCount(newCount);
      if (data.logId) setLogId(data.logId);

      if (complete) {
        setIsComplete(true);
        setReportMd(data.reply);
        toast.success("复盘完成！AI 日报已生成 🎉");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "发送失败";
      toast.error(msg);
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      setInputValue(userContent);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRestart = () => {
    setHasStarted(false);
    startSession();
  };

  const handleShowHistory = async () => {
    setShowHistory(true);
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/daily");
      const data = await res.json();
      setHistoryLogs(data);
    } catch {
      toast.error("获取历史失败");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!reportMd) return;
    navigator.clipboard.writeText(reportMd);
    toast.success("日报已复制到剪贴板");
  };

  const today = new Date().toLocaleDateString("zh-CN", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="grid h-[calc(100vh-8rem)] gap-6 lg:grid-cols-[2fr_1fr]">
      {/* ── 聊天区 ─────────────────────────────────────── */}
      <div className="flex flex-col rounded-xl border border-slate-800 bg-[#101922] overflow-hidden">
        {/* 顶部栏 */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#137FEC]">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">灵魂六问</h2>
              <p className="text-xs text-slate-500">{today}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* 进度指示器 */}
            <div className="flex items-center gap-1">
              {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 w-5 rounded-full transition-all duration-500",
                    i < questionCount ? "bg-[#137FEC]" : "bg-slate-700"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500">{questionCount}/{TOTAL_QUESTIONS}</span>
            <button
              onClick={handleShowHistory}
              className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 transition-colors"
            >
              <History className="h-3 w-3" /> 历史
            </button>
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="h-3 w-3" /> 重新开始
            </button>
          </div>
        </div>

        {/* 消息区 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 未开始时的欢迎屏 */}
          {!hasStarted && messages.length === 0 && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full gap-6"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-purple-500/20">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">每日灵魂拷问</h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  AI 教练将通过 6 个问题帮你复盘今天的创业进展，最终生成专属日报。
                </p>
              </div>
              <button
                onClick={startSession}
                className="flex items-center gap-2 rounded-xl bg-[#137FEC] px-6 py-3 text-sm font-bold text-white hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <Rocket className="h-4 w-4" /> 开始今日复盘
              </button>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-4", msg.role === "user" && "flex-row-reverse")}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-lg",
                    msg.role === "ai"
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                      : "bg-slate-700"
                  )}
                >
                  {msg.role === "ai" ? (
                    <Bot className="h-5 w-5 text-white" />
                  ) : (
                    <User className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className={cn("flex max-w-[80%] flex-col gap-1", msg.role === "user" && "items-end")}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {msg.role === "ai" ? "AI 教练" : "我"}
                    </span>
                    <span className="text-xs text-slate-500">{msg.timestamp}</span>
                  </div>
                  <div
                    className={cn(
                      "rounded-xl border p-4 text-sm shadow-sm",
                      msg.role === "ai"
                        ? "rounded-tl-none border-slate-700 bg-[#1A232E] text-slate-300"
                        : "rounded-tr-none border-[#137FEC]/20 bg-[#137FEC]/10 text-slate-200"
                    )}
                  >
                    {msg.role === "ai" ? (
                      <SimpleMarkdown content={msg.content} />
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="flex max-w-[80%] flex-col gap-1">
                  <span className="text-xs text-slate-500">AI 教练正在思考...</span>
                  <div className="rounded-r-xl rounded-bl-xl border border-slate-700 bg-[#1A232E] p-4 shadow-sm">
                    <div className="flex gap-1">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="h-2 w-2 animate-bounce rounded-full bg-slate-500"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区 */}
        <div className="border-t border-slate-800 p-4">
          {isComplete ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 py-4 text-sm text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              六问全部完成！查看右侧日报预览
            </div>
          ) : (
            <div className="relative rounded-xl border border-slate-700 bg-[#1A232E] focus-within:border-[#137FEC]/50 transition-colors">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={hasStarted ? "在这里输入你的回答... (Enter 发送，Shift+Enter 换行)" : "点击上方「开始今日复盘」按钮"}
                disabled={!hasStarted || isTyping}
                className="h-24 w-full resize-none bg-transparent p-4 text-sm text-white placeholder-slate-500 focus:outline-none disabled:opacity-50"
              />
              <div className="flex items-center justify-end border-t border-slate-700/50 px-4 py-2">
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping || !hasStarted}
                  className="flex items-center gap-2 rounded-lg bg-[#137FEC] px-4 py-1.5 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  发送 <Send className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 日报预览区 ──────────────────────────────────── */}
      <div className="flex flex-col rounded-xl border border-slate-800 bg-[#101922] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full", isComplete ? "bg-green-500" : "bg-[#137FEC] animate-pulse")} />
            <h3 className="font-bold text-white">智能日报预览</h3>
          </div>
          <span
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
              isComplete
                ? "bg-green-500/10 text-green-500 border-green-500/20"
                : "bg-slate-700/50 text-slate-500 border-slate-700"
            )}
          >
            {isComplete ? "已完成" : "等待中"}
          </span>
        </div>

        {isComplete && reportMd ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 pb-32">
              <SimpleMarkdown content={reportMd} />
            </div>
            {/* 操作按钮 */}
            <div className="absolute bottom-0 right-0 w-[calc(33.333%-1.5rem)] border-t border-slate-800 bg-[#101922] p-4 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={handleCopyReport}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-[#1A232E] py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  <Copy className="h-3 w-3" /> 复制 Markdown
                </button>
                <button
                  onClick={() => {
                    const text = encodeURIComponent(
                      `今日复盘完成！\n\n${reportMd?.slice(0, 200)}...\n\n#BuildInPublic #独立开发`
                    );
                    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#1DA1F2]/20 bg-[#1DA1F2]/10 py-2 text-xs font-medium text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors"
                >
                  <Share2 className="h-3 w-3" /> X / Twitter
                </button>
              </div>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#137FEC] py-2.5 text-sm font-medium text-white hover:bg-blue-600 transition-colors">
                <Rocket className="h-4 w-4" /> Build in Public 发布
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800">
              <FileText className="h-7 w-7 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">完成六问后自动生成</p>
              <p className="mt-1 text-xs text-slate-600">
                {questionCount === 0
                  ? "还没有开始复盘"
                  : `已完成 ${questionCount}/${TOTAL_QUESTIONS} 个问题`}
              </p>
            </div>
            {questionCount > 0 && (
              <div className="w-full space-y-1.5">
                {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div
                      className={cn(
                        "h-1.5 w-1.5 rounded-full shrink-0",
                        i < questionCount ? "bg-[#137FEC]" : "bg-slate-700"
                      )}
                    />
                    <span className={i < questionCount ? "text-slate-400" : "text-slate-600"}>
                      问题 {i + 1}
                    </span>
                    {i < questionCount && <CheckCircle2 className="h-3 w-3 text-[#137FEC] ml-auto" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 历史记录抽屉 ─────────────────────────────────── */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-end"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="h-full w-full max-w-md bg-[#101922] border-l border-slate-800 flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-[#137FEC]" />
                  <h3 className="font-bold text-white">复盘历史</h3>
                </div>
                <button onClick={() => setShowHistory(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-6 w-6 text-slate-500 animate-spin" />
                  </div>
                ) : historyLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <AlertCircle className="h-8 w-8 text-slate-600" />
                    <p className="text-sm text-slate-500">还没有复盘记录</p>
                  </div>
                ) : (
                  historyLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-xl border border-slate-800 bg-[#1A232E] p-4 hover:border-slate-700 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-400">
                          {new Date(log.createdAt).toLocaleDateString("zh-CN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        {log.aiReportMd ? (
                          <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] text-green-500">已完成</span>
                        ) : (
                          <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-400">草稿</span>
                        )}
                      </div>
                      {log.q1 && (
                        <p className="text-xs text-slate-500 truncate">今日收入：{log.q1}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
