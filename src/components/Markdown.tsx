import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children, streaming }: { children: string; streaming?: boolean }) {
  return (
    <div
      className={`prose prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-table:text-sm prose-th:bg-muted prose-th:px-3 prose-td:px-3 prose-th:py-2 prose-td:py-2 ${streaming ? "caret-blink" : ""}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
