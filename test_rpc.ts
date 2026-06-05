import { db } from './lib/db';
import { sql } from 'drizzle-orm';
async function test() {
  try {
    const embedding = new Array(768).fill(0.01);
    const result = await db.execute(sql`
      SELECT * FROM match_memories(
        ${JSON.stringify(embedding)}::vector,
        0.2,
        10,
        '00000000-0000-0000-0000-000000000000'::uuid,
        '00000000-0000-0000-0000-000000000000'::uuid
      )
    `);
    console.log(result.rows);
  } catch (e) {
    console.error(e);
  }
}
test();
