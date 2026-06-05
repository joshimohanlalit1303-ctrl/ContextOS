/**
 * Embeddings Generator
 *
 * Strategy: Google Gemini text-embedding-004 (FREE, 1500 req/day)
 * - No cold starts (external API call, always warm)
 * - 768 dimensions (better quality than MiniLM's 384)
 * - Already have GOOGLE_GENERATIVE_AI_API_KEY in your .env!
 * - Falls back to local Xenova if key not available
 */

// ─── Google Gemini Embeddings (Primary, Free, Always Warm) ───────────────────
async function generateEmbeddingViaGemini(text: string): Promise<number[]> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not set');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: {
          parts: [{ text: text.slice(0, 2048) }]
        },
        taskType: 'SEMANTIC_SIMILARITY',
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini Embeddings API error: ${response.status} - ${err}`);
  }

  const result = await response.json();
  return result.embedding.values as number[];
}

// ─── Xenova Local (Fallback) ──────────────────────────────────────────────────
let localPipelinePromise: Promise<any> | null = null;

async function generateEmbeddingLocally(text: string): Promise<number[]> {
  const { pipeline } = await import('@xenova/transformers');
  if (!localPipelinePromise) {
    localPipelinePromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  const extractor = await localPipelinePromise;
  const output = await extractor(text.slice(0, 512), { pooling: 'mean', normalize: true });
  return Array.from(output.data as Float32Array);
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function generateEmbedding(text: string): Promise<number[]> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('Cannot embed empty text');

  // Use Gemini in production (free, 1500 req/day, no cold start)
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return generateEmbeddingViaGemini(trimmed);
  }

  // Fall back to local model
  console.warn('[embeddings] No embedding API key found. Falling back to local Xenova (slow cold start).');
  return generateEmbeddingLocally(trimmed);
}
