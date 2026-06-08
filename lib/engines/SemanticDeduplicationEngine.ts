import { db } from "@/lib/db";
import { memories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

export class SemanticDeduplicationEngine {
  /**
   * Detects if a new memory is a semantic duplicate of an existing memory.
   * Returns true if a match with >0.85 cosine similarity is found.
   */
  static async isDuplicate(endUserId: string, newMemoryContent: string): Promise<boolean> {
    // 1. Get all vector IDs for this user to act as our Turbovec allowlist
    const userMemories = await db
      .select({ vectorId: memories.vectorId })
      .from(memories)
      .where(eq(memories.endUserId, endUserId));

    if (userMemories.length === 0) {
      return false; // No existing memories to duplicate
    }

    const allowlist = userMemories.map(m => m.vectorId);

    try {
      // 2. Call Python Turbovec service for extremely fast in-memory search
      const response = await fetch(`${PYTHON_SERVICE_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: newMemoryContent,
          k: 1,
          allowlist: allowlist
        })
      });

      if (!response.ok) {
        console.error("Python service error:", await response.text());
        return false;
      }

      const data = await response.json();
      
      // Data format: { ids: [1], scores: [0.95] }
      if (data.scores && data.scores.length > 0) {
        const topScore = data.scores[0];
        // Turbovec returns inner product which acts as cosine similarity for normalized vectors
        if (topScore > 0.85) {
          return true; // Semantic duplicate found
        }
      }
      
      return false;
    } catch (e) {
      console.error("Failed to query Turbovec deduplication engine:", e);
      return false; // Fallback to storing memory if engine is down
    }
  }
}
