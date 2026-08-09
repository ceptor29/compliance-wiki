import { z } from "zod";

const rawTextSchema = z.object({
  controls: z.array(
    z.object({
      controlId: z.string(),
      title: z.string(),
      description: z.string(),
      domain: z.string().optional(),
    })
  ),
  changes: z
    .array(
      z.object({
        controlId: z.string(),
        type: z.enum(["new", "updated", "retired"]),
        summary: z.string(),
      })
    )
    .optional(),
});

export type ParsedFramework = z.infer<typeof rawTextSchema>;

function stripCodeFences(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

export async function parseWithAi(rawText: string): Promise<ParsedFramework> {
  const provider = process.env.AI_PROVIDER ?? "openai";
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL ?? "gpt-4o-mini";

  if (!apiKey && provider !== "ollama") {
    throw new Error("AI_API_KEY is not set. Set it in .env or the CI secrets to enable AI parsing.");
  }

  let base = "https://api.openai.com/v1";
  let chatModel = model;
  if (provider === "gemini") {
    base = "https://generativelanguage.googleapis.com/v1beta";
    chatModel = model ?? "gemini-1.5-flash";
  } else if (provider === "ollama") {
    base = process.env.AI_BASE_URL ?? "http://localhost:11434/v1";
  } else if (provider === "openai-compatible") {
    base = process.env.AI_BASE_URL ?? base;
  }

  const url =
    provider === "gemini"
      ? `${base}/models/${chatModel}:generateContent`
      : `${base}/chat/completions`;

  const system = [
    "You are a compliance analyst. Extract structured data from compliance framework documents.",
    "Extract every control or requirement you can find, including its ID, title, and a short plain-language description.",
    "Do NOT copy text verbatim; write concise original summaries.",
    "If the document mentions recent changes, list them with a controlId, a type (new|updated|retired), and a one-sentence summary.",
    "Respond ONLY with a JSON object shaped like:",
    JSON.stringify({
      controls: [{ controlId: "string", title: "string", description: "string", domain: "string" }],
      changes: [{ controlId: "string", type: "new|updated|retired", summary: "string" }],
    }),
  ].join("\n");

  let content = "";
  if (provider === "gemini") {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey ?? "" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: rawText }] }],
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`AI request failed (${res.status}): ${body}`);
    }
    const data = await res.json();
    content = data.candidates?.[0]?.content?.parts?.map((p: { text: string }) => p.text).join("") ?? "";
  } else {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: chatModel,
        temperature: 0.2,
        messages: [
          { role: "system", content: system },
          { role: "user", content: rawText },
        ],
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`AI request failed (${res.status}): ${body}`);
    }
    const data = await res.json();
    content = data.choices?.[0]?.message?.content ?? "";
  }

  return rawTextSchema.parse(JSON.parse(stripCodeFences(content)));
}
