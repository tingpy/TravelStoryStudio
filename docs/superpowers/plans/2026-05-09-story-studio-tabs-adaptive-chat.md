# Story Studio Tabs And Adaptive Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the local UI into tabbed workspaces and make Story Room behave like an active friend/journaling room that does not reply to every fragment.

**Architecture:** Keep the current local Node server and file store. Add note-only story persistence plus an explicit respond endpoint. Rebuild the browser UI into four tabs above the workspace: Story Room, Draft Studio, Feedback, and Memory. Story Room schedules adaptive replies; other tabs keep separate local chatboxes and call existing profile/draft endpoints.

**Tech Stack:** TypeScript, Node HTTP server, local JSONL/Markdown storage, current LLM provider abstraction, plain HTML/CSS/JS, Vitest.

---

## Task 1: Note-Only Story Flow

**Files:**
- Modify: `src/agent/storyAgent.ts`
- Modify: `src/agent/storyAgent.test.ts`
- Modify: `src/web/server.ts`

- [ ] Add tests proving `addStoryNote(storyId, content, createStory)` saves an author message without calling the LLM, and `respondToStory(storyId)` later saves one assistant response.
- [ ] Implement `addStoryNote()` and `respondToStory()` on `StoryAgent`.
- [ ] Add `POST /api/note` and `POST /api/respond` routes.
- [ ] Run `vitest run src/agent/storyAgent.test.ts` and `tsc -b`.

## Task 2: Tabbed UI Shell

**Files:**
- Modify: `src/web/messageAppHtml.ts`
- Modify: `src/web/messageAppHtml.test.ts`

- [ ] Add tests for tab buttons: Story Room, Draft Studio, Feedback, Memory.
- [ ] Add separate message containers per tab.
- [ ] Move tabs above the workspace content.
- [ ] Keep left sidebar story list, rename/delete/new chat controls.

## Task 3: Adaptive Story Room Replies

**Files:**
- Modify: `src/web/messageAppHtml.ts`
- Modify: `src/web/messageAppHtml.test.ts`

- [ ] Add tests for `Ask Now`, `Keep Listening`, `/api/note`, `/api/respond`, and adaptive scheduling strings.
- [ ] Story Room sends notes to `/api/note` without immediate LLM reply.
- [ ] Schedule a reply after 10 seconds by default.
- [ ] Schedule faster replies for direct questions and tension markers.
- [ ] `Ask Now` calls `/api/respond`.
- [ ] `Keep Listening` cancels the pending response.

## Task 4: Draft, Feedback, And Memory Workspaces

**Files:**
- Modify: `src/web/messageAppHtml.ts`
- Modify: `src/web/messageAppHtml.test.ts`

- [ ] Draft Studio has its own chatbox and buttons for angle, outline, draft, edit, title.
- [ ] Feedback has specific-response and general-advice modes.
- [ ] Feedback shows the updated profile/prompt layer after absorption.
- [ ] Memory has Friend Style, Bot Calibration, and Reflection Skills inputs.
- [ ] Use existing `/api/friend-conversation-style`, `/api/bot-feedback`, and `/api/command` endpoints where possible.

## Task 5: Verification And Commit

**Files:**
- Modify: `README.md`

- [ ] Document the tabbed UI and adaptive reply behavior.
- [ ] Run full Vitest suite.
- [ ] Run TypeScript build.
- [ ] Restart local server and smoke-check `/api/stories`.
- [ ] Commit with author `tingpy`.

---

## Self-Review

- Covers all approved requirements: tabs above workspace, different chatbox per tab, active adaptive Story Room, Feedback modes, Memory section, prompt/profile visibility, and stable profile-layer architecture.
- Keeps implementation local and avoids uploading story or memory data.
- Does not implement full WhatsApp/iMessage parsers yet; Memory provides manual paste/import surfaces first, with later file parsers left as a future enhancement.
