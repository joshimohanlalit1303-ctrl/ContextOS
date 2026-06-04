-- Enable pgvector
create extension if not exists vector with schema extensions;

drop table if exists public.memories;
drop table if exists public.api_keys;

-- Create API Keys table
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  key text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for api_keys
alter table public.api_keys enable row level security;

-- Policies for api_keys
create policy "Users can view their own api keys"
  on public.api_keys for select
  to authenticated
  using ( auth.uid() = user_id );

create policy "Users can insert their own api keys"
  on public.api_keys for insert
  to authenticated
  with check ( auth.uid() = user_id );

create policy "Users can delete their own api keys"
  on public.api_keys for delete
  to authenticated
  using ( auth.uid() = user_id );

-- Create Memories table
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  api_key_id uuid references public.api_keys(id) on delete cascade not null,
  end_user_id text not null,
  content text not null,
  embedding vector(1536) not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for memories
-- RLS on memories ensures SDK can only access its own memories if accessed via PostgREST,
-- but we will access it via Service Role in our API routes to bypass RLS.
alter table public.memories enable row level security;

-- Create an index for vector similarity search
create index on public.memories using hnsw (embedding vector_cosine_ops);

-- Create a function to match memories
create or replace function match_memories (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_api_key_id uuid,
  p_end_user_id text
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql
as $$
  select
    memories.id,
    memories.content,
    memories.metadata,
    1 - (memories.embedding <=> query_embedding) as similarity
  from memories
  where 
    memories.api_key_id = p_api_key_id
    and memories.end_user_id = p_end_user_id
    and 1 - (memories.embedding <=> query_embedding) > match_threshold
  order by memories.embedding <=> query_embedding
  limit match_count;
$$;
