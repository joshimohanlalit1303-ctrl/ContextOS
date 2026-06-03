import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { endUsers, profiles, projects, users, organizationMembers } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

export default async function ProfilesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get User's active projects
  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, user.email!),
  });

  if (!dbUser) redirect("/login");

  const orgMembers = await db.query.organizationMembers.findMany({
    where: eq(organizationMembers.userId, dbUser.id),
  });

  const orgIds = orgMembers.map(om => om.organizationId);

  const activeProjects = await db.query.projects.findMany({
    where: inArray(projects.organizationId, orgIds),
  });

  const projectIds = activeProjects.map(p => p.id);

  // Get EndUsers and Profiles
  const allEndUsers = await db.query.endUsers.findMany({
    where: projectIds.length > 0 ? inArray(endUsers.projectId, projectIds) : undefined,
  });

  const allProfiles = await db.query.profiles.findMany({
    where: allEndUsers.length > 0 ? inArray(profiles.endUserId, allEndUsers.map(eu => eu.id)) : undefined,
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">User Profiles</h1>
        <p className="text-muted">Explore the structured context extracted from your users.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allProfiles.length === 0 ? (
          <div className="col-span-full border border-white/10 bg-white/5 rounded-xl p-12 text-center">
            <h3 className="text-xl font-medium mb-2">No Profiles Found</h3>
            <p className="text-muted">Start ingesting data via the API to automatically generate user profiles.</p>
          </div>
        ) : (
          allProfiles.map((profile) => {
            const endUser = allEndUsers.find(eu => eu.id === profile.endUserId);
            return (
              <div key={profile.id} className="border border-white/10 bg-[#0a0a0a] rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between mb-4">
                  <div className="font-mono text-xs text-muted truncate max-w-[150px]">
                    {endUser?.externalId || "Unknown ID"}
                  </div>
                  <div className="text-xs font-semibold px-2 py-1 bg-green-500/10 text-green-400 rounded-full">
                    {profile.confidenceScore}% Confidence
                  </div>
                </div>

                <div className="space-y-4">
                  {profile.identity && Object.keys(profile.identity).length > 0 && (
                    <div>
                      <h4 className="text-xs uppercase text-muted font-bold mb-1 tracking-wider">Identity</h4>
                      <p className="text-sm font-medium">{JSON.stringify(profile.identity)}</p>
                    </div>
                  )}

                  {Array.isArray(profile.skills) && profile.skills.length > 0 && (
                    <div>
                      <h4 className="text-xs uppercase text-muted font-bold mb-2 tracking-wider">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {(profile.skills as string[]).map((skill, i) => (
                          <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(profile.goals) && profile.goals.length > 0 && (
                    <div>
                      <h4 className="text-xs uppercase text-muted font-bold mb-1 tracking-wider">Goals</h4>
                      <ul className="list-disc list-inside text-sm text-white/80">
                        {(profile.goals as string[]).slice(0, 2).map((goal, i) => (
                          <li key={i} className="truncate">{goal}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}
