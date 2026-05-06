import type { StoryProject } from "../domain/types";

export function makeStoryProject(overrides: Partial<StoryProject> = {}): StoryProject {
  const now = "2026-05-06T18:00:00.000Z";
  return {
    id: "story-1",
    title: "Untitled story",
    premise: "I met someone whose politics collided with mine.",
    stage: "premise",
    messages: [],
    notes: [],
    lenses: [],
    artifacts: [],
    feedback: [],
    friendVoicePack: { examples: [], notes: [] },
    authorVoiceProfile: { preferences: [], avoidances: [], readerInterestNotes: [] },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
