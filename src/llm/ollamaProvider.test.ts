import { describe, expect, it, vi } from "vitest";
import { OllamaProvider } from "./ollamaProvider";

describe("OllamaProvider", () => {
  it("calls Ollama chat API and extracts message content", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: { content: "A local follow-up question." } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const provider = new OllamaProvider({
      baseUrl: "http://localhost:11434",
      model: "qwen2.5:7b",
    });
    const result = await provider.complete({
      system: "Be a careful friend-editor.",
      messages: [{ role: "user", content: "A premise." }],
    });

    expect(result).toBe("A local follow-up question.");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:11434/api/chat",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"model":"qwen2.5:7b"'),
      }),
    );
  });
});
