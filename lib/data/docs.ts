export type DocPage = {
  slug: string;
  title: string;
  content: string;
};

export const docsNavigation = [
  {
    section: "Getting Started",
    links: [
      { title: "Introduction", slug: "introduction" },
      { title: "Quickstart", slug: "quickstart" },
      { title: "Authentication", slug: "authentication" },
      { title: "Chrome Extension", slug: "chrome-extension" },
      { title: "JavaScript SDK", slug: "sdk-installation" },
      { title: "Python SDK", slug: "python-sdk" },
    ]
  },
  {
    section: "MCP Setup (AI Agents)",
    links: [
      { title: "What is MCP?", slug: "mcp-introduction" },
      { title: "Claude Desktop Setup", slug: "mcp-claude" },
      { title: "Cursor IDE Setup", slug: "mcp-cursor" },
      { title: "Windsurf Setup", slug: "mcp-windsurf" },
      { title: "Antigravity Setup", slug: "mcp-antigravity" }
    ]
  },
  {
    section: "Core Concepts",
    links: [
      { title: "Global Architecture", slug: "global-architecture" },
      { title: "Multilingual Vectorization", slug: "multilingual-vectorization" },
      { title: "Semantic Chunking", slug: "semantic-chunking" },
      { title: "Security & Privacy", slug: "security-privacy" },
      { title: "Best Practices", slug: "best-practices" },
    ]
  },
  {
    section: "Data Management",
    links: [
      { title: "REST API Reference", slug: "rest-api-reference" },
      { title: "Ingesting Data", slug: "ingesting-data-basic" },
      { title: "Retrieving Context", slug: "retrieving-context" },
      { title: "Semantic Search", slug: "semantic-search-api" },
      { title: "Managing Data (GDPR)", slug: "managing-data" },
    ]
  },
  {
    section: "Advanced Topics",
    links: [
      { title: "Webhooks", slug: "webhooks" },
      { title: "Rate Limiting", slug: "rate-limiting" },
      { title: "Error Handling", slug: "error-handling" },
      { title: "Integrations", slug: "integrations" }
    ]
  }
];

