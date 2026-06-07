import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endUsers, memories, organizations, organizationMembers, projects, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { ProfileExtractionEngine } from "@/lib/engines/ProfileExtractionEngine";
import { SemanticDeduplicationEngine } from "@/lib/engines/SemanticDeduplicationEngine";
import { MemoryEvolutionEngine } from "@/lib/engines/MemoryEvolutionEngine";
import { ContextGraphEngine } from "@/lib/engines/ContextGraphEngine";
import { createClient } from '@supabase/supabase-js';

const IngestSchema = z.object({
  messages: z.array(z.object({
    role: z.string(),
    content: z.string()
  })),
  source: z.string()
});

export async function POST(request: Request) {
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

    const requestPayload = await request.json();
    const parsed = IngestSchema.safeParse(requestPayload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Combine messages
    const text = parsed.data.messages.map(m => m.content).join("\n");

    // We need a Project ID for the engine.
    // Let's see if the user exists in our users table and has a project.
    const dbUser = await db.query.users.findFirst({ where: eq(users.email, user.email || "") });
    
    let projectId: string;
    
    if (!dbUser) {
      // Create user, org, and project for extension users
      const [newUser] = await db.insert(users).values({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.email,
      }).returning();
      
      const [newOrg] = await db.insert(organizations).values({
        name: "Personal Extension Org",
        slug: `org-${user.id}`,
      }).returning();
      
      await db.insert(organizationMembers).values({
        organizationId: newOrg.id,
        userId: newUser.id,
        role: "owner"
      });
      
      const [newProject] = await db.insert(projects).values({
        organizationId: newOrg.id,
        name: "Extension Context",
      }).returning();
      
      projectId = newProject.id;
    } else {
      // Find their first project
      const member = await db.query.organizationMembers.findFirst({ where: eq(organizationMembers.userId, dbUser.id) });
      if (member) {
        const project = await db.query.projects.findFirst({ where: eq(projects.organizationId, member.organizationId) });
        if (project) {
          projectId = project.id;
        } else {
          return NextResponse.json({ error: "User has no project" }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: "User has no org" }, { status: 400 });
      }
    }

    // 1. Resolve or Create endUser
    let userRecord = await db.query.endUsers.findFirst({
      where: and(eq(endUsers.projectId, projectId), eq(endUsers.externalId, user.id)),
    });

    if (!userRecord) {
      const [newUser] = await db.insert(endUsers).values({
        projectId,
        externalId: user.id,
      }).returning();
      userRecord = newUser;
    }

    // 2. Semantic Deduplication
    const embedding = await SemanticDeduplicationEngine.generateEmbedding(text);
    const isDup = await SemanticDeduplicationEngine.isDuplicate(userRecord.id, text, embedding);

    if (isDup) {
      await db.insert(memories).values({
        endUserId: userRecord.id,
        content: text,
        embedding,
        metadata: { source: parsed.data.source, duplicate: true },
      });
      return NextResponse.json({ success: true, message: "Context ingested (deduplicated)" });
    }

    // 3. Store raw memory
    await db.insert(memories).values({
      endUserId: userRecord.id,
      content: text,
      embedding,
      metadata: { source: parsed.data.source },
    });

    // 4. Extract Structured Profile
    const extracted = await ProfileExtractionEngine.extract(text);

    // 5. Evolve Memory (Timeline) & Sync Graph in parallel
    await Promise.all([
      MemoryEvolutionEngine.evolve(userRecord.id, extracted),
      ContextGraphEngine.syncGraph(userRecord.id, extracted)
    ]);

    return NextResponse.json({ success: true, extracted });

  } catch (error: any) {
    console.error("Extension Ingest Error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message, 
      stack: error.stack 
    }, { status: 500 });
  }
}
