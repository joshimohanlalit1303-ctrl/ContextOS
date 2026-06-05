# Libro SDK

The official JavaScript/TypeScript SDK for **Libro** — The User Context Layer for AI Applications.

Transform conversations into structured, evolving user understanding. Build AI agents with infinite memory using our zero-cost local vectorization, semantic deduplication, and drop-in SDK.

## Features
- **⚡️ Blazing Fast Ingestion**: Edge-optimized architecture guarantees <300ms ingestion latency.
- **🧠 Zero Pipeline Changes**: Seamlessly retrieve memories to pass into your LLM prompt.
- **🛡️ Full Privacy Control**: Bring your own Supabase. We don't store your vectors, you do.
- **⏱️ Automated Context Trimming**: Never overflow your context window again.

## Installation

```bash
npm install libro-sdk
```

*Note: Requires Node.js >= 18.*

## Quick Start

### 1. Initialize the Client

```javascript
import { LibroClient } from 'libro-sdk';

const libro = new LibroClient({
  apiKey: process.env.LIBRO_API_KEY, 
  baseUrl: 'https://libro.co.in' // Optional: defaults to production
});
```

### 2. Ingest Memory

Save facts, preferences, or chunks of conversation into a user's memory brain.

```javascript
const response = await libro.ingest({
  content: "User prefers functional programming over OOP.",
  endUserId: "user-12345",
  metadata: { source: "slack_integration" }
});

console.log(response.memory.id); // 'f3b974d0-...'
```

### 3. Retrieve Context

Retrieve the most relevant memories for a user before passing context to an LLM like GPT-4 or Claude.

```javascript
const { context, memories } = await libro.getContext({
  query: "What kind of code structure do they like?",
  endUserId: "user-12345"
});

console.log(context); 
// -> "[Memory 1] (Relevance: 85.2%): User prefers functional programming over OOP."
```

### 4. Update Memory

When a user's preferences change, update their specific memory block directly.

```javascript
await libro.update("memory-uuid-1234", {
  content: "User prefers OOP when building large enterprise systems."
});
```

### 5. Forget (GDPR Compliance)

Fully delete a user's memory or specific blocks to comply with data deletion requests.

```javascript
// Delete a specific memory
await libro.forget({ memoryId: "memory-uuid-1234" });

// Delete ALL memories for a user (GDPR "Right to be Forgotten")
await libro.forget({ endUserId: "user-12345" });
```

## How It Works Under The Hood
Unlike managed monoliths (Mem0, Zep), Libro uses an **Edge-first architecture**. Our SDK hits your API, and the vectorization happens instantly on the edge via a lightweight embedding sidecar (`nomic-embed-text-v1.5`), before being stored directly in your own Supabase instance using `pgvector` HNSW indexes. 

Zero vendor lock-in. Full data sovereignty. 

---
**Libro** — Memory that never forgets.
