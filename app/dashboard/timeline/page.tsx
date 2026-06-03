import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { endUsers, timelineEvents, projects, users, organizationMembers } from "@/lib/db/schema";
import { eq, inArray, and, desc } from "drizzle-orm";
import { format } from "date-fns";

export default async function TimelinePage({
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

  let events: any[] = [];

  if (targetUserId && projectIds.length > 0) {
    const userRecord = await db.query.endUsers.findFirst({
      where: and(inArray(endUsers.projectId, projectIds), eq(endUsers.externalId, targetUserId)),
    });

    if (userRecord) {
      events = await db.query.timelineEvents.findMany({
        where: eq(timelineEvents.endUserId, userRecord.id),
        orderBy: [desc(timelineEvents.date)],
      });
    }
  }

  return (
    <div className="flex flex-col gap-8 h-[calc(100vh-100px)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Timeline Explorer</h1>
        <p className="text-muted">Trace the chronological evolution of a user's skills, goals, and context.</p>
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
              Load Timeline
            </button>
          </form>
        </div>

        <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl p-8 overflow-y-auto relative">
          {!targetUserId ? (
            <div className="flex items-center justify-center h-full text-muted">
               Enter a User ID to view their timeline.
            </div>
          ) : events.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted">
               No events found for this user.
            </div>
          ) : (
            <div className="relative border-l border-white/10 ml-4 space-y-12 pb-12">
              {events.map((event, index) => (
                <div key={event.id} className="relative pl-8">
                  {/* Timeline Dot */}
                  <div className="absolute w-3 h-3 bg-white rounded-full -left-[6.5px] top-1.5 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                  
                  <div className="text-xs font-semibold text-accent mb-1">
                     {format(new Date(event.date), "MMMM do, yyyy")}
                  </div>
                  <div className="text-sm text-white/90 leading-relaxed bg-white/5 border border-white/10 p-4 rounded-lg inline-block">
                    {event.description}
                  </div>
                  {event.category && (
                    <div className="mt-2 text-[10px] uppercase tracking-widest text-muted font-bold">
                       {event.category}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
