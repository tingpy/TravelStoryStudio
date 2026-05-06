# Travel Story Studio Design

Date: 2026-05-06

## Purpose

Build a private story studio for turning lived travel encounters, heard stories, culture shock, cultural conflict, and romantic/cross-cultural experiences into publishable writing.

The core product is not a tourist recommendation blog. It is a reflective writing companion that helps the author remember details, process emotional reactions, find the tension that makes a story worth reading, and shape the material into posts for external platforms.

## Product Direction

The first version is a journal-first private web app. It focuses on story workspaces, emotionally supportive interviewing, outline-first drafting, feedback ingestion, voice learning, and export.

The app does not include a built-in public blog in version one. Publishing happens manually on external platforms such as Instagram, Threads, Facebook, forums, newsletters, or a personal website.

## Core Flow

1. The author creates a story project with a rough premise, such as: "I met a right-wing man who became obsessed with me, but I am a leftist."
2. The chatbot identifies possible tensions from the premise, but does not lock the story type at the start.
3. While the author develops the story, the chatbot asks one natural follow-up question at a time.
4. As the story becomes clearer, the app tracks possible story lenses, such as culture shock, political tension, romantic encounter, cultural friction in romance, story heard from someone else, or mixed.
5. When the author pauses, summarizes, or signals that the main story has been told, the chatbot switches automatically into retrospective mode and offers several deeper questions. The author chooses which ones to answer.
6. The Writing Agent produces an outline first. The outline includes title ideas, central tension, scene beats, emotional arc, reader hook, editorial angle, possible sensitivities, and a single-post or serialized structure.
7. After the author approves or edits the outline, the Writing Agent drafts the story.
8. The author revises the draft and gives feedback on tone.
9. The app exports platform-ready versions for manual publishing.
10. The author can paste private friend feedback or public reader feedback back into the story workspace for analysis, revision, and future voice learning.

## Story Categories and Lenses

Story type is an emerging classification, not an up-front rigid choice.

Supported lenses include:

- Culture shock or cultural conflict
- Political or ideological tension
- Romantic encounter
- Cultural friction in romance
- Story heard from someone else
- Mixed or evolving story
- Something else

For culture shock, the final writing should lean toward a reflective cultural essay with a sharper column-like angle. It should be emotionally honest and reader-aware without becoming preachy.

For romantic encounters, the writing should shift toward travel memoir and preserve the emotional thread.

For cultural friction in romance, the app should treat it as its own mixed lens because the right questions include attraction, vulnerability, misread signals, family expectations, gender norms, language, power, public/private behavior, and differing ideas of love or respect.

## Components

### Story Workspace

A private project page for each story. It stores the premise, chat transcript, extracted notes, story lenses, outline, drafts, revisions, feedback imports, export versions, and project status.

### Interview Chatbot

A warm editor-friend that helps the author remember, process, and develop the story. It provides emotional support while also noticing narrative tension, potential reader hooks, and places where the author may need to look more honestly at their own role in the story.

### Story Lens Tracker

A lightweight analysis layer that watches the conversation and updates possible lenses, tensions, important moments, emotional reactions, unresolved questions, and possible reader hooks. It should not force a category too early.

### Writing Agent

A single coherent writing agent with modes:

- Outline mode: proposes title options, angle, structure, part breaks, hooks, sensitivities, and missing material.
- Draft mode: writes from the approved outline while keeping the chosen angle, tone, and serialization plan.
- Revision mode: responds to author edits, friend feedback, reader feedback, and tone requests.

### Friend Voice Pack

A private reference memory built from optional personal chats with close friends. It learns how the author's friends comfort, tease, ask questions, challenge, and help the author process complicated feelings.

The chatbot uses this blended close-friends voice when talking to the author. It does not imitate one specific friend.

### Author Voice Profile

A reviewable profile for the author's published writing voice. It learns from explicit feedback and implicit behavior, such as edits, kept phrases, deleted phrases, approved drafts, exported versions, and externally published versions that the author imports back into the workspace.

Friend Voice Pack and Author Voice Profile are separate:

- Friend Voice Pack controls how the chatbot talks to the author.
- Author Voice Profile controls how the final story should sound.

### Feedback Area

A private area inside each story workspace for pasted feedback from friends or readers.

Private friend feedback can be a full chat conversation, not just isolated comments. The agent should separate direct suggested edits, emotional reactions, confusion, compelling moments, warnings, and clarifications that emerge from back-and-forth discussion.

Reader feedback is manually imported in version one by pasting comments, reaction summaries, or discussion threads from external platforms.

### Export Tools

The app exports platform-ready versions, such as:

- Long-form essay
- Serialized story parts
- Short social caption
- Thread-style post
- Website Markdown

## Assistant Behavior

The chatbot should feel like a warm friend with sharp editor instincts.

It must keep these behavior rules:

