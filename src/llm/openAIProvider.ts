import type { LlmProvider, LlmRequest } from "./types";

interface OpenAIResponseOutputText {
  type?: string;
  text?: string;
}

interface OpenAIResponseOutputContent {
  type?: string;
  text?: string;
}

interface OpenAIResponseOutputItem {
  type?: string;
  content?: OpenAIResponseOutputContent[];
}

interface OpenAIResponseBody {
  output_text?: string;
  output?: OpenAIResponseOutputItem[];
}

export class OpenAIProvider implements LlmProvider {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(options: { apiKey?: string; model?: string } = {}) {
    const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required to use the OpenAI provider.");
    }
    this.apiKey = apiKey;
    this.model = options.model ?? process.env.TRAVEL_STORY_MODEL ?? "gpt-5.4-mini";
  }

  async complete(request: LlmRequest): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        instructions: request.system,
        input: request.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`OpenAI request failed (${response.status}): ${detail}`);
    }

    const body = (await response.json()) as OpenAIResponseBody;
    return extractText(body);
  }
}

function extractText(body: OpenAIResponseBody): string {
  if (body.output_text?.trim()) {
    return body.output_text.trim();
  }

  const text = body.output
    ?.flatMap((item) => item.content ?? [])
    .map((content: OpenAIResponseOutputText) => content.text ?? "")
    .join("")
    .trim();

  if (text) {
    return text;
  }

  throw new Error("OpenAI response did not contain text output.");
}
