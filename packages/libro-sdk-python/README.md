<div align="center">
  <img src="https://raw.githubusercontent.com/joshimohanlalit1303-ctrl/Libro/main/public/libro-logo.png" alt="Libro Logo" width="120" />
</div>

<h1 align="center">Libro Python SDK</h1>

<p align="center">
  <b>The official Python SDK for Libro — The User Context Layer for AI Applications.</b><br/>
  Transform conversations into structured, evolving user understanding. Build AI agents with infinite memory using our zero-cost local vectorization, semantic deduplication, and drop-in SDK.
</p>

<p align="center">
  <a href="https://pypi.org/project/libro-sdk/"><img src="https://img.shields.io/pypi/v/libro-sdk" alt="PyPI Version"></a>
  <a href="https://pypi.org/project/libro-sdk/"><img src="https://img.shields.io/pypi/pyversions/libro-sdk" alt="Python Versions"></a>
  <a href="https://github.com/joshimohanlalit1303-ctrl/Libro"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License"></a>
</p>

---

## ✨ Features
- **⚡️ Blazing Fast Ingestion**: Edge-optimized architecture guarantees <300ms ingestion latency.
- **🧠 Zero Pipeline Changes**: Seamlessly retrieve memories to pass into your LangChain or LlamaIndex prompts.
- **🛡️ Full Privacy Control**: Bring your own Supabase. We don't store your vectors, you do.
- **⏱️ Automated Context Trimming**: Never overflow your LLM context window again.

## 📦 Installation

```bash
pip install libro-sdk
```

## 🚀 Quick Start

### 1. Initialize the Client

```python
from libro import LibroClient
import os

# Initialize the client with your API key
client = LibroClient(
    api_key=os.environ.get("LIBRO_API_KEY"), 
    base_url="https://libro.co.in" # Optional: defaults to production
)
```

### 2. Ingest Memory

Save facts, preferences, or chunks of conversation into a user's memory brain.

```python
response = client.ingest(
    user_id="user-12345",
    text="User prefers Python over Java for machine learning.",
    metadata={"source": "slack_integration"}
)

print(response["memory"]["id"]) # 'f3b974d0-...'
```

### 3. Retrieve Context

Retrieve the most relevant memories for a user before passing context to an LLM like GPT-4 or Claude.

```python
context_data = client.get_context(
    user_id="user-12345",
    query="What programming language should I use for their new ML project?"
)

print(context_data["context"]) 
# -> "[Memory 1] (Relevance: 85.2%): User prefers Python over Java for machine learning."
```

### 4. Update Memory

When a user's preferences change, update their specific memory block directly.

```python
client.update(
    memory_id="memory-uuid-1234",
    content="User prefers Python for ML, but uses Rust for high-performance systems."
)
```

### 5. Forget (GDPR Compliance)

Fully delete a user's memory or specific blocks to comply with data deletion requests.

```python
# Delete a specific memory
client.forget(memory_id="memory-uuid-1234")

# Delete ALL memories for a user (GDPR "Right to be Forgotten")
client.forget(user_id="user-12345")
```

## 🏗️ How It Works Under The Hood
Unlike managed monoliths, Libro uses an **Edge-first architecture**. Our SDK hits your API, and the vectorization happens instantly on the edge via a lightweight embedding sidecar (`nomic-embed-text-v1.5`), before being stored directly in your own Supabase instance using `pgvector` HNSW indexes. 

Zero vendor lock-in. Full data sovereignty. 

---
<div align="center">
  <b>Libro</b> — Memory that never forgets.
</div>
