import type { ChatMessage } from "../domain/types";
import type { LlmMessage, LlmProvider } from "../llm/types";
import { FileStoryStore } from "../storage/fileStore";
import {
  DRAFT_SYSTEM_PROMPT,
  FEEDBACK_SYSTEM_PROMPT,
  INTERVIEW_SYSTEM_PROMPT,
  OUTLINE_SYSTEM_PROMPT,
} from "./prompts";

export interface AgentResult {
  reply: string;
  savedPath?: string;
}

export class StoryAgent {
  constructor(
    private readonly store: FileStoryStore,
    private readonly llm: LlmProvider,
    private readonly now: () => string = () => new Date().toISOString(),
  ) {}

  async startStory(storyId: string, premise: string): Promise<AgentResult> {
    await this.store.createStory(storyId, premise);
    await this.store.appendMessage(storyId, this.message("author", premise));
    const reply = await this.llm.complete({
      system: INTERVIEW_SYSTEM_PROMPT,
      messages: [{ role: "user", content: premise }],
    });
    await this.store.appendMessage(storyId, this.message("assistant", reply));
    return { reply };
  }

  async chat(storyId: string, content: string): Promise<AgentResult> {
    await this.store.appendMessage(storyId, this.message("author", content));
    const reply = await this.llm.complete({
      system: INTERVIEW_SYSTEM_PROMPT,
      messages: toLlmMessages(await this.store.readMessages(storyId)),
    });
    await this.store.appendMessage(storyId, this.message("assistant", reply));
    return { reply };
  }

  async outline(storyId: string): Promise<AgentResult> {
    const reply = await this.llm.complete({
      system: OUTLINE_SYSTEM_PROMPT,
      messages: await this.contextMessages(storyId),
    });
    await this.store.saveOutline(storyId, reply);
    return { reply, savedPath: this.store.paths(storyId).outline };
  }

  async draft(storyId: string): Promise<AgentResult> {
    const reply = await this.llm.complete({
      system: DRAFT_SYSTEM_PROMPT,
      messages: await this.contextMessages(storyId),
    });
    const savedPath = await this.store.saveDraft(storyId, `draft-${Date.now()}.md`, reply);
    return { reply, savedPath };
  }

  async feedback(storyId: string, rawFeedback: string): Promise<AgentResult> {
    const reply = await this.llm.complete({
      system: FEEDBACK_SYSTEM_PROMPT,
      messages: [
        ...(await this.contextMessages(storyId)),
        { role: "user", content: `Feedback to analyze:\n${rawFeedback}` },
      ],
    });
    const savedPath = await this.store.saveFeedback(storyId, `feedback-${Date.now()}.md`, reply);
    return { reply, savedPath };
  }

  async exportMarkdown(storyId: string): Promise<AgentResult> {
    const reply = await this.llm.complete({
      system: DRAFT_SYSTEM_PROMPT,
      messages: [
        ...(await this.contextMessages(storyId)),
        { role: "user", content: "Export the latest story as clean Markdown for external publishing." },
      ],
    });
    const savedPath = await this.store.saveExport(storyId, "story.md", reply);
    return { reply, savedPath };
  }

  private async contextMessages(storyId: string): Promise<LlmMessage[]> {
    const premise = await this.store.readPremise(storyId);
    const messages = await this.store.readMessages(storyId);
    return [{ role: "user", content: `Story premise:\n${premise}` }, ...toLlmMessages(messages)];
  }

  private message(role: ChatMessage["role"], content: string): ChatMessage {
    return {
      id: `${role}-${this.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role,
      content,
      createdAt: this.now(),
    };
  }
}

function toLlmMessages(messages: ChatMessage[]): LlmMessage[] {
  return messages.map((message) => ({
    role: message.role === "author" ? "user" : "assistant",
    content: message.content,
  }));
}
