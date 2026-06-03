import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { endUsers, profiles, timelineEvents, projects, users, organizationMembers } from "@/lib/db/schema";
import { eq, inArray, and, desc } from "drizzle-orm";

export default async function ContextExplorerPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const resolvedParams = await searchParams;
  const targetUserId = resolvedParams?.userId;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, user.email!),
  });

  if (!dbUser) redirect("/login");

  const orgMembers = await db.query.organizationMembers.findMany({
    where: eq(organizationMembers.userId, dbUser.id),
  });

  const activeProjects = await db.query.projects.findMany({
    where: inArray(projects.organizationId, orgMembers.map(om => om.organizationId)),
  });
  const projectIds = activeProjects.map(p => p.id);

  let contextPayload: any = null;

  if (targetUserId && projectIds.length > 0) {
    const userRecord = await db.query.endUsers.findFirst({
      where: and(inArray(endUsers.projectId, projectIds), eq(endUsers.externalId, targetUserId)),
    });

    if (userRecord) {
      const profile = await db.query.profiles.findFirst({
        where: eq(profiles.endUserId, userRecord.id),
      });
      const recentEvents = await db.query.timelineEvents.findMany({
        where: eq(timelineEvents.endUserId, userRecord.id),
        orderBy: [desc(timelineEvents.date)],
        limit: 5,
      });

      let summary = `This user `;
      if (profile?.identity && Object.keys(profile.identity).length > 0) {
        summary += `identifies as ${JSON.stringify(profile.identity)}. `;
      } else {
        summary += `is a user of the system. `;
      }
      
      if (profile?.projects && (profile.projects as string[]).length > 0) {
        summary += `They are currently working on ${(profile.projects as string[]).join(", ")}. `;
      }

      contextPayload = {
        summary: summary.trim(),
        identity: profile?.identity || {},
        skills: profile?.skills || [],
        projects: profile?.projects || [],
        goals: profile?.goals || [],
        preferences: profile?.preferences || [],
        recent_activity: recentEvents.map(e => ({ date: e.date.toISOString().split('T')[0], description: e.description })),
        confidence: profile?.confidenceScore || 0,
      };
    }
  }

  return (
    <div className="flex flex-col gap-8 h-[calc(100vh-100px)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Context Explorer</h1>
        <p className="text-muted">Enter a User ID to see exactly what context payload is sent to your LLM.</p>
      </div>

      <div className="flex gap-6 h-full">
        <div className="w-1/3 bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
          <form className="flex flex-col gap-4">
            <label className="text-sm font-medium">End User ID</label>
            <input 
              name="userId" 
              defaultValue={targetUserId}
              placeholder="e.g., user_12345" 
              className="bg-bg border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/30"
            />
            <button type="submit" className="bg-white text-black font-medium text-sm py-2 rounded-lg hover:bg-white/90 transition-colors">
              Load Context
            </button>
          </form>

          {targetUserId && !contextPayload && (
             <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                No context found for User ID: {targetUserId}
             </div>
          )}
        </div>

        <div className="flex-1 bg-black border border-white/10 rounded-xl overflow-hidden flex flex-col">
          <div className="bg-white/5 border-b border-white/10 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-green-500"></div>
               <span className="text-sm font-medium">GPT-Ready Payload</span>
            </div>
            {contextPayload && (
              <span className="text-xs text-muted font-mono">{JSON.stringify(contextPayload).length} bytes</span>
            )}
          </div>
          <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-green-400">
            {contextPayload ? (
              <pre>{JSON.stringify(contextPayload, null, 2)}</pre>
            ) : (
              <div className="text-muted text-center mt-20">Enter a User ID to preview the payload.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
