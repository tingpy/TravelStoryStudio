# Conversation Style Memory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two private learning systems: friend conversation style from pasted friend chats, and bot calibration from comments on selected chatbot responses.

**Architecture:** Store raw learning inputs locally under `voice/`, distill them into reusable Markdown profiles, and inject only those distilled profiles into future interview prompts. Keep these learning systems separate from story drafts, story feedback, and reader comments so meta-feedback never becomes accidental story material.

**Tech Stack:** TypeScript, Node HTTP server, local file storage, existing `LlmProvider`, existing Messages-style HTML UI, Vitest.

---

## File Structure

- Modify `src/domain/types.ts`
  - Replace the narrow `FriendVoicePack` concept with richer friend conversation style and bot calibration types.
- Modify `src/storage/fileStore.ts`
  - Add local `voice/` paths and methods for friend samples, friend style profile, selected-response bot feedback, and bot calibration profile.
- Create `src/agent/voicePrompts.ts`
  - Own prompts that distill friend chats and selected-response bot feedback into reusable profiles.
- Modify `src/agent/prompts.ts`
  - Add `interviewSystemPrompt(friendConversationProfile, botCalibrationProfile)`.
- Modify `src/agent/storyAgent.ts`
  - Add profile-generation methods and inject both profiles into story interview calls.
  - Return assistant message IDs from chat responses so the UI can attach feedback to a selected response.
- Modify `src/web/server.ts`
  - Add API routes for friend conversation style and bot feedback.
- Modify `src/web/messageAppHtml.ts`
  - Add a separate `Friend Style` space and a separate `Bot Feedback` space.
  - Let the user select a chatbot response and comment on it.
- Add/modify tests:
  - `src/storage/fileStore.test.ts`
  - `src/agent/storyAgent.test.ts`
  - `src/web/messageAppHtml.test.ts`
  - `src/llm/fakeProvider.ts` if needed to inspect prompt requests.

---

## Product Behavior

### Friend Conversation Style

This feature learns how trusted friends talk with the author. It is not only emotional tone. It should extract reusable conversational behavior:

- emotional support style
- follow-up question style
- challenge and pushback style
- attention patterns
- response rhythm
- humor and familiarity
- boundaries for what not to copy
- model-discovered patterns that do not fit the fixed categories
- concrete reusable behavioral instructions
- example moves that show preferred response patterns without quoting private messages

The profile should be structured enough to be reliable, but flexible enough for the model to notice unusual patterns in the author’s friendships.

### Bot Feedback

This feature lets the author comment on a selected chatbot response after a conversation.

Example comments:

```text
I wish you challenged me more here.
You should have followed up on the part where I said I felt flattered and disgusted.
This was too gentle. I wanted sharper editor energy.
```

Bot feedback is stored separately from story feedback. It becomes a bot calibration profile that changes future interviewing behavior.

### Prompt Use

Future story interviews should receive:

```text
Friend Conversation Style Profile
Bot Calibration Profile
```

The model should use these profiles as behavior guidance only. It must not reveal, quote, summarize, or treat private friend chats or bot feedback as story material.

---

## Task 1: Add Conversation Memory Storage

**Files:**
- Modify: `src/storage/fileStore.ts`
- Modify: `src/storage/fileStore.test.ts`

- [ ] **Step 1: Write the failing storage test**

Add this test to `src/storage/fileStore.test.ts`:

```ts
it("stores friend conversation style and selected bot feedback memory", async () => {
  const store = new FileStoryStore(tempDir);

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
  await store.saveBotCalibrationProfile("# Bot Calibration\n\nWhen attraction and discomfort appear together, ask about the contradiction.");

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
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
/Users/orcametgoldfish/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vitest/vitest.mjs run src/storage/fileStore.test.ts
```

Expected: FAIL because the conversation memory storage methods do not exist.

- [ ] **Step 3: Implement storage types**

Add these interfaces to `src/storage/fileStore.ts`:

```ts
export interface FriendConversationSample {
  id: string;
  rawText: string;
  createdAt: string;
}

export interface BotResponseFeedback {
  id: string;
  storyId: string;
  assistantMessageId: string;
  assistantResponse: string;
  comment: string;
  createdAt: string;
}
```

Extend `StoryWorkspacePaths`:

