import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createLlmProvider } from "../llm/providerFactory";
import { FileStoryStore } from "../storage/fileStore";
import { StoryAgent } from "../agent/storyAgent";
import { messageAppHtml } from "./messageAppHtml";

interface ApiBody {
  storyId?: string;
  premise?: string;
  content?: string;
  command?: string;
  rawChat?: string;
  assistantMessageId?: string;
  assistantResponse?: string;
  comment?: string;
  createStory?: boolean;
}

export function startMessageServer(options: { port?: number; host?: string } = {}): void {
  const port = options.port ?? Number(process.env.TRAVEL_STORY_PORT ?? 5173);
  const host = options.host ?? process.env.TRAVEL_STORY_HOST ?? "127.0.0.1";
  const store = new FileStoryStore(process.cwd());
  const agent = new StoryAgent(store, createLlmProvider());

  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

      if (request.method === "GET" && url.pathname === "/") {
        sendHtml(response, messageAppHtml());
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/stories") {
        sendJson(response, { stories: await store.listStories() });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/story") {
        const storyId = required(url.searchParams.get("storyId") ?? undefined, "storyId");
        sendJson(response, await store.readProject(storyId));
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/delete-story") {
        const body = await readJson(request);
        await store.deleteStory(required(body.storyId, "storyId"));
        sendJson(response, { ok: true });
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/start") {
        const body = await readJson(request);
        const result = await agent.startStory(required(body.storyId, "storyId"), required(body.premise, "premise"));
        sendJson(response, result);
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/chat") {
        const body = await readJson(request);
        const result = await agent.chat(required(body.storyId, "storyId"), required(body.content, "content"));
        sendJson(response, result);
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/note") {
        const body = await readJson(request);
        const result = await agent.addStoryNote(
          required(body.storyId, "storyId"),
          required(body.content, "content"),
          body.createStory === true,
        );
        sendJson(response, result);
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/respond") {
        const body = await readJson(request);
        sendJson(response, await agent.respondToStory(required(body.storyId, "storyId")));
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/command") {
        const body = await readJson(request);
        const storyId = required(body.storyId, "storyId");
        const command = required(body.command, "command");
        if (command === "outline") sendJson(response, await agent.outline(storyId));
        else if (command === "draft") sendJson(response, await agent.draft(storyId));
        else if (command === "feedback") sendJson(response, await agent.feedback(storyId, body.content ?? ""));
        else if (command === "export") sendJson(response, await agent.exportMarkdown(storyId));
        else sendError(response, 400, `Unknown command: ${command}`);
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/friend-conversation-style") {
        const body = await readJson(request);
        sendJson(response, await agent.learnFriendConversationStyle(required(body.rawChat, "rawChat")));
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/friend-conversation-style") {
        sendJson(response, { profile: await store.readFriendConversationProfile() });
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/bot-feedback") {
        const body = await readJson(request);
        sendJson(
          response,
          await agent.calibrateBotResponse({
            storyId: required(body.storyId, "storyId"),
            assistantMessageId: required(body.assistantMessageId, "assistantMessageId"),
            assistantResponse: required(body.assistantResponse, "assistantResponse"),
            comment: required(body.comment, "comment"),
          }),
        );
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/bot-feedback") {
        sendJson(response, { profile: await store.readBotCalibrationProfile() });
        return;
      }

      sendError(response, 404, "Not found");
    } catch (error) {
      sendError(response, 500, error instanceof Error ? error.message : String(error));
    }
  });

  server.listen(port, host, () => {
    console.log(`Travel Story Studio running at http://${host}:${port}/`);
  });
}

async function readJson(request: IncomingMessage): Promise<ApiBody> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? (JSON.parse(raw) as ApiBody) : {};
}

function required(value: string | undefined, name: string): string {
  if (!value?.trim()) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function sendHtml(response: ServerResponse, body: string): void {
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.end(body);
}

function sendJson(response: ServerResponse, body: unknown): void {
  response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function sendError(response: ServerResponse, status: number, error: string): void {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify({ error }));
}
