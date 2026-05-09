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
        grid-template-columns: 270px minmax(0, 1fr);
        height: 100vh;
      }

      .sidebar {
        border-right: 1px solid #d1d1d6;
        background: #ececf1;
        padding: 18px;
        overflow-y: auto;
      }

      .sidebar h1 {
        font-size: 20px;
        margin: 0 0 16px;
      }

      .story-card,
      .story-item {
        background: #ffffff;
        border: 1px solid #d8d8de;
        border-radius: 8px;
        padding: 12px;
      }

      .new-chat,
      .story-open,
      .story-delete,
      .tab-button,
      .toolbar button,
      .send {
        border: 0;
        border-radius: 8px;
        cursor: pointer;
      }

      .new-chat {
        background: #0a84ff;
        color: #ffffff;
        margin-top: 12px;
        padding: 8px 10px;
        width: 100%;
      }

      .story-list {
        display: grid;
        gap: 8px;
        margin-top: 14px;
      }

      .story-item {
        display: grid;
        gap: 6px;
      }

      .story-open {
        background: transparent;
        color: #1d1d1f;
        overflow-wrap: anywhere;
        padding: 0;
        text-align: left;
      }

      .story-delete {
        background: transparent;
        color: #c01818;
        font-size: 12px;
        justify-self: start;
        padding: 0;
      }

      .workspace {
        display: grid;
        grid-template-rows: auto 1fr auto;
        min-width: 0;
        background: #ffffff;
      }

      .topbar {
        border-bottom: 1px solid #e5e5ea;
        display: grid;
        gap: 10px;
        padding: 12px 18px;
      }

      .topbar h2 {
        font-size: 18px;
        margin: 0;
      }

      .tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .tab-button {
        background: #e9e9eb;
        padding: 7px 10px;
      }

      .tab-button.active {
        background: #1d1d1f;
        color: #ffffff;
      }

      .panel {
        display: none;
        min-height: 0;
        overflow-y: auto;
      }

      .panel.active {
        display: block;
      }

      .messages {
        min-height: 100%;
        padding: 22px;
      }

      .bubble-row {
        display: flex;
        margin: 8px 0;
      }

      .bubble-row.author { justify-content: flex-end; }
      .bubble-row.assistant {
        align-items: flex-start;
        flex-direction: column;
        justify-content: flex-start;
      }

      .bubble {
        max-width: min(700px, 78%);
        border-radius: 18px;
        line-height: 1.35;
        padding: 10px 14px;
        white-space: pre-wrap;
      }

      .author .bubble {
        background: #0a84ff;
        border-bottom-right-radius: 5px;
        color: #ffffff;
      }

      .assistant .bubble {
        background: #e9e9eb;
        border-bottom-left-radius: 5px;
        color: #1d1d1f;
      }

      .bubble-feedback {
        align-self: flex-start;
        background: transparent;
        border: 0;
        color: #6e6e73;
        cursor: pointer;
        font-size: 12px;
        margin: 3px 8px 0;
        padding: 2px;
      }

      .bubble-actions {
        display: flex;
        gap: 8px;
        margin: 3px 8px 0;
      }

      .bubble-action {
        background: transparent;
        border: 0;
        color: #6e6e73;
        cursor: pointer;
        font-size: 12px;
        padding: 2px;
      }

      .author-reply-stack {
        align-items: flex-end;
        display: flex;
        flex-direction: column;
        max-width: min(700px, 78%);
        position: relative;
      }

      .author-reply-stack::before {
        border-bottom: 3px solid #d1d1d6;
        border-left: 3px solid #d1d1d6;
        border-radius: 0 0 0 18px;
        bottom: 22px;
        content: "";
        height: 22px;
        left: 8px;
        position: absolute;
        width: 48px;
      }

      .author-reply-quote {
        align-self: flex-start;
        border: 1px solid #d1d1d6;
        border-radius: 16px;
        color: #8e8e93;
        font-size: 12px;
        line-height: 1.25;
        margin: 0 0 6px 58px;
        max-width: 78%;
        overflow: hidden;
        padding: 6px 9px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .author-reply-stack .bubble {
        max-width: 100%;
      }

      .reply-preview,
      .edit-preview {
        align-items: center;
        background: #f2f2f7;
        border: 1px solid #d1d1d6;
        border-radius: 14px;
        color: #6e6e73;
        display: grid;
        gap: 2px;
        grid-template-columns: minmax(0, 1fr) auto;
        padding: 7px 10px;
      }

      .reply-preview[hidden],
      .edit-preview[hidden] {
        display: none;
      }

      .reply-preview strong,
      .edit-preview strong {
        color: #1d1d1f;
        display: block;
        font-size: 12px;
      }

      .reply-preview span,
      .edit-preview span {
        display: block;
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .reply-preview button,
      .edit-preview button,
      .message-menu button {
        background: transparent;
        border: 0;
        cursor: pointer;
      }

      .message-menu {
        background: #ffffff;
        border: 1px solid #d1d1d6;
        border-radius: 8px;
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14);
        display: flex;
        gap: 4px;
        padding: 5px;
        position: fixed;
        z-index: 10;
      }

      .message-menu[hidden] {
        display: none;
      }

      .message-menu button {
        border-radius: 6px;
        padding: 6px 9px;
      }

      .message-menu button:hover {
        background: #f2f2f7;
      }

      .feedback-context .bubble {
        background: #fff7df;
        border: 1px solid #f2d28a;
        color: #1d1d1f;
      }

      .feedback-story-context .bubble {
        border: 1px solid #d1d1d6;
      }

      .composer {
        border-top: 1px solid #e5e5ea;
        display: grid;
        gap: 10px;
        padding: 12px;
      }

      .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .toolbar[hidden] {
        display: none;
      }

      .toolbar button,
      .send {
        background: #e9e9eb;
        padding: 8px 10px;
      }

      .send {
        background: #0a84ff;
        color: #ffffff;
      }

      .input-row {
        display: grid;
        gap: 10px;
        grid-template-columns: minmax(0, 1fr) auto;
      }

      textarea {
        border: 1px solid #d1d1d6;
        border-radius: 14px;
        max-height: 150px;
        min-height: 44px;
        padding: 11px 13px;
        resize: none;
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
        <button id="newChat" class="new-chat" type="button">New Chat</button>
        <div id="storyList" class="story-list"></div>
      </aside>

      <section class="workspace">
        <header class="topbar">
          <h2 id="workspaceTitle">Story Room</h2>
          <nav class="tabs" aria-label="Workspace tabs">
            <button class="tab-button active" type="button" data-tab="story">Story Room</button>
            <button class="tab-button" type="button" data-tab="draft">Draft Studio</button>
            <button class="tab-button" type="button" data-tab="feedback">Feedback</button>
            <button class="tab-button" type="button" data-tab="memory">Memory</button>
          </nav>
        </header>

        <section class="panel active" data-panel="story">
          <div id="storyMessages" class="messages"></div>
        </section>
        <section class="panel" data-panel="draft">
          <div id="draftMessages" class="messages"></div>
        </section>
        <section class="panel" data-panel="feedback">
          <div id="feedbackMessages" class="messages"></div>
        </section>
        <section class="panel" data-panel="memory">
          <div id="memoryMessages" class="messages"></div>
        </section>

        <form id="composer" class="composer">
          <div id="storyToolbar" class="toolbar">
            <button id="askNow" type="button">Ask Now</button>
            <button id="keepListening" type="button">Keep Listening</button>
          </div>
          <div id="draftToolbar" class="toolbar" hidden>
            <button type="button" data-draft-command="angle">Brainstorm Angle</button>
            <button type="button" data-draft-command="outline">Outline</button>
            <button type="button" data-draft-command="draft">Draft</button>
            <button type="button" data-draft-command="edit">Edit</button>
            <button type="button" data-draft-command="title">Title</button>
          </div>
          <div id="feedbackToolbar" class="toolbar" hidden>
            <button type="button" data-feedback-mode="specific">Specific Comment</button>
            <button type="button" data-command="botFeedback" data-feedback-mode="general">General Advice</button>
          </div>
          <div id="memoryToolbar" class="toolbar" hidden>
            <button type="button" data-command="friendStyle" data-memory-mode="friendStyle">Friend Style Import</button>
            <button type="button" data-memory-mode="reflection">Reflection Skills</button>
          </div>
          <div id="replyPreview" class="reply-preview" hidden>
            <div>
              <strong>Replying to Bot</strong>
              <span id="replyPreviewText"></span>
            </div>
            <button id="cancelReply" type="button" aria-label="Cancel reply">x</button>
          </div>
          <div id="editPreview" class="edit-preview" hidden>
            <div>
              <strong>Editing Message</strong>
              <span id="editPreviewText"></span>
            </div>
            <button id="cancelEdit" type="button" aria-label="Cancel edit">x</button>
          </div>
          <div class="input-row">
            <textarea id="input" placeholder="Send story fragments. I may jump in when something feels important..."></textarea>
            <button id="sendButton" class="send" type="submit">Send</button>
          </div>
        </form>
      </section>
      <div id="messageMenu" class="message-menu" hidden>
        <button id="editMessage" type="button">Edit</button>
        <button id="deleteMessage" type="button">Delete</button>
      </div>
    </main>

    <script>
      const storyMessagesEl = document.querySelector("#storyMessages");
      const draftMessagesEl = document.querySelector("#draftMessages");
      const feedbackMessagesEl = document.querySelector("#feedbackMessages");
      const memoryMessagesEl = document.querySelector("#memoryMessages");
      const inputEl = document.querySelector("#input");
      const formEl = document.querySelector("#composer");
      const storyListEl = document.querySelector("#storyList");
      const storyIdEl = document.querySelector("#storyId");
      const workspaceTitleEl = document.querySelector("#workspaceTitle");
      const replyPreviewEl = document.querySelector("#replyPreview");
      const replyPreviewTextEl = document.querySelector("#replyPreviewText");
      const cancelReplyEl = document.querySelector("#cancelReply");
      const editPreviewEl = document.querySelector("#editPreview");
      const editPreviewTextEl = document.querySelector("#editPreviewText");
      const cancelEditEl = document.querySelector("#cancelEdit");
      const sendButtonEl = document.querySelector("#sendButton");
      const messageMenuEl = document.querySelector("#messageMenu");
      const editMessageEl = document.querySelector("#editMessage");
      const deleteMessageEl = document.querySelector("#deleteMessage");
      const toolbars = {
        story: document.querySelector("#storyToolbar"),
        draft: document.querySelector("#draftToolbar"),
        feedback: document.querySelector("#feedbackToolbar"),
        memory: document.querySelector("#memoryToolbar"),
      };
      const messageEls = {
        story: storyMessagesEl,
        draft: draftMessagesEl,
        feedback: feedbackMessagesEl,
        memory: memoryMessagesEl,
      };
      const tabTitles = {
        story: "Story Room",
        draft: "Draft Studio",
        feedback: "Feedback",
        memory: "Memory",
      };
      const placeholders = {
        story: "Send story fragments. I may jump in when something feels important...",
        draft: "Ask for an outline, draft, edit, title, or story angle...",
        feedback: "Add a specific comment or general advice...",
        memory: "Paste friend chat excerpts, voice-call transcripts, or reflection techniques...",
      };
      const TENSION_MARKERS = [
        "?",
        "but",
        "however",
        "wait",
        "forgot",
        "shocked",
        "ashamed",
        "uncomfortable",
        "attracted",
        "disgusted",
        "angry",
        "confused",
      ];

      let storyId = "story-" + Date.now();
      let started = false;
      let activeTab = "story";
      let feedbackMode = "general";
      let memoryMode = "friendStyle";
      let selectedAssistantMessage = null;
      let replyToMessage = null;
      let editingMessageId = null;
      let menuMessageId = null;
      let storyTranscript = [];
      let responseTimer = null;
      let longPressTimer = null;
      let suppressNextDocumentClick = false;
      storyIdEl.textContent = storyId;

      function activeMessages() {
        return messageEls[activeTab];
      }

      function addBubble(target, role, content, metadata = {}) {
        const container = typeof target === "string" ? messageEls[target] : target;
        const targetName = typeof target === "string" ? target : "";
        const row = document.createElement("div");
        row.className = "bubble-row " + role;
        if (metadata.messageId) row.dataset.messageId = metadata.messageId;
        const bubble = document.createElement("div");
        bubble.className = "bubble";
        bubble.textContent = content;
        if (role === "author" && metadata.replyToContent) {
          const stack = document.createElement("div");
          stack.className = "author-reply-stack";
          const quote = document.createElement("div");
          quote.className = "author-reply-quote";
          quote.textContent = metadata.replyToContent;
          stack.appendChild(quote);
          stack.appendChild(bubble);
          row.appendChild(stack);
        } else {
          row.appendChild(bubble);
        }
        if (targetName === "story" && !metadata.skipTranscript) {
          recordStoryMessage({
            role,
            content,
            messageId: metadata.messageId,
            replyToMessageId: metadata.replyToMessageId,
            replyToContent: metadata.replyToContent,
          });
        }
        if (role === "assistant" && metadata.messageId && metadata.feedbackEnabled) {
          addFeedbackButton(row, metadata.messageId, content, metadata.feedbackLabel);
        }
        if (role === "assistant" && metadata.messageId && metadata.replyEnabled) {
          addReplyButton(row, metadata.messageId, content);
          addSwipeReply(row, metadata.messageId, content);
        }
        if (targetName === "story" && role === "author" && metadata.messageId) {
          addAuthorMessageMenu(row, metadata.messageId, content);
        }
        container.appendChild(row);
        container.parentElement.scrollTop = container.parentElement.scrollHeight;
        return row;
      }

      function recordStoryMessage(message) {
        storyTranscript.push(message);
        if (storyTranscript.length > 80) storyTranscript = storyTranscript.slice(-80);
      }

      function clearFeedbackContext() {
        feedbackMessagesEl.querySelectorAll("[data-feedback-context]").forEach((node) => node.remove());
      }

      function renderFeedbackStoryContext() {
        clearFeedbackContext();
        if (feedbackMode !== "specific") return;

        const intro = selectedAssistantMessage
          ? "Selected response:\\n" + selectedAssistantMessage.content + "\\n\\nChat from Story Room:"
          : "Chat from Story Room:\\nChoose a bot response below, then type what you wanted the chatbot to do differently.";
        const introRow = addBubble("feedback", "assistant", intro);
        introRow.classList.add("feedback-context");
        introRow.dataset.feedbackContext = "true";

        if (storyTranscript.length === 0) {
          const emptyRow = addBubble("feedback", "assistant", "No story chat yet.");
          emptyRow.classList.add("feedback-story-context");
          emptyRow.dataset.feedbackContext = "true";
          return;
        }

        storyTranscript.forEach((message) => {
          const row = addBubble("feedback", message.role, message.content, {
            messageId: message.messageId,
            feedbackEnabled: message.role === "assistant" && Boolean(message.messageId),
            feedbackLabel: "Comment on this response",
          });
          row.classList.add("feedback-story-context");
          row.dataset.feedbackContext = "true";
        });
      }

      function addFeedbackButton(row, messageId, content, label = "Give feedback on this response") {
        const feedbackButton = bubbleActionButton(label);
        feedbackButton.type = "button";
        feedbackButton.addEventListener("click", () => {
          selectedAssistantMessage = { id: messageId, content };
          feedbackMode = "specific";
          renderFeedbackStoryContext();
          switchTab("feedback");
          inputEl.placeholder = "Specific Comment: what should this response have done differently?";
          inputEl.focus();
        });
        bubbleActions(row).appendChild(feedbackButton);
      }

      function addReplyButton(row, messageId, content) {
        const replyButton = bubbleActionButton("Reply");
        replyButton.addEventListener("click", () => selectReplyTarget(messageId, content));
        bubbleActions(row).appendChild(replyButton);
      }

      function bubbleActionButton(label) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "bubble-action bubble-feedback";
        button.textContent = label;
        return button;
      }

      function bubbleActions(row) {
        let actions = row.querySelector(".bubble-actions");
        if (!actions) {
          actions = document.createElement("div");
          actions.className = "bubble-actions";
          row.appendChild(actions);
        }
        return actions;
      }

      function selectReplyTarget(messageId, content) {
        replyToMessage = { id: messageId, content };
        replyPreviewTextEl.textContent = content;
        replyPreviewEl.hidden = false;
        inputEl.placeholder = "Reply to this bot response...";
        inputEl.focus();
      }

      function clearReplyTarget() {
        replyToMessage = null;
        replyPreviewTextEl.textContent = "";
        replyPreviewEl.hidden = true;
        inputEl.placeholder = placeholders[activeTab];
      }

      function beginEditMessage(messageId, content) {
        editingMessageId = messageId;
        clearReplyTarget();
        hideMessageMenu();
        inputEl.value = content;
        editPreviewTextEl.textContent = content;
        editPreviewEl.hidden = false;
        sendButtonEl.textContent = "Save";
        inputEl.placeholder = "Edit your sent message...";
        inputEl.focus();
      }

      function clearEditMode() {
        editingMessageId = null;
        editPreviewTextEl.textContent = "";
        editPreviewEl.hidden = true;
        sendButtonEl.textContent = "Send";
        inputEl.placeholder = placeholders[activeTab];
      }

      function addSwipeReply(row, messageId, content) {
        let startX = 0;
        row.addEventListener("touchstart", (event) => {
          startX = event.touches[0]?.clientX ?? 0;
        });
        row.addEventListener("touchend", (event) => {
          const endX = event.changedTouches[0]?.clientX ?? startX;
          if (endX - startX > 50) selectReplyTarget(messageId, content);
        });
      }

      function addAuthorMessageMenu(row, messageId, content) {
        row.addEventListener("contextmenu", (event) => {
          event.preventDefault();
          showMessageMenu(messageId, content, event.clientX, event.clientY);
        });
        row.addEventListener("touchstart", (event) => {
          const touch = event.touches[0];
          longPressTimer = setTimeout(() => {
            showMessageMenu(messageId, content, touch?.clientX ?? 20, touch?.clientY ?? 20, true);
          }, 900);
        });
        row.addEventListener("touchend", clearLongPress);
        row.addEventListener("touchmove", clearLongPress);
        row.addEventListener("mousedown", (event) => {
          if (event.button !== 0) return;
          longPressTimer = setTimeout(() => showMessageMenu(messageId, content, event.clientX, event.clientY, true), 900);
        });
        row.addEventListener("mouseup", clearLongPress);
        row.addEventListener("mouseleave", clearLongPress);
      }

      function clearLongPress() {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      }

      function showMessageMenu(messageId, content, x, y, suppressReleaseClick = false) {
        menuMessageId = messageId;
        suppressNextDocumentClick = suppressReleaseClick;
        messageMenuEl.dataset.content = content;
        messageMenuEl.style.left = Math.min(x, window.innerWidth - 150) + "px";
        messageMenuEl.style.top = Math.min(y, window.innerHeight - 60) + "px";
        messageMenuEl.hidden = false;
      }

      function hideMessageMenu() {
        menuMessageId = null;
        messageMenuEl.hidden = true;
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

      async function get(path) {
        const response = await fetch(path);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Request failed");
        return data;
      }

      function switchTab(tab) {
        activeTab = tab;
        if (tab !== "story" && replyToMessage) clearReplyTarget();
        if (tab !== "story" && editingMessageId) clearEditMode();
        document.querySelectorAll("[data-tab]").forEach((button) => {
          button.classList.toggle("active", button.dataset.tab === tab);
        });
        document.querySelectorAll("[data-panel]").forEach((panel) => {
          panel.classList.toggle("active", panel.dataset.panel === tab);
        });
        Object.entries(toolbars).forEach(([name, toolbar]) => {
          toolbar.hidden = name !== tab;
        });
        workspaceTitleEl.textContent = tabTitles[tab];
        inputEl.placeholder = placeholders[tab];
        inputEl.focus();
      }

      function resetChat() {
        clearPendingResponse();
        storyId = "story-" + Date.now();
        started = false;
        selectedAssistantMessage = null;
        clearReplyTarget();
        clearEditMode();
        storyTranscript = [];
        storyIdEl.textContent = storyId;
        storyMessagesEl.innerHTML = "";
        draftMessagesEl.innerHTML = "";
        feedbackMessagesEl.innerHTML = "";
        memoryMessagesEl.innerHTML = "";
        addBubble("story", "assistant", "Tell me fragments as they come. I will mostly listen, then jump in when something feels important.");
        addBubble("draft", "assistant", "Draft Studio is separate. Ask for a story angle, outline, draft, edit, or title when you are ready.");
        addBubble("feedback", "assistant", "Feedback can be a Specific Comment on one response, or General Advice about the whole chat. I will show the Updated prompt/profile layer after absorbing it.");
        addBubble("memory", "assistant", "Memory is for Friend Style Import and Reflection Skills. Paste WhatsApp/iMessage exports or voice-call transcripts here.");
      }

      async function loadStories() {
        const data = await get("/api/stories");
        storyListEl.innerHTML = "";
        data.stories.forEach((story) => {
          const item = document.createElement("div");
          item.className = "story-item";

          const openButton = document.createElement("button");
          openButton.type = "button";
          openButton.className = "story-open";
          openButton.textContent = story.premise || story.id;
          openButton.title = "Continue chat";
          openButton.addEventListener("click", () => openStory(story.id));

          const deleteButton = document.createElement("button");
          deleteButton.type = "button";
          deleteButton.className = "story-delete";
          deleteButton.textContent = "Delete chat";
          deleteButton.addEventListener("click", async (event) => {
            event.stopPropagation();
            if (!confirm("Delete this local chat?")) return;
            await post("/api/delete-story", { storyId: story.id });
            if (story.id === storyId) resetChat();
            await loadStories();
          });

          item.appendChild(openButton);
          item.appendChild(deleteButton);
          storyListEl.appendChild(item);
        });
      }

      async function openStory(id) {
        clearPendingResponse();
        const project = await get("/api/story?storyId=" + encodeURIComponent(id));
        storyId = project.id;
        started = true;
        selectedAssistantMessage = null;
        clearEditMode();
        storyTranscript = [];
        storyIdEl.textContent = storyId;
        storyMessagesEl.innerHTML = "";
        project.messages.forEach((message) => {
          addBubble("story", message.role, message.content, {
            messageId: message.id,
            feedbackEnabled: message.role === "assistant",
            replyEnabled: message.role === "assistant",
            replyToMessageId: message.replyToMessageId,
            replyToContent: message.replyToContent,
          });
        });
        switchTab("story");
      }

      function clearPendingResponse() {
        if (responseTimer) {
          clearTimeout(responseTimer);
          responseTimer = null;
        }
      }

      function shouldJumpInSoon(content) {
        const lower = content.toLowerCase();
        return TENSION_MARKERS.some((marker) => lower.includes(marker));
      }

      function scheduleAdaptiveReply(content) {
        clearPendingResponse();
        const delay = shouldJumpInSoon(content) ? 1800 : 10000;
        responseTimer = setTimeout(() => {
          requestStoryResponse();
        }, delay);
      }

      async function saveStoryNote(content) {
        const replyTarget = replyToMessage;
        const row = addBubble("story", "author", content, {
          replyToMessageId: replyTarget?.id,
          replyToContent: replyTarget?.content,
        });
        const data = await post("/api/note", {
          storyId,
          content,
          createStory: !started,
          replyToMessageId: replyTarget?.id,
          replyToContent: replyTarget?.content,
        });
        if (data.authorMessageId) {
          row.dataset.messageId = data.authorMessageId;
          addAuthorMessageMenu(row, data.authorMessageId, content);
        }
        clearReplyTarget();
        started = true;
        await loadStories();
        scheduleAdaptiveReply(content);
      }

      async function submitEditedMessage(content) {
        const id = editingMessageId;
        if (!id) return;
        try {
          await post("/api/edit-message", { storyId, messageId: id, content });
          clearEditMode();
          inputEl.value = "";
          await regenerateAfterHistoryChange();
        } catch (error) {
          addBubble("story", "assistant", error.message);
        }
      }

      async function regenerateAfterHistoryChange() {
        clearPendingResponse();
        const project = await get("/api/story?storyId=" + encodeURIComponent(storyId));
        await openStory(storyId);
        await loadStories();
        if (project.messages.some((message) => message.role === "author")) {
          await requestStoryResponse();
        }
      }

      async function requestStoryResponse() {
        clearPendingResponse();
        if (!started) return;
        const thinking = addBubble("story", "assistant", "Thinking...", { skipTranscript: true });
        try {
          const data = await post("/api/respond", { storyId });
          thinking.querySelector(".bubble").textContent = data.reply;
          recordStoryMessage({ role: "assistant", content: data.reply, messageId: data.assistantMessageId });
          if (data.assistantMessageId) {
            thinking.dataset.messageId = data.assistantMessageId;
            addFeedbackButton(thinking, data.assistantMessageId, data.reply);
            addReplyButton(thinking, data.assistantMessageId, data.reply);
            addSwipeReply(thinking, data.assistantMessageId, data.reply);
          }
          await loadStories();
        } catch (error) {
          thinking.querySelector(".bubble").textContent = error.message;
        }
      }

      async function runDraftCommand(command, content) {
        const label = command === "angle" ? "Brainstorm Angle" : command;
        addBubble("draft", "author", label + (content ? "\\n" + content : ""));
        addBubble("draft", "assistant", "Working...");
        const thinking = draftMessagesEl.lastElementChild;
        try {
          const routeCommand = command === "outline" ? "outline" : command === "draft" ? "draft" : "outline";
          const data = await post("/api/command", { storyId, command: routeCommand, content });
          thinking.querySelector(".bubble").textContent = data.savedPath
            ? data.reply + "\\n\\nSaved: " + data.savedPath
            : data.reply;
        } catch (error) {
          thinking.querySelector(".bubble").textContent = error.message;
        }
      }

      async function submitFeedback(comment) {
        const selected = feedbackMode === "specific" && selectedAssistantMessage
          ? selectedAssistantMessage
          : { id: "general-advice", content: "General advice for the whole chat or current draft." };
        addBubble("feedback", "author", (feedbackMode === "specific" ? "Specific Comment" : "General Advice") + "\\n" + comment);
        addBubble("feedback", "assistant", "Updating bot calibration...");
        const thinking = feedbackMessagesEl.lastElementChild;
        try {
          const data = await post("/api/bot-feedback", {
            storyId,
            assistantMessageId: selected.id,
            assistantResponse: selected.content,
            comment,
          });
          thinking.querySelector(".bubble").textContent = "Updated prompt/profile layer:\\n\\n" + data.reply;
          selectedAssistantMessage = null;
        } catch (error) {
          thinking.querySelector(".bubble").textContent = error.message;
        }
      }

      async function submitMemory(content) {
        addBubble("memory", "author", (memoryMode === "friendStyle" ? "Friend Style Import" : "Reflection Skills") + "\\n" + content);
        addBubble("memory", "assistant", "Updating memory...");
        const thinking = memoryMessagesEl.lastElementChild;
        try {
          const data = memoryMode === "friendStyle"
            ? await post("/api/friend-conversation-style", { rawChat: content })
            : await post("/api/bot-feedback", {
                storyId,
                assistantMessageId: "reflection-skills",
                assistantResponse: "Reflection Skills import",
                comment: content,
              });
          thinking.querySelector(".bubble").textContent = "Updated prompt/profile layer:\\n\\n" + data.reply;
        } catch (error) {
          thinking.querySelector(".bubble").textContent = error.message;
        }
      }

      formEl.addEventListener("submit", async (event) => {
        event.preventDefault();
        const content = inputEl.value.trim();
        if (!content) return;
        if (activeTab === "story" && editingMessageId) await submitEditedMessage(content);
        else {
          inputEl.value = "";
          if (activeTab === "story") await saveStoryNote(content);
          else if (activeTab === "draft") await runDraftCommand("draft", content);
          else if (activeTab === "feedback") await submitFeedback(content);
          else if (activeTab === "memory") await submitMemory(content);
        }
      });

      inputEl.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
          event.preventDefault();
          formEl.requestSubmit();
        }
      });

      document.querySelectorAll("[data-tab]").forEach((button) => {
        button.addEventListener("click", () => switchTab(button.dataset.tab));
      });

      document.querySelector("#askNow").addEventListener("click", requestStoryResponse);
      document.querySelector("#keepListening").addEventListener("click", () => {
        clearPendingResponse();
        addBubble("story", "assistant", "I will keep listening.");
      });

      cancelReplyEl.addEventListener("click", clearReplyTarget);
      cancelEditEl.addEventListener("click", () => {
        inputEl.value = "";
        clearEditMode();
      });

      editMessageEl.addEventListener("click", async () => {
        if (!menuMessageId) return;
        const currentContent = messageMenuEl.dataset.content ?? "";
        beginEditMessage(menuMessageId, currentContent);
      });

      deleteMessageEl.addEventListener("click", async () => {
        if (!menuMessageId) return;
        const id = menuMessageId;
        hideMessageMenu();
        if (!confirm("Delete this sent message?")) return;
        try {
          await post("/api/delete-message", { storyId, messageId: id });
          await regenerateAfterHistoryChange();
        } catch (error) {
          addBubble("story", "assistant", error.message);
        }
      });

      document.addEventListener("click", (event) => {
        if (suppressNextDocumentClick) {
          suppressNextDocumentClick = false;
          return;
        }
        if (!messageMenuEl.contains(event.target)) hideMessageMenu();
      });

      document.querySelectorAll("[data-draft-command]").forEach((button) => {
        button.addEventListener("click", () => runDraftCommand(button.dataset.draftCommand, inputEl.value.trim()));
      });

      document.querySelectorAll("[data-feedback-mode]").forEach((button) => {
        button.addEventListener("click", () => {
          feedbackMode = button.dataset.feedbackMode;
          if (feedbackMode === "specific") renderFeedbackStoryContext();
          else clearFeedbackContext();
          inputEl.placeholder = feedbackMode === "specific"
            ? "Specific Comment: choose a response or describe which one you mean..."
            : "General Advice: comment on the whole chat, draft, or interview vibe...";
          inputEl.focus();
        });
      });

      document.querySelectorAll("[data-memory-mode]").forEach((button) => {
        button.addEventListener("click", () => {
          memoryMode = button.dataset.memoryMode;
          inputEl.placeholder = memoryMode === "friendStyle"
            ? "Friend Style Import: paste WhatsApp, iMessage, or voice-call transcript text..."
            : "Reflection Skills: paste techniques you want the bot to use to unfold story detail...";
          inputEl.focus();
        });
      });

      document.querySelector("#newChat").addEventListener("click", resetChat);

      resetChat();
      loadStories().catch((error) => addBubble("story", "assistant", error.message));
    </script>
  </body>
</html>`;
}
