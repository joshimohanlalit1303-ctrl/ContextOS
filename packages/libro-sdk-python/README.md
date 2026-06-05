# Libro Python SDK

Official Python SDK for Libro, the open-source AI memory infrastructure.

## Installation

```bash
pip install libro-sdk
```

## Quick Start

```python
from libro import LibroClient

# Initialize the client
client = LibroClient(api_key="your_api_key", base_url="http://localhost:3000")

# 1. Ingest a memory
client.ingest(
    user_id="user_123",
    text="User prefers Python over Java",
    metadata={"source": "slack"}
)

# 2. Retrieve context
context = client.get_context(
    user_id="user_123",
    query="What programming language do they like?"
)

print(context)
```
