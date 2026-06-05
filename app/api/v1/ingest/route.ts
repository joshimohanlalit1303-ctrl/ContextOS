import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateEmbedding } from '@/utils/embeddings';
import { validateApiKey, checkRateLimit, logSdkError } from '../sdk-utils';
import { db } from '@/lib/db';
import { memories } from '@/lib/db/schema';

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
    const { content, endUserId, metadata = {} } = body;

    if (!content || !endUserId) {
      return NextResponse.json({ error: 'Missing required fields: content, endUserId' }, { status: 400 });
    }

    // 3. Generate Embedding using free local Transformers model
    const embedding = await generateEmbedding(content, 'search_document');

    // 4. Store in Postgres via Drizzle (avoids HTTP overhead of Supabase REST API)
    const [memoryData] = await db
      .insert(memories)
      .values({
        apiKeyId: apiKeyData.id,
        endUserId: endUserId,
        content: content,
        embedding: embedding,
        metadata: metadata,
      })
      .returning();

    return NextResponse.json({ success: true, memory: memoryData }, { status: 200 });
  } catch (error: any) {
    logSdkError(error, 'ingest_route_catch');
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
