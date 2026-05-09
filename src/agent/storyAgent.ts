import type { ChatMessage } from "../domain/types";
import type { LlmMessage, LlmProvider } from "../llm/types";
import { FileStoryStore } from "../storage/fileStore";
import {
  DRAFT_SYSTEM_PROMPT,
  FEEDBACK_SYSTEM_PROMPT,
  OUTLINE_SYSTEM_PROMPT,
  interviewSystemPrompt,
} from "./prompts";
import { BOT_CALIBRATION_SYSTEM_PROMPT, FRIEND_CONVERSATION_PROFILE_SYSTEM_PROMPT } from "./voicePrompts";

export interface AgentResult {
  reply: string;
  savedPath?: string;
  assistantMessageId?: string;
  authorMessageId?: string;
}

export interface BotResponseFeedbackInput {
  storyId: string;
  assistantMessageId: string;
  assistantResponse: string;
  comment: string;
}

export interface ReplyTarget {
  id: string;
  content: string;
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
      system: await this.interviewPrompt(),
      messages: [{ role: "user", content: premise }],
    });
    const assistantMessage = this.message("assistant", reply);
    await this.store.appendMessage(storyId, assistantMessage);
    return { reply, assistantMessageId: assistantMessage.id };
  }

  async chat(storyId: string, content: string): Promise<AgentResult> {
    await this.store.appendMessage(storyId, this.message("author", content));
    const reply = await this.llm.complete({
      system: await this.interviewPrompt(),
      messages: toLlmMessages(await this.store.readMessages(storyId)),
    });
    const assistantMessage = this.message("assistant", reply);
    await this.store.appendMessage(storyId, assistantMessage);
    return { reply, assistantMessageId: assistantMessage.id };
  }

  async addStoryNote(storyId: string, content: string, createStory: boolean, replyTo?: ReplyTarget): Promise<AgentResult> {
    if (createStory) {
      await this.store.createStory(storyId, content);
    }
    const authorMessage = this.message("author", content, replyTo);
    await this.store.appendMessage(storyId, authorMessage);
    return { reply: "", authorMessageId: authorMessage.id };
  }

  async respondToStory(storyId: string): Promise<AgentResult> {
    const reply = await this.llm.complete({
      system: await this.interviewPrompt(),
      messages: toLlmMessages(await this.store.readMessages(storyId)),
    });
    const assistantMessage = this.message("assistant", reply);
    await this.store.appendMessage(storyId, assistantMessage);
    return { reply, assistantMessageId: assistantMessage.id };
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
        {
          role: "user",
          content: existingProfile
            ? `Existing bot calibration profile:\n${existingProfile}`
            : "No existing bot calibration profile yet.",
        },
        {
          role: "user",
          content: `Selected assistant response:\n${input.assistantResponse}\n\nAuthor feedback:\n${input.comment}`,
        },
      ],
    });

    const savedPath = await this.store.saveBotCalibrationProfile(reply);
    return { reply, savedPath };
  }

  private async contextMessages(storyId: string): Promise<LlmMessage[]> {
    const premise = await this.store.readPremise(storyId);
    const messages = await this.store.readMessages(storyId);
    return [{ role: "user", content: `Story premise:\n${premise}` }, ...toLlmMessages(messages)];
  }

  private async interviewPrompt(): Promise<string> {
    return interviewSystemPrompt(
      await this.store.readFriendConversationProfile(),
      await this.store.readBotCalibrationProfile(),
    );
  }

  private message(role: ChatMessage["role"], content: string, replyTo?: ReplyTarget): ChatMessage {
    const message: ChatMessage = {
      id: `${role}-${this.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role,
      content,
      createdAt: this.now(),
    };
    if (replyTo) {
      message.replyToMessageId = replyTo.id;
      message.replyToContent = replyTo.content;
    }
    return message;
  }
}

function toLlmMessages(messages: ChatMessage[]): LlmMessage[] {
  return messages.map((message) => ({
    role: message.role === "author" ? "user" : "assistant",
    content:
      message.role === "author" && message.replyToContent
        ? `Replying to assistant response: "${message.replyToContent}"\n\n${message.content}`
        : message.content,
  }));
}
