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
});
