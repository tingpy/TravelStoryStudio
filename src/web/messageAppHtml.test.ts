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

  it("includes reply preview and author message edit/delete controls", () => {
    const html = messageAppHtml();

    expect(html).toContain("Reply");
    expect(html).toContain("replyPreview");
    expect(html).toContain("Replying to Bot");
    expect(html).toContain("replyToMessage");
    expect(html).toContain("/api/edit-message");
    expect(html).toContain("/api/delete-message");
    expect(html).toContain("Edit");
    expect(html).toContain("Delete");
    expect(html).toContain("touchstart");
    expect(html).toContain("contextmenu");
    expect(html).toContain("suppressNextDocumentClick");
  });

  it("shows story chat context when giving feedback on a specific response", () => {
    const html = messageAppHtml();

    expect(html).toContain("storyTranscript");
    expect(html).toContain("renderFeedbackStoryContext");
    expect(html).toContain("Selected response");
    expect(html).toContain("Chat from Story Room");
    expect(html).toContain("Comment on this response");
  });

  it("includes controls for continuing and deleting old chats", () => {
    const html = messageAppHtml();

    expect(html).toContain('id="storyList"');
    expect(html).toContain("/api/stories");
    expect(html).toContain("/api/story?");
    expect(html).toContain("/api/delete-story");
    expect(html).toContain("Delete chat");
  });

  it("includes tabbed workspaces and adaptive story controls", () => {
    const html = messageAppHtml();

    expect(html).toContain(".toolbar[hidden]");
    expect(html).toContain('data-tab="story"');
    expect(html).toContain('data-tab="draft"');
    expect(html).toContain('data-tab="feedback"');
    expect(html).toContain('data-tab="memory"');
    expect(html).toContain('id="storyMessages"');
    expect(html).toContain('id="draftMessages"');
    expect(html).toContain('id="feedbackMessages"');
    expect(html).toContain('id="memoryMessages"');
    expect(html).toContain('id="askNow"');
    expect(html).toContain('id="keepListening"');
    expect(html).toContain("/api/note");
    expect(html).toContain("/api/respond");
    expect(html).toContain("scheduleAdaptiveReply");
  });

  it("includes feedback and memory profile surfaces", () => {
    const html = messageAppHtml();

    expect(html).toContain("Specific Comment");
    expect(html).toContain("General Advice");
    expect(html).toContain("Updated prompt/profile layer");
    expect(html).toContain("Friend Style Import");
    expect(html).toContain("Reflection Skills");
  });
});
