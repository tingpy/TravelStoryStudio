import { describe, expect, it } from "vitest";
import { messageAppHtml } from "./messageAppHtml";

describe("messageAppHtml", () => {
  it("submits the composer on Enter while preserving Shift+Enter newlines", () => {
    const html = messageAppHtml();

    expect(html).toContain('inputEl.addEventListener("keydown"');
    expect(html).toContain('event.key === "Enter"');
    expect(html).toContain("!event.shiftKey");
    expect(html).toContain("formEl.requestSubmit()");
  });

  it("includes a separate friend style learning action", () => {
    const html = messageAppHtml();

    expect(html).toContain('data-command="friendStyle"');
    expect(html).toContain("/api/friend-conversation-style");
    expect(html).toContain("Paste friend chat excerpts");
  });

  it("includes selected-response bot feedback controls", () => {
    const html = messageAppHtml();

    expect(html).toContain('data-command="botFeedback"');
    expect(html).toContain("/api/bot-feedback");
    expect(html).toContain("selectedAssistantMessage");
    expect(html).toContain("Give feedback on this response");
  });
});
