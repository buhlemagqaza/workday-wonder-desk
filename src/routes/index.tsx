import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { NAV } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WorkMate — AI Workplace Productivity Dashboard" },
      { name: "description", content: "One AI workspace for emails, meeting summaries, task planning, research and chat." },
      { property: "og:title", content: "WorkMate — AI Workplace Productivity Dashboard" },
      { property: "og:description", content: "Emails, meeting summaries, planning, research and chat in one AI workspace." },
    ],
  }),
  component: Index,
});

const BLURBS: Record<string, { text: string; saves: string }> = {
  "/email": { text: "Professional emails in formal, friendly or persuasive tones.", saves: "~15 min / email" },
  "/notes": { text: "Summaries, decisions, action items and deadlines from raw notes.", saves: "~30 min / meeting" },
  "/planner": { text: "Prioritised, time-blocked daily and weekly schedules.", saves: "~20 min / day" },
  "/research": { text: "Topic briefs with insights, recommendations and caveats.", saves: "~1 hr / topic" },
  "/chat": { text: "An interactive assistant for any workplace question.", saves: "Always on" },
};

function Index() {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const tools = NAV.filter((n) => BLURBS[n.to]);
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
      <section className="relative overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground sm:p-12">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
        <p className="text-sm opacity-75" suppressHydrationWarning>{greet} 👋</p>
        <h1 className="mt-2 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
          Less busywork. <em className="text-accent">More real work.</em>
        </h1>
        <p className="mt-4 max-w-xl opacity-80">
          WorkMate brings five AI assistants into one workspace — so you can write, summarise, plan and research in minutes, with you always in control.
        </p>
        <Link to="/chat" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90">
          Ask WorkMate <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <h2 className="mt-12 text-2xl font-semibold">Your AI toolkit</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="group rounded-2xl border bg-card p-6 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40">
            <div className="flex items-center justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-highlight text-primary"><Icon className="h-5 w-5" /></div>
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">{BLURBS[to]?.saves}</span>
            </div>
            <h3 className="mt-4 text-xl font-semibold">{label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{BLURBS[to]?.text}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
        <Link to="/responsible-ai" className="rounded-2xl border border-dashed bg-highlight/50 p-6 transition hover:border-primary/40">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h3 className="mt-4 text-xl font-semibold">Responsible by design</h3>
          <p className="mt-1 text-sm text-muted-foreground">Guardrails against made-up facts, privacy-first, and human review on every output.</p>
        </Link>
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        AI-generated content may be inaccurate. Always review outputs before use. Saved times are illustrative estimates.
      </p>
    </div>
  );
}
