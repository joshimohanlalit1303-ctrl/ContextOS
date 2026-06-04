import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { ProfileData } from './profile-extractor';

export const TimelineEventSchema = z.object({
  isSignificantEvent: z.boolean().describe("Whether this new memory constitutes a significant timeline event (milestone, shift, major learning)."),
  date: z.string().describe("ISO Date string for the event (use current date if not specified)"),
  description: z.string().describe("A concise description of the timeline event (e.g., 'Started learning AI', 'Moved to Bangalore')"),
  category: z.enum(['milestone', 'shift', 'learning', 'project_start', 'project_end', 'other']).describe("Category of the event"),
});

export type TimelineEventData = z.infer<typeof TimelineEventSchema>;

export async function detectTimelineEvent(
  memoryContent: string, 
  oldProfile: Partial<ProfileData>, 
  newProfile: ProfileData
): Promise<TimelineEventData | null> {
  const systemPrompt = `
You are the Libro Memory Evolution Engine.
Your task is to compare the user's old profile and their new profile (after a new memory was ingested) and determine if a significant timeline event occurred.

Old Profile:
${JSON.stringify(oldProfile, null, 2)}

New Profile:
${JSON.stringify(newProfile, null, 2)}

Instructions:
1. If the user indicates a major shift (e.g. changing locations, changing roles, starting a new project, setting a major new goal, or acquiring a significant skill), mark isSignificantEvent as true.
2. If it is just casual chatter or a minor preference change (e.g., "I like dark mode"), mark isSignificantEvent as false.
3. If true, provide a concise description and categorize it.
4. Assume the current date for the event unless the user specified a past date in the memory. The current date is ${new Date().toISOString()}.
  `;

  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: TimelineEventSchema,
    system: systemPrompt,
    prompt: `New Memory: "${memoryContent}"`,
  });

  return object.isSignificantEvent ? object : null;
}
