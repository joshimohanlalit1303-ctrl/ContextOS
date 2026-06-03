import { db } from "@/lib/db";
import { contextGraphNodes, contextGraphEdges } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { ExtractedProfile } from "./ProfileExtractionEngine";

export class ContextGraphEngine {
  /**
   * Synchronizes the extracted profile into the relational graph tables.
   */
  static async syncGraph(endUserId: string, extraction: ExtractedProfile): Promise<void> {
    // 1. Ensure User Root Node exists
    let userNode = await db.query.contextGraphNodes.findFirst({
      where: and(
        eq(contextGraphNodes.endUserId, endUserId),
        eq(contextGraphNodes.type, "person")
      ),
    });

    if (!userNode) {
      const [newRoot] = await db.insert(contextGraphNodes).values({
        endUserId,
        label: "User Root",
        type: "person",
      }).returning();
      userNode = newRoot;
    }

    // Process Skills
    if (extraction.skills) {
      for (const skill of extraction.skills) {
        await this.upsertEdge(endUserId, userNode.id, skill, "skill", "has_skill", extraction.confidence);
      }
    }

    // Process Projects
    if (extraction.projects) {
      for (const project of extraction.projects) {
        await this.upsertEdge(endUserId, userNode.id, project, "project", "building", extraction.confidence);
      }
    }

    // Process Goals
    if (extraction.goals) {
      for (const goal of extraction.goals) {
        await this.upsertEdge(endUserId, userNode.id, goal, "goal", "wants_to", extraction.confidence);
      }
    }
  }

  private static async upsertEdge(
    endUserId: string,
    sourceId: string,
    label: string,
    nodeType: string,
    edgeType: string,
    confidence?: number
  ) {
    // Upsert Node
    let targetNode = await db.query.contextGraphNodes.findFirst({
      where: and(
        eq(contextGraphNodes.endUserId, endUserId),
        eq(contextGraphNodes.label, label),
        eq(contextGraphNodes.type, nodeType)
      ),
    });

    if (!targetNode) {
      const [newNode] = await db.insert(contextGraphNodes).values({
        endUserId,
        label,
        type: nodeType,
      }).returning();
      targetNode = newNode;
    }

    // Upsert Edge
    const existingEdge = await db.query.contextGraphEdges.findFirst({
      where: and(
        eq(contextGraphEdges.sourceNodeId, sourceId),
        eq(contextGraphEdges.targetNodeId, targetNode.id),
        eq(contextGraphEdges.relationshipType, edgeType)
      ),
    });

    if (!existingEdge) {
      await db.insert(contextGraphEdges).values({
        sourceNodeId: sourceId,
        targetNodeId: targetNode.id,
        relationshipType: edgeType,
        confidenceScore: confidence || 50,
      });
    }
  }
}
