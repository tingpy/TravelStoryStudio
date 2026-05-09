import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FakeLlmProvider } from "../llm/fakeProvider";
import { FileStoryStore } from "../storage/fileStore";
import { StoryAgent } from "./storyAgent";

describe("StoryAgent", () => {
  it("starts a story and saves both sides of the first chat turn", async () => {
    const root = await mkdtemp(join(tmpdir(), "travel-story-agent-"));
    const llm = new FakeLlmProvider(["What made his attention feel complicated?"]);
    const agent = new StoryAgent(new FileStoryStore(root), llm, () => "2026-05-07T00:00:00.000Z");

    const result = await agent.startStory("story-1", "I met someone whose politics collided with mine.");

    expect(result.reply).toBe("What made his attention feel complicated?");
    const messages = await new FileStoryStore(root).readMessages("story-1");
    expect(messages.map((message) => message.role)).toEqual(["author", "assistant"]);
    expect(llm.requests[0].system).toContain("Challenge with care");
  });

  it("creates outline, draft, feedback, and markdown export artifacts", async () => {
    const root = await mkdtemp(join(tmpdir(), "travel-story-agent-"));
    const store = new FileStoryStore(root);
    const llm = new FakeLlmProvider([
      "first reply",
      "outline body",
      "draft body",
      "feedback summary",
      "# Export",
    ]);
    const agent = new StoryAgent(store, llm, () => "2026-05-07T00:00:00.000Z");
    await agent.startStory("story-1", "A premise.");

    await agent.outline("story-1");
    const draft = await agent.draft("story-1");
    const feedback = await agent.feedback("story-1", "Friend: this sounds too harsh.");
    const exported = await agent.exportMarkdown("story-1");

    await expect(readFile(store.paths("story-1").outline, "utf8")).resolves.toBe("outline body\n");
    await expect(readFile(draft.savedPath ?? "", "utf8")).resolves.toBe("draft body\n");
    await expect(readFile(feedback.savedPath ?? "", "utf8")).resolves.toBe("feedback summary\n");
    await expect(readFile(exported.savedPath ?? "", "utf8")).resolves.toBe("# Export\n");
  });

  it("distills friend chats into a mixed conversation style profile", async () => {
    const root = await mkdtemp(join(tmpdir(), "travel-story-agent-"));
    const store = new FileStoryStore(root);
    const llm = new FakeLlmProvider([
      "# Friend Conversation Style Profile\n\n## Core Dimensions\n\n### Follow-Up Questions\nAsk about the hidden feeling before giving advice.\n\n## Discovered Patterns\n- Notices when I joke around pain.\n\n## Example Moves\nPrefer: Wait, is this attraction, fear, or both?",
    ]);
    const agent = new StoryAgent(store, llm, () => "2026-05-09T00:00:00.000Z");

    const result = await agent.learnFriendConversationStyle("Friend: you're joking, but you sound hurt.");

    expect(result.reply).toContain("Friend Conversation Style Profile");
    await expect(store.readFriendConversationProfile()).resolves.toContain("Discovered Patterns");
    await expect(store.readFriendConversationSamples()).resolves.toHaveLength(1);
  });

  it("distills comments on selected bot responses into a calibration profile", async () => {
    const root = await mkdtemp(join(tmpdir(), "travel-story-agent-"));
    const store = new FileStoryStore(root);
    const llm = new FakeLlmProvider([
      "# Bot Calibration Profile\n\n- Challenge more when the author simplifies another person.\n- Follow up on attraction mixed with discomfort.",
    ]);
    const agent = new StoryAgent(store, llm, () => "2026-05-09T00:00:00.000Z");

    const result = await agent.calibrateBotResponse({
      storyId: "story-1",
      assistantMessageId: "assistant-1",
      assistantResponse: "That sounds intense. What happened next?",
      comment: "I wanted you to ask why I felt flattered instead of moving on.",
    });

    expect(result.reply).toContain("Bot Calibration Profile");
    await expect(store.readBotCalibrationProfile()).resolves.toContain("attraction mixed with discomfort");
    await expect(store.readBotResponseFeedback()).resolves.toHaveLength(1);
  });

  it("uses friend conversation and bot calibration profiles when interviewing", async () => {
    const root = await mkdtemp(join(tmpdir(), "travel-story-agent-"));
    const store = new FileStoryStore(root);
    await store.saveFriendConversationProfile("# Friend Conversation Style Profile\n\nAsk one precise follow-up.");
    await store.saveBotCalibrationProfile("# Bot Calibration Profile\n\nChallenge more when I simplify people.");
    const llm = new FakeLlmProvider(["What made your reaction feel bigger than the event itself?"]);
    const agent = new StoryAgent(store, llm, () => "2026-05-09T00:00:00.000Z");

    const result = await agent.startStory("story-voice", "I met a right-wing man who was obsessed with me.");

    expect(result.assistantMessageId).toContain("assistant-");
    expect(llm.requests[0].system).toContain("Ask one precise follow-up");
    expect(llm.requests[0].system).toContain("Challenge more when I simplify people");
  });

  it("can save story notes without replying and respond later", async () => {
    const root = await mkdtemp(join(tmpdir(), "travel-story-agent-"));
    const store = new FileStoryStore(root);
    const llm = new FakeLlmProvider(["Wait, that contradiction feels important. What made it stick?"]);
    const agent = new StoryAgent(store, llm, () => "2026-05-09T00:00:00.000Z");

    await agent.addStoryNote("story-adaptive", "He said they had not had sex in 10 years.", true);
    await agent.addStoryNote("story-adaptive", "But they bought a house together.", false);

    expect(llm.requests).toHaveLength(0);
    await expect(store.readMessages("story-adaptive")).resolves.toHaveLength(2);

    const result = await agent.respondToStory("story-adaptive");

    expect(result.reply).toContain("contradiction");
    expect(result.assistantMessageId).toContain("assistant-");
    await expect(store.readMessages("story-adaptive")).resolves.toHaveLength(3);
    expect(llm.requests[0].messages.map((message) => message.content).join("\n")).toContain(
      "But they bought a house together.",
    );
  });
});
