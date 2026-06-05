/**
 * Embeddings Generator
 * 
 * Strategy: Hugging Face Inference API (free tier) → No cold starts, no model downloads.
 * Falls back to Xenova local model if HF_TOKEN is not set (local dev only).
 * 
 * To enable: add HF_TOKEN=hf_xxx to your .env.local
 * Get a free token at: https://huggingface.co/settings/tokens
 */

const HF_API_URL = 'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2';

// --- Hugging Face Inference API (Primary, Zero Cold Start) ---
async function generateEmbeddingViaHF(text: string): Promise<number[]> {
  const token = process.env.HF_TOKEN;

  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: text.slice(0, 512), // MiniLM max token limit
      options: { wait_for_model: true }, // Don't fail if model is loading on HF side
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HuggingFace API error: ${response.status} - ${err}`);
  }

  const result = await response.json();
  
  // HF returns [[...embedding]] for feature-extraction
  if (Array.isArray(result) && Array.isArray(result[0])) {
    // Sentence-transformers model returns the pooled embedding directly
    // as a nested array: [[0.1, 0.2, ...]]
    return result[0];
  }
  
  // Some models return a flat array
  if (Array.isArray(result) && typeof result[0] === 'number') {
    return result;
  }

  throw new Error('Unexpected response shape from HuggingFace API');
}

// --- Xenova Local (Fallback for local dev without HF_TOKEN) ---
let localPipelinePromise: Promise<any> | null = null;

async function generateEmbeddingLocally(text: string): Promise<number[]> {
  const { pipeline } = await import('@xenova/transformers');
  
  // Correct singleton: store the Promise so concurrent callers await the same load
  if (!localPipelinePromise) {
    localPipelinePromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  
  const extractor = await localPipelinePromise;
  const output = await extractor(text.slice(0, 512), { pooling: 'mean', normalize: true });
  return Array.from(output.data as Float32Array);
}

// --- Public API ---
export async function generateEmbedding(text: string): Promise<number[]> {
  const trimmed = text.trim();
  
  if (!trimmed) {
    throw new Error('Cannot embed empty text');
  }

  // Use HF API in production (set HF_TOKEN in Vercel env vars)
  if (process.env.HF_TOKEN) {
    return generateEmbeddingViaHF(trimmed);
  }

  // Fall back to local model in dev (causes cold start, acceptable locally)
  console.warn('[embeddings] HF_TOKEN not set. Falling back to local Xenova model (cold start expected).');
  return generateEmbeddingLocally(trimmed);
}
