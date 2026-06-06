# 🧠 Libro Hive Mind MCP Server

> Connect any AI agent to a shared, persistent memory that survives across sessions, tools, and projects.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/joshimohanlalit1303-ctrl/ContextOS)

**Live Server:** `https://libro-mcp-server.onrender.com`

---

## What is This?

The Libro MCP Server gives your AI agents a **long-term memory** — called a "Hive Mind". Any agent that connects to the same Hive Mind can:

- 🧠 **Remember** architectural decisions, preferences, and context
- 🔍 **Recall** what other agents or sessions have learned  
- 🗑️ **Forget** outdated or incorrect information

Think of it like a shared brain that all your AI tools — Claude, Cursor, Windsurf, Antigravity — read from and write to simultaneously.

---

## Quick Start (2 minutes)

### Step 1 — Get Your API Key

1. Go to [libro.app/dashboard](https://libro.app/dashboard)
2. Sign up and create an API Key — it looks like `libro_sk_xxxxxxxxxx`

### Step 2 — Pick a Hive Name

A **Hive Name** (`userId`) is just a label for your memory bucket. Choose anything:
- `my-startup` — for a project
- `personal` — for personal AI memory
- `team-backend` — for a team's shared context

### Step 3 — Connect Your AI Agent

---

## Connecting AI Clients

### 🤖 Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "libro": {
      "type": "sse",
      "url": "https://libro-mcp-server.onrender.com/sse?apiKey=YOUR_API_KEY&userId=YOUR_HIVE_NAME"
    }
  }
}
```

Restart Claude Desktop. The tools will appear automatically.

---

### ⚡ Cursor / Windsurf

Open your MCP Settings and add:

```json
{
  "libro": {
    "type": "sse",
    "url": "https://libro-mcp-server.onrender.com/sse?apiKey=YOUR_API_KEY&userId=YOUR_HIVE_NAME"
  }
}
```

---

### 🖥️ Claude Code CLI

```bash
claude mcp add libro --type sse \
  "https://libro-mcp-server.onrender.com/sse?apiKey=YOUR_API_KEY&userId=YOUR_HIVE_NAME"
```

---

### 🪐 Antigravity IDE

Add to your Antigravity MCP config:

```json
{
  "mcpServers": {
    "libro": {
      "type": "sse",
      "url": "https://libro-mcp-server.onrender.com/sse?apiKey=YOUR_API_KEY&userId=YOUR_HIVE_NAME"
    }
  }
}
```

---

### 🐍 Python (Direct SDK)

```bash
pip install libro-sdk
```

```python
from libro import LibroClient

client = LibroClient(api_key="YOUR_API_KEY")

# Save a memory
client.ingest(
    user_id="YOUR_HIVE_NAME",
    text="We use PostgreSQL with UUID primary keys."
)

# Recall context
result = client.get_context(
    user_id="YOUR_HIVE_NAME",
    query="What database do we use?"
)
print(result.context)
```

---

### 🟨 Node.js / TypeScript (Direct SDK)

```bash
npm install libro-sdk
```

```typescript
import { LibroClient } from 'libro-sdk';

const libro = new LibroClient({ apiKey: 'YOUR_API_KEY' });

// Save a memory
await libro.ingest({
  userId: 'YOUR_HIVE_NAME',
  text: 'Frontend is Next.js 14 App Router with Tailwind CSS.'
});

// Recall context
const result = await libro.getContext({
  userId: 'YOUR_HIVE_NAME',
  query: 'What frontend framework are we using?'
});
console.log(result.context);
```

---

## Available MCP Tools

| Tool | Description |
|---|---|
| `libro_ingest` | Save a memory or fact to the Hive Mind |
| `libro_get_context` | Semantically search the Hive for relevant context |
| `libro_forget` | Delete a specific or semantically-matched memory |

---

## Multi-Tenant Architecture

This server is fully **multi-tenant** — no API keys are stored on the server itself. Every connection is isolated:

```
Developer A → ?apiKey=loro_sk_aaa&userId=project-alpha  → Their private Hive
Developer B → ?apiKey=loro_sk_bbb&userId=project-beta   → Their private Hive  
Team        → ?apiKey=loro_sk_ccc&userId=shared-hive    → Shared Team Hive
```

---

## Self-Hosting

Want to run your own instance?

```bash
git clone https://github.com/joshimohanlalit1303-ctrl/ContextOS
cd ContextOS

# Run the MCP server in SSE mode
cd packages/libro-mcp-server
npm install && npm run build
node dist/index.js --sse
```

Or deploy instantly with the button at the top of this README.

---

## Tips

- **Share a Hive across your team** — use the same `apiKey` and `userId` across all team members' AI tools
- **Scope by project** — use `my-app-backend` and `my-app-frontend` as separate Hives to keep context organized
- **Works offline too** — use the `stdio` mode by running `node dist/index.js` (no `--sse`) for local CLI agents

---

## Troubleshooting

| Error | Fix |
|---|---|
| `401 Unauthorized` | Check your `apiKey` in the URL |
| `userId is required` | Add `&userId=YOUR_HIVE_NAME` to the URL |
| Tools not showing in Claude | Restart Claude Desktop after editing config |
| Server takes 50s to respond | Free tier sleeping — wait once, then it's fast |

---

## License

MIT — Free to use, fork, and self-host.
