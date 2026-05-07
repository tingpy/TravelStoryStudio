# Travel Story Studio

A local OpenAI-powered story agent that helps turn travel encounters, culture shock, cultural friction, romance, and heard stories into publishable drafts.

The first version is a terminal chat agent, not a webpage. It stores story workspaces locally and uses the OpenAI API for the interview chatbot and writing agent.

## Setup

```bash
npm install
export OPENAI_API_KEY="your_api_key_here"
```

Optional model override:

```bash
export TRAVEL_STORY_MODEL="gpt-5.4-mini"
```

## Run

```bash
npm run build
node dist/cli.js chat
```

During chat, use:

```text
/outline
/draft
/feedback
/export markdown
/help
/quit
```

## Local Files

Story data is saved under:

```text
stories/<story-id>/
  premise.md
  chat.jsonl
  notes.json
  outline.md
  drafts/
  feedback/
  exports/
```

Shared voice memory will live under:

```text
voice/
  friend-voice-pack.md
  author-voice-profile.md
```
