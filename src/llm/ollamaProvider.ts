import type { LlmProvider, LlmRequest } from "./types";

interface OllamaChatResponse {
  message?: {
    content?: string;
  };
}

export class OllamaProvider implements LlmProvider {
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(options: { baseUrl?: string; model?: string } = {}) {
    this.baseUrl = options.baseUrl ?? process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";
    this.model = options.model ?? process.env.OLLAMA_MODEL ?? "qwen2.5:7b";
  }

  async complete(request: LlmRequest): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        stream: false,
        messages: [
          { role: "system", content: request.system },
          ...request.messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Ollama request failed (${response.status}): ${detail}`);
    }

    const body = (await response.json()) as OllamaChatResponse;
    const text = body.message?.content?.trim();
    if (!text) {
      throw new Error("Ollama response did not contain message content.");
    }
    return text;
  }
}
