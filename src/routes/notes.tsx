import { createFileRoute } from "@tanstack/react-router";
import { NotebookPen } from "lucide-react";
import { ToolPage } from "@/components/ToolPage";

const EXAMPLE = `Weekly product sync – 14 Oct
Attendees: Lerato (PM), Sipho (eng lead), Ayesha (design), Johan (marketing)
- Lerato: mobile app beta slipped, now targeting 4 Nov. Agreed we won't add new features before beta.
- Sipho said the payments bug is fixed in staging, needs QA sign-off. Sipho to ask QA by Thursday.
- Ayesha showing new onboarding screens, team liked v2. Decision: go with v2.
- Johan needs final screenshots for the launch campaign, ideally by 28 Oct. Ayesha to send.
- Budget for user testing still unclear – Lerato to check with finance.
- Someone should update the public roadmap page.
- Next sync 21 Oct.`;

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — WorkMate" },
      { name: "description", content: "Turn long meeting notes into summaries, decisions, action items and deadlines." },
      { property: "og:title", content: "Meeting Notes Summarizer — WorkMate" },
      { property: "og:description", content: "Extract decisions, action items and deadlines from meeting notes." },
    ],
  }),
  component: () => (
    <ToolPage
      feature="notes"
      icon={NotebookPen}
      title="Meeting Notes Summarizer"
      description="Paste raw notes or a transcript. Get a clear summary with decisions, owners and deadlines — nothing invented."
      inputLabel="Meeting notes or transcript"
      placeholder="Paste your meeting notes here…"
      example={EXAMPLE}
      options={{
        label: "Summary depth",
        choices: [
          { value: "concise", label: "Concise", hint: "Quick brief" },
          { value: "detailed", label: "Detailed", hint: "Full context" },
          { value: "executive", label: "Executive", hint: "For leadership" },
        ],
      }}
      buildPrompt={(input, depth) => `SUMMARY DEPTH: ${depth}\nMEETING NOTES:\n"""${input}"""`}
      cta="Summarize meeting"
      note="Tip: remove confidential details (salaries, personal data) before pasting."
    />
  ),
});
