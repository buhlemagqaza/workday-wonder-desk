import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, MessagesSquare, Square, Trash2 } from "lucide-react";
import { streamAi, type ChatMsg } from "@/lib/ai-client";
import { Markdown } from "@/components/Markdown";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Workplace Chat Assistant — WorkMate" },
      { name: "description", content: "Chat with an AI workplace assistant for writing, planning and analysis." },
      { property: "og:title", content: "Workplace Chat Assistant — WorkMate" },
      { property: "og:description", content: "An interactive AI assistant for everyday work." },
    ],
  }),
  component: Chat,
});

const STARTERS = [
  "How do I give constructive feedback to a colleague?",
  "Draft an agenda for a 30-minute project kickoff",
  "Explain OKRs vs KPIs with examples",
  "Help me prepare for a salary negotiation",
];

function Chat() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const history: ChatMsg[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);
    abort.current = new AbortController();
    try {
      await streamAi("chat", history, (full) =>
        setMessages([...history, { role: "assistant", content: full }]), abort.current.signal);
    } catch (e) {
      if ((e as Error).name !== "AbortError")
        setMessages([...history, { role: "assistant", content: "⚠️ Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-60px)] max-w-3xl flex-col px-4 lg:h-screen">
      <div className="flex items-center justify-between py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-highlight text-primary"><MessagesSquare className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-semibold">Workplace Chat</h1>
            <p className="text-xs text-muted-foreground">Your AI colleague for everyday work questions</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-muted">
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        {messages.length === 0 ? (
          <div className="grid h-full place-content-center gap-6 text-center">
            <p className="font-display text-3xl">How can I help today?</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {STARTERS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-xl border bg-card p-3 text-left text-sm shadow-card hover:border-primary/50">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.content}</div>
                </div>
              ) : (
                <div key={i} className="flex gap-3">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-accent font-display text-sm font-bold text-accent-foreground">W</div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    {m.content ? <Markdown streaming={loading && i === messages.length - 1}>{m.content}</Markdown>
                      : <p className="animate-pulse text-sm text-muted-foreground">Thinking…</p>}
                  </div>
                </div>
              ),
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="pb-4">
        <div className="flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-card focus-within:ring-2 focus-within:ring-ring">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            rows={1}
            placeholder="Ask anything about work…"
            className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
          />
          {loading ? (
            <button type="button" aria-label="Stop" onClick={() => abort.current?.abort()} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border">
              <Square className="h-4 w-4" />
            </button>
          ) : (
            <button type="submit" aria-label="Send" disabled={!input.trim()} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40">
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">WorkMate can make mistakes. Don't share confidential or personal data.</p>
      </form>
    </div>
  );
}
