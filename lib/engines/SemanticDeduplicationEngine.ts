import { db } from "@/lib/db";
import { memories } from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";
import { pipeline, FeatureExtractionPipeline } from "@xenova/transformers";

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

const getExtractor = async () => {
  if (!extractorPromise) {
    // Lazy load pipeline so it doesn't block server startup
    extractorPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return extractorPromise;
};

export class SemanticDeduplicationEngine {
  /**
   * Generates a 384-dimensional embedding locally using Transformers.js.
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    const extractor = await getExtractor();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  }

  /**
   * Detects if a new memory is a semantic duplicate of an existing memory.
   * Returns true if a match with >0.85 cosine similarity is found.
   */
  static async isDuplicate(endUserId: string, newMemoryContent: string, embedding?: number[]): Promise<boolean> {
    const vector = embedding ?? (await this.generateEmbedding(newMemoryContent));
    
    // Format the vector for pgvector: '[0.1, 0.2, ...]'
    const vectorString = `[${vector.join(",")}]`;

    // Query for semantic similarity
    // In pgvector, cosine distance is `<=>`.
    // Similarity = 1 - distance. Distance < 0.15 means Similarity > 0.85
    const similarMemories = await db
      .select({
        id: memories.id,
        content: memories.content,
        distance: sql<number>`${memories.embedding} <=> ${vectorString}::vector`,
      })
      .from(memories)
      .where(eq(memories.endUserId, endUserId))
      .orderBy(sql`${memories.embedding} <=> ${vectorString}::vector`)
      .limit(1);

    if (similarMemories.length > 0 && similarMemories[0].distance < 0.15) {
      return true; // It's a semantic duplicate
    }

    return false;
  }
}
