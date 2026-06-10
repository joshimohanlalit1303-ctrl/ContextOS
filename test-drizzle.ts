import { db } from './lib/db/index.js';
import { memories } from './lib/db/schema.js';
import { inArray, desc } from 'drizzle-orm';
async function run() {
  try {
    const apiKeyIds = ['edcf545e-8e79-4d68-9dc7-f2053ce07f03'];
    const recentMemories = await db.query.memories.findMany({
      where: inArray(memories.apiKeyId, apiKeyIds),
      orderBy: [desc(memories.createdAt)],
      limit: 5,
      columns: { id: true, content: true, createdAt: true, endUserId: true }
    });
    console.log("Recent Memories length:", recentMemories.length);
  } catch (e) {
    console.error("ERROR:", e);
  }
}
run();
