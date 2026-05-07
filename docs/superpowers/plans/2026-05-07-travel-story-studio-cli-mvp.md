# Travel Story Studio CLI MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local terminal-based story agent that uses the OpenAI API for the chatbot and writing agent while saving story workspaces as local files.

**Architecture:** Use TypeScript with a small CLI layer, local file storage, a provider-agnostic LLM interface, an OpenAI Responses API provider, and deterministic fake providers for tests. Rule-based code handles commands, persistence, stage transitions, and export formatting; the LLM handles conversation, outline, draft, revision, and feedback language.

**Tech Stack:** TypeScript, Node.js, Vitest, OpenAI Responses API via native `fetch`, local filesystem storage.

---

## Tasks

### Task 1: CLI Package Foundation

- Convert package scripts to `build`, `test`, and `start`.
- Compile TypeScript from `src` to `dist`.
- Expose `travel-story` as a bin command.
- Keep tests on source files through Vitest.

### Task 2: Local File Storage

- Store projects under `stories/<story-id>/`.
- Store shared voice memory under `voice/`.
- Save `premise.md`, `chat.jsonl`, `notes.json`, `outline.md`, `drafts/`, `feedback/`, and `exports/`.

### Task 3: LLM Provider Boundary

- Create an `LlmProvider` interface.
- Add `OpenAIProvider` using `OPENAI_API_KEY`, `TRAVEL_STORY_MODEL`, and the Responses API.
- Add `FakeLlmProvider` for tests.

### Task 4: Story Agent

- Implement message-like chat turns.
- Support `/outline`, `/draft`, `/feedback`, `/export markdown`, and `/quit`.
- Keep friend voice and author voice separate.
- Preserve honest support plus gentle challenge in prompts.

### Task 5: CLI Entrypoint

- Implement `travel-story chat`.
- Prompt for a premise when starting the first story.
- Save every user and agent turn.
- Print concise command help.

### Task 6: Verification

- Unit test storage, fake provider, agent commands, and export.
- Build with `tsc`.
- Run npm audit.
- Manually smoke test with `OPENAI_API_KEY` when available.

## Self-Review

This plan implements the approved pivot from a webpage to a local CLI agent. It keeps the original product behavior but removes the requirement to run a browser or local web server. Web UI remains future optional work.
