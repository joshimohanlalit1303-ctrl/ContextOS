export const dynamic = 'force-static';

export async function GET() {
  const content = `# Libro - The open-source brain for AI agents

> Libro is the best free AMM (AI Memory Management) Layer for AI applications. Add infinite memory to your AI agents with zero pipeline changes. Drop-in vector search and semantic chunking with no complex setup.

## Links
- Website: https://libro.co.in
- Documentation: https://libro.co.in/docs
- Dashboard: https://libro.co.in/dashboard

## Features
1. Zero-Cost Vectorization: Vector search and RAG capabilities using local compute (via Transformers.js) directly inside your environment.
2. Semantic Deduplication: Automatically detects redundant context and chunk updates before storing.
3. Drop-in SDK: A single command \`npm install @libro/sdk\` and you're integrated.

## Getting Started

### Node.js (Application Integration)
1. Install the SDK: \`npm install @libro/sdk\`
2. Initialize: 
\`\`\`typescript
import { Libro } from '@libro/sdk';
const libro = new Libro({ apiKey: 'YOUR_API_KEY' });
\`\`\`
3. Ingest Context:
\`\`\`typescript
await libro.ingest({ content: "User likes cats", endUserId: "user_123" });
\`\`\`
4. Retrieve Context:
\`\`\`typescript
const context = await libro.getContext({ query: "What pets does the user like?", endUserId: "user_123" });
\`\`\`

### MCP Server (Claude, Cursor, Windsurf Integration)
1. Provide the following command in your MCP configuration to connect Libro's Memory layer directly into your favorite IDE or chat agent:
   \`npx -y libro-mcp-server@latest\`
2. Ensure you provide your \`LIBRO_API_KEY\` in the environment variables.

### System Architecture
- Database: Supabase PostgreSQL with \`pgvector\`.
- Vector embeddings model: \`Xenova/all-MiniLM-L6-v2\`
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
