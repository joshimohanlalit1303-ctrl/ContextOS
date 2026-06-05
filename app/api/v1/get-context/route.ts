import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateEmbedding } from '@/utils/embeddings';
import { validateApiKey, checkRateLimit, logSdkError } from '../sdk-utils';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }

    const apiKey = authHeader.split(' ')[1];

    if (!(await checkRateLimit(apiKey))) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const apiKeyData = await validateApiKey(apiKey);
    if (!apiKeyData) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // 2. Parse Request Body
    const body = await req.json();
    const { query, endUserId } = body;

    if (!query || !endUserId) {
      return NextResponse.json({ error: 'Missing required fields: query, endUserId' }, { status: 400 });
    }

    // 3. Generate Embedding for the query using free local Transformers model
    const queryEmbedding = await generateEmbedding(query, 'search_query');

    // 4. Perform Vector Search via Postgres directly (avoids Supabase REST API overhead)
    let memories: any[] = [];
    try {
      const result = await db.execute(sql`
        SELECT * FROM match_memories(
          ${JSON.stringify(queryEmbedding)}::vector,
          0.2,
          10,
          ${apiKeyData.id}::uuid,
          ${endUserId}::text
        )
      `);
      memories = result.rows;
    } catch (searchError: any) {
      logSdkError(searchError, 'get_context_vector_search', apiKeyData.id);
      return NextResponse.json({ error: 'Failed to search memory', details: searchError.message || String(searchError) }, { status: 500 });
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
    logSdkError(error, 'get_context_route_catch');
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
