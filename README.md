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

## Run Terminal Chat

```bash
npm run build
node dist/cli.js chat
```

## Run Messages-Style UI With Ollama

Install Ollama and pull a local model first:

```bash
ollama pull qwen2.5:7b
```

Then run:

```bash
npm run build
TRAVEL_STORY_PROVIDER=ollama OLLAMA_MODEL=qwen2.5:7b node dist/cli.js ui
```

Open:

```text
http://127.0.0.1:5173/
```

Provider options:

```bash
export TRAVEL_STORY_PROVIDER="auto"    # auto | openai | ollama
export OLLAMA_MODEL="qwen2.5:7b"
export OLLAMA_BASE_URL="http://127.0.0.1:11434"
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
