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
      { title: "SDK Installation", slug: "sdk-installation" },
      { title: "Initializing Client", slug: "initializing-client" },
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
      { title: "Ingesting Data (Basic)", slug: "ingesting-data-basic" },
      { title: "Ingesting Data (Metadata)", slug: "ingesting-data-metadata" },
      { title: "Retrieving Context", slug: "retrieving-context" },
      { title: "Semantic Search API", slug: "semantic-search-api" },
      { title: "Managing Data", slug: "managing-data" },
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

Libro is the first zero-infrastructure, Edge-native memory engine designed specifically for AI applications. Instead of managing complex vector databases like Pinecone, orchestrating embedding models with OpenAI, and dealing with chunking algorithms, Libro handles everything internally.

### Why Libro?
In modern AI development, retaining context is hard. Context windows are limited, and stuffing entire conversation histories into a prompt is expensive and slow.

Libro solves this by taking raw text or conversations, instantly embedding them at the edge, and dynamically retrieving only the most relevant semantic information right before you generate your prompt.

- **Zero setup**: No databases to provision.
- **Cost effective**: Substantially cheaper than OpenAI embeddings.
- **Blazing Fast**: Runs on Vercel Edge and Cloudflare Workers natively.
`,
  "quickstart": `
# Quickstart Guide

Get up and running with Libro in under two minutes. Our SDK is completely typed and native to modern JavaScript environments.

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
# SDK Installation

Libro distributes a lightweight, dependency-free SDK designed to run in any JavaScript environment.

### Node Package Manager
\`\`\`bash
npm install @libro/sdk
\`\`\`

### Yarn
\`\`\`bash
yarn add @libro/sdk
\`\`\`

### pnpm
\`\`\`bash
pnpm add @libro/sdk
\`\`\`

### Supported Environments
Because the Libro SDK uses the native \`fetch\` API, it is universally compatible with:
- **Node.js** (v18+)
- **Vercel Edge Functions**
- **Cloudflare Workers**
- **Deno**
- **Browser Environments** (though we strictly recommend against using API keys in client-side code).
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
# Managing & Deleting Data

To comply with GDPR and CCPA, you must provide a way to delete user data when requested.

### Deleting a User
The \`deleteUser()\` method wipes all memory, vectors, and metadata associated with a specific \`userId\` instantly.
\`\`\`typescript
await ctx.deleteUser("user_123");
// All data is completely destroyed across all edge replicas.
\`\`\`

### Deleting Specific Memories
Currently, Libro treats the user as the primary boundary. If you need to delete a specific memory, we recommend using short-lived keys, or managing memory via the Dashboard. Granular chunk-level deletion API is coming in v2.
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
};
