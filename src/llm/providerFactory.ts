import { OllamaProvider } from "./ollamaProvider";
import { OpenAIProvider } from "./openAIProvider";
import type { LlmProvider, LlmRequest } from "./types";

export type ProviderName = "auto" | "openai" | "ollama";

export function createLlmProvider(name: ProviderName = providerFromEnv()): LlmProvider {
  if (name === "openai") {
    return new OpenAIProvider();
  }

  if (name === "ollama") {
    return new OllamaProvider();
  }

  return new AutoProvider();
}

function providerFromEnv(): ProviderName {
  const value = process.env.TRAVEL_STORY_PROVIDER;
  if (value === "openai" || value === "ollama" || value === "auto") {
    return value;
  }
  return "auto";
}

class AutoProvider implements LlmProvider {
  private readonly providers: LlmProvider[];

  constructor() {
    this.providers = process.env.OPENAI_API_KEY
      ? [new OpenAIProvider(), new OllamaProvider()]
      : [new OllamaProvider()];
  }

  async complete(request: LlmRequest): Promise<string> {
    const errors: string[] = [];
    for (const provider of this.providers) {
      try {
        return await provider.complete(request);
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }
    throw new Error(`No LLM provider succeeded. ${errors.join(" | ")}`);
  }
}
