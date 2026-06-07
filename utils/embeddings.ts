/**
 * Embeddings Generator — Sidecar Architecture
 *
 * Model: nomic-ai/nomic-embed-text-v1.5
 * Dimensions: 768
 * Sidecar URL: http://localhost:8000/embed
 * Cold start: < 100ms (sidecar is always warm)
 */

export async function generateEmbedding(text: string, taskType: string = 'search_document'): Promise<number[]> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('Cannot embed empty text');

  const SIDECAR_URL = process.env.EMBEDDING_SIDECAR_URL || 'http://localhost:8000';

  try {
    const response = await fetch(`${SIDECAR_URL}/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: trimmed,
        task_type: taskType
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Embedding sidecar error (${response.status}): ${err}`);
    }

    const data = await response.json();
    return data.embedding;
  } catch (error: any) {
    // If the sidecar isn't running or there's a connection issue, try Hugging Face Inference API
    if (process.env.HF_TOKEN) {
      console.warn('Local embedding sidecar unavailable, falling back to Hugging Face API...');
      return await generateEmbeddingHF(trimmed, taskType);
    }

    // If the sidecar isn't running, provide a helpful error
    if (error.cause && error.cause.code === 'ECONNREFUSED') {
      throw new Error('Embedding sidecar is not running. Please start it using: cd packages/libro-embedding-service && uvicorn main:app --port 8000');
    }
    throw error;
  }
}

async function generateEmbeddingHF(text: string, taskType: string): Promise<number[]> {
  const HF_TOKEN = process.env.HF_TOKEN;
  if (!HF_TOKEN) {
    throw new Error('HF_TOKEN is not defined for fallback embeddings.');
  }

  const HF_MODEL = "sentence-transformers/all-mpnet-base-v2";
  const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}/pipeline/feature-extraction`;
  const prefix = `${taskType}: `;

  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prefix + text,
      options: { wait_for_model: true }
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Hugging Face API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  
  // The HuggingFace API for feature extraction can return nested arrays depending on the input shape.
  let embedding = data;
  if (Array.isArray(data) && Array.isArray(data[0])) {
    embedding = data[0];
  }
  
  return embedding as number[];
}
