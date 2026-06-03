"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { count } from "drizzle-orm";

export async function getUserCount() {
  try {
    const result = await db.select({ value: count() }).from(users);
    
    // We start at a baseline of 74 to show momentum for the "First 100" early access limit.
    const baseLine = 74;
    const actualCount = result[0].value;
    
    return baseLine + actualCount;
  } catch (error) {
    console.error("Failed to fetch user count", error);
    return 74; // Fallback baseline
  }
}
