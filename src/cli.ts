#!/usr/bin/env node
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { createLlmProvider } from "./llm/providerFactory";
import { FileStoryStore } from "./storage/fileStore";
import { StoryAgent } from "./agent/storyAgent";
import { startMessageServer } from "./web/server";

const HELP = `
Commands:
  /outline          Create or update the story outline
  /draft            Draft from the story material
  /feedback         Paste friend or reader feedback for analysis
  /export markdown  Export the story as Markdown
  /help             Show commands
  /quit             Exit
`.trim();

async function main(): Promise<void> {
  const command = process.argv[2] ?? "chat";
  if (command === "ui") {
    startMessageServer();
    return;
  }

  if (command !== "chat") {
    console.error("Usage: travel-story chat | ui");
    process.exitCode = 1;
    return;
  }

  const rl = createInterface({ input, output });
  const store = new FileStoryStore(process.cwd());
  const agent = new StoryAgent(store, createLlmProvider());

  console.log("Travel Story Studio");
  console.log(HELP);
  const storyId = await promptWithDefault(rl, "Story id", `story-${Date.now()}`);
  const premise = await rl.question("Premise: ");
  if (!premise.trim()) {
    console.log("No premise entered. Exiting.");
    rl.close();
    return;
  }

  const first = await agent.startStory(storyId, premise);
  printAgent(first.reply);

  for (;;) {
    const line = await rl.question("\nYou: ");
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed === "/quit") {
      break;
    }

    if (trimmed === "/help") {
      console.log(HELP);
      continue;
    }

    if (trimmed === "/outline") {
      printResult(await agent.outline(storyId));
      continue;
    }

    if (trimmed === "/draft") {
      printResult(await agent.draft(storyId));
      continue;
    }

    if (trimmed === "/feedback") {
      const feedback = await rl.question("Paste feedback: ");
      printResult(await agent.feedback(storyId, feedback));
      continue;
    }

    if (trimmed === "/export markdown") {
      printResult(await agent.exportMarkdown(storyId));
      continue;
    }

    printAgent((await agent.chat(storyId, trimmed)).reply);
  }

  rl.close();
}

async function promptWithDefault(
  rl: ReturnType<typeof createInterface>,
  label: string,
  defaultValue: string,
): Promise<string> {
  const answer = await rl.question(`${label} (${defaultValue}): `);
  return answer.trim() || defaultValue;
}

function printResult(result: { reply: string; savedPath?: string }): void {
  printAgent(result.reply);
  if (result.savedPath) {
    console.log(`\nSaved: ${result.savedPath}`);
  }
}

function printAgent(reply: string): void {
  console.log(`\nAgent: ${reply}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
