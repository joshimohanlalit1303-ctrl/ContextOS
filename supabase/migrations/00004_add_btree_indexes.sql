-- ============================================================
-- MIGRATION: Add B-tree indexes for foreign keys and lookup columns
-- Reason: Enhance performance for queries filtering by api_key_id and end_user_id
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_memories_api_key_id ON public.memories(api_key_id);
CREATE INDEX IF NOT EXISTS idx_memories_end_user_id ON public.memories(end_user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
