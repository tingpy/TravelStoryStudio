import type { LlmProvider, LlmRequest } from "./types";

export class FakeLlmProvider implements LlmProvider {
  public readonly requests: LlmRequest[] = [];

  constructor(private readonly responses: string[] = ["Tell me what made that moment feel charged."]) {}

  async complete(request: LlmRequest): Promise<string> {
    this.requests.push(request);
    return this.responses[Math.min(this.requests.length - 1, this.responses.length - 1)];
  }
}
