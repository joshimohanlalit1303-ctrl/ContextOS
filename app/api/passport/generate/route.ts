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

    // 2. Generate Search Query for Deduplication
    const embeddingText = `Project: ${passportData.project}. Goal: ${passportData.goal}`;
    const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

    // 3. Check for Similar Passports via Turbovec
    const userPassports = await db
      .select({ id: passports.id, vectorId: passports.vectorId })
      .from(passports)
      .where(eq(passports.userId, internalUserId));

    let passportId: string | undefined;
    let action = 'created';

    if (userPassports.length > 0) {
      const allowlist = userPassports.map(p => p.vectorId);
      
      try {
        const searchRes = await fetch(`${PYTHON_SERVICE_URL}/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: embeddingText, k: 1, allowlist })
        });
        
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (searchData.scores && searchData.scores.length > 0 && searchData.scores[0] > 0.85) {
            const matchedVectorId = searchData.ids[0];
            const matchedPassport = userPassports.find(p => p.vectorId === matchedVectorId);
            if (matchedPassport) {
              passportId = matchedPassport.id;
              action = 'merged';
            }
          }
        }
      } catch (e) {
        console.error("Turbovec search failed:", e);
      }
    }

    if (passportId) {
      // Merge into existing passport
      await db.update(passports)
        .set({
          project: passportData.project,
          goal: passportData.goal,
          summary: passportData.summary,
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
      }).returning({ id: passports.id, vectorId: passports.vectorId });
      
      passportId = newPassport[0].id;

      // Index in Turbovec
      try {
        await fetch(`${PYTHON_SERVICE_URL}/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: newPassport[0].vectorId, text: embeddingText })
        });
      } catch (e) {
        console.error("Failed to add vector to Turbovec:", e);
      }
    }

    // Insert Tasks
    if (passportData.tasks && passportData.tasks.length > 0) {
      await db.insert(passportTasks).values(
        passportData.tasks.map(task => ({
          passportId: passportId!,
          task
        }))
      );
    }

    // Insert Decisions
    if (passportData.decisions && passportData.decisions.length > 0) {
      await db.insert(passportDecisions).values(
        passportData.decisions.map(decision => ({
          passportId: passportId!,
          decision
        }))
      );
    }

    return NextResponse.json({ 
      success: true, 
      passportId, 
      action,
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
