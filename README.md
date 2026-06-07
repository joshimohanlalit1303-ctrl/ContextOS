# ContextOS (Libro Hive Mind) 🧠

ContextOS is the persistent memory layer for AI Agents. It provides a multi-tenant "Hive Mind" that syncs your context across tools like Claude Desktop, Cursor, and ChatGPT. Stop pasting the same architectural decisions into your prompts—tell ContextOS once, and all your agents will know it forever.

---

## 🏗️ Architecture

ContextOS connects your local AI environments to a persistent cloud database using the Model Context Protocol (MCP) and REST APIs.

```mermaid
graph TD
    subgraph "AI Agents"
        Claude[Claude Desktop]
        Cursor[Cursor IDE]
        ChatGPT[ChatGPT Mobile]
    end

    subgraph "Local Environment"
        MCPServer[libro-mcp-server\nNode.js]
    end

    subgraph "ContextOS (Vercel + Supabase)"
        API[ContextOS Edge API\nREST & SDK]
        VectorDB[(Supabase pgvector\nTenant-isolated Memories)]
        Embeddings[Local Transformer Models\nText to Vector]
    end

    Claude <-->|Model Context Protocol| MCPServer
    Cursor <-->|Model Context Protocol| MCPServer
    MCPServer <-->|HTTP /fetch & /ingest| API
    ChatGPT <-->|OpenAPI Custom Actions| API

    API --> Embeddings
    Embeddings --> VectorDB
```

---

## 🚀 Getting Started

To give your AI agent persistent memory, you need your unique **User ID** and an **API Key**. Sign up or log into the dashboard at [libro.co.in](https://libro.co.in) (using GitHub) to get your credentials.

---

## 🛠️ 1. Using the MCP Server (For Claude & Cursor)

The Model Context Protocol (MCP) allows local AI agents to seamlessly access the Libro Hive Mind.

### Installation & Configuration

For **Claude Desktop**, open your configuration file:
* Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
* Windows: `%APPDATA%\Claude\claude_desktop_config.json`

Add the `libro` server:

```json
{
  "mcpServers": {
    "libro": {
      "command": "npx",
      "args": [
        "-y",
        "libro-mcp-server@latest"
      ],
      "env": {
        "LIBRO_API_KEY": "your_api_key_here",
        "LIBRO_USER_ID": "your_user_id_here"
      }
    }
  }
}
```

### Usage in Chat

Once installed, simply restart Claude or Cursor. Because of our strict privacy controls, the agent will **not** automatically save your data. 

To use your Hive Mind, tell your agent to use the following manual commands:
* **`/ingest [text]`** - Saves a new memory to your database. (e.g. `/ingest Our project codename is Apollo.`)
* **`/fetch [query]`** - Retrieves relevant memories and injects them into the chat. (e.g. `/fetch What is the project codename?`)

---

## 🤖 2. Using ChatGPT Custom GPTs (For Mobile & Web)

You can bring your Hive Mind to the ChatGPT iOS/Android app by creating a Custom Action.

1. Create a new Custom GPT.
2. In the **Instructions**, add: *"To save memories, call ingestMemory. To retrieve context, call getContext. Use endUserId: 'your_user_id_here'"*
3. Create a **New Action** and paste our OpenAPI Schema.
4. Set the Authentication to **API Key**, Auth Type **Bearer**, and paste your `LIBRO_API_KEY`.

---

## 📦 3. Using the `@libro/sdk` (For Next.js / Node.js)

If you are building your own application, you can use our official SDK.

### Installation

```bash
npm install @libro/sdk
```

### Usage

```typescript
import { LibroClient } from "@libro/sdk";

const client = new LibroClient({
  apiKey: "your_api_key_here"
});

// 1. Save a new memory
await client.ingestMemory({
  userId: "your_user_id_here",
  text: "The new UI uses a dark mode palette."
});

// 2. Retrieve context
const context = await client.getContext({
  userId: "your_user_id_here",
  query: "What is the UI palette?"
});

console.log(context.context); 
// Outputs: "[Memory 1] The new UI uses a dark mode palette."
```

---

## 🔌 4. Core REST API

If you aren't using the SDK, you can call the API directly using `curl` or `fetch`.

**Base URL:** `https://www.libro.co.in/api/v1`
**Authentication:** `Authorization: Bearer <YOUR_API_KEY>`

### POST `/ingest`
Saves a new piece of context.
```bash
curl -X POST https://www.libro.co.in/api/v1/ingest \
  -H "Authorization: Bearer libro_sk_..." \
  -H "Content-Type: application/json" \
  -d '{"userId": "123", "text": "My preferred language is TypeScript."}'
```

### POST `/get-context`
Searches the vector database for the most relevant memories.
```bash
curl -X POST https://www.libro.co.in/api/v1/get-context \
  -H "Authorization: Bearer libro_sk_..." \
  -H "Content-Type: application/json" \
  -d '{"endUserId": "123", "query": "What language do I like?"}'
```

### POST `/update`
Updates an existing memory.
```bash
curl -X POST https://www.libro.co.in/api/v1/update \
  -H "Authorization: Bearer libro_sk_..." \
  -H "Content-Type: application/json" \
  -d '{"userId": "123", "memoryId": "uuid-here", "text": "New text"}'
```

### POST `/forget`
Deletes a specific memory from the Hive Mind.
```bash
curl -X POST https://www.libro.co.in/api/v1/forget \
  -H "Authorization: Bearer libro_sk_..." \
  -H "Content-Type: application/json" \
  -d '{"userId": "123", "memoryId": "uuid-here"}'
```
