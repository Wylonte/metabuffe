import type { CoachPrompt } from "@workspace/game-knowledge";

export interface LlmClient {
  chat(prompt: CoachPrompt, options?: { temperature?: number }): Promise<string>;
}

export function createLlmClient(): LlmClient | null {
  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey) {
    return createOpenAiClient(openAiKey, process.env.OPENAI_MODEL ?? "gpt-4o-mini");
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    return createAnthropicClient(
      anthropicKey,
      process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest",
    );
  }

  return null;
}

function createOpenAiClient(apiKey: string, model: string): LlmClient {
  return {
    async chat(prompt, options) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: options?.temperature ?? 0.4,
          messages: [
            { role: "system", content: prompt.system },
            ...prompt.messages.map((m) => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.content,
            })),
          ],
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`OpenAI error ${response.status}: ${text}`);
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error("OpenAI returned empty content");
      return content;
    },
  };
}

function createAnthropicClient(apiKey: string, model: string): LlmClient {
  return {
    async chat(prompt, options) {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: 1200,
          temperature: options?.temperature ?? 0.4,
          system: prompt.system,
          messages: prompt.messages.map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Anthropic error ${response.status}: ${text}`);
      }

      const data = (await response.json()) as {
        content?: Array<{ type: string; text?: string }>;
      };
      const content = data.content
        ?.filter((block) => block.type === "text")
        .map((block) => block.text ?? "")
        .join("\n")
        .trim();
      if (!content) throw new Error("Anthropic returned empty content");
      return content;
    },
  };
}
