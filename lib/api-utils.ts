import { db } from "@/lib/db";
import { apiKeys, apiLogs, usageLogs, projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis based Ratelimiter
// Allow 10 requests per 10 seconds per API key
let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
  });
}

export async function validateApiKey(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing or invalid Authorization header", status: 401 };
  }

  const rawKey = authHeader.replace("Bearer ", "");
  const keyHash = createHash("sha256").update(rawKey).digest("hex");

  const keyRecord = await db.query.apiKeys.findFirst({
    where: eq(apiKeys.keyHash, keyHash),
  });

  if (!keyRecord) {
    return { error: "Invalid API Key", status: 401 };
  }

  // Update lastUsedAt
  await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, keyRecord.id));

  // Rate Limiting
  if (ratelimit) {
    const { success } = await ratelimit.limit(keyRecord.id);
    if (!success) {
      return { error: "Rate limit exceeded", status: 429 };
    }
  }

  return { projectId: keyRecord.projectId, keyId: keyRecord.id };
}

export async function logApiRequest(params: {
  projectId: string;
  method: string;
  endpoint: string;
  requestPayload: any;
  responsePayload: any;
  statusCode: number;
  durationMs: number;
  errorMessage?: string;
}) {
  // Fire and forget logging
  Promise.all([
    db.insert(apiLogs).values({ ...params }),
    db.insert(usageLogs).values({
      projectId: params.projectId,
      endpoint: params.endpoint,
      statusCode: params.statusCode,
      durationMs: params.durationMs,
    })
  ]).catch((err) => console.error("Failed to log API request:", err));
}
