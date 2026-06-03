import { NextResponse } from "next/server";
import { validateApiKey, logApiRequest } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { endUsers, memories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { ProfileExtractionEngine } from "@/lib/engines/ProfileExtractionEngine";
import { SemanticDeduplicationEngine } from "@/lib/engines/SemanticDeduplicationEngine";
import { MemoryEvolutionEngine } from "@/lib/engines/MemoryEvolutionEngine";
import { ContextGraphEngine } from "@/lib/engines/ContextGraphEngine";

const IngestSchema = z.object({
  userId: z.string().min(1),
  text: z.string().min(1),
  metadata: z.record(z.string(), z.any()).optional(),
});

export async function POST(request: Request) {
  const startTime = Date.now();
  let projectId = "unknown";
  let requestPayload: any = {};

  try {
    const auth = await validateApiKey(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    projectId = auth.projectId!;

    requestPayload = await request.json();
    const parsed = IngestSchema.safeParse(requestPayload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.issues }, { status: 400 });
    }

    const { userId, text, metadata } = parsed.data;

    // 1. Resolve or Create endUser
    let userRecord = await db.query.endUsers.findFirst({
      where: and(eq(endUsers.projectId, projectId), eq(endUsers.externalId, userId)),
    });

    if (!userRecord) {
      const [newUser] = await db.insert(endUsers).values({
        projectId,
        externalId: userId,
      }).returning();
      userRecord = newUser;
    }

    // 2. Semantic Deduplication
    const embedding = await SemanticDeduplicationEngine.generateEmbedding(text);
    const isDup = await SemanticDeduplicationEngine.isDuplicate(userRecord.id, text, embedding);

    if (isDup) {
      // It's a duplicate, we can still record the memory but skip heavy extraction to save costs
      await db.insert(memories).values({
        endUserId: userRecord.id,
        content: text,
        embedding,
        metadata: { ...metadata, duplicate: true },
      });
      
      const response = { success: true, message: "Context ingested (deduplicated)" };
      logApiRequest({ projectId, method: "POST", endpoint: "/api/v1/ingest", requestPayload, responsePayload: response, statusCode: 200, durationMs: Date.now() - startTime });
      return NextResponse.json(response);
    }

    // 3. Store raw memory
    await db.insert(memories).values({
      endUserId: userRecord.id,
      content: text,
      embedding,
      metadata,
    });

    // 4. Extract Structured Profile
    const extracted = await ProfileExtractionEngine.extract(text);

    // 5. Evolve Memory (Timeline) & Sync Graph in parallel
    await Promise.all([
      MemoryEvolutionEngine.evolve(userRecord.id, extracted),
      ContextGraphEngine.syncGraph(userRecord.id, extracted)
    ]);

    const response = { success: true, extracted };
    logApiRequest({ projectId, method: "POST", endpoint: "/api/v1/ingest", requestPayload, responsePayload: response, statusCode: 200, durationMs: Date.now() - startTime });
    return NextResponse.json(response);

  } catch (error: any) {
    logApiRequest({ projectId, method: "POST", endpoint: "/api/v1/ingest", requestPayload, responsePayload: null, statusCode: 500, durationMs: Date.now() - startTime, errorMessage: error.message });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
