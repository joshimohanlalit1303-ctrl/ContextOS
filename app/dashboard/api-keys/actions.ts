"use server";

import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomBytes, createHash } from "crypto";

export async function createApiKey(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  
  if (!projectId) return { error: "Missing Project ID" };

  // Generate a random 32 byte key
  const rawKey = randomBytes(32).toString("hex");
  const fullKey = `ctx_live_${rawKey}`; // This would be shown to the user EXACTLY ONCE.

  // We only store the SHA256 hash in the database
  const keyHash = createHash("sha256").update(fullKey).digest("hex");

  await db.insert(apiKeys).values({
    projectId,
    keyHash,
    name: `Key created on ${new Date().toLocaleDateString()}`,
  });

  revalidatePath("/dashboard/api-keys");
  
  // Note: In a real production app, we would return the raw fullKey here and display it in a modal to the user.
}

export async function revokeApiKey(formData: FormData) {
  const keyId = formData.get("keyId") as string;
  if (!keyId) return { error: "Missing Key ID" };

  await db.delete(apiKeys).where(eq(apiKeys.id, keyId));
  
  revalidatePath("/dashboard/api-keys");
}
