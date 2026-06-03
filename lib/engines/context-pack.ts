import { ProfileData } from './profile-extractor';
import { TimelineEventData } from './memory-evolution';

export interface ContextPackRequest {
  profile: ProfileData;
  recentTimeline: TimelineEventData[];
  // we could include raw memory strings if we implemented vector search
  // recentMemories?: string[]; 
}

export interface ContextPackResponse {
  summary: string;
  identity: Record<string, string>;
  skills: string[];
  projects: string[];
  goals: string[];
  preferences: string[];
  recent_activity: string[];
}

export function generateContextPack(request: ContextPackRequest): ContextPackResponse {
  // We can optimize the context pack by omitting empty fields, 
  // or using an LLM to summarize the timeline. For speed and reliability, 
  // we'll format it deterministically.
  
  const { profile, recentTimeline } = request;

  const summaryParts = [];
  if (profile.identity['role']) {
    summaryParts.push(`User is a ${profile.identity['role']}.`);
  }
  if (profile.goals.length > 0) {
    summaryParts.push(`Primary goal: ${profile.goals[0]}.`);
  }
  if (profile.projects.length > 0) {
    summaryParts.push(`Currently working on: ${profile.projects[0]}.`);
  }

  const summary = summaryParts.join(' ') || "No significant context available yet.";

  return {
    summary,
    identity: profile.identity || {},
    skills: profile.skills || [],
    projects: profile.projects || [],
    goals: profile.goals || [],
    preferences: profile.preferences || [],
    recent_activity: recentTimeline.map(t => `[${t.date.substring(0, 10)}] ${t.description}`)
  };
}