```ts
voiceDir: string;
friendConversationSamples: string;
friendConversationProfile: string;
botResponseFeedback: string;
botCalibrationProfile: string;
```

Extend `paths()` with:

```ts
const voiceDir = join(this.root, "voice");
```

and return:

```ts
voiceDir,
friendConversationSamples: join(voiceDir, "friend-conversation-samples.jsonl"),
friendConversationProfile: join(voiceDir, "friend-conversation-profile.md"),
botResponseFeedback: join(voiceDir, "bot-response-feedback.jsonl"),
botCalibrationProfile: join(voiceDir, "bot-calibration-profile.md"),
```

- [ ] **Step 4: Implement storage methods**

Add:

```ts
async appendFriendConversationSample(sample: FriendConversationSample): Promise<void> {
  const paths = this.paths("voice");
  await mkdir(paths.voiceDir, { recursive: true });
  await writeFile(paths.friendConversationSamples, `${JSON.stringify(sample)}\n`, { encoding: "utf8", flag: "a" });
}

async readFriendConversationSamples(): Promise<FriendConversationSample[]> {
  const raw = await readOptionalFile(this.paths("voice").friendConversationSamples);
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as FriendConversationSample);
}

async saveFriendConversationProfile(profile: string): Promise<string> {
  const paths = this.paths("voice");
  await mkdir(paths.voiceDir, { recursive: true });
  await writeFile(paths.friendConversationProfile, `${profile.trim()}\n`, "utf8");
  return paths.friendConversationProfile;
}

async readFriendConversationProfile(): Promise<string> {
  return (await readOptionalFile(this.paths("voice").friendConversationProfile)).trim();
}

async appendBotResponseFeedback(feedback: BotResponseFeedback): Promise<void> {
  const paths = this.paths("voice");
  await mkdir(paths.voiceDir, { recursive: true });
  await writeFile(paths.botResponseFeedback, `${JSON.stringify(feedback)}\n`, { encoding: "utf8", flag: "a" });
}

async readBotResponseFeedback(): Promise<BotResponseFeedback[]> {
  const raw = await readOptionalFile(this.paths("voice").botResponseFeedback);
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as BotResponseFeedback);
}

async saveBotCalibrationProfile(profile: string): Promise<string> {
  const paths = this.paths("voice");
  await mkdir(paths.voiceDir, { recursive: true });
  await writeFile(paths.botCalibrationProfile, `${profile.trim()}\n`, "utf8");
  return paths.botCalibrationProfile;
}

async readBotCalibrationProfile(): Promise<string> {
  return (await readOptionalFile(this.paths("voice").botCalibrationProfile)).trim();
}
```

- [ ] **Step 5: Run the test and verify it passes**

