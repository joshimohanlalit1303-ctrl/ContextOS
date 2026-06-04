import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy_key_to_prevent_crash_if_missing',
    });
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
    const { content, endUserId, metadata = {} } = body;

    if (!content || !endUserId) {
      return NextResponse.json({ error: 'Missing required fields: content, endUserId' }, { status: 400 });
    }

    // 3. Generate Embedding
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: content,
      encoding_format: 'float',
    });
    const embedding = embeddingResponse.data[0].embedding;

    // 4. Store in Supabase
    const { data: memoryData, error: memoryError } = await supabase
      .from('memories')
      .insert({
        api_key_id: apiKeyData.id,
        end_user_id: endUserId,
        content: content,
        embedding: embedding,
        metadata: metadata,
      })
      .select()
      .single();

    if (memoryError) {
      console.error('Database Error:', memoryError);
      return NextResponse.json({ error: 'Failed to save memory' }, { status: 500 });
    }

    return NextResponse.json({ success: true, memory: memoryData }, { status: 200 });
  } catch (error: any) {
    console.error('Ingest API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
