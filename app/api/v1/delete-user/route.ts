import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ratelimit } from '@/lib/ratelimit';
import { validateApiKey } from '@/lib/auth/api-key';
import { db } from '@/lib/db';
import { endUsers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const DeleteUserRequestSchema = z.object({
  userId: z.string(),
});

export async function DELETE(req: NextRequest) {
  try {
    const apiKey = req.headers.get('Authorization');
    const auth = await validateApiKey(apiKey);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await req.json();
    const result = DeleteUserRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request body', details: String(result.error) }, { status: 400 });
    }
    const { userId: externalId } = result.data;

    // Drizzle will handle cascading deletes if set up correctly in the database schema.
    const deletedUser = await db.delete(endUsers).where(
      and(eq(endUsers.projectId, auth.projectId), eq(endUsers.externalId, externalId))
    ).returning();

    if (deletedUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Delete User API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
