import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { ToolPage } from "@/components/ToolPage";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — WorkMate" },
      { name: "description", content: "Summarise topics and articles, then get insights and recommendations." },
      { property: "og:title", content: "AI Research Assistant — WorkMate" },
      { property: "og:description", content: "Summaries, insights and recommendations on any topic." },
    ],
  }),
  component: () => (
    <ToolPage
      feature="research"
      icon={Search}
      title="AI Research Assistant"
      description="Enter a topic or paste an article. Get a structured brief with key points, insights, recommendations and what to verify."
      inputLabel="Topic, question or article text"
      placeholder="e.g. Benefits and risks of a 4-day work week for small businesses"
      example="How can small and medium businesses in South Africa use AI tools responsibly to improve productivity?"
      options={{
        label: "Audience",
        choices: [
          { value: "general professional", label: "General", hint: "Plain language" },
          { value: "executive decision-maker", label: "Executive", hint: "Strategic view" },
          { value: "technical specialist", label: "Technical", hint: "In-depth detail" },
        ],
      }}
      extraLabel="Your context or goal"
      extraPlaceholder="e.g. I run a 15-person marketing agency and want to cut admin time"
      buildPrompt={(input, audience, extra) =>
        `AUDIENCE: ${audience}\nUSER CONTEXT: ${extra || "Not provided"}\nTOPIC OR ARTICLE:\n"""${input}"""`
      }
      cta="Research this"
      note="Research is based on general AI knowledge, not live web search. Verify important facts with current sources."
    />
  ),
});
