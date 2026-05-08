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
});
