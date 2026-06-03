import { db } from "@/lib/db";
import { profiles, timelineEvents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { ExtractedProfile } from "./ProfileExtractionEngine";

export class MemoryEvolutionEngine {
  /**
   * Merges newly extracted profile data into the user's existing profile.
   * Emits timeline events for any significant changes.
   */
  static async evolve(endUserId: string, newExtraction: ExtractedProfile): Promise<void> {
    // 1. Fetch current profile
    let currentProfile = await db.query.profiles.findFirst({
      where: eq(profiles.endUserId, endUserId),
    });

    if (!currentProfile) {
      // Create an empty profile if none exists
      const [newProf] = await db.insert(profiles).values({
        endUserId,
      }).returning();
      currentProfile = newProf;
    }

    const currentSkills = Array.isArray(currentProfile.skills) ? (currentProfile.skills as string[]) : [];
    const currentGoals = Array.isArray(currentProfile.goals) ? (currentProfile.goals as string[]) : [];
    const currentProjects = Array.isArray(currentProfile.projects) ? (currentProfile.projects as string[]) : [];
    
    // Identity logic: merge objects
    const currentIdentity = (currentProfile.identity as Record<string, any>) || {};
    const newIdentity = newExtraction.identity || {};
    
    // We will track timeline events
    const newEvents: { date: Date; description: string; category: string; endUserId: string }[] = [];

    // Check for Identity changes (e.g., location moved, role changed)
    for (const [key, val] of Object.entries(newIdentity)) {
      if (currentIdentity[key] !== val) {
        newEvents.push({
          endUserId,
          date: new Date(),
          description: `Identity updated: ${key} is now ${val}`,
          category: "shift",
        });
      }
    }
    const mergedIdentity = { ...currentIdentity, ...newIdentity };

    // Check for new skills
    const mergedSkills = new Set(currentSkills);
    if (newExtraction.skills) {
      for (const skill of newExtraction.skills) {
        if (!mergedSkills.has(skill)) {
          mergedSkills.add(skill);
          newEvents.push({
            endUserId,
            date: new Date(),
            description: `Started learning or using ${skill}`,
            category: "learning",
          });
        }
      }
    }

    // Check for new projects
    const mergedProjects = new Set(currentProjects);
    if (newExtraction.projects) {
      for (const proj of newExtraction.projects) {
        if (!mergedProjects.has(proj)) {
          mergedProjects.add(proj);
          newEvents.push({
            endUserId,
            date: new Date(),
            description: `Started working on ${proj}`,
            category: "milestone",
          });
        }
      }
    }

    // Update the profile
    const currentPreferences = Array.isArray(currentProfile.preferences) ? (currentProfile.preferences as string[]) : [];

    await db.update(profiles)
      .set({
        identity: mergedIdentity,
        skills: Array.from(mergedSkills),
        projects: Array.from(mergedProjects),
        goals: newExtraction.goals ? Array.from(new Set([...currentGoals, ...newExtraction.goals])) : currentGoals,
        preferences: newExtraction.preferences ? Array.from(new Set([...currentPreferences, ...newExtraction.preferences])) : currentPreferences,
        confidenceScore: newExtraction.confidence ?? currentProfile.confidenceScore,
        lastExtractedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, currentProfile.id));

    // Insert timeline events in bulk
    if (newEvents.length > 0) {
      await db.insert(timelineEvents).values(newEvents);
    }
  }
}
