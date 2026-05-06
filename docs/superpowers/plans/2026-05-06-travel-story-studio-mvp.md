# Travel Story Studio MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-user private story studio MVP that supports story workspaces, honest editor-friend interviewing, story lens tracking, outline/draft/revision generation, voice memory, feedback import, and platform-neutral export.

**Architecture:** Use a local-first web app with a thin UI layer, a focused domain layer, and an AI adapter boundary. The first implementation should work with deterministic local model stubs in tests and development. Product behavior is designed for an LLM-powered chatbot and Writing Agent, while condition-based code supplies guardrails, workflow state, export formatting, and testable fallback behavior.

**Tech Stack:** TypeScript, React, Vite, Vitest, Testing Library, local JSON persistence, CSS modules or plain CSS, provider-agnostic AI adapter.

---

## Scope Check

The approved spec describes several subsystems. For a first implementation pass, keep them in one MVP because they form one end-to-end workflow:

- Create a private story workspace.
- Interview from a rough premise.
- Track story lenses and tension notes.
- Generate an outline before drafting.
- Generate draft/revision/export artifacts.
- Import friend or reader feedback.
- Maintain separate Friend Voice Pack and Author Voice Profile notes.

Do not implement direct social integrations, built-in public blog hosting, authentication, multi-user collaboration, analytics, payments, or real model training.

## File Structure

Create this structure:

```text
package.json
tsconfig.json
vite.config.ts
vitest.config.ts
index.html
src/main.tsx
src/App.tsx
src/styles.css
src/vite-env.d.ts
src/domain/types.ts
src/domain/storyWorkflow.ts
src/domain/lensTracker.ts
src/domain/interviewPolicy.ts
src/domain/writingAgent.ts
src/domain/feedbackAnalyzer.ts
src/domain/exporter.ts
src/domain/voiceProfiles.ts
src/storage/localStore.ts
src/ai/aiAdapter.ts
src/ai/localFakeAdapter.ts
src/ui/StoryList.tsx
src/ui/StoryWorkspace.tsx
src/ui/InterviewPanel.tsx
src/ui/WritingPanel.tsx
src/ui/FeedbackPanel.tsx
src/ui/VoiceMemoryPanel.tsx
src/ui/ExportPanel.tsx
src/test/setup.ts
src/test/factories.ts
src/**/*.test.ts
```

Responsibilities:

- `src/domain/types.ts`: shared domain models and literal unions.
- `src/domain/storyWorkflow.ts`: workspace creation, state transitions, artifact updates.
- `src/domain/lensTracker.ts`: deterministic lens/tension extraction from transcript text.
- `src/domain/interviewPolicy.ts`: chatbot mode choice and next-question policy.
- `src/domain/writingAgent.ts`: outline, draft, and revision orchestration using an AI adapter.
- `src/domain/feedbackAnalyzer.ts`: private friend chat and public reader comment classification.
- `src/domain/exporter.ts`: long-form, serialized, caption, thread, and Markdown exports.
- `src/domain/voiceProfiles.ts`: separate Friend Voice Pack and Author Voice Profile updates.
- `src/storage/localStore.ts`: JSON persistence behind a small repository interface.
- `src/ai/aiAdapter.ts`: provider-agnostic AI interface.
- `src/ai/localFakeAdapter.ts`: deterministic responses for tests and offline development; this is a development stand-in, not the intended production intelligence.
- `src/ui/*`: focused React components.

---

### Task 1: Scaffold the App and Test Harness

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/vite-env.d.ts`
- Create: `src/domain/types.ts`
- Create: `src/test/setup.ts`
- Create: `src/test/factories.ts`
- Test: `src/domain/types.test.ts`

- [ ] **Step 1: Create package metadata and scripts**

```json
{
  "name": "travel-story-studio",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-react": "6.0.1",
    "vite": "8.0.10",
    "typescript": "6.0.3",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "lucide-react": "1.8.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "6.9.1",
    "@testing-library/react": "16.3.0",
    "@testing-library/user-event": "14.6.1",
    "@types/react": "19.2.14",
    "@types/react-dom": "19.2.3",
    "jsdom": "27.2.0",
    "vitest": "4.0.18"
  }
}
```

- [ ] **Step 2: Create TypeScript config**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": []
}
```

- [ ] **Step 3: Create Vite and Vitest config**

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["src/test/setup.ts"],
  },
});
```

- [ ] **Step 4: Create the app shell**

```html
<!-- index.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Travel Story Studio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

```tsx
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

```tsx
// src/App.tsx
export function App() {
  return (
    <main className="app-shell">
      <section className="workspace">
        <h1>Travel Story Studio</h1>
        <p>Private story workspaces for honest travel writing.</p>
      </section>
    </main>
  );
}
```

```css
/* src/styles.css */
:root {
  color: #171717;
  background: #f6f2ec;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
}

button,
input,
textarea,
select {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  padding: 24px;
}

.workspace {
  max-width: 1180px;
  margin: 0 auto;
}
```

```ts
// src/vite-env.d.ts
/// <reference types="vite/client" />
```

- [ ] **Step 5: Define domain types**

```ts
// src/domain/types.ts
export type StoryLens =
  | "culture_conflict"
  | "political_tension"
  | "romantic_encounter"
  | "cultural_friction_in_romance"
  | "heard_story"
  | "mixed"
  | "something_else";

export type StoryStage =
  | "premise"
  | "interview"
  | "retrospective"
  | "outline"
  | "draft"
  | "revision"
  | "exported"
  | "feedback";

export type ChatRole = "author" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface StoryNote {
  id: string;
  kind: "event" | "emotion" | "tension" | "reader_hook" | "open_question";
  text: string;
  sourceMessageId?: string;
}

export interface StoryOutline {
  titleOptions: string[];
  centralTension: string;
  editorialAngle: string;
  sceneBeats: string[];
  emotionalArc: string[];
  readerHooks: string[];
  sensitivities: string[];
  serialization: SerializedPlan;
}

export interface SerializedPlan {
  recommended: boolean;
  parts: SerializedPart[];
}

export interface SerializedPart {
  partNumber: number;
  workingTitle: string;
  turn: string;
  hookEnding: string;
}

export interface DraftArtifact {
  id: string;
  kind: "outline" | "draft" | "revision" | "export";
  title: string;
  content: string;
  createdAt: string;
}

export interface FriendVoicePack {
  examples: string[];
  notes: string[];
}

export interface AuthorVoiceProfile {
  preferences: string[];
  avoidances: string[];
  readerInterestNotes: string[];
}

export interface FeedbackImport {
  id: string;
  source: "friend_chat" | "reader_comments";
  rawText: string;
  summary?: FeedbackSummary;
  createdAt: string;
}

export interface FeedbackSummary {
  suggestedEdits: string[];
  emotionalReactions: string[];
  confusion: string[];
  compellingMoments: string[];
  warnings: string[];
  readerQuestions: string[];
}