Run the same Vitest command. Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/storage/fileStore.ts src/storage/fileStore.test.ts
git commit -m "feat: add conversation memory storage"
```

---

## Task 2: Add Distillation Prompts

**Files:**
- Create: `src/agent/voicePrompts.ts`
- Modify: `src/agent/storyAgent.ts`
- Modify: `src/agent/storyAgent.test.ts`

- [ ] **Step 1: Write the failing friend profile test**

Add this test to `src/agent/storyAgent.test.ts`:

```ts
it("distills friend chats into a mixed conversation style profile", async () => {
  const store = new FileStoryStore(tempDir);
  const provider = new FakeProvider([
    "# Friend Conversation Style Profile\n\n## Core Dimensions\n\n### Follow-Up Questions\nAsk about the hidden feeling before giving advice.\n\n## Discovered Patterns\n- Notices when I joke around pain.\n\n## Example Moves\nPrefer: Wait, is this attraction, fear, or both?",
  ]);
  const agent = new StoryAgent(store, provider, () => "2026-05-09T00:00:00.000Z");

  const result = await agent.learnFriendConversationStyle("Friend: you're joking, but you sound hurt.");

  expect(result.reply).toContain("Friend Conversation Style Profile");
  await expect(store.readFriendConversationProfile()).resolves.toContain("Discovered Patterns");
  await expect(store.readFriendConversationSamples()).resolves.toHaveLength(1);
});
```

- [ ] **Step 2: Write the failing bot calibration test**

Add:

```ts
it("distills comments on selected bot responses into a calibration profile", async () => {
  const store = new FileStoryStore(tempDir);
  const provider = new FakeProvider([
    "# Bot Calibration Profile\n\n- Challenge more when the author simplifies another person.\n- Follow up on attraction mixed with discomfort.",
  ]);
  const agent = new StoryAgent(store, provider, () => "2026-05-09T00:00:00.000Z");

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
```

- [ ] **Step 3: Run tests and verify they fail**

Run:

```bash
/Users/orcametgoldfish/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vitest/vitest.mjs run src/agent/storyAgent.test.ts
```

Expected: FAIL because the new agent methods and prompts do not exist.

- [ ] **Step 4: Create friend conversation profile prompt**

Create `src/agent/voicePrompts.ts` with:

```ts
export const FRIEND_CONVERSATION_PROFILE_SYSTEM_PROMPT = `
You create a private Friend Conversation Style Profile from pasted close-friend chat excerpts.

The goal is not to imitate a person exactly. The goal is to extract reusable conversational instincts that help a story interview chatbot talk with the author in a familiar, useful way.

Privacy rules:
- Do not summarize gossip, secrets, names, locations, or private events.
- Do not preserve exact private quotes unless they are generic and non-identifying.
- Convert private examples into reusable patterns.
- Treat the samples as conversation-style guidance only, never as story material.

Learn fixed dimensions:
- Emotional support: how the friend comforts, validates, softens, or stays with feelings.
- Follow-up questions: what the friend asks next, how they ask why, when they ask one sharp question vs several gentle ones.
- Challenge / pushback: how the friend calls out blind spots without making the author shut down.
- Attention patterns: what the friend notices, including contradictions, attraction mixed with discomfort, shame, avoidance, political tension, humor, overreaction, or body reactions.
- Rhythm: response length, pacing, mirroring, whether they pause before analysis.
- Humor / familiarity: playful, blunt, sarcastic, tender, intimate, casual, or teasing moves.
- Boundaries: what the chatbot must not copy.

Also extract flexible patterns:
- Discovered patterns that do not fit the fixed dimensions.
- Reusable behavioral instructions for future story interviews.
- Example moves that show preferred behavior without exposing private facts.

Return Markdown exactly with these headings:
# Friend Conversation Style Profile
## Core Dimensions
### Emotional Support
### Follow-Up Questions
### Challenge / Pushback
### Attention Patterns
### Rhythm
### Humor / Familiarity
### Boundaries
## Discovered Patterns
## Reusable Behavioral Instructions
## Example Moves
`.trim();
```

- [ ] **Step 5: Add bot calibration prompt**

In the same file:

```ts
export const BOT_CALIBRATION_SYSTEM_PROMPT = `
You create a private Bot Calibration Profile from the author's comments on selected chatbot responses.

The author is teaching the story interview chatbot how to interview better. Extract reusable guidance about what the chatbot should do differently in future conversations.

Rules:
- Do not treat the selected response or the author's comment as story material.
- Focus on interview behavior: when to challenge, when to follow up, where to slow down, what emotional contradictions to notice, and what response style the author prefers.
- Preserve concrete instructions when they are useful.
- Generalize from the selected response into future behavior.
- Keep guidance specific enough to affect future replies.

Return Markdown with:
# Bot Calibration Profile
## Challenge Preferences
## Follow-Up Preferences
## Missed Signals To Notice
## Response Style Adjustments
## Things To Avoid
## Concrete Future Instructions
`.trim();
```

- [ ] **Step 6: Implement agent methods**

In `src/agent/storyAgent.ts`, add:

```ts
interface BotResponseFeedbackInput {
  storyId: string;
  assistantMessageId: string;
  assistantResponse: string;
  comment: string;
}
```

Then add:

```ts
async learnFriendConversationStyle(rawChat: string): Promise<AgentResult> {
  await this.store.appendFriendConversationSample({
    id: `friend-conversation-${this.now()}-${Math.random().toString(36).slice(2, 8)}`,
    rawText: rawChat,
    createdAt: this.now(),
  });

  const existingProfile = await this.store.readFriendConversationProfile();
  const reply = await this.llm.complete({
    system: FRIEND_CONVERSATION_PROFILE_SYSTEM_PROMPT,
    messages: [
      { role: "user", content: existingProfile ? `Existing profile:\n${existingProfile}` : "No existing profile yet." },
      { role: "user", content: `New friend chat excerpts:\n${rawChat}` },
    ],
  });

  const savedPath = await this.store.saveFriendConversationProfile(reply);
  return { reply, savedPath };
}

async calibrateBotResponse(input: BotResponseFeedbackInput): Promise<AgentResult> {
  await this.store.appendBotResponseFeedback({
    id: `bot-feedback-${this.now()}-${Math.random().toString(36).slice(2, 8)}`,
    storyId: input.storyId,
    assistantMessageId: input.assistantMessageId,
    assistantResponse: input.assistantResponse,
    comment: input.comment,
    createdAt: this.now(),
  });

  const existingProfile = await this.store.readBotCalibrationProfile();
  const reply = await this.llm.complete({
    system: BOT_CALIBRATION_SYSTEM_PROMPT,
    messages: [
      { role: "user", content: existingProfile ? `Existing bot calibration profile:\n${existingProfile}` : "No existing bot calibration profile yet." },
      {
        role: "user",
        content: `Selected assistant response:\n${input.assistantResponse}\n\nAuthor feedback:\n${input.comment}`,
      },
    ],
  });

  const savedPath = await this.store.saveBotCalibrationProfile(reply);
  return { reply, savedPath };
}
```

- [ ] **Step 7: Run tests and verify they pass**

Run the same StoryAgent test command. Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/agent/storyAgent.ts src/agent/storyAgent.test.ts src/agent/voicePrompts.ts
git commit -m "feat: distill conversation learning profiles"
```

---

## Task 3: Inject Learning Profiles Into Interviews

**Files:**
- Modify: `src/agent/prompts.ts`
- Modify: `src/agent/storyAgent.ts`
- Modify: `src/agent/storyAgent.test.ts`
- Modify: `src/llm/fakeProvider.ts`

- [ ] **Step 1: Write the failing injection test**

Add this test to `src/agent/storyAgent.test.ts`:

```ts
it("uses friend conversation and bot calibration profiles when interviewing", async () => {
  const store = new FileStoryStore(tempDir);
  await store.saveFriendConversationProfile("# Friend Conversation Style Profile\n\nAsk one precise follow-up.");
  await store.saveBotCalibrationProfile("# Bot Calibration Profile\n\nChallenge more when I simplify people.");
  const provider = new FakeProvider(["What made your reaction feel bigger than the event itself?"]);
  const agent = new StoryAgent(store, provider, () => "2026-05-09T00:00:00.000Z");

  await agent.startStory("story-voice", "I met a right-wing man who was obsessed with me.");

  expect(provider.requests[0].system).toContain("Ask one precise follow-up");
  expect(provider.requests[0].system).toContain("Challenge more when I simplify people");
});
```

If `FakeProvider` does not expose requests, update `src/llm/fakeProvider.ts`:

```ts
readonly requests: LlmRequest[] = [];
```

and push each request at the start of `complete()`.

- [ ] **Step 2: Run and verify failure**

Run:

```bash
/Users/orcametgoldfish/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vitest/vitest.mjs run src/agent/storyAgent.test.ts
```

Expected: FAIL because the interview prompt is static.

- [ ] **Step 3: Add prompt builder**

In `src/agent/prompts.ts`, add:

```ts
export function interviewSystemPrompt(friendConversationProfile: string, botCalibrationProfile: string): string {
  const sections = [INTERVIEW_SYSTEM_PROMPT];

  if (friendConversationProfile.trim()) {
    sections.push(`Friend Conversation Style Profile:
${friendConversationProfile.trim()}

Use this to shape emotional support, follow-up questions, challenge style, attention patterns, rhythm, and humor. Do not quote, reveal, or treat private friend chats as story material.`);
  }

  if (botCalibrationProfile.trim()) {
    sections.push(`Bot Calibration Profile:
${botCalibrationProfile.trim()}

Use this to improve your interviewing behavior. Do not treat the author's meta-feedback as story material.`);
  }

  return sections.join("\n\n");
}
```

- [ ] **Step 4: Use prompt builder in chat methods**

In `startStory()` and `chat()`, replace `system: INTERVIEW_SYSTEM_PROMPT` with:

```ts
system: interviewSystemPrompt(
  await this.store.readFriendConversationProfile(),
  await this.store.readBotCalibrationProfile(),
),
```

- [ ] **Step 5: Return assistant message IDs**

Extend `AgentResult`:

```ts
export interface AgentResult {
  reply: string;
  savedPath?: string;
  assistantMessageId?: string;
}
```

In `startStory()` and `chat()`, create the assistant message once:

```ts
const assistantMessage = this.message("assistant", reply);
await this.store.appendMessage(storyId, assistantMessage);
return { reply, assistantMessageId: assistantMessage.id };
```

- [ ] **Step 6: Run tests and verify pass**

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/agent/prompts.ts src/agent/storyAgent.ts src/agent/storyAgent.test.ts src/llm/fakeProvider.ts
git commit -m "feat: apply conversation learning to interviews"
```

