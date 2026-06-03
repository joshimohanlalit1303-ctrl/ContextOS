import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PassportExtractionEngine } from "@/lib/engines/PassportExtractionEngine";
import { SemanticDeduplicationEngine } from "@/lib/engines/SemanticDeduplicationEngine";
import { db } from "@/lib/db";
import { passports, passportTasks, passportDecisions, users } from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json({ error: "Invalid JWT" }, { status: 401 });
    }

    // Lookup the internal Drizzle user ID using the authenticated email
    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, user.email!),
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    const internalUserId = dbUser.id;

    const payload = await request.json();
    const history = payload.history;

    if (!Array.isArray(history) || history.length === 0) {
      return NextResponse.json({ error: "No chat history provided" }, { status: 400 });
    }

    // 1. Extract Passport via Gemini
    const passportData = await PassportExtractionEngine.extract(history);

    // 2. Generate Embedding for the Project + Goal for Deduplication
    const embeddingText = `Project: ${passportData.project}. Goal: ${passportData.goal}`;
    const vector = await SemanticDeduplicationEngine.generateEmbedding(embeddingText);
    const vectorString = JSON.stringify(vector);

    // 3. Check for Similar Passports (Cosine distance < 0.1 means > 0.9 similarity)
    const similarPassports = await db
      .select({
        id: passports.id,
        distance: sql<number>`${passports.embedding} <=> ${vectorString}::vector`,
      })
      .from(passports)
      .where(
        sql`${passports.userId} = ${internalUserId} AND ${passports.embedding} <=> ${vectorString}::vector < 0.15` // Using 0.15 for slightly broader match
      )
      .orderBy(sql`${passports.embedding} <=> ${vectorString}::vector`)
      .limit(1);

    let passportId: string;

    if (similarPassports.length > 0) {
      // Merge into existing passport
      passportId = similarPassports[0].id;
      await db.update(passports)
        .set({
          project: passportData.project,
          goal: passportData.goal,
          summary: passportData.summary,
          embedding: vector,
          updatedAt: new Date(),
        })
        .where(eq(passports.id, passportId));

      // Note: For MVP, we simply append new tasks and decisions. 
      // In a production app, we would do a more complex merge/dedup of the arrays.
    } else {
      // Create new passport
      const newPassport = await db.insert(passports).values({
        userId: internalUserId,
        project: passportData.project,
        goal: passportData.goal,
        summary: passportData.summary,
        embedding: vector,
      }).returning({ id: passports.id });
      
      passportId = newPassport[0].id;
    }

    // Insert Tasks
    if (passportData.tasks && passportData.tasks.length > 0) {
      await db.insert(passportTasks).values(
        passportData.tasks.map(task => ({
          passportId,
          task
        }))
      );
    }

    // Insert Decisions
    if (passportData.decisions && passportData.decisions.length > 0) {
      await db.insert(passportDecisions).values(
        passportData.decisions.map(decision => ({
          passportId,
          decision
        }))
      );
    }

    return NextResponse.json({ 
      success: true, 
      passportId, 
      action: similarPassports.length > 0 ? 'merged' : 'created',
      data: passportData
    });
    
  } catch (error: any) {
    console.error("Passport Generate Error:", error);
    
    // Check if the error is our custom rate limit error from the engine
    const errorMessage = error?.message || "Internal server error";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes("Rate Limit") ? 429 : 500 }
    );
  }
}
