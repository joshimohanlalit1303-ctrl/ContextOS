# Understanding Embeddings in Libro

Libro uses **Vector Embeddings** to power its semantic memory engine. But what exactly is an embedding, and how does Hugging Face fit into the picture? This document breaks down the process from complex architecture to basic concepts.

## 1. The High-Level Architecture (How it fits together)

When you send a text memory to Libro, we don't just store the text. We convert it into a vector using a Hugging Face model running directly on our Edge API.

```mermaid
graph TD
    A[User's Raw Text Memory] -->|Sent via API| B(Libro Edge API)
    
    subgraph Hugging Face Inference
    B --> C{Xenova/Transformers.js}
    C -->|Downloads/Caches Model| D[Supabase-bge-small-en]
    D -->|Processes Text| E[1536-Dimensional Vector]
    end
    
    E -->|INSERT INTO| F[(Supabase Postgres)]
    F -->|Stored in pgvector column| G[Searchable Semantic Memory]
    
    style C fill:#ffcc00,stroke:#333,stroke-width:2px,color:black
    style D fill:#ffcc00,stroke:#333,stroke-width:2px,color:black
    style E fill:#4caf50,stroke:#333,stroke-width:2px,color:white
```

### The Role of Hugging Face (Xenova/Transformers)
- **Hugging Face** is the premier open-source hub for AI models.
- **Xenova/Transformers.js** is a library that allows us to run Hugging Face models *directly in Node.js/Edge environments* without needing a massive external Python server.
- **The Model:** We use a specialized embedding model (e.g., `Supabase/gte-small` or `bge-small-en`) hosted on Hugging Face. Transformers.js downloads the model weights and converts your text into numbers instantly.

---

## 2. The Vectorization Process (How text becomes math)

How does text turn into a "Vector"? The embedding model acts as a massive dictionary of meaning, not just words. 

```mermaid
flowchart LR
    Text["Text: 'I love React and Next.js'"] --> Tokenizer
    Tokenizer -->|Splits into tokens| T1["['I', 'love', 'React', 'and', 'Next', '.js']"]
    T1 --> NeuralNet[Hugging Face Neural Network]
    
    subgraph The Embedding Space
    NeuralNet -->|Maps to 1536 Dimensions| V1["[0.12, -0.45, 0.88, ... 1533 more numbers]"]
    end
```

Every dimension (number) in that array represents a subtle, abstract concept that the AI learned during training.

---

## 3. Semantic Search (How we find memories)

When a user asks a question, we don't look for exact word matches (like traditional SQL `LIKE '%React%'`). Instead, we calculate the "distance" between the question's vector and all the stored memory vectors.

```mermaid
sequenceDiagram
    participant User
    participant Model as Hugging Face Model
    participant DB as Postgres (pgvector)
    
    User->>Model: Query: "What frontend framework do I use?"
    Model-->>User: Query Vector: [0.10, -0.42, 0.85, ...]
    
    Note over User, DB: Cosine Similarity Search
    User->>DB: Compare Query Vector against all Memory Vectors
    
    DB->>DB: Memory A: "I love React" (Distance: 0.05) - VERY CLOSE
    DB->>DB: Memory B: "I like baking" (Distance: 0.89) - FAR AWAY
    
    DB-->>User: Return Memory A
```

### The Basics: What is Cosine Similarity?
Imagine a 2D graph.
- Point A (Memory): `[1, 2]`
- Point B (Query): `[1, 2.1]`
Because the arrows pointing to A and B are pointing in almost the exact same direction, the angle between them is tiny. A tiny angle means they are **semantically similar**. 
Libro does this exact math, just in 1,536 dimensions instead of 2!
