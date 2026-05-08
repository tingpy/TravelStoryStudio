export function messageAppHtml(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Travel Story Studio</title>
    <style>
      :root {
        color: #1d1d1f;
        background: #f5f5f7;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif;
      }

      * { box-sizing: border-box; }
      body { margin: 0; min-width: 320px; }
      button, input, textarea { font: inherit; }

      .shell {
        display: grid;
        grid-template-columns: 260px minmax(0, 1fr);
        height: 100vh;
      }

      .sidebar {
        border-right: 1px solid #d1d1d6;
        background: #ececf1;
        padding: 18px;
      }

      .sidebar h1 {
        font-size: 20px;
        margin: 0 0 16px;
      }

      .story-card {
        background: #ffffff;
        border: 1px solid #d8d8de;
        border-radius: 8px;
        padding: 12px;
      }

      .chat {
        display: grid;
        grid-template-rows: auto 1fr auto;
        min-width: 0;
        background: #ffffff;
      }

      .topbar {
        border-bottom: 1px solid #e5e5ea;
        padding: 14px 18px;
      }

      .topbar h2 {
        margin: 0;
        font-size: 18px;
      }

      .messages {
        overflow-y: auto;
        padding: 22px;
      }

      .bubble-row {
        display: flex;
        margin: 8px 0;
      }

      .bubble-row.author { justify-content: flex-end; }
      .bubble-row.assistant { justify-content: flex-start; }

      .bubble {
        max-width: min(680px, 78%);
        border-radius: 18px;
        padding: 10px 14px;
        line-height: 1.35;
        white-space: pre-wrap;
      }

      .author .bubble {
        color: #ffffff;
        background: #0a84ff;
        border-bottom-right-radius: 5px;
      }

      .assistant .bubble {
        color: #1d1d1f;
        background: #e9e9eb;
        border-bottom-left-radius: 5px;
      }

      .composer {
        border-top: 1px solid #e5e5ea;
        padding: 12px;
        display: grid;
        gap: 10px;
      }

      .actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .actions button,
      .send {
        border: 0;
        border-radius: 8px;
        background: #e9e9eb;
        padding: 8px 10px;
        cursor: pointer;
      }

      .send {
        background: #0a84ff;
        color: #ffffff;
      }

      .input-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 10px;
      }

      textarea {
        resize: none;
        min-height: 44px;
        max-height: 140px;
        border: 1px solid #d1d1d6;
        border-radius: 14px;
        padding: 11px 13px;
      }

      @media (max-width: 760px) {
        .shell { grid-template-columns: 1fr; }
        .sidebar { display: none; }
        .bubble { max-width: 88%; }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <aside class="sidebar">
        <h1>Travel Story Studio</h1>
        <div class="story-card">
          <strong id="storyId">New story</strong>
          <p>Provider: <span id="provider">ollama</span></p>
        </div>
      </aside>
      <section class="chat">
        <header class="topbar">
          <h2>Story Chat</h2>
        </header>
        <div id="messages" class="messages"></div>
        <form id="composer" class="composer">
          <div class="actions">
            <button type="button" data-command="outline">Outline</button>
            <button type="button" data-command="draft">Draft</button>
            <button type="button" data-command="feedback">Feedback</button>
            <button type="button" data-command="export">Export</button>
          </div>
          <div class="input-row">
            <textarea id="input" placeholder="Tell the story, or paste feedback after clicking Feedback..."></textarea>
            <button class="send" type="submit">Send</button>
          </div>
        </form>
      </section>
    </main>
    <script>
      const messagesEl = document.querySelector("#messages");
      const inputEl = document.querySelector("#input");
      const formEl = document.querySelector("#composer");
      const storyId = "story-" + Date.now();
      let started = false;
      let pendingCommand = null;
      document.querySelector("#storyId").textContent = storyId;

      function addBubble(role, content) {
        const row = document.createElement("div");
        row.className = "bubble-row " + role;
        const bubble = document.createElement("div");
        bubble.className = "bubble";
        bubble.textContent = content;
        row.appendChild(bubble);
        messagesEl.appendChild(row);
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }

      async function post(path, body) {
        const response = await fetch(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Request failed");
        return data;
      }

      async function sendMessage(content) {
        addBubble("author", content);
        addBubble("assistant", "Thinking...");
        const thinking = messagesEl.lastElementChild;
        try {
          const data = !started
            ? await post("/api/start", { storyId, premise: content })
            : await post("/api/chat", { storyId, content });
          started = true;
          thinking.querySelector(".bubble").textContent = data.reply;
        } catch (error) {
          thinking.querySelector(".bubble").textContent = error.message;
        }
      }

      async function runCommand(command, content) {
        addBubble("author", "/" + command + (content ? "\\n" + content : ""));
        addBubble("assistant", "Working...");
        const thinking = messagesEl.lastElementChild;
        try {
          const data = await post("/api/command", { storyId, command, content });
          thinking.querySelector(".bubble").textContent = data.savedPath
            ? data.reply + "\\n\\nSaved: " + data.savedPath
            : data.reply;
        } catch (error) {
          thinking.querySelector(".bubble").textContent = error.message;
        }
      }

      formEl.addEventListener("submit", async (event) => {
        event.preventDefault();
        const content = inputEl.value.trim();
        if (!content && pendingCommand !== "feedback") return;
        inputEl.value = "";
        if (pendingCommand) {
          const command = pendingCommand;
          pendingCommand = null;
          await runCommand(command, content);
        } else {
          await sendMessage(content);
        }
      });

      inputEl.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
          event.preventDefault();
          formEl.requestSubmit();
        }
      });

      document.querySelectorAll("[data-command]").forEach((button) => {
        button.addEventListener("click", async () => {
          const command = button.dataset.command;
          if (command === "feedback") {
            pendingCommand = "feedback";
            inputEl.placeholder = "Paste friend or reader feedback, then press Send...";
            inputEl.focus();
            return;
          }
          await runCommand(command, "");
        });
      });

      addBubble("assistant", "Tell me the rough premise of the story. I’ll ask like a warm friend with editor instincts.");
    </script>
  </body>
</html>`;
}
