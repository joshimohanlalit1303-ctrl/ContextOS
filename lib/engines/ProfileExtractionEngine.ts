import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const ExtractionSchema = z.object({
  identity: z.object({
    name: z.string().optional(),
    age: z.string().optional(),
    location: z.string().optional(),
    role: z.string().optional(),
    other: z.record(z.string(), z.string()).optional()
  }).optional().describe("User's personal identity details"),
  skills: z.array(z.string()).optional().describe("Technical or soft skills explicitly mentioned (e.g., ['AI', 'TypeScript'])"),
  projects: z.array(z.string()).optional().describe("Projects, companies, or products the user is working on"),
  goals: z.array(z.string()).optional().describe("Specific goals, desires, or intents the user has expressed"),
  preferences: z.array(z.string()).optional().describe("User preferences, likes, or dislikes (e.g., ['butter chicken', 'dark mode'])"),
  confidence: z.number().min(0).max(100).describe("Confidence score of this extraction (0-100)"),
});

export type ExtractedProfile = z.infer<typeof ExtractionSchema>;

export class ProfileExtractionEngine {
  /**
   * Extracts structured profile data from raw conversational text using Google Gemini API.
   * @param text Raw conversational memory/input from the user
   * @returns Structured profile objects
   */
  static async extract(text: string): Promise<ExtractedProfile> {
    try {
      const { object } = await generateObject({
        // Uses the free-tier Gemini 1.5 Flash model
        model: google("gemini-2.5-flash"),
        schema: ExtractionSchema,
        system: `You are an expert user context extraction engine for Libro.
Your job is to read raw conversational inputs and extract structured understanding of the user.
Extract persistent attributes: name, age, location, what they can do, what they are building, what they like (preferences).
Output strict JSON matching the schema. Handle conflicting or ambiguous data gracefully by lowering your confidence score.`,
        prompt: `User Input:\n\n"${text}"\n\nExtract the structured context perfectly.`,
      });

      return object;
    } catch (error) {
      console.error("[ProfileExtractionEngine] Extraction failed (is GOOGLE_GENERATIVE_AI_API_KEY set?):", error);
      throw new Error("Failed to extract profile context");
    }
  }
}
