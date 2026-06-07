import { db } from "../lib/db";
import { memories, users, apiKeys } from "../lib/db/schema";
import { count } from "drizzle-orm";

async function checkMemories() {
  const allMemories = await db.query.memories.findMany();
  console.log(`Total memories in DB: ${allMemories.length}`);
  if (allMemories.length > 0) {
    console.log("Sample memory:", allMemories[0]);
  }

  const userCount = await db.select({ value: count() }).from(users);
  console.log("Total users:", userCount[0].value);
  
  const keyCount = await db.select({ value: count() }).from(apiKeys);
  console.log("Total API keys:", keyCount[0].value);
}

checkMemories().catch(console.error).finally(() => process.exit(0));
