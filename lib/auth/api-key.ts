import { db } from '../db';
import { apiKeys } from '../db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function validateApiKey(headerKey: string | null): Promise<{ projectId: string } | null> {
  if (!headerKey || !headerKey.startsWith('Bear ')) {
    if (!headerKey || !headerKey.startsWith('Bearer ')) {
      return null;
    }
  }

  const token = headerKey.replace('Bearer ', '').trim();
  if (!token) return null;

  // Secure hashing algorithm to compare against the DB hash.
  const hash = crypto.createHash('sha256').update(token).digest('hex');

  const keyRecord = await db.select().from(apiKeys).where(eq(apiKeys.keyHash, hash)).limit(1);

  if (keyRecord.length === 0) {
    return null;
  }

  // Double check with timing-safe comparison to prevent timing attacks, 
  // although DB query inherently isn't constant-time, this guarantees the string matching is.
  const isMatch = crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(keyRecord[0].keyHash)
  );

  if (!isMatch) {
    return null;
  }

  return {
    projectId: keyRecord[0].projectId,
  };
}
