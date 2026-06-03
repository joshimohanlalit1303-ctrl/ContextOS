import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export const ProfileSchema = z.object({
  identity: z.record(z.string(), z.string()).describe("Key-value pairs of user identity attributes (e.g. { role: 'Founder', location: 'SF' })"),
  skills: z.array(z.string()).describe("List of skills the user possesses"),
  goals: z.array(z.string()).describe("List of goals the user is trying to achieve"),
  projects: z.array(z.string()).describe("List of projects the user is working on or has worked on"),
  preferences: z.array(z.string()).describe("List of user preferences (e.g., uses dark mode, prefers async communication)"),
});

export type ProfileData = z.infer<typeof ProfileSchema>;

export async function extractProfileData(memoryContent: string, currentProfile?: Partial<ProfileData>): Promise<ProfileData> {
  const systemPrompt = `
You are ContextOS Profile Extraction Engine.
Your task is to analyze the user's conversational input and extract a structured profile.

Current Profile Data (if any):
${JSON.stringify(currentProfile ?? {}, null, 2)}

Instructions:
1. Extract any new identity attributes, skills, goals, projects, or preferences from the new memory.
2. If the user indicates a change (e.g., "I moved to NYC"), update the identity attribute.
3. Perform semantic deduplication. Do not add "TypeScript" if "TS" or "TypeScript" is already in the skills list.
4. Return the COMPLETE updated profile, including the old data that hasn't changed.
5. If the new memory contradicts old data (e.g., old: "Student", new: "Graduated, now SWE"), prioritize the new memory and update the identity.
  `;

  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: ProfileSchema,
    system: systemPrompt,
    prompt: `New Memory: "${memoryContent}"`,
  });

  return object;
}
