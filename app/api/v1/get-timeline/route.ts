import { NextResponse } from "next/server";
import { validateApiKey, logApiRequest } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { endUsers, timelineEvents } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const GetTimelineSchema = z.object({
  userId: z.string().min(1),
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
    const parsed = GetTimelineSchema.safeParse(requestPayload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.issues }, { status: 400 });
    }

    const { userId } = parsed.data;

    // Resolve endUser
    const userRecord = await db.query.endUsers.findFirst({
      where: and(eq(endUsers.projectId, projectId), eq(endUsers.externalId, userId)),
    });

    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const events = await db.query.timelineEvents.findMany({
      where: eq(timelineEvents.endUserId, userRecord.id),
      orderBy: [desc(timelineEvents.date)],
      limit: 100, // Reasonable max
    });

    const response = {
      events: events.map(e => ({
        id: e.id,
        date: e.date,
        description: e.description,
        category: e.category,
      }))
    };

    logApiRequest({ projectId, method: "POST", endpoint: "/api/v1/get-timeline", requestPayload, responsePayload: response, statusCode: 200, durationMs: Date.now() - startTime });
    return NextResponse.json(response);

  } catch (error: any) {
    logApiRequest({ projectId, method: "POST", endpoint: "/api/v1/get-timeline", requestPayload, responsePayload: null, statusCode: 500, durationMs: Date.now() - startTime, errorMessage: error.message });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
