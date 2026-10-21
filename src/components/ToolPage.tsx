import { useRef, useState, type ReactNode } from "react";
import { Copy, Check, RotateCcw, Square, Wand2, ShieldAlert, type LucideIcon } from "lucide-react";
import { streamAi } from "@/lib/ai-client";
import { Markdown } from "./Markdown";

export type Option = { value: string; label: string; hint?: string };

type Props = {
  feature: string;
  icon: LucideIcon;
  title: string;
  description: string;
  inputLabel: string;
  placeholder: string;
  example: string;
  options?: { label: string; choices: Option[] };
  extraLabel?: string;
  extraPlaceholder?: string;
  buildPrompt: (input: string, option: string, extra: string) => string;
  cta: string;
  note?: ReactNode;
};

export function ToolPage(p: Props) {
  const [input, setInput] = useState("");
  const [extra, setExtra] = useState("");
  const [option, setOption] = useState(p.options?.choices[0]?.value ?? "");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const abort = useRef<AbortController | null>(null);

  async function run() {
    if (!input.trim() || loading) return;
    setError("");
    setOutput("");
    setLoading(true);
    abort.current = new AbortController();
    try {
      await streamAi(p.feature, [{ role: "user", content: p.buildPrompt(input.trim(), option, extra.trim()) }], setOutput, abort.current.signal);
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError((e as Error).message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const Icon = p.icon;
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-highlight text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">{p.title}</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">{p.description}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5 shadow-card sm:p-6">
          <div className="flex items-center justify-between">
            <label htmlFor="main-input" className="text-sm font-semibold">{p.inputLabel}</label>
            <button onClick={() => setInput(p.example)} className="text-xs font-medium text-primary underline-offset-4 hover:underline">
              Try an example
            </button>
          </div>
          <textarea
            id="main-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={p.placeholder}
            rows={10}
            maxLength={15000}
            className="mt-2 w-full resize-y rounded-xl border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">{input.length}/15000</p>

          {p.options && (
            <div className="mt-4">
              <p className="text-sm font-semibold">{p.options.label}</p>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {p.options.choices.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setOption(c.value)}
                    className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                      option === c.value ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary/50"
                    }`}
                  >
                    <span className="font-semibold">{c.label}</span>
                    {c.hint && <span className={`block text-xs ${option === c.value ? "opacity-80" : "text-muted-foreground"}`}>{c.hint}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {p.extraLabel && (
            <div className="mt-4">
              <label htmlFor="extra" className="text-sm font-semibold">{p.extraLabel} <span className="font-normal text-muted-foreground">(optional)</span></label>
              <input
                id="extra"
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder={p.extraPlaceholder}
                className="mt-2 w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          <div className="mt-5 flex gap-2">
            {loading ? (
              <button onClick={() => abort.current?.abort()} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm font-semibold">
                <Square className="h-4 w-4" /> Stop
              </button>
            ) : (
              <button
                onClick={run}
                disabled={!input.trim()}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
              >
                <Wand2 className="h-4 w-4" /> {p.cta}
              </button>
            )}
          </div>
          {p.note && <div className="mt-4 text-xs text-muted-foreground">{p.note}</div>}
        </section>

        <section className="flex min-h-[420px] flex-col rounded-2xl border bg-card shadow-card">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <p className="text-sm font-semibold">AI output</p>
            <div className="flex gap-1">
              <button
                disabled={!output || loading}
                onClick={run}
                aria-label="Regenerate"
                className="rounded-md p-2 text-muted-foreground hover:bg-muted disabled:opacity-30"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                disabled={!output}
                onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                aria-label="Copy output"
                className="rounded-md p-2 text-muted-foreground hover:bg-muted disabled:opacity-30"
              >
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-5">
            {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            {!output && !error && !loading && (
              <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
                <p>Your result will appear here.</p>
              </div>
            )}
            {loading && !output && <p className="animate-pulse text-sm text-muted-foreground">Thinking it through…</p>}
            {output && <Markdown streaming={loading}>{output}</Markdown>}
          </div>
          <div className="flex items-start gap-2 border-t bg-muted/50 px-5 py-3 text-xs text-muted-foreground">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            AI-generated content may contain errors. Review, fact-check and edit before using it.
          </div>
        </section>
      </div>
    </div>
  );
}
