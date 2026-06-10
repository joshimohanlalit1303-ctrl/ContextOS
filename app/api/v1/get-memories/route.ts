import { NextResponse } from "next/server";
import { validateApiKey, logApiRequest } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { endUsers, memories } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const GetMemoriesSchema = z.object({
  userId: z.string().min(1),
  limit: z.number().max(500).optional().default(100),
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
    const parsed = GetMemoriesSchema.safeParse(requestPayload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.issues }, { status: 400 });
    }

    const { userId, limit } = parsed.data;

    // Resolve endUser
    const userRecord = await db.query.endUsers.findFirst({
      where: and(eq(endUsers.projectId, projectId), eq(endUsers.externalId, userId)),
    });

    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const fetchedMemories = await db.query.memories.findMany({
      where: eq(memories.endUserId, userRecord.id),
      orderBy: [desc(memories.createdAt)],
      limit,
    });

    const response = {
      memories: fetchedMemories.map(m => ({
        id: m.id,
        content: m.content,
        metadata: m.metadata,
        createdAt: m.createdAt,
      }))
    };

    logApiRequest({ projectId, method: "POST", endpoint: "/api/v1/get-memories", requestPayload, responsePayload: { count: response.memories.length }, statusCode: 200, durationMs: Date.now() - startTime });
    return NextResponse.json(response);

  } catch (error: any) {
    logApiRequest({ projectId, method: "POST", endpoint: "/api/v1/get-memories", requestPayload, responsePayload: null, statusCode: 500, durationMs: Date.now() - startTime, errorMessage: error.message });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