---

## Task 4: Add Conversation Learning API Routes

**Files:**
- Modify: `src/web/server.ts`

- [ ] **Step 1: Extend API body**

In `src/web/server.ts`, extend `ApiBody`:

```ts
rawChat?: string;
assistantMessageId?: string;
assistantResponse?: string;
comment?: string;
```

- [ ] **Step 2: Reuse one store instance**

Replace:

```ts
const agent = new StoryAgent(new FileStoryStore(process.cwd()), createLlmProvider());
```

with:

```ts
const store = new FileStoryStore(process.cwd());
const agent = new StoryAgent(store, createLlmProvider());
```

- [ ] **Step 3: Add friend style routes**

Add:

```ts
if (request.method === "POST" && request.url === "/api/friend-conversation-style") {
  const body = await readJson(request);
  sendJson(response, await agent.learnFriendConversationStyle(required(body.rawChat, "rawChat")));
  return;
}

if (request.method === "GET" && request.url === "/api/friend-conversation-style") {
  sendJson(response, { profile: await store.readFriendConversationProfile() });
  return;
}
```

- [ ] **Step 4: Add bot feedback routes**

Add:

```ts
if (request.method === "POST" && request.url === "/api/bot-feedback") {
  const body = await readJson(request);
  sendJson(
    response,
    await agent.calibrateBotResponse({
      storyId: required(body.storyId, "storyId"),
      assistantMessageId: required(body.assistantMessageId, "assistantMessageId"),
      assistantResponse: required(body.assistantResponse, "assistantResponse"),
      comment: required(body.comment, "comment"),
    }),
  );
  return;
}

if (request.method === "GET" && request.url === "/api/bot-feedback") {
  sendJson(response, { profile: await store.readBotCalibrationProfile() });
  return;
}
```

