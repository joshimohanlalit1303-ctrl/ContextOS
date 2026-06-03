import { NextResponse } from "next/server";
import { validateApiKey, logApiRequest } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { endUsers, profiles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const GetProfileSchema = z.object({
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
    const parsed = GetProfileSchema.safeParse(requestPayload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.issues }, { status: 400 });
    }

    const { userId } = parsed.data;

    // Resolve endUser
    const userRecord = await db.query.endUsers.findFirst({
      where: and(eq(endUsers.projectId, projectId), eq(endUsers.externalId, userId)),
      with: {
        profiles: true, // we need to configure relations in schema.ts
      }
    });

    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Since relations aren't strictly defined yet, fallback to a direct query
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.endUserId, userRecord.id),
    });

    if (!profile) {
      return NextResponse.json({ 
        identity: {}, skills: [], goals: [], projects: [], preferences: [], confidenceScore: 0 
      }, { status: 200 });
    }

    const response = {
      identity: profile.identity,
      skills: profile.skills,
      projects: profile.projects,
      goals: profile.goals,
      preferences: profile.preferences,
      confidenceScore: profile.confidenceScore,
      lastExtractedAt: profile.lastExtractedAt,
    };

    logApiRequest({ projectId, method: "POST", endpoint: "/api/v1/get-profile", requestPayload, responsePayload: response, statusCode: 200, durationMs: Date.now() - startTime });
    return NextResponse.json(response);

  } catch (error: any) {
    logApiRequest({ projectId, method: "POST", endpoint: "/api/v1/get-profile", requestPayload, responsePayload: null, statusCode: 500, durationMs: Date.now() - startTime, errorMessage: error.message });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
