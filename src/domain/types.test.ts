import { describe, expect, it } from "vitest";
import { makeStoryProject } from "../test/factories";

describe("StoryProject", () => {
  it("starts with empty artifacts and voice memory", () => {
    const project = makeStoryProject();

    expect(project.stage).toBe("premise");
    expect(project.artifacts).toEqual([]);
    expect(project.friendVoicePack.notes).toEqual([]);
    expect(project.authorVoiceProfile.preferences).toEqual([]);
  });
});
