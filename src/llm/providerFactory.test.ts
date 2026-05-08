import { describe, expect, it } from "vitest";
import { createLlmProvider } from "./providerFactory";
import { OllamaProvider } from "./ollamaProvider";

describe("createLlmProvider", () => {
  it("can explicitly create an Ollama provider", () => {
    expect(createLlmProvider("ollama")).toBeInstanceOf(OllamaProvider);
  });
});
