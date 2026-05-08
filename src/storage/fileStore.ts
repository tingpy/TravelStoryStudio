import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ChatMessage, StoryNote, StoryProject } from "../domain/types";

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

export interface StoryWorkspacePaths {
  root: string;
  storyDir: string;
  premise: string;
  chat: string;
  notes: string;
  outline: string;
  draftsDir: string;
  feedbackDir: string;
  exportsDir: string;
  voiceDir: string;
  friendConversationSamples: string;
  friendConversationProfile: string;
  botResponseFeedback: string;
  botCalibrationProfile: string;
}

export class FileStoryStore {
  constructor(private readonly root: string = process.cwd()) {}

  paths(storyId: string): StoryWorkspacePaths {
    const storyDir = join(this.root, "stories", storyId);
    const voiceDir = join(this.root, "voice");
    return {
      root: this.root,
      storyDir,
      premise: join(storyDir, "premise.md"),
      chat: join(storyDir, "chat.jsonl"),
      notes: join(storyDir, "notes.json"),
      outline: join(storyDir, "outline.md"),
      draftsDir: join(storyDir, "drafts"),
      feedbackDir: join(storyDir, "feedback"),
      exportsDir: join(storyDir, "exports"),
      voiceDir,
      friendConversationSamples: join(voiceDir, "friend-conversation-samples.jsonl"),
      friendConversationProfile: join(voiceDir, "friend-conversation-profile.md"),
      botResponseFeedback: join(voiceDir, "bot-response-feedback.jsonl"),
      botCalibrationProfile: join(voiceDir, "bot-calibration-profile.md"),
    };
  }

  async createStory(storyId: string, premise: string): Promise<StoryWorkspacePaths> {
    const paths = this.paths(storyId);
    await mkdir(paths.draftsDir, { recursive: true });
    await mkdir(paths.feedbackDir, { recursive: true });
    await mkdir(paths.exportsDir, { recursive: true });
    await mkdir(join(this.root, "voice"), { recursive: true });
    await writeFile(paths.premise, `${premise.trim()}\n`, "utf8");
    await writeFile(paths.chat, "", "utf8");
    await writeFile(paths.notes, "[]\n", "utf8");
    return paths;
  }

  async appendMessage(storyId: string, message: ChatMessage): Promise<void> {
    const paths = this.paths(storyId);
    await mkdir(paths.storyDir, { recursive: true });
    const line = `${JSON.stringify(message)}\n`;
    await writeFile(paths.chat, line, { encoding: "utf8", flag: "a" });
  }

  async readMessages(storyId: string): Promise<ChatMessage[]> {
    const raw = await readOptionalFile(this.paths(storyId).chat);
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line) as ChatMessage);
  }

  async saveNotes(storyId: string, notes: StoryNote[]): Promise<void> {
    await writeFile(this.paths(storyId).notes, `${JSON.stringify(notes, null, 2)}\n`, "utf8");
  }

  async saveOutline(storyId: string, outline: string): Promise<void> {
    await writeFile(this.paths(storyId).outline, `${outline.trim()}\n`, "utf8");
  }

  async saveDraft(storyId: string, name: string, content: string): Promise<string> {
    const path = join(this.paths(storyId).draftsDir, name);
    await writeFile(path, `${content.trim()}\n`, "utf8");
    return path;
  }

  async saveFeedback(storyId: string, name: string, content: string): Promise<string> {
    const path = join(this.paths(storyId).feedbackDir, name);
    await writeFile(path, `${content.trim()}\n`, "utf8");
    return path;
  }

  async saveExport(storyId: string, name: string, content: string): Promise<string> {
    const path = join(this.paths(storyId).exportsDir, name);
    await writeFile(path, `${content.trim()}\n`, "utf8");
    return path;
  }

  async readPremise(storyId: string): Promise<string> {
    return (await readFile(this.paths(storyId).premise, "utf8")).trim();
  }

  async readProject(storyId: string): Promise<Pick<StoryProject, "id" | "premise" | "messages">> {
    return {
      id: storyId,
      premise: await this.readPremise(storyId),
      messages: await this.readMessages(storyId),
    };
  }

  async appendFriendConversationSample(sample: FriendConversationSample): Promise<void> {
    const paths = this.paths("voice");
    await mkdir(paths.voiceDir, { recursive: true });
    await writeFile(paths.friendConversationSamples, `${JSON.stringify(sample)}\n`, { encoding: "utf8", flag: "a" });
  }

  async readFriendConversationSamples(): Promise<FriendConversationSample[]> {
    const raw = await readOptionalFile(this.paths("voice").friendConversationSamples);
    return parseJsonLines<FriendConversationSample>(raw);
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
    return parseJsonLines<BotResponseFeedback>(raw);
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
}

async function readOptionalFile(path: string): Promise<string> {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

function parseJsonLines<T>(raw: string): T[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}
