import { describe, expect, it } from "vitest";
import { makeStoryProject } from "../test/factories";

describe("StoryProject", () => {
  it("starts with empty artifacts and conversation memory", () => {
    const project = makeStoryProject();

    expect(project.stage).toBe("premise");
    expect(project.artifacts).toEqual([]);
    expect(project.friendConversationStyle.rawSampleCount).toBe(0);
    expect(project.friendConversationStyle.reusableInstructions).toEqual([]);
    expect(project.botCalibration.feedbackCount).toBe(0);
    expect(project.botCalibration.followUpPreferences).toEqual([]);
  });
});
