import { describe, expect, it, vi } from "vitest";
import { OpenAIProvider } from "./openAIProvider";

describe("OpenAIProvider", () => {
  it("requires an API key", () => {
    expect(() => new OpenAIProvider({ apiKey: "" })).toThrow("OPENAI_API_KEY");
  });

  it("calls the Responses API and extracts output text", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ output_text: "A warm follow-up question." }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const provider = new OpenAIProvider({ apiKey: "test-key", model: "test-model" });
    const result = await provider.complete({
      system: "Be a careful friend-editor.",
      messages: [{ role: "user", content: "A premise." }],
    });

    expect(result).toBe("A warm follow-up question.");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.openai.com/v1/responses",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
        }),
      }),
    );
  });
});
