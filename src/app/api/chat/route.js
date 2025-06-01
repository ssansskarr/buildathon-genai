import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export async function POST(req) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system:
      "You are an AI Cost Optimization Advisor for enterprises. You help companies optimize their AI costs, select the right LLMs, calculate ROI, and architect efficient AI agents. Provide practical, data-driven recommendations with specific cost-saving strategies.",
  })

  return result.toDataStreamResponse()
}