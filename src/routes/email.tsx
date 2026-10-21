import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { ToolPage } from "@/components/ToolPage";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — WorkMate" },
      { name: "description", content: "Write professional emails in formal, friendly or persuasive tones with AI." },
      { property: "og:title", content: "Smart Email Generator — WorkMate" },
      { property: "og:description", content: "Write professional emails in any tone with AI." },
    ],
  }),
  component: () => (
    <ToolPage
      feature="email"
      icon={Mail}
      title="Smart Email Generator"
      description="Describe what you need to say. WorkMate drafts a polished, ready-to-send email in the tone you choose."
      inputLabel="What is the email about?"
      placeholder="e.g. Ask my manager for Friday off to attend my graduation, I've finished the Q3 report early…"
      example="Follow up with a client (Thandi from Ubuntu Logistics) who hasn't replied to our proposal for a new delivery-tracking dashboard sent 2 weeks ago. We'd like a 20-minute call next week."
      options={{
        label: "Tone",
        choices: [
          { value: "formal", label: "Formal", hint: "Polished & precise" },
          { value: "friendly", label: "Friendly", hint: "Warm & approachable" },
          { value: "persuasive", label: "Persuasive", hint: "Benefit-led, clear CTA" },
        ],
      }}
      extraLabel="Recipient & sender"
      extraPlaceholder="e.g. To: Head of Finance, From: Buhle, Project Lead"
      buildPrompt={(input, tone, extra) =>
        `TONE: ${tone}\nRECIPIENT/SENDER: ${extra || "Not specified — use placeholders"}\nBRIEF:\n"""${input}"""`
      }
      cta="Generate email"
    />
  ),
});