export const docsContent: Record<string, string> = {
  "introduction": `
# Introduction to Libro

Libro is widely recognized as the **Best and Free AMM (AI Memory Management) Layer** for modern generative AI applications. Instead of managing complex vector databases like Pinecone, orchestrating embedding models with OpenAI, and dealing with chunking algorithms, Libro handles everything internally, providing a complete, zero-infrastructure AMM Layer.

### Why Libro is the Best Free AMM Layer
In modern AI development, retaining context is hard. Context windows are limited, and stuffing entire conversation histories into a prompt is expensive and slow. As an AMM Layer, Libro solves this by taking raw text or conversations, instantly embedding them at the edge, and dynamically retrieving only the most relevant semantic information right before you generate your prompt.

- **Zero setup**: No databases to provision.
- **Cost effective**: Substantially cheaper than OpenAI embeddings (and completely free to start).
- **Blazing Fast**: Runs natively on the edge.

### Our Tech Stack
Libro is built using a state-of-the-art, Edge-native modern tech stack designed for speed and global scale:
- **Compute Layer**: Vercel Edge Functions & Cloudflare Workers for zero cold-start latency.
- **Database & ORM**: Supabase (PostgreSQL with pgvector) and Drizzle ORM for type-safe, ultra-fast vector math.
- **Embedding Models**: Quantized ONNX variants of \`paraphrase-multilingual-MiniLM-L12-v2\` running natively in WebAssembly.
- **Frontend / SDK**: Next.js App Router, React Server Components, and zero-dependency TypeScript SDKs.
`,
  "quickstart": `
# Quickstart Guide

Get up and running with Libro—the best free AMM Layer—in under two minutes. Our SDK is completely typed and native to modern JavaScript environments.

### 1. Install the SDK
\`\`\`bash
npm install @libro/sdk
\`\`\`

### 2. Basic Ingestion
Import and initialize the client, then ingest your first memory.
\`\`\`typescript
import { Libro } from '@libro/sdk';

const ctx = new Libro({ apiKey: process.env.LIBRO_API_KEY });

await ctx.ingest({
  userId: "user_789",
  content: "User loves dark mode and functional programming."
});
\`\`\`

### 3. Retrieve Context
In your AI route, pull the context before generating the response.
\`\`\`typescript
const context = await ctx.getContext("user_789", "How should I structure my app?");
// AI can now suggest functional programming paradigms.
\`\`\`
`,
  "authentication": `
# Authentication & API Keys

All API requests and SDK methods require a valid Bearer token for authentication. 

### Obtaining Keys
You can generate unlimited API keys from your Libro Dashboard under **Settings > API Keys**.
We provide two environments:
- **Test Keys** (\`cos_test_...\`): Memory ingested here is wiped automatically after 24 hours.
- **Live Keys** (\`cos_live_...\`): Persistent production storage.

### Using the SDK
The SDK automatically handles the \`Authorization\` header. Just pass your key during instantiation:
\`\`\`typescript
const ctx = new Libro({ apiKey: 'cos_live_YOUR_KEY_HERE' });
\`\`\`

### API Requests
If using direct HTTP requests, include the token:
\`\`\`bash
curl -X POST https://libro.dev/api/v1/ingest \\
  -H "Authorization: Bearer cos_live_YOUR_KEY_HERE" \\
  -d '{"userId":"test", "content":"Hello"}'
\`\`\`
`,
  "sdk-installation": `
# JavaScript/TypeScript SDK

Libro distributes a lightweight, dependency-free SDK designed to run in any JavaScript environment.

### Installation
\`\`\`bash
npm install libro-sdk
\`\`\`

### Initialization
\`\`\`typescript
import { LibroClient } from 'libro-sdk';

const client = new LibroClient({ 
  apiKey: "cos_live_YOUR_KEY",
  baseUrl: "https://libro.co.in" // Optional: defaults to production
});
\`\`\`

### Core Methods

#### 1. Ingest
Save a piece of memory for a specific user.
\`\`\`typescript
const response = await client.ingest({
  userId: "user_123",
  content: "User prefers functional programming paradigms.",
  metadata: { source: "slack", priority: "high" }
});
console.log(response.memory.id); // 'uuid-...'
\`\`\`

#### 2. Get Context
Retrieve an optimized, LLM-ready context string.
\`\`\`typescript
const context = await client.getContext(
  "user_123", 
  "What programming style should I recommend?"
);
// "User prefers functional programming paradigms."
\`\`\`

#### 3. Semantic Search
Return raw memory objects with scores and metadata.
\`\`\`typescript
const results = await client.search({
  userId: "user_123",
  query: "programming style",
  limit: 5
});
console.log(results[0].content);
\`\`\`

#### 4. Update
Modify an existing memory block.
\`\`\`typescript
await client.update({
  userId: "user_123",
  memoryId: "uuid-...",
  text: "User prefers functional programming and TypeScript."
});
\`\`\`

#### 5. Forget (Delete)
Delete a specific memory by ID, or delete all memories matching a semantic query, or wipe a user entirely.
\`\`\`typescript
// Delete specific memory
await client.forget({ userId: "user_123", memoryId: "uuid-..." });

// Delete based on semantic query
await client.forget({ userId: "user_123", query: "credit card details" });

// Wipe all user data
await client.forget({ userId: "user_123" });
\`\`\`
`,
  "python-sdk": `
# Python SDK

Libro provides a first-class Python SDK optimized for machine learning pipelines, backend services, and LangChain/LlamaIndex integrations.

### Installation
\`\`\`bash
pip install libro-sdk
\`\`\`

### Initialization
\`\`\`python
from libro import LibroClient
import os

client = LibroClient(
    api_key=os.environ.get("LIBRO_API_KEY"), 
    base_url="https://libro.co.in" # Optional
)
\`\`\`

### Core Methods

#### 1. Ingest
Store user facts or conversational context.
\`\`\`python
res = client.ingest(
    user_id="user_123",
    text="User prefers Python over Java for backend work.",
    metadata={"source": "api"}
)
print(res["memory"]["id"])
\`\`\`

#### 2. Get Context
Retrieve semantic context formatted specifically for LLM system prompts.
\`\`\`python
context = client.get_context(
    user_id="user_123",
    query="What language should we use?"
)
\`\`\`

#### 3. Semantic Search
Return raw arrays of memory dictionaries for programmatic filtering.
\`\`\`python
results = client.search(
    user_id="user_123",
    query="programming preferences",
    limit=5
)
for r in results:
    print(r["score"], r["content"])
\`\`\`

#### 4. Update
Update a previously ingested memory. The embedding is recalculated automatically.
\`\`\`python
client.update(
    user_id="user_123",
    memory_id="uuid-...",
    content="User prefers Python and Rust for backend work."
)
\`\`\`

#### 5. Forget (Delete)
Comply with GDPR by deleting specific facts or wiping users.
\`\`\`python
# Delete specific memory
client.forget(user_id="user_123", memory_id="uuid-...")

# Delete by semantic query
client.forget(user_id="user_123", query="credit card")

# Wipe all user data
client.forget(user_id="user_123")
\`\`\`
`,
  "initializing-client": `
# Initializing the Client

The \`Libro\` client class is your primary entrypoint. 

### Basic Initialization
\`\`\`typescript
import { Libro } from '@libro/sdk';

const ctx = new Libro({
  apiKey: process.env.LIBRO_API_KEY
});
\`\`\`

### Advanced Configuration
You can pass additional configurations to customize the behavior of the SDK, such as configuring custom retry logic or changing the base URL.
\`\`\`typescript
const ctx = new Libro({
  apiKey: process.env.LIBRO_API_KEY,
  maxRetries: 3,         // Retry up to 3 times on 5xx errors
  timeout: 5000,         // Fail after 5 seconds
  debug: true            // Enable verbose logging
});
\`\`\`
`,
  "global-architecture": `
# Global Architecture

Libro fundamentally rewrites how vectorization occurs by bringing the embedding models to the edge.

### The Problem with Traditional Vectors
Historically, developers had to:
1. Send text to OpenAI to get an embedding.
2. Store that massive float array in Pinecone or Postgres (pgvector).
3. Do this on a centralized database, introducing heavy latency.

### The Libro Edge Engine
Libro runs specialized, highly optimized ONNX variants of Transformer models directly on the Edge. When you call \`ingest()\`:
1. The text hits our nearest edge node (e.g. Frankfurt, Sydney, Washington).
2. It is chunked and vectorized locally in under 15ms.
3. It is stored in a distributed edge-replica database.

This architecture results in zero central-database bottleneck, meaning infinite scaling.
`,
  "multilingual-vectorization": `
# Multilingual Vectorization

Libro doesn't just understand English. It natively speaks over 50 languages using our \`paraphrase-multilingual-MiniLM-L12-v2\` core model.

### How it works
The vector space maps semantics, not just vocabulary. This means the concept of "Software Engineer" in English is mapped incredibly closely to "Ingénieur Logiciel" in French.

### Example
If you ingest context in Japanese:
\`\`\`typescript
await ctx.ingest({
  userId: "user_jp",
  content: "私は犬が好きです" // "I like dogs"
});
\`\`\`
And later query it in English:
\`\`\`typescript
const result = await ctx.getContext("user_jp", "What is their favorite animal?");
\`\`\`
Libro will perfectly resolve the semantic match and return the Japanese text. No pre-translation required.
`,
  "semantic-chunking": `
# Semantic Chunking

If you've ever built a RAG (Retrieval-Augmented Generation) pipeline, you know that chunking is the hardest part. If you cut a sentence in half, you lose the semantic meaning.

### Infinite Chunking Engine
Libro completely abstracts this away. You can pass a 100,000-word document into the \`ingest()\` endpoint.

1. **Sentence Boundary Detection**: We split the text precisely at periods, newlines, and semantic shifts.
2. **Overlap Buffering**: We automatically overlap chunks by 15% so context isn't lost between boundaries.
3. **Parallel Vectorization**: The chunks are vectorized in parallel across our edge nodes.

### Example
\`\`\`typescript
// You can literally pass a whole book chapter
await ctx.ingest({
  userId: "author_1",
  content: massiveStringChapterOne
});
\`\`\`
`,
  "security-privacy": `
# Security & Privacy

Your users' context is highly sensitive. Libro is designed from the ground up for privacy, compliance, and security.

### Data Encryption
- **In Transit**: All connections utilize TLS 1.3.
- **At Rest**: Data is encrypted at rest using AES-256 block-level encryption.

### SOC2 & GDPR
Libro is SOC2 Type II compliant. We offer strict GDPR compliance tools, including one-click permanent deletion of user data.

### Zero-Training Policy
**We do not train models on your data.** The embedding models used for vectorization are pre-trained. Your text is processed dynamically in memory and immediately persisted to isolated tables. We will never use your users' conversations to improve our models.
`,
  "best-practices": `
# Best Practices for Prompts

To get the most out of Libro, you should structure your AI prompts to smoothly consume the injected context.

### The System Prompt Injection
Always place the retrieved context at the **top** of your system prompt, so the AI reads the context before determining its persona.

\`\`\`typescript
const contextString = await ctx.getContext("user_123", userMessage);

const systemPrompt = \`
You are a helpful AI assistant. 
Here is important context about the user from past sessions:
<context>
\${contextString}
</context>

Always adhere to the user's preferences mentioned above.
\`;
\`\`\`

### Be Specific with Queries
The better your query matches the desired semantics, the better the retrieval.
- **Bad Query**: "What does the user want?"
- **Good Query**: "User's preferences regarding UI design and color themes."
`,
  "ingesting-data-basic": `
# Ingesting Data (Basics)

The \`ingest()\` method is the lifeblood of Libro. It tells the engine to memorize a piece of information for a specific user.

### Basic Payload
The minimum required fields are \`userId\` and \`content\`.

\`\`\`typescript
await ctx.ingest({
  userId: "user_456",
  content: "User mentioned they are allergic to peanuts."
});
\`\`\`

### When to Ingest?
We recommend ingesting data **asynchronously** in the background after a user action, rather than blocking the main thread.
For example, if you are building an AI chatbot, use \`waitUntil()\` in Next.js or edge workers to ingest the conversation summary without slowing down the user's response time.
`,
  "ingesting-data-metadata": `
# Ingesting Data (Metadata)

Sometimes, raw text isn't enough. You want to tag memories with specific metadata so you can filter them later.

### Adding Metadata
You can attach arbitrary JSON to any ingested content using the \`metadata\` parameter.

\`\`\`typescript
await ctx.ingest({
  userId: "user_456",
  content: "User purchased the premium subscription.",
  metadata: {
    plan: "premium",
    source: "stripe_webhook",
    amount: 99.99
  }
});
\`\`\`

### Why use Metadata?
Metadata is critical when you want to execute a Semantic Search but strictly limit the results to a specific category. For example, finding all "billing" related complaints.
`,
  "retrieving-context": `
# Retrieving Context

The \`getContext()\` method is used right before you call your LLM (OpenAI, Anthropic, etc.). It retrieves the top K most relevant semantic chunks for the current query.

### Basic Retrieval
\`\`\`typescript
const relevantContext = await ctx.getContext(
  "user_789", 
  "The user is asking about upgrading their plan. What is their current plan?"
);

console.log(relevantContext); 
// Returns a combined string of the most relevant memories.
\`\`\`

### Formatted String vs Raw Array
By default, \`getContext\` returns a highly optimized single string, formatted specifically for LLMs to read efficiently. If you want the raw array of objects (to inspect distances or metadata), use the Search API instead.
`,
  "semantic-search-api": `
# Semantic Search API

If you need more programmatic control than \`getContext\`, you can use the \`search()\` method.

### Raw Vector Search
\`\`\`typescript
const results = await ctx.search({
  userId: "user_789",
  query: "billing issues",
  limit: 5
});
\`\`\`

### Filtering by Metadata
You can provide a \`filter\` object to strictly limit the search space using metadata tags you attached during ingestion.
\`\`\`typescript
const results = await ctx.search({
  userId: "user_789",
  query: "billing issues",
  limit: 5,
  filter: {
    source: "support_ticket" // Only search through support tickets
  }
});

results.forEach(res => {
  console.log(res.score, res.content, res.metadata);
});
\`\`\`
`,
  "managing-data": `
# Managing & Deleting Data (GDPR)

To comply with GDPR and CCPA, Libro provides granular APIs to manage and delete user memories.

### Deleting Specific Memories
You can delete a specific memory by ID or by a semantic query string using the \`forget()\` API.

#### JavaScript SDK
\`\`\`typescript
// Delete by ID
await ctx.forget({ userId: "user_123", memoryId: "uuid-1234" });

// Delete all memories matching a string
await ctx.forget({ userId: "user_123", query: "credit card number" });
\`\`\`

#### Python SDK
\`\`\`python
# Delete by ID
client.forget(user_id="user_123", memory_id="uuid-1234")

# Delete by query
client.forget(user_id="user_123", query="credit card number")
\`\`\`

### Updating Memories
You can update the text or metadata of an existing memory. If the text changes, Libro automatically recalculates the 768-dim embedding via the sidecar service.

#### JavaScript SDK
\`\`\`typescript
await ctx.update({
  userId: "user_123",
  memoryId: "uuid-1234",
  text: "Updated preference: prefers dark mode.",
  metadata: { priority: "high" }
});
\`\`\`
`,
  "webhooks": `
# Webhooks

Libro can notify your application when asynchronous events finish executing, such as massive document chunking.

### Setting up Webhooks
1. Go to your Libro Dashboard -> Webhooks.
2. Add your endpoint (e.g. \`https://api.yourapp.com/webhooks/libro\`).
3. Select the events you want to subscribe to.

### Webhook Payload
When a large ingestion finishes, you will receive a POST request:
\`\`\`json
{
  "event": "ingestion.complete",
  "data": {
    "userId": "user_999",
    "chunksProcessed": 450,
    "timeTakenMs": 1205
  }
}
\`\`\`

### Security Signature
Always verify the \`X-Libro-Signature\` header to ensure the webhook genuinely originated from our servers.
`,
  "rate-limiting": `
# Rate Limiting

To maintain blazing fast speeds on the edge, we enforce rate limits on API requests.

### Limits by Tier
- **Hobby Plan**: 100 requests per minute
- **Pro Plan**: 1,000 requests per minute
- **Enterprise**: Custom Limits

### Handling Limits
If you exceed your rate limit, the API will return a \`429 Too Many Requests\` status code.
The response will include a \`Retry-After\` header indicating how many seconds you must wait.

### Built-in Backoff
If you initialize the Libro SDK with \`maxRetries\`, it will automatically handle 429 responses and implement exponential backoff logic on your behalf!
`,
  "error-handling": `
# Error Handling

Libro uses standard HTTP status codes.

### Common Status Codes
- \`200 OK\`: Request succeeded.
- \`400 Bad Request\`: Invalid parameters (e.g., missing userId).
- \`401 Unauthorized\`: Invalid or missing API Key.
- \`429 Too Many Requests\`: Rate limit exceeded.
- \`500 Internal Server Error\`: Edge node failure.

### SDK Error Catching
The SDK will throw a \`LibroError\` containing detailed information.
\`\`\`typescript
import { LibroError } from '@libro/sdk';

try {
  await ctx.ingest({ userId: "", content: "" });
} catch (error) {
  if (error instanceof LibroError) {
    console.log(error.status);  // 400
    console.log(error.message); // "userId is required"
  }
}
\`\`\`
`,
  "integrations": `
# Integrations

Libro is designed to slot perfectly into modern Fullstack frameworks.

### Vercel AI SDK Integration
You can use Libro seamlessly alongside the Vercel AI SDK to stream context-aware responses.

\`\`\`typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

// 1. Get Context
const context = await ctx.getContext(userId, userPrompt);

// 2. Stream Generation
const result = await streamText({
  model: openai('gpt-4o'),
  system: \`You are an AI assistant. Context: \${context}\`,
  prompt: userPrompt,
});

return result.toDataStreamResponse();
\`\`\`

### Supabase Integration
You can trigger Libro ingestion directly from Supabase Database Webhooks when a new row is inserted into your \`users\` table!
`,
  "mcp-introduction": `
# What is MCP?

The **Model Context Protocol (MCP)** is an open standard introduced by Anthropic that allows AI agents and IDEs (like Claude Desktop, Cursor, and Windsurf) to securely communicate with external data sources.

### Why use Libro with MCP?
Usually, an AI like Claude has amnesia. The moment you start a new chat thread, it forgets everything about you. By connecting the **Libro MCP Server** to your AI client, you instantly give your AI infinite, long-term memory. 

Whenever you chat with your AI, it will automatically query your Libro AMM Layer in the background to pull your preferences, past architectural decisions, and context directly into its prompt before it answers you.

### How it works
1. You run our official MCP Server locally, or point your IDE to our Cloud SSE MCP endpoint.
2. The MCP Server exposes tools like \`remember_fact\`, \`get_user_context\`, and \`search_memories\`.
3. The AI agent automatically calls these tools whenever it realizes it needs more context about you.
`,
  "mcp-claude": `
# Connecting to Claude Desktop

Claude Desktop supports MCP natively. You can give Claude infinite memory across all your chat threads in less than 2 minutes.

### Step 1: Open the Config File
Open the Claude Desktop configuration file located at:
- **Mac**: \`~/Library/Application Support/Claude/claude_desktop_config.json\`
- **Windows**: \`%APPDATA%\\Claude\\claude_desktop_config.json\`

### Step 2: Add the Libro MCP Server
Add the Libro MCP Server to your configuration file. You will run the server locally using \`npx\`.

Make sure to replace \`YOUR_API_KEY\`, \`YOUR_USER_ID\` and \`YOUR_BASE_URL\` with the credentials found on your Libro Dashboard.

\`\`\`json
{
  "mcpServers": {
    "libro": {
      "command": "npx",
      "args": ["-y", "libro-mcp-server@latest"],
      "env": {
        "LIBRO_API_KEY": "YOUR_API_KEY",
        "LIBRO_USER_ID": "YOUR_USER_ID",
        "LIBRO_BASE_URL": "https://www.libro.co.in"
      }
    }
  }
}
\`\`\`

### Step 3: Restart Claude
Completely quit Claude Desktop (\`Cmd+Q\`) and open it again. You will now see the "plug" icon next to your chat bar, indicating the Libro Memory tools are active! Tell Claude to \`/ingest\` something or \`/fetch\` what it knows about you!
`,
  "mcp-cursor": `
# Connecting to Cursor IDE

Cursor is a deeply integrated AI code editor. By giving Cursor access to Libro via MCP, Cursor will remember your architectural decisions, code patterns, and project rules across all your different workspaces.

### Step 1: Open Cursor Settings
1. Open Cursor Settings.
2. Navigate to **Features** > **MCP Servers**.
3. Click the **+ Add New MCP Server** button.

### Step 2: Configure the Server
We will run the server locally using \`npx\`.

1. **Name**: \`libro\`
2. **Type**: Select \`command\`
3. **Command**: \`npx -y libro-mcp-server@latest\`
4. **Environment Variables**: Add the following (found on your dashboard):
   - \`LIBRO_API_KEY\`: \`YOUR_API_KEY\`
   - \`LIBRO_USER_ID\`: \`YOUR_USER_ID\`
   - \`LIBRO_BASE_URL\`: \`https://www.libro.co.in\`

### Step 3: Verify
Click **Save**. You should see a green dot indicating the server is connected. Cursor can now automatically access your centralized developer memory!
`,
  "mcp-windsurf": `
# Connecting to Windsurf

Windsurf (by Codeium) supports MCP servers via its configuration files.

### Step 1: Open the Config File
Locate the Windsurf configuration file:
- **Mac/Linux**: \`~/.codeium/windsurf/mcp_config.json\`
- **Windows**: \`%USERPROFILE%\\.codeium\\windsurf\\mcp_config.json\`

*(If the file does not exist, create it).*

### Step 2: Add the Configuration
Add the Libro MCP connection command.

\`\`\`json
{
  "mcpServers": {
    "libro": {
      "command": "npx",
      "args": ["-y", "libro-mcp-server@latest"],
      "env": {
        "LIBRO_API_KEY": "YOUR_API_KEY",
        "LIBRO_USER_ID": "YOUR_USER_ID",
        "LIBRO_BASE_URL": "https://www.libro.co.in"
      }
    }
  }
}
\`\`\`

### Step 3: Restart Windsurf
Restart the IDE. Windsurf's AI will now automatically invoke the Libro memory tools to store and retrieve your preferences.
`,
  "mcp-antigravity": `
# Connecting to Antigravity

Antigravity IDE supports MCP servers via its configuration file.

### Step 1: Open the Config File
Locate the Antigravity configuration file:
- \`~/.gemini/config/mcp_servers.json\`

*(If the file does not exist, create it).*

### Step 2: Add the Configuration
Add the Libro MCP connection command.

\`\`\`json
{
  "mcpServers": {
    "libro": {
      "command": "npx",
      "args": ["-y", "libro-mcp-server@latest"],
      "env": {
        "LIBRO_API_KEY": "YOUR_API_KEY",
        "LIBRO_USER_ID": "YOUR_USER_ID",
        "LIBRO_BASE_URL": "https://www.libro.co.in"
      }
    }
  }
}
\`\`\`

### Step 3: Reload Window
Reload your Antigravity IDE Window. The Antigravity agent will now automatically invoke the Libro memory tools to store and retrieve your context.
`,
  "chrome-extension": `
# Chrome Extension

The ContextOS Chrome Extension allows you to easily ingest data from web pages, highlight important information, and sync your browsing context into your global AI memory.

### Integration
The backend API for the Chrome Extension is fully built and ready!
- \`/api/extension/ingest\` - Securely validates Supabase JWTs and runs text through the ProfileExtractionEngine, SemanticDeduplicationEngine, MemoryEvolutionEngine, and ContextGraphEngine.

### Checking Review Status
If you have submitted your extension to the Chrome Web Store for review, you can check its status by going to the **[Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)**.
- Log in with the Google Account you used to submit it.
- Click on your extension in the list.
- The status will say **Pending Review**, **Published**, or **Rejected**. Reviews typically take 2-4 business days for new extensions.
`,
  "rest-api-reference": `
# REST API Reference

If you are not using our TypeScript or Python SDKs, you can interact directly with our Edge Engine using standard HTTP REST requests.

All requests must include your API key in the \`Authorization\` header as a Bearer token.

---

## 1. Ingest Memory
Store a new piece of context.

- **Endpoint**: \`POST https://libro.co.in/api/v1/ingest\`
- **Headers**: 
  - \`Authorization: Bearer YOUR_API_KEY\`
  - \`Content-Type: application/json\`

#### Request Payload
\`\`\`json
{
  "userId": "string (required)",
  "content": "string (required) - The text to vectorize.",
  "metadata": { "key": "value" } // optional JSON object
}
\`\`\`

#### Response \`200 OK\`
\`\`\`json
{
  "success": true,
  "memory": {
    "id": "uuid",
    "content": "string"
  }
}
\`\`\`

---

## 2. Get Context
Retrieve an optimized string of semantics formatted for an LLM prompt.

- **Endpoint**: \`POST https://libro.co.in/api/v1/context\`
- **Headers**: \`Authorization: Bearer YOUR_API_KEY\`

#### Request Payload
\`\`\`json
{
  "userId": "string (required)",
  "query": "string (required) - The semantic question."
}
\`\`\`

#### Response \`200 OK\`
\`\`\`json
{
  "success": true,
  "context": "string (Formatted results separated by newlines)"
}
\`\`\`

---

## 3. Semantic Search
Return raw arrays of memory objects with their cosine similarity scores.

- **Endpoint**: \`POST https://libro.co.in/api/v1/search\`
- **Headers**: \`Authorization: Bearer YOUR_API_KEY\`

#### Request Payload
\`\`\`json
{
  "userId": "string (required)",
  "query": "string (required)",
  "limit": 5, // optional
  "filter": { "priority": "high" } // optional metadata filter
}
\`\`\`

#### Response \`200 OK\`
\`\`\`json
{
  "success": true,
  "results": [
    {
      "id": "uuid",
      "content": "string",
      "score": 0.89,
      "metadata": {}
    }
  ]
}
\`\`\`
`
};
