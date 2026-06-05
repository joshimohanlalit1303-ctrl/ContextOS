/**
 * Embeddings Generator — Local Xenova (Reliable, Zero External Dependencies)
 *
 * Model: Xenova/all-MiniLM-L6-v2
 * Dimensions: 384
 * Cold start: ~2-3s once per server boot (stays warm for entire session)
 * Cost: $0 forever
 */

// Singleton promise — stores the Promise itself so concurrent callers
// await the same load instead of spawning multiple model instances.
let pipelinePromise: Promise<any> | null = null;

export async function generateEmbedding(text: string): Promise<number[]> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('Cannot embed empty text');

  const { pipeline } = await import('@xenova/transformers');

  if (!pipelinePromise) {
    pipelinePromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }

  const extractor = await pipelinePromise;
  const output = await extractor(trimmed.slice(0, 512), {
    pooling: 'mean',
    normalize: true,
  });

  return Array.from(output.data as Float32Array);
}
