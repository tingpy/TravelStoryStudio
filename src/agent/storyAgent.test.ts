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
});
