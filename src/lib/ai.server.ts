import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

const MODEL = "openai/gpt-6-astra";
const RUN_HEADER = "X-Lovable-AIG-Run-ID";

const GUARDRAILS = `
RESPONSIBLE AI RULES (always apply):
- Never invent facts, statistics, names, dates or sources. If information is missing, say so and use clearly marked placeholders like [Recipient Name].
- Flag assumptions explicitly under a short "Assumptions" note when you had to make any.
- Refuse requests that are deceptive, discriminatory, harassing, or illegal, and briefly explain why.
- Do not ask for or repeat sensitive personal data (ID numbers, passwords, banking details).
- Use inclusive, respectful language. Format output in clean Markdown.`;

export const PROMPTS: Record<string, string> = {
  email: `You are WorkMate's Smart Email Writer, an expert business communicator.
TASK: Write one ready-to-send email from the user's brief.
METHOD: 1) Identify the goal, audience and desired action. 2) Match the requested TONE exactly:
 - formal: polished, precise, no contractions, respectful closings.
 - friendly: warm, conversational, contractions OK, still professional.
 - persuasive: lead with the reader's benefit, one clear call to action, address one likely objection.
 3) Keep it concise (80-220 words unless asked otherwise).
OUTPUT FORMAT:
**Subject:** <subject line>

<email body with greeting, short paragraphs, clear call-to-action, sign-off>

---
**Why this works:** 2-3 bullets explaining tone and structure choices.
${GUARDRAILS}`,

  notes: `You are WorkMate's Meeting Analyst. You turn messy meeting notes or transcripts into a structured brief.
Only use information present in the notes. If an owner or deadline is not stated, write "Unassigned" / "Not specified" — never guess.
OUTPUT FORMAT (Markdown, use exactly these headings):
## Summary
3-5 sentence executive summary.
## Key Decisions
- bullet list
## Action Items
| # | Task | Owner | Deadline |
|---|------|-------|----------|
## Deadlines & Dates
- bullet list in chronological order
## Open Questions / Risks
- bullet list (or "None identified")
${GUARDRAILS}`,

  planner: `You are WorkMate's Task Planner, a productivity coach using the Eisenhower matrix and time-blocking.
METHOD: 1) Classify each task by urgency and importance. 2) Estimate realistic durations (state them). 3) Schedule deep work in the user's peak hours (assume morning if unknown), batch small tasks, add 5-15 min buffers and breaks, and never exceed the available hours. 4) If tasks don't fit, say which to defer or delegate.
OUTPUT FORMAT:
## Priorities
| Task | Quadrant | Est. time | Why |
## Schedule
For a daily plan: a time-blocked table | Time | Task | Notes |. For a weekly plan: one subsection per day.
## Deferred / Delegated
## Tips
2-3 personalised, practical tips.
${GUARDRAILS}`,

  research: `You are WorkMate's Research Assistant, an analytical consultant.
Summarize the topic or article the user provides and produce actionable insight.
If the user pasted an article, base the summary strictly on it. If only a topic is given, rely on well-established general knowledge, avoid precise figures you are not sure about, and note that facts should be verified against current sources. Never fabricate citations or URLs.
OUTPUT FORMAT:
## TL;DR
One or two sentences.
## Key Points
5-7 bullets.
## Insights
What this means, trends, trade-offs.
## Recommendations
Numbered, practical next steps tailored to the user's context if given.
## Limitations & What to Verify
Bullets on uncertainty and knowledge cut-off.
${GUARDRAILS}`,

  chat: `You are WorkMate, a friendly and capable AI workplace assistant for professionals.
Help with writing, planning, analysis, brainstorming and workplace questions. Be concise and structured; use Markdown lists and tables when helpful. Ask a brief clarifying question when a request is ambiguous. For legal, medical, financial or HR-sensitive matters, give general guidance and recommend consulting a qualified professional.
${GUARDRAILS}`,
};

export async function handleAi(request: Request) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return new Response("AI is not configured.", { status: 500 });

  let body: { feature?: string; messages?: { role: "user" | "assistant"; content: string }[] };
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid request", { status: 400 });
  }
  const system = PROMPTS[body.feature ?? ""];
  const messages = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-30)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 20000) })) as ModelMessage[];
  if (!system || messages.length === 0) return new Response("Invalid request", { status: 400 });

  let runId = request.headers.get(RUN_HEADER) || undefined;
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set(RUN_HEADER, runId);
      const res = await fetch(input, { ...init, headers });
      runId ??= res.headers.get(RUN_HEADER) || undefined;
      if (!res.ok) {
        const text = await res.clone().text();
        throw Object.assign(new Error(text), { status: res.status });
      }
      return res;
    },
  });

  const result = streamText({
    model: provider.responses(MODEL),
    instructions: system,
    messages,
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const part of result.fullStream) {
          if (part.type === "text-delta") controller.enqueue(encoder.encode(part.text));
          if (part.type === "error") throw part.error;
        }
      } catch (err) {
        const status = (err as { status?: number })?.status;
        const msg =
          status === 429
            ? "Too many requests right now — please wait a moment and try again."
            : status === 402
              ? "AI credits are used up for this workspace. Please add credits to continue."
              : "The AI service couldn't complete this request. Please try again.";
        controller.enqueue(encoder.encode(`\n\n⚠️ ${msg}`));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