1. Ask from tension. It does not ask generic travel-blog questions. It looks for cultural misunderstanding, political difference, attraction, discomfort, shame, curiosity, social pressure, surprise, or a moment where the author's reaction seems bigger than the event itself.
2. Match the story stage. If the author is still adding events, it asks one focused follow-up. If the author pauses, summarizes, or signals that the main story is told, it shifts into retrospective mode and offers several deeper question paths.
3. Highlight reader hooks. When it notices a strong moment, it can say something like: "This feels like the scene readers will remember. Want to unpack what made it uncomfortable, funny, or seductive?" It helps develop hooks without forcing clickbait.
4. Provide honest emotional support. It can validate feelings, sit with ambiguity, and respond warmly when stories touch shame, attraction, fear, loneliness, rejection, obsession, political conflict, or cultural confusion. It should not blindly agree with the author.
5. Challenge with care. When the story suggests the author may be avoiding responsibility, projecting motives, framing someone unfairly, ignoring cultural context, or missing their own part in the conflict, the chatbot can gently point this out and ask a reflective follow-up.
6. Avoid the wrong roles. It should not sound like a therapist, tourist guide, moral judge, or content-growth coach.

## Data Flow

Each story project moves through these states:

`Premise -> Interview -> Retrospective -> Outline -> Draft -> Revision -> Exported -> Feedback`

During Interview, every message is saved to the story workspace. After each author message, the app updates lightweight notes: important events, emotional reactions, unresolved tensions, possible reader hooks, and possible story lenses.

During Retrospective, the chatbot shows several deeper questions based on what it noticed. The author chooses which ones to answer.

During Outline, the Writing Agent uses the transcript, notes, story lenses, and Author Voice Profile to propose the angle and structure. The Friend Voice Pack stays separate and only influences how the chatbot talks to the author.

During Draft and Revision, the Writing Agent writes from the approved outline, then responds to edits and feedback. Explicit author feedback and observed edits can update the Author Voice Profile, but the resulting profile remains reviewable and editable.

During Feedback, the author imports private friend conversations or public reader discussion. The agent summarizes reactions and suggests revisions, future post ideas, or voice-profile updates.

## Serialization

The Writing Agent should support both single-post and multi-part story structures.

For serialized stories, it should propose:

- Part boundaries
- The emotional or narrative turn in each part
- The hook at the end of each part
- What each part should make readers wonder next
- Whether later parts should be revised based on early feedback

## Publishing Model

The app is platform-neutral. It does not publish directly and does not host public posts in version one.

The author manually publishes exported content on external platforms. The app should stay useful regardless of where the author decides to post.

Direct integrations with Instagram, Threads, Facebook, forums, or website CMS tools are out of scope for version one. Manual paste/import is the first version.

## Feedback Loop

Feedback is used in two ways:

1. Story revision. The agent suggests edits to the current story, future serialized parts, or follow-up posts.
2. Learning. The agent proposes updates to the Author Voice Profile and reader-interest notes.

Friend feedback remains private unless the author explicitly quotes or uses it in published writing.

Reader feedback is summarized for patterns, including:

- Emotional reactions
- Disagreement or debate
- Recurring questions
- Confusing sections
- Moments readers found compelling
- Which serialized parts created momentum

## Privacy and Trust

The first version should include:

- Private by default workspaces.
- Nothing public or externally posted by the app.
- Reviewable and deletable Friend Voice Pack notes.
- Reviewable and editable Author Voice Profile notes.
- Draft revision instead of heavy early sanitization.
- Optional revision-stage reminders to protect names, identifying details, screenshots, exact locations, or private messages.
- A lightweight fallback when the chatbot is unsure of mode: "Do you want to keep telling it, or should I help you unpack what it means?"

## Error Handling

The app should handle these cases:

- If the chatbot is unsure whether to ask one question or move to retrospective mode, it asks a short check-in.
- If the story lens is ambiguous, it keeps multiple possible lenses instead of forcing one.
- If imported friend or reader feedback is messy, the agent asks whether it should summarize, extract suggested edits, or compare feedback against the current draft.
- If the outline lacks enough material, the Writing Agent asks for missing details instead of drafting prematurely.
- If an export target has unknown formatting requirements, the app offers a generic long-form, short caption, thread, or Markdown export.

## Testing Priorities

The riskiest behavior is not basic UI rendering. The riskiest behavior is whether the assistant asks the right kind of questions, respects privacy, and preserves the author's voice.

Tests should cover:

- Story workspace creation from a rough premise.
- Interview mode asking one focused follow-up.
- Automatic switch from story-building to retrospective mode.
- Story lens tracking without premature classification.
- Outline generation with angle, scene beats, emotional arc, hooks, sensitivities, and serialization options.
- Draft generation from an approved outline.
- Serialized hook generation between parts.
- Friend Voice Pack and Author Voice Profile remaining separate.
- Feedback import classification for private friend chats and public reader comments.
- Export formatting for long-form, serialized, caption, thread, and Markdown outputs.
- Privacy boundaries around unpublished projects, friend chats, and voice memory.

## Version One Scope

In scope:

- Private story workspaces
- Interview chatbot
- Story lens tracking
- Writing Agent with outline, draft, and revision modes
- Friend Voice Pack
- Author Voice Profile
- Manual feedback import
- Manual export for external publishing
- Single-post and serialized story planning

Out of scope:

- Built-in public blog hosting
- Direct publishing to social media
- Direct reading from Instagram, Threads, Facebook, forums, or CMS platforms
- Multi-user collaboration
- Payments, analytics dashboards, newsletters, or public discovery
- Real model training on private chats
