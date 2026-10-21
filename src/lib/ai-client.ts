export type ChatMsg = { role: "user" | "assistant"; content: string };

export async function streamAi(
  feature: string,
  messages: ChatMsg[],
  onText: (full: string) => void,
  signal?: AbortSignal,
) {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ feature, messages }),
    signal: signal ?? null,
  });
  if (!res.ok || !res.body) throw new Error((await res.text()) || "Request failed");
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let full = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    full += dec.decode(value, { stream: true });
    onText(full);
  }
  return full;
}
