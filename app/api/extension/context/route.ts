import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endUsers, profiles, projects, users, organizationMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Validate JWT
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json({ error: "Invalid JWT" }, { status: 401 });
    }

    // Find the endUser
    let dbUser = await db.query.users.findFirst({ where: eq(users.email, user.email || "") });
    if (!dbUser) return NextResponse.json({ context: "<user_context>No context established yet.</user_context>" });
    
    const member = await db.query.organizationMembers.findFirst({ where: eq(organizationMembers.userId, dbUser.id) });
    if (!member) return NextResponse.json({ context: "<user_context>No context established yet.</user_context>" });
    
    const project = await db.query.projects.findFirst({ where: eq(projects.organizationId, member.organizationId) });
    if (!project) return NextResponse.json({ context: "<user_context>No context established yet.</user_context>" });

    const userRecord = await db.query.endUsers.findFirst({
      where: and(eq(endUsers.projectId, project.id), eq(endUsers.externalId, user.id)),
    });

    if (!userRecord) {
      return NextResponse.json({ context: "<user_context>No context established yet.</user_context>" });
    }

    // Fetch the profile
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.endUserId, userRecord.id)
    });

    if (!profile) {
      return NextResponse.json({ context: "<user_context>No profile data yet.</user_context>" });
    }

    // Format the capsule
    const markdownContext = `
<user_context>
## Identity
${JSON.stringify(profile.identity, null, 2)}

## Core Skills
${Array.isArray(profile.skills) && profile.skills.length > 0 ? profile.skills.map((s: string) => "- " + s).join('\\n') : 'None'}

## Active Goals
${Array.isArray(profile.goals) && profile.goals.length > 0 ? profile.goals.map((g: string) => "- " + g).join('\\n') : 'None'}

## Preferences
${Array.isArray(profile.preferences) && profile.preferences.length > 0 ? profile.preferences.map((p: string) => "- " + p).join('\\n') : 'None'}
</user_context>
`.trim();

    return NextResponse.json({ context: markdownContext });

  } catch (error: any) {
    console.error("Extension Context Error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message, 
      stack: error.stack 
    }, { status: 500 });
  }
}
