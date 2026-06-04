import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }

    const apiKey = authHeader.split(' ')[1];
    const supabase = createAdminClient();

    // 1. Validate API Key
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('id, user_id')
      .eq('key', apiKey)
      .single();

    if (apiKeyError || !apiKeyData) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // 2. Parse Request Body
    const body = await req.json();
    const { query, endUserId } = body;

    if (!query || !endUserId) {
      return NextResponse.json({ error: 'Missing required fields: query, endUserId' }, { status: 400 });
    }

    // 3. Generate Embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
      encoding_format: 'float',
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // 4. Perform Vector Search via RPC
    const { data: memories, error: searchError } = await supabase.rpc('match_memories', {
      query_embedding: queryEmbedding,
      match_threshold: 0.2, // Adjust based on strictness
      match_count: 10,
      p_api_key_id: apiKeyData.id,
      p_end_user_id: endUserId,
    });

    if (searchError) {
      console.error('Vector Search Error:', searchError);
      return NextResponse.json({ error: 'Failed to search memory' }, { status: 500 });
    }

    // 5. Compile Context
    if (!memories || memories.length === 0) {
      return NextResponse.json({ context: '', memories: [] }, { status: 200 });
    }

    const compiledContext = memories
      .map((m: any, i: number) => `[Memory ${i + 1}] (Relevance: ${(m.similarity * 100).toFixed(1)}%): ${m.content}`)
      .join('\n');

    return NextResponse.json({ 
      context: compiledContext, 
      memories: memories 
    }, { status: 200 });
  } catch (error: any) {
    console.error('Get Context API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
