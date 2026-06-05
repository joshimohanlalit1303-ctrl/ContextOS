import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateEmbedding } from '@/utils/embeddings';
import { validateApiKey, checkRateLimit, logSdkError } from '../sdk-utils';

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
    const { userId, memoryId, text, metadata } = body;

    if (!userId || !memoryId) {
      return NextResponse.json({ error: 'Missing required fields: userId, memoryId' }, { status: 400 });
    }

    if (!text && !metadata) {
      return NextResponse.json({ error: 'Must provide either text or metadata to update' }, { status: 400 });
    }

    const updates: any = {};
    if (text) {
      updates.content = text;
      // Regenerate embedding if text changed
      updates.embedding = await generateEmbedding(text, 'search_document');
    }
    if (metadata) {
      updates.metadata = metadata;
    }

    const supabase = createAdminClient();
    const { data: updatedData, error: updateError } = await supabase
      .from('memories')
      .update(updates)
      .eq('id', memoryId)
      .eq('api_key_id', apiKeyData.id)
      .eq('end_user_id', userId)
      .select()
      .single();

    if (updateError) {
      logSdkError(updateError, 'update_database', apiKeyData.id);
      return NextResponse.json({ error: 'Failed to update memory' }, { status: 500 });
    }

    return NextResponse.json({ success: true, memory: updatedData }, { status: 200 });
  } catch (error: any) {
    logSdkError(error, 'update_route_catch');
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
