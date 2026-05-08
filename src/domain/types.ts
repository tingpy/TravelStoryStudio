export type StoryLens =
  | "culture_conflict"
  | "political_tension"
  | "romantic_encounter"
  | "cultural_friction_in_romance"
  | "heard_story"
  | "mixed"
  | "something_else";

export type StoryStage =
  | "premise"
  | "interview"
  | "retrospective"
  | "outline"
  | "draft"
  | "revision"
  | "exported"
  | "feedback";

export type ChatRole = "author" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface StoryNote {
  id: string;
  kind: "event" | "emotion" | "tension" | "reader_hook" | "open_question";
  text: string;
  sourceMessageId?: string;
}

export interface StoryOutline {
  titleOptions: string[];
  centralTension: string;
  editorialAngle: string;
  sceneBeats: string[];
  emotionalArc: string[];
  readerHooks: string[];
  sensitivities: string[];
  serialization: SerializedPlan;
}

export interface SerializedPlan {
  recommended: boolean;
  parts: SerializedPart[];
}

export interface SerializedPart {
  partNumber: number;
  workingTitle: string;
  turn: string;
  hookEnding: string;
}

export interface DraftArtifact {
  id: string;
  kind: "outline" | "draft" | "revision" | "export";
  title: string;
  content: string;
  createdAt: string;
}

export interface FriendConversationStyleProfile {
  rawSampleCount: number;
  profileMarkdown?: string;
  dimensions: string[];
  discoveredPatterns: string[];
  reusableInstructions: string[];
  exampleMoves: string[];
  updatedAt?: string;
}

export interface BotCalibrationProfile {
  feedbackCount: number;
  profileMarkdown?: string;
  challengePreferences: string[];
  followUpPreferences: string[];
  missedSignals: string[];
  responseStyleAdjustments: string[];
  avoidances: string[];
  concreteInstructions: string[];
  updatedAt?: string;
}

export interface FeedbackImport {
  id: string;
  source: "friend_chat" | "reader_comments";
  rawText: string;
  summary?: FeedbackSummary;
  createdAt: string;
}

export interface FeedbackSummary {
  suggestedEdits: string[];
  emotionalReactions: string[];
  confusion: string[];
  compellingMoments: string[];
  warnings: string[];
  readerQuestions: string[];
}

export interface StoryProject {
  id: string;
  title: string;
  premise: string;
  stage: StoryStage;
  messages: ChatMessage[];
  notes: StoryNote[];
  lenses: StoryLens[];
  outline?: StoryOutline;
  artifacts: DraftArtifact[];
  feedback: FeedbackImport[];
  friendConversationStyle: FriendConversationStyleProfile;
  botCalibration: BotCalibrationProfile;
  createdAt: string;
  updatedAt: string;
}
