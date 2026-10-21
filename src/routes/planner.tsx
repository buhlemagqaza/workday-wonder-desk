import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";
import { ToolPage } from "@/components/ToolPage";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — WorkMate" },
      { name: "description", content: "Prioritise tasks and generate time-blocked daily or weekly schedules with AI." },
      { property: "og:title", content: "AI Task Planner — WorkMate" },
      { property: "og:description", content: "Prioritised, realistic daily and weekly schedules." },
    ],
  }),
  component: () => (
    <ToolPage
      feature="planner"
      icon={CalendarClock}
      title="AI Task Planner"
      description="List your tasks and constraints. WorkMate prioritises them and builds a realistic, time-blocked plan."
      inputLabel="Your tasks (one per line, add deadlines if known)"
      placeholder={"Finish client report – due tomorrow\nReply to emails\nPrepare slides for Thursday…"}
      example={"Finish Q3 sales report – due tomorrow 12:00\nPrepare slides for Thursday board meeting\nReply to 25 unread emails\n1:1 with new intern (30 min)\nReview Sipho's pull request\nBook flights for Cape Town trip\nGym session\nPlan team-building event – due next Friday"}
      options={{
        label: "Plan type",
        choices: [
          { value: "daily", label: "Daily", hint: "Hour-by-hour" },
          { value: "weekly", label: "Weekly", hint: "Mon – Fri" },
          { value: "focus", label: "Focus sprint", hint: "Next 3 hours" },
        ],
      }}
      extraLabel="Working hours & preferences"
      extraPlaceholder="e.g. 08:00–17:00, lunch at 13:00, most focused in the morning"
      buildPrompt={(input, type, extra) =>
        `PLAN TYPE: ${type}\nAVAILABILITY & PREFERENCES: ${extra || "Assume 08:00–17:00 with a 1-hour lunch"}\nTASKS:\n"""${input}"""`
      }
      cta="Build my plan"
    />
  ),
});
