import { db } from "../lib/db";
import { passports } from "../lib/db/schema";
import { count } from "drizzle-orm";

async function testCount() {
  const [passportCountResult] = await db.select({ value: count() }).from(passports);
  console.log("Count result:", passportCountResult);
  console.log("Type of value:", typeof passportCountResult.value);
}

testCount().catch(console.error).finally(() => process.exit(0));
