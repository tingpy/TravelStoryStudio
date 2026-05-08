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
}

export function startMessageServer(options: { port?: number; host?: string } = {}): void {
  const port = options.port ?? Number(process.env.TRAVEL_STORY_PORT ?? 5173);
  const host = options.host ?? process.env.TRAVEL_STORY_HOST ?? "127.0.0.1";
  const agent = new StoryAgent(new FileStoryStore(process.cwd()), createLlmProvider());

  const server = createServer(async (request, response) => {
    try {
      if (request.method === "GET" && request.url === "/") {
        sendHtml(response, messageAppHtml());
        return;
      }

      if (request.method === "POST" && request.url === "/api/start") {
        const body = await readJson(request);
        const result = await agent.startStory(required(body.storyId, "storyId"), required(body.premise, "premise"));
        sendJson(response, result);
        return;
      }

      if (request.method === "POST" && request.url === "/api/chat") {
        const body = await readJson(request);
        const result = await agent.chat(required(body.storyId, "storyId"), required(body.content, "content"));
        sendJson(response, result);
        return;
      }

      if (request.method === "POST" && request.url === "/api/command") {
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
