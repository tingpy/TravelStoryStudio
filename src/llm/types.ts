export interface LlmMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LlmRequest {
  system: string;
  messages: LlmMessage[];
}

export interface LlmProvider {
  complete(request: LlmRequest): Promise<string>;
}
