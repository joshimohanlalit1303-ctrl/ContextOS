import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const PassportSchema = z.object({
  project: z.string().describe("The name of the project or coding task being worked on."),
  goal: z.string().describe("The overarching goal or objective the user is trying to achieve."),
  tasks: z.array(z.string()).describe("A list of specific tasks or actionable steps mentioned or implied in the conversation."),
  decisions: z.array(z.string()).describe("A list of technical or design decisions made during the conversation."),
  summary: z.string().describe("A concise summary of the conversation and current state of the project.")
});

export type PassportExtraction = z.infer<typeof PassportSchema>;

export class PassportExtractionEngine {
  /**
   * Extracts a structured Passport from raw chat history.
   * @param chatHistory Array of {role: 'user'|'assistant', content: string}
   */
  static async extract(chatHistory: any[]): Promise<PassportExtraction> {
    const historyString = chatHistory
      .map((msg) => `[${msg.role.toUpperCase()}]: ${msg.content}`)
      .join("\n\n");

    // Take the last 25,000 characters to prevent huge token limits
    const truncatedHistory = historyString.slice(-25000);

    try {
      const { object } = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: PassportSchema,
        system: `You are an expert AI Context Extraction Engine.
Your job is to read raw conversational inputs between a User and an AI Assistant, and extract a structured "Context Passport".

A Context Passport captures the essence of a project so that the user can seamlessly switch to another AI platform and resume exactly where they left off.

Rules for Extraction:
1. PROJECT: Identify the overarching project name or topic.
2. GOAL: Identify what the user is ultimately trying to build or achieve.
3. TASKS: List the specific tasks that were completed or are currently pending.
4. DECISIONS: List any technical choices, stack decisions, or architecture agreements made.
5. SUMMARY: Write a concise summary of the current state of the project.

Make sure your extraction is accurate, highly detailed, and strictly follows the JSON schema.`,
        prompt: `Extract the Context Passport from the following conversation:\n\n${truncatedHistory}`,
      });

      return object;
    } catch (error: any) {
      console.error("PassportExtractionEngine error:", error);
      
      // Specifically detect 429 Too Many Requests (Rate Limit)
      if (error?.statusCode === 429 || error?.message?.includes("Quota exceeded") || error?.message?.includes("429")) {
        throw new Error("AI Rate Limit Exceeded: Please wait 60 seconds before saving another passport.");
      }
      
      throw new Error("Failed to extract Context Passport from conversation.");
    }
  }
}