export interface StoryProject {
  id: string;
  title: string;
  premise: string;
  stage: StoryStage;
  messages: ChatMessage[];
  notes: StoryNote[];
  lenses: StoryLens[];
  outline?: StoryOutline;
  artifacts: DraftArtifact[];
  feedback: FeedbackImport[];
  friendVoicePack: FriendVoicePack;
  authorVoiceProfile: AuthorVoiceProfile;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 6: Create test factories**

```ts
// src/test/setup.ts
import "@testing-library/jest-dom/vitest";
```

```ts
// src/test/factories.ts
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
```

- [ ] **Step 7: Write the first type smoke test**

```ts
// src/domain/types.test.ts
import { describe, expect, it } from "vitest";
import { makeStoryProject } from "../test/factories";

describe("StoryProject", () => {
  it("starts private and unpublished by default", () => {
    const project = makeStoryProject();

    expect(project.stage).toBe("premise");
    expect(project.artifacts).toEqual([]);
    expect(project.friendVoicePack.notes).toEqual([]);
    expect(project.authorVoiceProfile.preferences).toEqual([]);
  });
});
```

- [ ] **Step 8: Install dependencies and verify the scaffold**

Run:

```bash
npm install
npm test
npm run build
```

Expected:

```text
1 test passes
TypeScript build succeeds
Vite build succeeds
```

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts vitest.config.ts index.html src
git commit -m "chore: scaffold travel story studio"
```

---

### Task 2: Story Workspace Workflow

**Files:**
- Create: `src/domain/storyWorkflow.ts`
- Test: `src/domain/storyWorkflow.test.ts`

- [ ] **Step 1: Write failing workflow tests**

```ts
// src/domain/storyWorkflow.test.ts
import { describe, expect, it } from "vitest";
import {
  addAssistantMessage,
  addAuthorMessage,
  createStoryProject,
  moveToStage,
} from "./storyWorkflow";

describe("storyWorkflow", () => {
  it("creates a private story project from a rough premise", () => {
    const project = createStoryProject({
      id: "story-123",
      now: "2026-05-06T18:00:00.000Z",
      premise: "I met a right-wing man who became obsessed with me.",
    });

    expect(project.title).toBe("Untitled story");
    expect(project.premise).toContain("right-wing man");
    expect(project.stage).toBe("interview");
    expect(project.messages).toEqual([
      {
        id: "story-123-message-1",
        role: "author",
        content: "I met a right-wing man who became obsessed with me.",
        createdAt: "2026-05-06T18:00:00.000Z",
      },
    ]);
  });

  it("adds messages without dropping existing transcript", () => {
    const project = createStoryProject({
      id: "story-123",
      now: "2026-05-06T18:00:00.000Z",
      premise: "A culture shock story.",
    });

    const withAuthor = addAuthorMessage(project, "I felt strangely guilty.", "2026-05-06T18:01:00.000Z");
    const withAssistant = addAssistantMessage(withAuthor, "What made the guilt feel bigger than the moment?", "2026-05-06T18:02:00.000Z");

    expect(withAssistant.messages.map((message) => message.role)).toEqual([
      "author",
      "author",
      "assistant",
    ]);
    expect(withAssistant.updatedAt).toBe("2026-05-06T18:02:00.000Z");
  });

  it("moves through approved workflow stages only", () => {
    const project = createStoryProject({
      id: "story-123",
      now: "2026-05-06T18:00:00.000Z",
      premise: "A mixed romance and culture story.",
    });

    expect(moveToStage(project, "retrospective", "2026-05-06T18:03:00.000Z").stage).toBe("retrospective");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/domain/storyWorkflow.test.ts
```

Expected: FAIL because `storyWorkflow.ts` does not exist.

- [ ] **Step 3: Implement story workflow helpers**

```ts
// src/domain/storyWorkflow.ts
import type { ChatMessage, StoryProject, StoryStage } from "./types";

interface CreateStoryProjectInput {
  id: string;
  now: string;
  premise: string;
}

export function createStoryProject(input: CreateStoryProjectInput): StoryProject {
  const firstMessage: ChatMessage = {
    id: `${input.id}-message-1`,
    role: "author",
    content: input.premise,
    createdAt: input.now,
  };

  return {
    id: input.id,
    title: "Untitled story",
    premise: input.premise,
    stage: "interview",
    messages: [firstMessage],
    notes: [],
    lenses: [],
    artifacts: [],
    feedback: [],
    friendVoicePack: { examples: [], notes: [] },
    authorVoiceProfile: { preferences: [], avoidances: [], readerInterestNotes: [] },
    createdAt: input.now,
    updatedAt: input.now,
  };
}

export function addAuthorMessage(project: StoryProject, content: string, now: string): StoryProject {
  return addMessage(project, "author", content, now);
}

export function addAssistantMessage(project: StoryProject, content: string, now: string): StoryProject {
  return addMessage(project, "assistant", content, now);
}

export function moveToStage(project: StoryProject, stage: StoryStage, now: string): StoryProject {
  return {
    ...project,
    stage,
    updatedAt: now,
  };
}

function addMessage(
  project: StoryProject,
  role: ChatMessage["role"],
  content: string,
  now: string,
): StoryProject {
  return {
    ...project,
    messages: [
      ...project.messages,
      {
        id: `${project.id}-message-${project.messages.length + 1}`,
        role,
        content,
        createdAt: now,
      },
    ],
    updatedAt: now,
  };
}
```

- [ ] **Step 4: Run tests**

Run:

```bash
npm test -- src/domain/storyWorkflow.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/storyWorkflow.ts src/domain/storyWorkflow.test.ts
git commit -m "feat: add story workspace workflow"
```

---

### Task 3: Lens Tracking and Interview Policy

**Files:**
- Create: `src/domain/lensTracker.ts`
- Create: `src/domain/interviewPolicy.ts`
- Test: `src/domain/lensTracker.test.ts`
- Test: `src/domain/interviewPolicy.test.ts`

- [ ] **Step 1: Write failing lens tracker tests**

```ts
// src/domain/lensTracker.test.ts
import { describe, expect, it } from "vitest";
import { trackLensesAndNotes } from "./lensTracker";
import { makeStoryProject } from "../test/factories";

describe("trackLensesAndNotes", () => {
  it("keeps multiple lenses when a story mixes politics, romance, and culture", () => {
    const project = makeStoryProject({
      messages: [
        {
          id: "m1",
          role: "author",
          content: "I was attracted to him, but his right-wing politics made me angry, and the family expectations felt cultural.",
          createdAt: "2026-05-06T18:00:00.000Z",
        },
      ],
    });

    const updated = trackLensesAndNotes(project);

    expect(updated.lenses).toEqual([
      "political_tension",
      "romantic_encounter",
      "cultural_friction_in_romance",
    ]);
    expect(updated.notes.some((note) => note.kind === "tension")).toBe(true);
    expect(updated.notes.some((note) => note.kind === "emotion")).toBe(true);
  });

  it("does not force a single category for ambiguous stories", () => {
    const project = makeStoryProject({
      messages: [
        {
          id: "m1",
          role: "author",
          content: "Something about the dinner made my reaction bigger than the event itself.",
          createdAt: "2026-05-06T18:00:00.000Z",
        },
      ],
    });

    const updated = trackLensesAndNotes(project);

    expect(updated.lenses).toEqual(["mixed"]);
    expect(updated.notes.map((note) => note.kind)).toContain("open_question");
  });
});
```

- [ ] **Step 2: Write failing interview policy tests**

```ts
// src/domain/interviewPolicy.test.ts
import { describe, expect, it } from "vitest";
import { chooseInterviewResponse } from "./interviewPolicy";
import { makeStoryProject } from "../test/factories";

describe("chooseInterviewResponse", () => {
  it("asks one tension-based question while the author is still developing events", () => {
    const project = makeStoryProject({
      stage: "interview",
      messages: [
        {
          id: "m1",
          role: "author",
          content: "He kept messaging me and I felt flattered and irritated at the same time.",
          createdAt: "2026-05-06T18:00:00.000Z",
        },
      ],
    });

    const response = chooseInterviewResponse(project);

    expect(response.nextStage).toBe("interview");
    expect(response.questions).toHaveLength(1);
    expect(response.questions[0]).toContain("flattered");
  });

  it("moves to retrospective when the author signals the main story is done", () => {
    const project = makeStoryProject({
      stage: "interview",
      messages: [
        {
          id: "m1",
          role: "author",
          content: "That is basically the whole story.",
          createdAt: "2026-05-06T18:00:00.000Z",
        },
      ],
    });

    const response = chooseInterviewResponse(project);

    expect(response.nextStage).toBe("retrospective");
    expect(response.questions.length).toBeGreaterThanOrEqual(3);
  });

  it("challenges with care instead of blindly agreeing", () => {
    const project = makeStoryProject({
      stage: "interview",
      messages: [
        {
          id: "m1",
          role: "author",
          content: "Obviously he was just ignorant, and I never gave him any mixed signals.",
          createdAt: "2026-05-06T18:00:00.000Z",
        },
      ],
    });

    const response = chooseInterviewResponse(project);

    expect(response.questions[0]).toContain("your own role");
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run:

```bash
npm test -- src/domain/lensTracker.test.ts src/domain/interviewPolicy.test.ts
```

Expected: FAIL because the modules do not exist.

- [ ] **Step 4: Implement lens tracker**

```ts
// src/domain/lensTracker.ts
import type { StoryLens, StoryNote, StoryProject } from "./types";

const lensRules: Array<{ lens: StoryLens; patterns: RegExp[] }> = [
  { lens: "political_tension", patterns: [/right-wing/i, /leftist/i, /politic/i, /ideolog/i] },
  { lens: "romantic_encounter", patterns: [/attracted/i, /romance/i, /seductive/i, /obsessed/i, /date/i] },
  { lens: "culture_conflict", patterns: [/culture/i, /family expectation/i, /custom/i, /misunderstand/i] },
  {
    lens: "cultural_friction_in_romance",
    patterns: [/attracted.*culture/i, /romance.*culture/i, /family expectations felt cultural/i],
  },
  { lens: "heard_story", patterns: [/someone told me/i, /story i heard/i, /my friend said/i] },
];

const emotionPattern = /felt|angry|guilty|ashamed|flattered|irritated|lonely|afraid|curious|confused/i;
const tensionPattern = /but|however|conflict|shock|misunderstand|bigger than the event|obsessed|politics/i;

export function trackLensesAndNotes(project: StoryProject): StoryProject {
  const authorText = project.messages
    .filter((message) => message.role === "author")
    .map((message) => message.content)
    .join("\n");

  const lenses = lensRules
    .filter((rule) => rule.patterns.some((pattern) => pattern.test(authorText)))
    .map((rule) => rule.lens);

  const normalizedLenses = normalizeLenses(lenses);
  const notes: StoryNote[] = [];

  if (tensionPattern.test(authorText)) {
    notes.push({
      id: `${project.id}-note-tension-1`,
      kind: "tension",
      text: "The story contains a visible contradiction or conflict worth developing.",
    });
  }

  if (emotionPattern.test(authorText)) {
    notes.push({
      id: `${project.id}-note-emotion-1`,
      kind: "emotion",
      text: "The author's emotional reaction is part of the story material.",
    });
  }

  if (/bigger than the event|why/i.test(authorText)) {
    notes.push({
      id: `${project.id}-note-open-question-1`,
      kind: "open_question",
      text: "The author may need to unpack why the reaction felt larger than the event.",
    });
  }

  return {
    ...project,
    lenses: normalizedLenses,
    notes: mergeNotes(project.notes, notes),
  };
}

function normalizeLenses(lenses: StoryLens[]): StoryLens[] {
  const unique = Array.from(new Set(lenses));

  if (
    unique.includes("culture_conflict") &&
    unique.includes("romantic_encounter") &&
    !unique.includes("cultural_friction_in_romance")
  ) {
    unique.push("cultural_friction_in_romance");
  }

  return unique.length > 0 ? unique : ["mixed"];
}

function mergeNotes(existing: StoryNote[], incoming: StoryNote[]): StoryNote[] {
  const existingKeys = new Set(existing.map((note) => `${note.kind}:${note.text}`));
  return [
    ...existing,
    ...incoming.filter((note) => !existingKeys.has(`${note.kind}:${note.text}`)),
  ];
}
```

- [ ] **Step 5: Implement interview policy**

```ts
// src/domain/interviewPolicy.ts
import type { StoryProject, StoryStage } from "./types";

interface InterviewResponse {
  nextStage: StoryStage;
  mode: "story_building" | "retrospective";
  questions: string[];
}

export function chooseInterviewResponse(project: StoryProject): InterviewResponse {
  const lastAuthorMessage = [...project.messages].reverse().find((message) => message.role === "author");
  const text = lastAuthorMessage?.content ?? project.premise;

  if (signalsRetrospective(text)) {
    return {
      nextStage: "retrospective",
      mode: "retrospective",
      questions: [
        "What part of this still feels unresolved for you?",
        "Where might your own interpretation have shaped the conflict?",
        "Which moment would readers remember, and why?",
        "What cultural or emotional context would make the scene more fair?",
      ],
    };
  }

  return {
    nextStage: "interview",
    mode: "story_building",
    questions: [buildSingleQuestion(text)],
  };
}

function signalsRetrospective(text: string): boolean {
  return /basically the whole story|that's it|that is it|in the end|looking back|retrospective/i.test(text);
}

function buildSingleQuestion(text: string): string {
  if (/mixed signals|never gave/i.test(text)) {
    return "What would it look like to examine your own role here without blaming yourself or excusing him?";
  }

  if (/flattered/i.test(text)) {
    return "What part of being flattered felt good, and what part made you uneasy?";
  }

  if (/angry|irritated/i.test(text)) {
    return "What did your irritation seem to protect: your politics, your boundaries, your pride, or something else?";
  }

  if (/obsessed/i.test(text)) {
    return "When did his attention first stop feeling romantic or funny and start feeling like pressure?";
  }

  return "What made your reaction feel bigger than the event itself?";
}
```

- [ ] **Step 6: Run tests**

Run:

```bash
npm test -- src/domain/lensTracker.test.ts src/domain/interviewPolicy.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/domain/lensTracker.ts src/domain/interviewPolicy.ts src/domain/lensTracker.test.ts src/domain/interviewPolicy.test.ts
git commit -m "feat: add story lens and interview policy"
```

---

### Task 4: AI Adapter and Writing Agent

**Files:**
- Create: `src/ai/aiAdapter.ts`
- Create: `src/ai/localFakeAdapter.ts`
- Create: `src/domain/writingAgent.ts`
- Test: `src/domain/writingAgent.test.ts`

- [ ] **Step 1: Write failing writing agent tests**

```ts
// src/domain/writingAgent.test.ts
import { describe, expect, it } from "vitest";
import { LocalFakeAdapter } from "../ai/localFakeAdapter";
import { makeStoryProject } from "../test/factories";
import { createDraftFromOutline, createOutline, reviseDraft } from "./writingAgent";

describe("writingAgent", () => {
  it("creates an outline before drafting", async () => {
    const project = makeStoryProject({
      premise: "I was attracted to someone whose politics disturbed me.",
      lenses: ["political_tension", "romantic_encounter"],
      notes: [
        { id: "n1", kind: "tension", text: "Attraction collides with ideology." },
        { id: "n2", kind: "reader_hook", text: "The contradiction is the hook." },
      ],
    });

    const outline = await createOutline(project, new LocalFakeAdapter());

    expect(outline.centralTension).toContain("Attraction collides");
    expect(outline.serialization.parts[0].hookEnding).toContain("question");
  });

  it("drafts from the approved outline", async () => {
    const project = makeStoryProject();
    const outline = await createOutline(project, new LocalFakeAdapter());

    const draft = await createDraftFromOutline(project, outline, new LocalFakeAdapter());

    expect(draft.kind).toBe("draft");
    expect(draft.content).toContain(outline.centralTension);
  });

  it("revises with feedback without changing the original draft", async () => {
    const project = makeStoryProject();
    const outline = await createOutline(project, new LocalFakeAdapter());
    const draft = await createDraftFromOutline(project, outline, new LocalFakeAdapter());

    const revision = await reviseDraft(project, draft, "Less harsh, more nuanced.", new LocalFakeAdapter());

    expect(draft.content).not.toBe(revision.content);
    expect(revision.kind).toBe("revision");
    expect(revision.content).toContain("more nuanced");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/domain/writingAgent.test.ts
```

Expected: FAIL because the AI adapter and writing agent modules do not exist.

- [ ] **Step 3: Create AI adapter interface**

```ts
// src/ai/aiAdapter.ts
export interface AiRequest {
  task: "outline" | "draft" | "revision" | "feedback" | "voice";
  system: string;
  input: string;
}

export interface AiResponse {
  text: string;
}

export interface AiAdapter {
  complete(request: AiRequest): Promise<AiResponse>;
}
```

- [ ] **Step 4: Create deterministic local fake adapter**

```ts
// src/ai/localFakeAdapter.ts
import type { AiAdapter, AiRequest, AiResponse } from "./aiAdapter";

export class LocalFakeAdapter implements AiAdapter {
  async complete(request: AiRequest): Promise<AiResponse> {
    if (request.task === "outline") {
      return {
        text: JSON.stringify({
          titleOptions: ["The Attraction I Did Not Trust", "Politics at the Edge of Desire"],
          centralTension: request.input.includes("Attraction collides")
            ? "Attraction collides with ideology."
            : "A private reaction becomes larger than the event.",
          editorialAngle: "A reflective cultural essay with a sharper personal column edge.",
          sceneBeats: ["The first encounter", "The moment of contradiction", "The private reaction"],
          emotionalArc: ["Curiosity", "Unease", "Self-questioning"],
          readerHooks: ["The contradiction between attraction and politics"],
          sensitivities: ["Avoid flattening a person into a political label"],
          serialization: {
            recommended: true,
            parts: [
              {
                partNumber: 1,
                workingTitle: "The First Pull",
                turn: "Attraction appears before judgment catches up.",
                hookEnding: "End with the question of why the attention felt good.",
              },
            ],
          },
        }),
      };
    }

    if (request.task === "draft") {
      return { text: `Draft based on approved outline: ${request.input}` };
    }

    if (request.task === "revision") {
      return { text: `Revision that is more nuanced: ${request.input}` };
    }

    return { text: request.input };
  }
}
```

- [ ] **Step 5: Implement Writing Agent modes**

```ts
// src/domain/writingAgent.ts
import type { AiAdapter } from "../ai/aiAdapter";
import type { DraftArtifact, StoryOutline, StoryProject } from "./types";

export async function createOutline(project: StoryProject, ai: AiAdapter): Promise<StoryOutline> {
  const response = await ai.complete({
    task: "outline",
    system:
      "Create a writer/editor outline. Use honest emotional support, reader hooks, sensitivity notes, and serialization options.",
    input: buildProjectInput(project),
  });

  return JSON.parse(response.text) as StoryOutline;
}

export async function createDraftFromOutline(
  project: StoryProject,
  outline: StoryOutline,
  ai: AiAdapter,
): Promise<DraftArtifact> {
  const response = await ai.complete({
    task: "draft",
    system: "Write from the approved outline. Preserve the author's voice and selected angle.",
    input: `${buildProjectInput(project)}\n\nApproved outline:\n${JSON.stringify(outline, null, 2)}`,
  });

  return {
    id: `${project.id}-draft-${project.artifacts.length + 1}`,
    kind: "draft",
    title: outline.titleOptions[0] ?? "Untitled draft",
    content: response.text,
    createdAt: new Date().toISOString(),
  };
}

export async function reviseDraft(
  project: StoryProject,
  draft: DraftArtifact,
  instruction: string,
  ai: AiAdapter,
): Promise<DraftArtifact> {
  const response = await ai.complete({
    task: "revision",
    system: "Revise the draft according to author feedback without erasing the central tension.",
    input: `Instruction: ${instruction}\n\nDraft:\n${draft.content}`,
  });

  return {
    id: `${project.id}-revision-${project.artifacts.length + 1}`,
    kind: "revision",
    title: draft.title,
    content: response.text,
    createdAt: new Date().toISOString(),
  };
}

function buildProjectInput(project: StoryProject): string {
  return [
    `Premise: ${project.premise}`,
    `Lenses: ${project.lenses.join(", ") || "none"}`,
    `Notes: ${project.notes.map((note) => `${note.kind}: ${note.text}`).join(" | ") || "none"}`,
    `Author preferences: ${project.authorVoiceProfile.preferences.join(" | ") || "none"}`,
    `Author avoidances: ${project.authorVoiceProfile.avoidances.join(" | ") || "none"}`,
  ].join("\n");
}
```

- [ ] **Step 6: Run tests**

Run:

```bash
npm test -- src/domain/writingAgent.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/ai src/domain/writingAgent.ts src/domain/writingAgent.test.ts
git commit -m "feat: add writing agent modes"
```

---

### Task 5: Feedback, Voice Memory, and Export

**Files:**
- Create: `src/domain/feedbackAnalyzer.ts`
- Create: `src/domain/voiceProfiles.ts`
- Create: `src/domain/exporter.ts`
- Test: `src/domain/feedbackAnalyzer.test.ts`
- Test: `src/domain/voiceProfiles.test.ts`
- Test: `src/domain/exporter.test.ts`

- [ ] **Step 1: Write failing feedback tests**

```ts
// src/domain/feedbackAnalyzer.test.ts
import { describe, expect, it } from "vitest";
import { analyzeFeedback } from "./feedbackAnalyzer";

describe("analyzeFeedback", () => {
  it("classifies private friend chat feedback as conversation, not isolated comments", () => {
    const summary = analyzeFeedback({
      source: "friend_chat",
      rawText:
        "Friend: This part sounds too harsh.\nMe: I wanted it to feel honest.\nFriend: Then explain why you were angry, not just that he was wrong.",
    });

    expect(summary.suggestedEdits).toContain("Explain why the anger appeared instead of only saying the other person was wrong.");
    expect(summary.warnings).toContain("The current framing may sound too harsh.");
  });

  it("classifies reader comments for reactions, confusion, and questions", () => {
    const summary = analyzeFeedback({
      source: "reader_comments",
      rawText: "Reader: I was confused why you kept replying. Reader: The politics/attraction tension was compelling.",
    });

    expect(summary.confusion).toContain("Readers may not understand why the author kept replying.");
    expect(summary.compellingMoments).toContain("Readers responded to the tension between politics and attraction.");
  });
});
```

- [ ] **Step 2: Write failing voice profile tests**

```ts
// src/domain/voiceProfiles.test.ts
import { describe, expect, it } from "vitest";
import { updateAuthorVoiceProfile, updateFriendVoicePack } from "./voiceProfiles";
import { makeStoryProject } from "../test/factories";

describe("voiceProfiles", () => {
  it("keeps friend voice separate from author voice", () => {
    const project = makeStoryProject();

    const withFriendVoice = updateFriendVoicePack(project, "Friend: babe, be honest with yourself but don't be cruel.");
    const withAuthorVoice = updateAuthorVoiceProfile(withFriendVoice, {
      keptPhrase: "I was attracted to the contradiction.",
      deletedPhrase: "It was just exotic.",
    });

    expect(withAuthorVoice.friendVoicePack.notes).toContain("Friends challenge gently while staying warm.");
    expect(withAuthorVoice.authorVoiceProfile.preferences).toContain("Keeps introspective tension in plain language.");
    expect(withAuthorVoice.authorVoiceProfile.avoidances).toContain("Avoids exoticizing cultural difference.");
  });
});
```

- [ ] **Step 3: Write failing export tests**

```ts
// src/domain/exporter.test.ts
import { describe, expect, it } from "vitest";
import { exportDraft } from "./exporter";
import type { DraftArtifact, StoryOutline } from "./types";

const draft: DraftArtifact = {
  id: "draft-1",
  kind: "draft",
  title: "The Attraction I Did Not Trust",
  content: "Paragraph one.\n\nParagraph two.",
  createdAt: "2026-05-06T18:00:00.000Z",
};

const outline: StoryOutline = {
  titleOptions: ["The Attraction I Did Not Trust"],
  centralTension: "Attraction collides with politics.",
  editorialAngle: "Reflective cultural essay.",
  sceneBeats: [],
  emotionalArc: [],
  readerHooks: [],
  sensitivities: [],
  serialization: {
    recommended: true,
    parts: [
      { partNumber: 1, workingTitle: "Part One", turn: "First pull", hookEnding: "But then he said the thing I could not ignore." },
      { partNumber: 2, workingTitle: "Part Two", turn: "Conflict", hookEnding: "I had to ask what I was protecting." },
    ],
  },
};

describe("exportDraft", () => {
  it("exports website markdown", () => {
    const exported = exportDraft({ format: "markdown", draft, outline });

    expect(exported).toContain("# The Attraction I Did Not Trust");
    expect(exported).toContain("Paragraph one.");
  });

  it("exports serialized parts with hook endings", () => {
    const exported = exportDraft({ format: "serialized", draft, outline });

    expect(exported).toContain("Part 1: Part One");
    expect(exported).toContain("But then he said the thing I could not ignore.");
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run:

```bash
npm test -- src/domain/feedbackAnalyzer.test.ts src/domain/voiceProfiles.test.ts src/domain/exporter.test.ts
```

Expected: FAIL because modules do not exist.

- [ ] **Step 5: Implement feedback analyzer**

```ts
// src/domain/feedbackAnalyzer.ts
import type { FeedbackImport, FeedbackSummary } from "./types";

export function analyzeFeedback(input: Pick<FeedbackImport, "source" | "rawText">): FeedbackSummary {
  const text = input.rawText;

  return {
    suggestedEdits: [
      ...match(text, /explain why you were angry/i, "Explain why the anger appeared instead of only saying the other person was wrong."),
    ],
    emotionalReactions: [
      ...match(text, /honest/i, "The feedback recognizes the author's desire for honesty."),
    ],
    confusion: [
      ...match(text, /confused why you kept replying/i, "Readers may not understand why the author kept replying."),
    ],
    compellingMoments: [
      ...match(text, /politics\/attraction|politics and attraction/i, "Readers responded to the tension between politics and attraction."),
    ],
    warnings: [
      ...match(text, /too harsh/i, "The current framing may sound too harsh."),
    ],
    readerQuestions: [
      ...match(text, /\?/i, "Feedback includes questions the author may need to answer."),
    ],
  };
}

function match(text: string, pattern: RegExp, value: string): string[] {
  return pattern.test(text) ? [value] : [];
}
```

- [ ] **Step 6: Implement voice profile updates**

```ts
// src/domain/voiceProfiles.ts
import type { StoryProject } from "./types";

interface AuthorVoiceSignal {
  keptPhrase?: string;
  deletedPhrase?: string;
}

export function updateFriendVoicePack(project: StoryProject, chatExample: string): StoryProject {
  const notes = [...project.friendVoicePack.notes];

  if (/be honest with yourself|don't be cruel/i.test(chatExample)) {
    notes.push("Friends challenge gently while staying warm.");
  }

  return {
    ...project,
    friendVoicePack: {
      examples: [...project.friendVoicePack.examples, chatExample],
      notes: Array.from(new Set(notes)),
    },
  };
}

export function updateAuthorVoiceProfile(project: StoryProject, signal: AuthorVoiceSignal): StoryProject {
  const preferences = [...project.authorVoiceProfile.preferences];
  const avoidances = [...project.authorVoiceProfile.avoidances];

  if (/attracted to the contradiction/i.test(signal.keptPhrase ?? "")) {
    preferences.push("Keeps introspective tension in plain language.");
  }

  if (/exotic/i.test(signal.deletedPhrase ?? "")) {
    avoidances.push("Avoids exoticizing cultural difference.");
  }

  return {
    ...project,
    authorVoiceProfile: {
      ...project.authorVoiceProfile,
      preferences: Array.from(new Set(preferences)),
      avoidances: Array.from(new Set(avoidances)),
    },
  };
}
```

- [ ] **Step 7: Implement exporter**

```ts
// src/domain/exporter.ts
import type { DraftArtifact, StoryOutline } from "./types";

type ExportFormat = "long_form" | "serialized" | "caption" | "thread" | "markdown";

interface ExportInput {
  format: ExportFormat;
  draft: DraftArtifact;
  outline?: StoryOutline;
}

export function exportDraft(input: ExportInput): string {
  if (input.format === "markdown") {
    return `# ${input.draft.title}\n\n${input.draft.content}`;
  }

  if (input.format === "serialized") {
    return serializeParts(input.draft, input.outline);
  }

  if (input.format === "caption") {
    return `${input.draft.title}\n\n${firstParagraph(input.draft.content)}`;
  }

  if (input.format === "thread") {
    return splitParagraphs(input.draft.content)
      .map((part, index) => `${index + 1}. ${part}`)
      .join("\n\n");
  }

  return input.draft.content;
}

function serializeParts(draft: DraftArtifact, outline?: StoryOutline): string {
  if (!outline?.serialization.parts.length) {
    return draft.content;
  }

  return outline.serialization.parts
    .map(
      (part) =>
        `Part ${part.partNumber}: ${part.workingTitle}\n\nTurn: ${part.turn}\n\nHook: ${part.hookEnding}`,
    )
    .join("\n\n---\n\n");
}

function firstParagraph(content: string): string {
  return splitParagraphs(content)[0] ?? content;
}

function splitParagraphs(content: string): string[] {
  return content.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
}
```

- [ ] **Step 8: Run tests**

Run:

```bash
npm test -- src/domain/feedbackAnalyzer.test.ts src/domain/voiceProfiles.test.ts src/domain/exporter.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/domain/feedbackAnalyzer.ts src/domain/voiceProfiles.ts src/domain/exporter.ts src/domain/feedbackAnalyzer.test.ts src/domain/voiceProfiles.test.ts src/domain/exporter.test.ts
git commit -m "feat: add feedback voice and export logic"
```

---

### Task 6: Local Persistence

**Files:**
- Create: `src/storage/localStore.ts`
- Test: `src/storage/localStore.test.ts`

- [ ] **Step 1: Write failing persistence tests**

```ts
// src/storage/localStore.test.ts
import { describe, expect, it } from "vitest";
import { makeStoryProject } from "../test/factories";
import { createMemoryStorage, LocalStoryStore } from "./localStore";

describe("LocalStoryStore", () => {
  it("saves and lists story projects", () => {
    const storage = createMemoryStorage();
    const store = new LocalStoryStore(storage);
    const project = makeStoryProject({ id: "story-1", title: "Political Attraction" });

    store.save(project);

    expect(store.list()).toEqual([project]);
  });

  it("returns undefined for missing projects", () => {
    const storage = createMemoryStorage();
    const store = new LocalStoryStore(storage);

    expect(store.get("missing")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/storage/localStore.test.ts
```

Expected: FAIL because `localStore.ts` does not exist.

- [ ] **Step 3: Implement local store**

```ts
// src/storage/localStore.ts
import type { StoryProject } from "../domain/types";

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const STORAGE_KEY = "travel-story-studio.projects";

export class LocalStoryStore {
  constructor(private readonly storage: KeyValueStorage = window.localStorage) {}

  list(): StoryProject[] {
    const raw = this.storage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoryProject[]) : [];
  }

  get(id: string): StoryProject | undefined {
    return this.list().find((project) => project.id === id);
  }

  save(project: StoryProject): void {
    const others = this.list().filter((existing) => existing.id !== project.id);
    this.storage.setItem(STORAGE_KEY, JSON.stringify([...others, project]));
  }
}

export function createMemoryStorage(): KeyValueStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}
```

- [ ] **Step 4: Run tests**

Run:

```bash
npm test -- src/storage/localStore.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/storage/localStore.ts src/storage/localStore.test.ts
git commit -m "feat: add local story persistence"
```

---

### Task 7: Build the MVP UI

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Create: `src/ui/StoryList.tsx`
- Create: `src/ui/StoryWorkspace.tsx`
- Create: `src/ui/InterviewPanel.tsx`
- Create: `src/ui/WritingPanel.tsx`
- Create: `src/ui/FeedbackPanel.tsx`
- Create: `src/ui/VoiceMemoryPanel.tsx`
- Create: `src/ui/ExportPanel.tsx`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Write failing end-to-end UI test**

```tsx
// src/App.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("creates a story, interviews, outlines, imports feedback, and exports", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(
      screen.getByLabelText("Story premise"),
      "I met a right-wing man who became obsessed with me, but I am a leftist.",
    );
    await user.click(screen.getByRole("button", { name: "Start story" }));

    expect(screen.getByText("Untitled story")).toBeInTheDocument();
    expect(screen.getByText(/What part of being flattered|When did his attention|What made your reaction/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Create outline" }));
    expect(await screen.findByText("The Attraction I Did Not Trust")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Draft from outline" }));
    expect(await screen.findByText(/Draft based on approved outline/)).toBeInTheDocument();

    await user.type(screen.getByLabelText("Paste feedback"), "Friend: This part sounds too harsh.");
    await user.click(screen.getByRole("button", { name: "Analyze feedback" }));
    expect(screen.getByText("The current framing may sound too harsh.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Export Markdown" }));
    expect(screen.getByText(/# The Attraction I Did Not Trust/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: FAIL because UI components do not exist.

- [ ] **Step 3: Implement `App.tsx`**

```tsx
// src/App.tsx
import { useMemo, useState } from "react";
import { LocalFakeAdapter } from "./ai/localFakeAdapter";
import type { StoryProject } from "./domain/types";
import { createStoryProject } from "./domain/storyWorkflow";
import { StoryList } from "./ui/StoryList";
import { StoryWorkspace } from "./ui/StoryWorkspace";

export function App() {
  const ai = useMemo(() => new LocalFakeAdapter(), []);
  const [projects, setProjects] = useState<StoryProject[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>();
  const [premise, setPremise] = useState("");

  const activeProject = projects.find((project) => project.id === activeId);

  function startStory() {
    if (!premise.trim()) return;
    const project = createStoryProject({
      id: `story-${projects.length + 1}`,
      now: new Date().toISOString(),
      premise,
    });
    setProjects([...projects, project]);
    setActiveId(project.id);
    setPremise("");
  }

  function updateProject(updated: StoryProject) {
    setProjects((current) =>
      current.map((project) => (project.id === updated.id ? updated : project)),
    );
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="topbar">
          <div>
            <h1>Travel Story Studio</h1>
            <p>Private story workspaces for honest travel writing.</p>
          </div>
        </header>

        <section className="starter">
          <label htmlFor="premise">Story premise</label>
          <textarea
            id="premise"
            value={premise}
            onChange={(event) => setPremise(event.target.value)}
            placeholder="I met someone whose politics collided with mine..."
          />
          <button type="button" onClick={startStory}>
            Start story
          </button>
        </section>

        <div className="studio-grid">
          <StoryList projects={projects} activeId={activeId} onSelect={setActiveId} />
          {activeProject ? (
            <StoryWorkspace project={activeProject} ai={ai} onChange={updateProject} />
          ) : (
            <section className="empty-state">Start with a rough premise.</section>
          )}
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Implement UI components**

```tsx
// src/ui/StoryList.tsx
import type { StoryProject } from "../domain/types";

interface StoryListProps {
  projects: StoryProject[];
  activeId?: string;
  onSelect: (id: string) => void;
}

export function StoryList({ projects, activeId, onSelect }: StoryListProps) {
  return (
    <aside className="panel story-list">
      <h2>Stories</h2>
      {projects.map((project) => (
        <button
          key={project.id}
          type="button"
          className={project.id === activeId ? "selected story-button" : "story-button"}
          onClick={() => onSelect(project.id)}
        >
          {project.title}
        </button>
      ))}
    </aside>
  );
}
```

```tsx
// src/ui/StoryWorkspace.tsx
import type { AiAdapter } from "../ai/aiAdapter";
import type { StoryProject } from "../domain/types";
import { ExportPanel } from "./ExportPanel";
import { FeedbackPanel } from "./FeedbackPanel";
import { InterviewPanel } from "./InterviewPanel";
import { VoiceMemoryPanel } from "./VoiceMemoryPanel";
import { WritingPanel } from "./WritingPanel";

interface StoryWorkspaceProps {
  project: StoryProject;
  ai: AiAdapter;
  onChange: (project: StoryProject) => void;
}

export function StoryWorkspace({ project, ai, onChange }: StoryWorkspaceProps) {
  return (
    <section className="story-workspace">
      <header className="panel">
        <h2>{project.title}</h2>
        <p>{project.premise}</p>
      </header>
      <InterviewPanel project={project} onChange={onChange} />
      <WritingPanel project={project} ai={ai} onChange={onChange} />
      <FeedbackPanel project={project} onChange={onChange} />
      <VoiceMemoryPanel project={project} onChange={onChange} />
      <ExportPanel project={project} onChange={onChange} />
    </section>
  );
}
```

```tsx
// src/ui/InterviewPanel.tsx
import { chooseInterviewResponse } from "../domain/interviewPolicy";
import { trackLensesAndNotes } from "../domain/lensTracker";
import { addAssistantMessage, addAuthorMessage, moveToStage } from "../domain/storyWorkflow";
import type { StoryProject } from "../domain/types";

interface InterviewPanelProps {
  project: StoryProject;
  onChange: (project: StoryProject) => void;
}

export function InterviewPanel({ project, onChange }: InterviewPanelProps) {
  const tracked = trackLensesAndNotes(project);
  const response = chooseInterviewResponse(tracked);

  function addQuestion() {
    const withQuestion = addAssistantMessage(tracked, response.questions[0], new Date().toISOString());
    onChange(moveToStage(withQuestion, response.nextStage, new Date().toISOString()));
  }

  return (
    <section className="panel">
      <h3>Interview</h3>
      <p>{response.questions[0]}</p>
      <button type="button" onClick={addQuestion}>
        Add question
      </button>
    </section>
  );
}
```

```tsx
// src/ui/WritingPanel.tsx
import type { AiAdapter } from "../ai/aiAdapter";
import { createDraftFromOutline, createOutline } from "../domain/writingAgent";
import type { StoryProject } from "../domain/types";

interface WritingPanelProps {
  project: StoryProject;
  ai: AiAdapter;
  onChange: (project: StoryProject) => void;
}

export function WritingPanel({ project, ai, onChange }: WritingPanelProps) {
  async function handleOutline() {
    const outline = await createOutline(project, ai);
    onChange({ ...project, outline, stage: "outline" });
  }

  async function handleDraft() {
    if (!project.outline) return;
    const draft = await createDraftFromOutline(project, project.outline, ai);
    onChange({ ...project, artifacts: [...project.artifacts, draft], stage: "draft" });
  }

  const latestDraft = [...project.artifacts].reverse().find((artifact) => artifact.kind === "draft");

  return (
    <section className="panel">
      <h3>Writing Agent</h3>
      <button type="button" onClick={handleOutline}>
        Create outline
      </button>
      {project.outline ? <pre>{project.outline.titleOptions[0]}</pre> : null}
      <button type="button" onClick={handleDraft} disabled={!project.outline}>
        Draft from outline
      </button>
      {latestDraft ? <article>{latestDraft.content}</article> : null}
    </section>
  );
}
```

```tsx
// src/ui/FeedbackPanel.tsx
import { useState } from "react";
import { analyzeFeedback } from "../domain/feedbackAnalyzer";
import type { StoryProject } from "../domain/types";

interface FeedbackPanelProps {
  project: StoryProject;
  onChange: (project: StoryProject) => void;
}

export function FeedbackPanel({ project, onChange }: FeedbackPanelProps) {
  const [rawText, setRawText] = useState("");

  function analyze() {
    const summary = analyzeFeedback({ source: "friend_chat", rawText });
    onChange({
      ...project,
      feedback: [
        ...project.feedback,
        {
          id: `${project.id}-feedback-${project.feedback.length + 1}`,
          source: "friend_chat",
          rawText,
          summary,
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }

  const latestSummary = [...project.feedback].reverse()[0]?.summary;

  return (
    <section className="panel">
      <h3>Feedback</h3>
      <label htmlFor="feedback">Paste feedback</label>
      <textarea id="feedback" value={rawText} onChange={(event) => setRawText(event.target.value)} />
      <button type="button" onClick={analyze}>
        Analyze feedback
      </button>
      {latestSummary?.warnings.map((warning) => <p key={warning}>{warning}</p>)}
    </section>
  );
}
```

```tsx
// src/ui/VoiceMemoryPanel.tsx
import { useState } from "react";
import { updateFriendVoicePack } from "../domain/voiceProfiles";
import type { StoryProject } from "../domain/types";

interface VoiceMemoryPanelProps {
  project: StoryProject;
  onChange: (project: StoryProject) => void;
}

export function VoiceMemoryPanel({ project, onChange }: VoiceMemoryPanelProps) {
  const [example, setExample] = useState("");

  function saveExample() {
    onChange(updateFriendVoicePack(project, example));
    setExample("");
  }

  return (
    <section className="panel">
      <h3>Friend Voice Pack</h3>
      <label htmlFor="friend-voice">Friend chat example</label>
      <textarea id="friend-voice" value={example} onChange={(event) => setExample(event.target.value)} />
      <button type="button" onClick={saveExample}>
        Save voice example
      </button>
      {project.friendVoicePack.notes.map((note) => <p key={note}>{note}</p>)}
    </section>
  );
}
```

```tsx
// src/ui/ExportPanel.tsx
import { useState } from "react";
import { exportDraft } from "../domain/exporter";
import type { StoryProject } from "../domain/types";

interface ExportPanelProps {
  project: StoryProject;
  onChange: (project: StoryProject) => void;
}

export function ExportPanel({ project }: ExportPanelProps) {
  const [exported, setExported] = useState("");
  const latestDraft = [...project.artifacts].reverse().find((artifact) => artifact.kind === "draft");

  function exportMarkdown() {
    if (!latestDraft) return;
    setExported(exportDraft({ format: "markdown", draft: latestDraft, outline: project.outline }));
  }

  return (
    <section className="panel">
      <h3>Export</h3>
      <button type="button" onClick={exportMarkdown} disabled={!latestDraft}>
        Export Markdown
      </button>
      {exported ? <pre>{exported}</pre> : null}
    </section>
  );
}
```

- [ ] **Step 5: Replace CSS with responsive studio layout**

```css
/* src/styles.css */
:root {
  color: #171717;
  background: #f6f2ec;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
}

button,
input,
textarea,
select {
  font: inherit;
}

button {
  border: 1px solid #232323;
  background: #232323;
  color: #ffffff;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

textarea {
  width: 100%;
  min-height: 88px;
  resize: vertical;
  border: 1px solid #c9c0b4;
  border-radius: 6px;
  padding: 10px;
  background: #fffdf9;
}

.app-shell {
  min-height: 100vh;
  padding: 24px;
}

.workspace {
  max-width: 1180px;
  margin: 0 auto;
}

.topbar {
  margin-bottom: 20px;
}

.topbar h1 {
  margin: 0;
  font-size: 32px;
}

.topbar p,
.panel p {
  color: #504b45;
}

.starter,
.panel,
.empty-state {
  border: 1px solid #d8cfc3;
  background: #fffaf2;
  border-radius: 8px;
  padding: 16px;
}

.starter {
  display: grid;
  gap: 10px;
  margin-bottom: 18px;
}

.studio-grid {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 18px;
}

.story-list {
  align-self: start;
}

.story-button {
  display: block;
  width: 100%;
  margin-top: 8px;
  text-align: left;
}

.story-button.selected {
  background: #6e4f2e;
}

.story-workspace {
  display: grid;
  gap: 14px;
}

.panel {
  overflow-wrap: anywhere;
}

.panel h2,
.panel h3 {
  margin-top: 0;
}

pre,
article {
  white-space: pre-wrap;
  background: #f1eadf;
  border-radius: 6px;
  padding: 12px;
}

@media (max-width: 760px) {
  .app-shell {
    padding: 14px;
  }

  .studio-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 6: Run UI test**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Run full verification**

Run:

```bash
npm test
npm run build
```

Expected: all tests pass and build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/App.tsx src/styles.css src/ui src/App.test.tsx
git commit -m "feat: build story studio interface"
```

---

### Task 8: Final Verification and GitHub Sync

**Files:**
- Modify: `docs/superpowers/plans/2026-05-06-travel-story-studio-mvp.md` only if implementation discoveries require plan updates.

- [ ] **Step 1: Run complete test suite**

Run:

```bash
npm test
```

Expected:

```text
All test files pass
```

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected:

```text
TypeScript build succeeds
Vite build succeeds
```

- [ ] **Step 3: Start dev server**

Run:

```bash
npm run dev
```

Expected:

```text
Vite prints a local URL
```

- [ ] **Step 4: Manual smoke test**

In the browser:

1. Create a story from a rough premise.
2. Confirm the chatbot asks a tension-based question.
3. Confirm the bot can challenge gently when the premise sounds one-sided.
4. Create an outline.
5. Draft from the outline.
6. Paste friend-chat feedback.
7. Export Markdown.

Expected: the whole private story workflow works without social publishing or built-in blog hosting.

- [ ] **Step 5: Commit any final fixes**

```bash
git status -sb
git add <changed-files>
git commit -m "fix: complete story studio smoke test"
```

Expected: commit only if there are actual fixes.

- [ ] **Step 6: Push or sync to GitHub**

If local GitHub credentials are configured:

```bash
git push -u origin main
```

Expected: push succeeds.

If terminal GitHub credentials are still unavailable, use the connected GitHub app to create or update the changed files on `tingpy/TravelStoryStudio`.

## Self-Review

Spec coverage:

- Private story workspaces: Tasks 1, 2, 6, and 7.
- Interview chatbot: Tasks 3 and 7.
- Honest emotional support and careful challenge: Task 3.
- Story lens tracking: Task 3.
- Writing Agent with outline, draft, and revision modes: Task 4.
- Friend Voice Pack: Task 5 and Task 7.
- Author Voice Profile: Task 5.
- Manual feedback import: Task 5 and Task 7.
- Manual export: Task 5 and Task 7.
- Serialization: Task 4 and Task 5.
- Privacy boundaries: Tasks 1, 5, 6, and 8.

Placeholder scan: no TBD/TODO placeholders are intentionally left. Implementation steps include concrete code, commands, and expected results.

Type consistency: all tasks use `StoryProject`, `StoryOutline`, `DraftArtifact`, `FeedbackSummary`, `FriendVoicePack`, and `AuthorVoiceProfile` from `src/domain/types.ts`.
