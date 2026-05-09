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

The UI is organized into tabs above the main workspace:

- `Story Room` is the active friend/journaling space. Sending a fragment saves it immediately without forcing a reply every time. The bot responds after an adaptive pause, sooner for direct questions or tension markers, or immediately with `Ask Now`. `Keep Listening` cancels the pending reply.
- `Draft Studio` is a separate chatbox for story angle, outline, draft, edit, and title work.
- `Feedback` is a separate chatbox for specific comments on a selected bot response or general advice about the whole chat/draft. After feedback is absorbed, it shows the updated prompt/profile layer.
- `Memory` is a separate chatbox for Friend Style imports and Reflection Skills.

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
  friend-conversation-samples.jsonl
  friend-conversation-profile.md
  bot-response-feedback.jsonl
  bot-calibration-profile.md
```

### Friend Style

Click `Friend Style` to paste excerpts from close-friend chats. The app stores raw excerpts locally in
`voice/friend-conversation-samples.jsonl` and distills them into
`voice/friend-conversation-profile.md`.

The profile captures support style, follow-up question style, challenge style, attention patterns,
rhythm, humor, discovered patterns, reusable instructions, and example moves. The story chatbot uses
the profile as conversation guidance only. It should not quote or reveal private friend messages.

### Bot Feedback

Click `Give feedback on this response` under a chatbot message, or click `Bot Feedback`, to tell the app
how the chatbot should have responded differently.

The app stores selected-response feedback locally in `voice/bot-response-feedback.jsonl` and distills it
into `voice/bot-calibration-profile.md`. This profile changes future interviewing behavior, such as when
to challenge, what to follow up on, and what signals the chatbot should notice.