- [ ] **Step 5: Manual route check**

Run the UI server, then:

```bash
curl -sS -X POST http://127.0.0.1:5173/api/friend-conversation-style \
  -H 'Content-Type: application/json' \
  -d '{"rawChat":"Friend: you are joking, but I think this actually hurt you."}'
```

Expected: JSON with `reply` and `savedPath`.

Then:

```bash
curl -sS -X POST http://127.0.0.1:5173/api/bot-feedback \
  -H 'Content-Type: application/json' \
  -d '{"storyId":"story-manual","assistantMessageId":"assistant-1","assistantResponse":"What happened next?","comment":"Ask why I felt both attracted and uncomfortable before moving on."}'
```

Expected: JSON with `reply` and `savedPath`.

- [ ] **Step 6: Commit**

```bash
git add src/web/server.ts
git commit -m "feat: add conversation learning APIs"
```

---

## Task 5: Add Friend Style UI Space

**Files:**
- Modify: `src/web/messageAppHtml.ts`
- Modify: `src/web/messageAppHtml.test.ts`

- [ ] **Step 1: Write failing UI test**

Add:

```ts
it("includes a separate friend style learning action", () => {
  const html = messageAppHtml();

  expect(html).toContain('data-command="friendStyle"');
  expect(html).toContain("/api/friend-conversation-style");
  expect(html).toContain("Paste friend chat excerpts");
});
```

- [ ] **Step 2: Run and verify failure**

Run:

```bash
/Users/orcametgoldfish/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vitest/vitest.mjs run src/web/messageAppHtml.test.ts
```

Expected: FAIL because the UI has no friend style action.

- [ ] **Step 3: Add the button**

In the actions row:

```html
<button type="button" data-command="friendStyle">Friend Style</button>
```

- [ ] **Step 4: Add the submit behavior**

In the command click handler:

