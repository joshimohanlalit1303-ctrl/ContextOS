import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
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
    const { userId, memoryId, query } = body;

    // Notice we use "userId" in the request body, but map it to "end_user_id" in DB
    // to keep the SDK api clean
    if (!userId) {
      return NextResponse.json({ error: 'Missing required field: userId' }, { status: 400 });
    }

    // For GDPR "Right to Erasure", if neither memoryId nor query is provided,
    // we proceed and it will delete ALL memories for the userId.
    // We don't return an error in this case.

    const supabase = createAdminClient();
    let deleteQuery = supabase
      .from('memories')
      .delete()
      .eq('api_key_id', apiKeyData.id)
      .eq('end_user_id', userId);

    if (memoryId) {
      deleteQuery = deleteQuery.eq('id', memoryId);
    }
    
    // For now, if "query" is provided, we just do a text match. 
    // In a more advanced version, we could do semantic delete.
    if (query) {
      deleteQuery = deleteQuery.ilike('content', `%${query}%`);
    }

    const { data: deletedData, error: deleteError } = await deleteQuery.select();

    if (deleteError) {
      logSdkError(deleteError, 'forget_database_delete', apiKeyData.id);
      return NextResponse.json({ error: 'Failed to delete memory' }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedCount: deletedData?.length || 0, memories: deletedData }, { status: 200 });
  } catch (error: any) {
    logSdkError(error, 'forget_route_catch');
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
