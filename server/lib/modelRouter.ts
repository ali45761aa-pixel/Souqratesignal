// ── Model Router ────────────────────────────────────────────────────────────
// Routes agents to the best LLM based on task requirements:
// - Claude Sonnet 4.5: frontend, reviewer, auditor, brand, innovation, strategy (visual/creative)
// - DeepSeek: all other agents (analysis, content, SEO, backend, etc.)

const CLAUDE_AGENTS = new Set([
  "frontend", "reviewer", "auditor", "brand", "innovation", "strategy", "designer", "ux"
]);

const CLAUDE_MODEL = "claude-sonnet-4-5-20250929";
const DEEPSEEK_MODEL = "deepseek-chat";

export function getModelForAgent(agentId: string): "claude" | "deepseek" {
  return CLAUDE_AGENTS.has(agentId) ? "claude" : "deepseek";
}

export interface StreamCallOptions {
  agentId: string;
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  temperature?: number;
}

export async function streamWithBestModel(
  options: StreamCallOptions
): Promise<Response> {
  const { agentId, systemPrompt, userMessage, maxTokens = 16000, temperature = 0.7 } = options;
  const model = getModelForAgent(agentId);

  if (model === "claude") {
    const claudeKey = process.env.ANTHROPIC_API_KEY;
    if (!claudeKey) {
      // Fallback to DeepSeek if Claude key not available
      return streamWithDeepSeek({ systemPrompt, userMessage, maxTokens, temperature });
    }
    return streamWithClaude({ systemPrompt, userMessage, maxTokens, temperature, apiKey: claudeKey });
  }

  return streamWithDeepSeek({ systemPrompt, userMessage, maxTokens, temperature });
}

async function streamWithClaude(opts: {
  systemPrompt: string;
  userMessage: string;
  maxTokens: number;
  temperature: number;
  apiKey: string;
}): Promise<Response> {
  const { systemPrompt, userMessage, maxTokens, temperature, apiKey } = opts;
  
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: Math.min(maxTokens, 16000),
      temperature,
      stream: true,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  // Transform Claude SSE format to DeepSeek-compatible format
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) { await writer.close(); return; }

    let inputTokens = 0;
    let outputTokens = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      for (const line of decoder.decode(value, { stream: true }).split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;
        
        try {
          const parsed = JSON.parse(data);
          
          // Claude streaming events
          if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
            // Convert to DeepSeek format
            const compatible = {
              choices: [{ delta: { content: parsed.delta.text }, finish_reason: null }]
            };
            await writer.write(encoder.encode(`data: ${JSON.stringify(compatible)}\n\n`));
          } else if (parsed.type === "message_delta" && parsed.usage) {
            outputTokens = parsed.usage.output_tokens || 0;
          } else if (parsed.type === "message_start" && parsed.message?.usage) {
            inputTokens = parsed.message.usage.input_tokens || 0;
          } else if (parsed.type === "message_stop") {
            // Send usage info
            const usageMsg = {
              choices: [{ delta: {}, finish_reason: "stop" }],
              usage: { prompt_tokens: inputTokens, completion_tokens: outputTokens, total_tokens: inputTokens + outputTokens }
            };
            await writer.write(encoder.encode(`data: ${JSON.stringify(usageMsg)}\n\n`));
            await writer.write(encoder.encode("data: [DONE]\n\n"));
          }
        } catch (_e) { /* intentional */ }
      }
    }
    await writer.close();
  })();

  return new Response(readable, {
    headers: { "Content-Type": "text/event-stream" }
  });
}

async function streamWithDeepSeek(opts: {
  systemPrompt: string;
  userMessage: string;
  maxTokens: number;
  temperature: number;
}): Promise<Response> {
  const { systemPrompt, userMessage, maxTokens, temperature } = opts;
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.BUILT_IN_FORGE_API_KEY;
  const apiUrl = process.env.BUILT_IN_FORGE_API_URL || "https://api.deepseek.com";

  return fetch(`${apiUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      temperature,
      max_tokens: maxTokens,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
    }),
  });
}

// ── Non-streaming call (for chat router and simple completions) ───────────────
export async function callWithBestModel(opts: {
  agentId?: string;
  messages: { role: string; content: string }[];
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const { agentId = "chat", messages, maxTokens = 4096, temperature = 0.7 } = opts;
  const model = getModelForAgent(agentId);

  if (model === "claude") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Fallback to DeepSeek if Claude key not available
      return callWithBestModel({ agentId: "chat", messages, maxTokens, temperature });
    }
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: maxTokens,
        messages: messages.filter(m => m.role !== "system"),
        system: messages.find(m => m.role === "system")?.content,
      }),
    });
    if (!res.ok) throw new Error(`Claude error: ${res.status}`);
    const data = await res.json() as any;
    return data.content?.[0]?.text ?? "";
  }

  // DeepSeek (default)
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.BUILT_IN_FORGE_API_KEY;
  const apiUrl = process.env.BUILT_IN_FORGE_API_URL || "https://api.deepseek.com";
  const res = await fetch(`${apiUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: DEEPSEEK_MODEL, messages, max_tokens: maxTokens, temperature }),
  });
  if (!res.ok) throw new Error(`DeepSeek error: ${res.status}`);
  const data = await res.json() as any;
  return data.choices?.[0]?.message?.content ?? "";
}
