/**
 * Embeddings Generator
 *
 * Uses the @ai-sdk/google package (same as PassportExtractionEngine)
 * which already works with the configured GOOGLE_GENERATIVE_AI_API_KEY.
 * 
 * Model: text-embedding-004 (768 dimensions, free, always warm, no cold start)
 * Falls back to local Xenova if the Google key is not available.
 */

import { embed } from 'ai';
import { google } from '@ai-sdk/google';

// ─── Google AI SDK Embeddings (Primary) ───────────────────────────────────────
async function generateEmbeddingViaGoogle(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: google.textEmbeddingModel('text-embedding-004'),
    value: text.slice(0, 2048),
  });
  return embedding;
}

// ─── Xenova Local (Fallback for dev without API key) ──────────────────────────
let localPipelinePromise: Promise<any> | null = null;

async function generateEmbeddingLocally(text: string): Promise<number[]> {
  const { pipeline } = await import('@xenova/transformers');
  // Store the Promise itself so concurrent callers await the same load
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

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return generateEmbeddingViaGoogle(trimmed);
  }

  console.warn('[embeddings] GOOGLE_GENERATIVE_AI_API_KEY not set. Falling back to local Xenova (cold start expected in dev).');
  return generateEmbeddingLocally(trimmed);
}
