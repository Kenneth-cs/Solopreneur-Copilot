/**
 * 火山引擎 ARK API 客户端
 * 文档：https://www.volcengine.com/docs/82379/1302008
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface VolcanoResponse {
  id: string
  choices: Array<{
    message: { role: string; content: string }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

const BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"

function getClient() {
  const apiKey = process.env.VOLCANO_API_KEY
  const modelId = process.env.VOLCANO_MODEL_ID

  if (!apiKey || !modelId) {
    throw new Error("VOLCANO_API_KEY 或 VOLCANO_MODEL_ID 未配置，请在 .env 中填入")
  }

  return { apiKey, modelId }
}

export async function chat(messages: ChatMessage[]): Promise<string> {
  const { apiKey, modelId } = getClient()

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      temperature: 0.8,
      max_tokens: 1000,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`火山引擎 API 错误 ${res.status}: ${err}`)
  }

  const data: VolcanoResponse = await res.json()
  return data.choices[0]?.message?.content ?? ""
}

// ────────────────────────────────────────────────────────────
// 每日复盘灵魂六问 Prompts
// ────────────────────────────────────────────────────────────

export const DAILY_SYSTEM_PROMPT = `你是一个严格但有智慧的创业教练，专门帮助独立开发者（Solopreneur）进行每日复盘。

你的任务是依次追问以下"灵魂八问"，每次只问一个问题，等待用户回答后再问下一个。
对用户的回答给予简短、犀利的点评（1-2句），然后追问下一个问题。

八个问题：
1. 哪件事离赚钱最近？今天做了吗？
2. 你今天赚钱了吗？（如果没有直接收入，就说清楚距离第一笔收入还差什么，并量化你为赚钱所做的具体行动）
3. 你今天的核心输出是什么？商业价值是什么？请用"支持了 XX 付费功能"或"减少了 XX 流失"来量化，不接受"重构"、"优化"等模糊说法。
4. 你今天遇到了什么卡点？是什么原因，是技术、认知还是执行问题？你是怎么解决的？
5. 你今天的精力状态如何？（1-10分），有什么影响因素？
6. 你明天最重要的一件事是什么？（只能说一件）
7. 如果今天重来一次，你会改变什么？
8. 明天如何带来收入？哪怕是1元，给出一个具体可执行的计划，不要说"继续开发"。

所有八个问题都回答完毕后，生成一份结构化的日报摘要（Markdown格式）。

语气：直接、不废话、偶尔带点辛辣幽默感。不要过度鼓励，要实事求是。`

export const DAILY_REPORT_PROMPT = `根据以上对话记录，生成一份结构化的每日复盘报告（Markdown格式）：

# 📊 今日复盘报告 - {date}

## 💰 收入情况
（总结问题1的答案）

## 🎯 核心产出
（总结问题2的答案）

## 🧱 卡点与突破
（总结问题3的答案）

## 🚀 明日重点
（总结问题4的答案）

## 🔋 精力状态
（总结问题5的答案）

## 🔄 复盘反思
（总结问题6的答案）

## 💡 AI 教练点评
（根据整体对话，给出2-3句整体评价和1条可执行建议）

请严格按照以上格式输出，不要添加额外内容。`

/**
 * 生成每日复盘对话的下一条 AI 回复
 */
export async function getDailyReviewReply(
  conversationHistory: ChatMessage[]
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: DAILY_SYSTEM_PROMPT },
    ...conversationHistory,
  ]
  return chat(messages)
}

// ────────────────────────────────────────────────────────────
// 毒舌 VC 评分
// ────────────────────────────────────────────────────────────

const VC_SCORE_PROMPT = `你是一个经历过无数失败项目的毒舌风险投资人，眼光毒辣，从不废话。
你的任务是根据创业者提供的商业画布，给出0-100的评分，并给出犀利的评语。

评分标准：
- 0-30：伪需求，浪费生命，建议直接粉碎
- 31-50：有点意思，但问题很多，需要大幅修改
- 51-70：基本可行，有一定市场潜力，但差异化不足
- 71-90：有潜力，值得做 MVP，注意执行风险
- 91-100：少见的好想法，抓紧做

输出格式（严格按照 JSON 输出，不要添加其他内容）：
{
  "score": <0-100的整数>,
  "comment": "<2-4句话的犀利评语，要直接点名最大问题，语气辛辣，不要废话>",
  "strengths": ["优势1", "优势2"],
  "weaknesses": ["最大问题1", "最大问题2"],
  "verdict": "approved" | "needs_work" | "rejected"
}`

export interface VCScoreResult {
  score: number
  comment: string
  strengths: string[]
  weaknesses: string[]
  verdict: "approved" | "needs_work" | "rejected"
}

export async function getVCScore(idea: {
  title: string
  description?: string | null
  canvasTarget?: string | null
  canvasPain?: string | null
  canvasMvp?: string | null
  canvasRevenue?: string | null
}): Promise<VCScoreResult> {
  const userContent = `
创意标题：${idea.title}
${idea.description ? `描述：${idea.description}` : ""}

商业画布：
- 目标用户：${idea.canvasTarget ?? "未填写"}
- 用户痛点：${idea.canvasPain ?? "未填写"}
- MVP核心功能：${idea.canvasMvp ?? "未填写"}
- 变现模式：${idea.canvasRevenue ?? "未填写"}
`.trim()

  const messages: ChatMessage[] = [
    { role: "system", content: VC_SCORE_PROMPT },
    { role: "user", content: userContent },
  ]

  const raw = await chat(messages)

  // 提取 JSON（防止 AI 在 JSON 前后加多余文字）
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error("AI 返回格式异常，请重试")

  return JSON.parse(jsonMatch[0]) as VCScoreResult
}

/**
 * 根据完整对话生成 Markdown 日报
 */
export async function generateDailyReport(
  conversationHistory: ChatMessage[],
  date: string
): Promise<string> {
  const reportPrompt = DAILY_REPORT_PROMPT.replace("{date}", date)
  const messages: ChatMessage[] = [
    { role: "system", content: DAILY_SYSTEM_PROMPT },
    ...conversationHistory,
    { role: "user", content: reportPrompt },
  ]
  return chat(messages)
}
