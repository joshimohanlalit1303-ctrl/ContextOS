-- Migration: Upgrade vector dimensions to 768 for nomic-embed-text-v1.5
-- WARNING: This will drop the existing 384-dimensional vectors.

-- 1. Drop the existing HNSW index
-- We must find and drop the unnamed index on memories
DO $$ 
DECLARE
    index_name text;
BEGIN
    SELECT i.relname INTO index_name
    FROM pg_class t, pg_class i, pg_index ix
    WHERE t.oid = ix.indrelid
      AND i.oid = ix.indexrelid
      AND t.relname = 'memories'
      AND i.relname LIKE '%memories_embedding%';
      
    IF index_name IS NOT NULL THEN
        EXECUTE 'DROP INDEX IF EXISTS public.' || quote_ident(index_name);
    END IF;
END $$;

-- 2. Drop the existing match function
DROP FUNCTION IF EXISTS public.match_memories;

-- 3. Alter the column type to vector(768)
ALTER TABLE public.memories DROP COLUMN IF EXISTS embedding;
ALTER TABLE public.memories ADD COLUMN embedding vector(768);

-- 4. Recreate the HNSW index for 768 dimensions
CREATE INDEX IF NOT EXISTS memories_embedding_idx
ON public.memories
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 5. Recreate the match_memories function for 768 dimensions
CREATE OR REPLACE FUNCTION public.match_memories (
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
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.content,
    m.metadata,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM public.memories m
  WHERE m.api_key_id = p_api_key_id
    AND m.end_user_id = p_end_user_id
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
