-- ============================================================
-- MIGRATION: Upgrade vector dimensions 384 → 768
-- Reason: Switching from MiniLM (384-dim) to Gemini text-embedding-004 (768-dim)
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Drop old HNSW index (required before altering column type)
DROP INDEX IF EXISTS memories_embedding_idx;

-- 2. Drop the old match_memories function (uses old vector size)
DROP FUNCTION IF EXISTS match_memories;

-- 3. Alter the embedding column to 768 dimensions
-- Step 1: Drop old column
ALTER TABLE public.memories DROP COLUMN embedding;
-- Step 2: Add as nullable (avoids invalid default dimension error)
ALTER TABLE public.memories ADD COLUMN embedding vector(768);
-- Step 3: Remove any lingering null rows (safety)
DELETE FROM public.memories WHERE embedding IS NULL;
-- Step 4: Enforce NOT NULL
ALTER TABLE public.memories ALTER COLUMN embedding SET NOT NULL;

-- 4. Recreate HNSW index for 768 dimensions with tuned parameters
CREATE INDEX memories_embedding_idx ON public.memories 
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- 5. Recreate the match_memories function for 768 dimensions
CREATE OR REPLACE FUNCTION match_memories (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_api_key_id uuid,
  p_end_user_id text
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql
AS $$
  SELECT
    memories.id,
    memories.content,
    memories.metadata,
    1 - (memories.embedding <=> query_embedding) AS similarity
  FROM memories
  WHERE 
    memories.api_key_id = p_api_key_id
    AND memories.end_user_id = p_end_user_id
    AND 1 - (memories.embedding <=> query_embedding) > match_threshold
  ORDER BY memories.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Done! Your Supabase vector store now supports 768-dim Gemini embeddings.
