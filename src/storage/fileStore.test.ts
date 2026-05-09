import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FileStoryStore } from "./fileStore";

describe("FileStoryStore", () => {
  it("creates a local story workspace and saves transcript lines", async () => {
    const root = await mkdtemp(join(tmpdir(), "travel-story-"));
    const store = new FileStoryStore(root);

    const paths = await store.createStory("story-1", "A rough premise.");
    await store.appendMessage("story-1", {
      id: "m1",
      role: "author",
      content: "A rough premise.",
      createdAt: "2026-05-07T00:00:00.000Z",
    });

    await expect(readFile(paths.premise, "utf8")).resolves.toBe("A rough premise.\n");
    await expect(readFile(paths.notes, "utf8")).resolves.toBe("[]\n");
    await expect(store.readMessages("story-1")).resolves.toEqual([
      {
        id: "m1",
        role: "author",
        content: "A rough premise.",
        createdAt: "2026-05-07T00:00:00.000Z",
      },
    ]);
  });

  it("saves outline, draft, feedback, and export artifacts", async () => {
    const root = await mkdtemp(join(tmpdir(), "travel-story-"));
    const store = new FileStoryStore(root);
    await store.createStory("story-1", "A rough premise.");

    await store.saveOutline("story-1", "# Outline");
    const draft = await store.saveDraft("story-1", "draft-1.md", "Draft body");
    const feedback = await store.saveFeedback("story-1", "feedback-1.md", "Friend chat");
    const exported = await store.saveExport("story-1", "story.md", "Export body");

    await expect(readFile(draft, "utf8")).resolves.toBe("Draft body\n");
    await expect(readFile(feedback, "utf8")).resolves.toBe("Friend chat\n");
    await expect(readFile(exported, "utf8")).resolves.toBe("Export body\n");
    await expect(readFile(store.paths("story-1").outline, "utf8")).resolves.toBe("# Outline\n");
  });

  it("stores friend conversation style and selected bot feedback memory", async () => {
    const root = await mkdtemp(join(tmpdir(), "travel-story-"));
    const store = new FileStoryStore(root);

    await store.appendFriendConversationSample({
      id: "friend-sample-1",
      rawText: "Friend: you always ask if you are overreacting right when something actually hurt.",
      createdAt: "2026-05-09T00:00:00.000Z",
    });
    await store.saveFriendConversationProfile("# Friend Conversation Style\n\nAsk one precise follow-up before advice.");

    await store.appendBotResponseFeedback({
      id: "bot-feedback-1",
      storyId: "story-1",
      assistantMessageId: "assistant-1",
      assistantResponse: "That sounds uncomfortable. What happened next?",
      comment: "This was too generic. Challenge me on why I avoided naming attraction.",
      createdAt: "2026-05-09T00:00:00.000Z",
    });
    await store.saveBotCalibrationProfile(
      "# Bot Calibration\n\nWhen attraction and discomfort appear together, ask about the contradiction.",
    );

    await expect(store.readFriendConversationSamples()).resolves.toEqual([
      {
        id: "friend-sample-1",
        rawText: "Friend: you always ask if you are overreacting right when something actually hurt.",
        createdAt: "2026-05-09T00:00:00.000Z",
      },
    ]);
    await expect(store.readFriendConversationProfile()).resolves.toContain("Ask one precise follow-up");
    await expect(store.readBotResponseFeedback()).resolves.toEqual([
      {
        id: "bot-feedback-1",
        storyId: "story-1",
        assistantMessageId: "assistant-1",
        assistantResponse: "That sounds uncomfortable. What happened next?",
        comment: "This was too generic. Challenge me on why I avoided naming attraction.",
        createdAt: "2026-05-09T00:00:00.000Z",
      },
    ]);
    await expect(store.readBotCalibrationProfile()).resolves.toContain("attraction and discomfort");
  });

  it("lists story chats and deletes selected story workspaces", async () => {
    const root = await mkdtemp(join(tmpdir(), "travel-story-"));
    const store = new FileStoryStore(root);
    await store.createStory("story-old", "An older premise.");
    await store.appendMessage("story-old", {
      id: "m1",
      role: "author",
      content: "An older premise.",
      createdAt: "2026-05-07T00:00:00.000Z",
    });
    await store.createStory("story-new", "A newer premise.");
    await store.appendMessage("story-new", {
      id: "m2",
      role: "author",
      content: "A newer premise.",
      createdAt: "2026-05-09T00:00:00.000Z",
    });

    const stories = await store.listStories();

    expect(stories.map((story) => story.id)).toEqual(["story-new", "story-old"]);
    expect(stories[0]).toEqual(
      expect.objectContaining({
        id: "story-new",
        premise: "A newer premise.",
        messageCount: 1,
      }),
    );

    await store.deleteStory("story-old");

    await expect(store.listStories()).resolves.toEqual([expect.objectContaining({ id: "story-new" })]);
    await expect(store.readMessages("story-old")).resolves.toEqual([]);
  });

  it("edits and deletes author messages while preserving reply metadata", async () => {
    const root = await mkdtemp(join(tmpdir(), "travel-story-"));
    const store = new FileStoryStore(root);
    await store.createStory("story-1", "A rough premise.");
    await store.appendMessage("story-1", {
      id: "assistant-1",
      role: "assistant",
      content: "What made that reaction feel bigger than the event?",
      createdAt: "2026-05-09T00:00:00.000Z",
    });
    await store.appendMessage("story-1", {
      id: "author-1",
      role: "author",
      content: "Because I felt judged and flattered at once.",
      createdAt: "2026-05-09T00:01:00.000Z",
      replyToMessageId: "assistant-1",
      replyToContent: "What made that reaction feel bigger than the event?",
    });
    await store.appendMessage("story-1", {
      id: "assistant-2",
      role: "assistant",
      content: "Old response based on the unedited message.",
      createdAt: "2026-05-09T00:01:30.000Z",
    });

    await store.editAuthorMessage("story-1", "author-1", "Because I felt judged, flattered, and embarrassed.", "2026-05-09T00:02:00.000Z");

    await expect(store.readMessages("story-1")).resolves.toEqual([
      {
        id: "assistant-1",
        role: "assistant",
        content: "What made that reaction feel bigger than the event?",
        createdAt: "2026-05-09T00:00:00.000Z",
      },
      {
        id: "author-1",
        role: "author",
        content: "Because I felt judged, flattered, and embarrassed.",
        createdAt: "2026-05-09T00:01:00.000Z",
        editedAt: "2026-05-09T00:02:00.000Z",
        replyToMessageId: "assistant-1",
        replyToContent: "What made that reaction feel bigger than the event?",
      },
    ]);

    await store.deleteAuthorMessage("story-1", "author-1");

    await expect(store.readMessages("story-1")).resolves.toEqual([
      {
        id: "assistant-1",
        role: "assistant",
        content: "What made that reaction feel bigger than the event?",
        createdAt: "2026-05-09T00:00:00.000Z",
      },
    ]);
  });
});