```js
if (command === "friendStyle") {
  pendingCommand = "friendStyle";
  inputEl.placeholder = "Paste friend chat excerpts. I’ll learn conversational patterns, not story material...";
  inputEl.focus();
  return;
}
```

Before the existing `runCommand()` path:

```js
if (pendingCommand === "friendStyle") {
  pendingCommand = null;
  await learnFriendStyle(content);
  return;
}
```

Add:

```js
async function learnFriendStyle(rawChat) {
  addBubble("author", "/friend style\n" + rawChat);
  addBubble("assistant", "Learning friend conversation style...");
  const thinking = messagesEl.lastElementChild;
  try {
    const data = await post("/api/friend-conversation-style", { rawChat });
    thinking.querySelector(".bubble").textContent =
      data.reply + (data.savedPath ? "\n\nSaved: " + data.savedPath : "");
  } catch (error) {
    thinking.querySelector(".bubble").textContent = error.message;
  }
}
```

- [ ] **Step 5: Run UI test and verify pass**

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/web/messageAppHtml.ts src/web/messageAppHtml.test.ts
git commit -m "feat: add friend style learning UI"
```

---

## Task 6: Add Selected-Response Bot Feedback UI Space

**Files:**
- Modify: `src/web/messageAppHtml.ts`
- Modify: `src/web/messageAppHtml.test.ts`

- [ ] **Step 1: Write failing UI test**

Add:

```ts
it("includes selected-response bot feedback controls", () => {
  const html = messageAppHtml();

  expect(html).toContain('data-command="botFeedback"');
  expect(html).toContain("/api/bot-feedback");
  expect(html).toContain("selectedAssistantMessage");
  expect(html).toContain("Give feedback on this response");
});
```

- [ ] **Step 2: Run and verify failure**

Expected: FAIL because no selected-response feedback controls exist.

- [ ] **Step 3: Track assistant messages in the UI**

Change `addBubble` signature:

```js
function addBubble(role, content, metadata = {}) {
```

Inside it, after creating `bubble`:

```js
if (metadata.messageId) row.dataset.messageId = metadata.messageId;
if (role === "assistant" && metadata.feedbackEnabled) {
  const feedbackButton = document.createElement("button");
  feedbackButton.type = "button";
  feedbackButton.className = "bubble-feedback";
  feedbackButton.textContent = "Give feedback on this response";
  feedbackButton.addEventListener("click", () => {
    selectedAssistantMessage = {
      id: metadata.messageId,
      content,
    };
    pendingCommand = "botFeedback";
    inputEl.placeholder = "Tell me what this response should have done differently...";
    inputEl.focus();
  });
  row.appendChild(feedbackButton);
}
```

Add state:

```js
let selectedAssistantMessage = null;
```

- [ ] **Step 4: Attach feedback buttons after assistant replies**

In `sendMessage()`, after receiving `data`, replace the thinking row content and mark it:

```js
thinking.dataset.messageId = data.assistantMessageId || "";
thinking.querySelector(".bubble").textContent = data.reply;
if (data.assistantMessageId) {
  addFeedbackButton(thinking, data.assistantMessageId, data.reply);
}
```

Use a helper instead of duplicating button creation:

```js
function addFeedbackButton(row, messageId, content) {
  const feedbackButton = document.createElement("button");
  feedbackButton.type = "button";
  feedbackButton.className = "bubble-feedback";
  feedbackButton.textContent = "Give feedback on this response";
  feedbackButton.addEventListener("click", () => {
    selectedAssistantMessage = { id: messageId, content };
    pendingCommand = "botFeedback";
    inputEl.placeholder = "Tell me what this response should have done differently...";
    inputEl.focus();
  });
  row.appendChild(feedbackButton);
}
```

- [ ] **Step 5: Add Bot Feedback action**

Add an action button:

```html
<button type="button" data-command="botFeedback">Bot Feedback</button>
```

In the click handler:

```js
if (command === "botFeedback") {
  pendingCommand = "botFeedback";
  inputEl.placeholder = selectedAssistantMessage
    ? "Tell me what this selected response should have done differently..."
    : "No response selected. Describe which recent bot response you mean and what should change...";
  inputEl.focus();
  return;
}
```

- [ ] **Step 6: Submit bot feedback**

Before `runCommand()`:

```js
if (pendingCommand === "botFeedback") {
  const selected = selectedAssistantMessage || { id: "manual-reference", content: "User described the response manually." };
  pendingCommand = null;
  await sendBotFeedback(selected, content);
  selectedAssistantMessage = null;
  return;
}
```

Add:

```js
async function sendBotFeedback(selected, comment) {
  addBubble("author", "/bot feedback\n" + comment);
  addBubble("assistant", "Updating bot calibration...");
  const thinking = messagesEl.lastElementChild;
  try {
    const data = await post("/api/bot-feedback", {
      storyId,
      assistantMessageId: selected.id,
      assistantResponse: selected.content,
      comment,
    });
    thinking.querySelector(".bubble").textContent =
      data.reply + (data.savedPath ? "\n\nSaved: " + data.savedPath : "");
  } catch (error) {
    thinking.querySelector(".bubble").textContent = error.message;
  }
}
```

- [ ] **Step 7: Add minimal button styling**

Add:

```css
.bubble-feedback {
  align-self: flex-end;
  border: 0;
  background: transparent;
  color: #6e6e73;
  cursor: pointer;
  font-size: 12px;
  margin: 3px 8px 0;
  padding: 2px;
}

.assistant {
  align-items: flex-start;
  flex-direction: column;
}
```

- [ ] **Step 8: Run UI test and verify pass**

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/web/messageAppHtml.ts src/web/messageAppHtml.test.ts
git commit -m "feat: add selected bot response feedback"
```

---

## Task 7: Documentation and Full Verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Document friend style**

Add:

```md
### Friend Style

Click `Friend Style` to paste excerpts from close-friend chats.
The app stores raw excerpts locally in `voice/friend-conversation-samples.jsonl` and distills them into `voice/friend-conversation-profile.md`.
The profile captures support style, follow-up question style, challenge style, attention patterns, rhythm, humor, discovered patterns, reusable instructions, and example moves.
The story chatbot uses the profile as conversation guidance only. It should not quote or reveal private friend messages.
```

- [ ] **Step 2: Document bot feedback**

Add:

```md
### Bot Feedback

Click `Give feedback on this response` under a chatbot message, or click `Bot Feedback`, to tell the app how the chatbot should have responded differently.
The app stores selected-response feedback locally in `voice/bot-response-feedback.jsonl` and distills it into `voice/bot-calibration-profile.md`.
This profile changes future interviewing behavior, such as when to challenge, what to follow up on, and what signals the chatbot should notice.
```

- [ ] **Step 3: Run all tests**

```bash
/Users/orcametgoldfish/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vitest/vitest.mjs run
```

Expected: all tests pass.

- [ ] **Step 4: Run TypeScript build**

```bash
./node_modules/.bin/tsc -b
```

Expected: no output and exit code `0`.

- [ ] **Step 5: Manual app check**

Start:

```bash
TRAVEL_STORY_PROVIDER=ollama OLLAMA_MODEL=qwen2.5:7b /Users/orcametgoldfish/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node dist/cli.js ui
```

Open `http://127.0.0.1:5173/`.

Check:
- Click `Friend Style`.
- Paste a short friend-chat excerpt.
- Press Enter.
- Confirm a structured Friend Conversation Style Profile is saved.
- Start a story and get an assistant reply.
- Click `Give feedback on this response`.
- Enter a comment about what the bot should have challenged or followed up on.
- Confirm a Bot Calibration Profile is saved.
- Send another story message and confirm the new guidance affects the next response without quoting private memory.

- [ ] **Step 6: Commit**

```bash
git add README.md
git commit -m "docs: explain conversation learning memory"
```

---

## Self-Review

- Spec coverage: The plan covers friend conversation style, flexible profile extraction, model-discovered dimensions, reusable examples, selected-response bot feedback, storage, API, prompt injection, UI, documentation, and verification.
- Privacy coverage: Raw friend chats and bot feedback stay local, and only distilled profiles enter future prompts.
- Separation coverage: Friend style, bot calibration, story drafting feedback, and reader feedback remain separate concepts.
- Scope check: This is one coherent memory/calibration feature, implemented in incremental testable tasks.
- Type consistency: `FriendConversationSample`, `BotResponseFeedback`, `learnFriendConversationStyle`, `calibrateBotResponse`, `/api/friend-conversation-style`, and `/api/bot-feedback` are named consistently across tasks.
