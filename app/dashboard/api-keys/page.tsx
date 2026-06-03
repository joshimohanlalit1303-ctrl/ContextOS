import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, organizationMembers, projects, apiKeys } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createApiKey, revokeApiKey } from "./actions";

export default async function ApiKeysPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch user -> org -> project
  const dbUser = await db.query.users.findFirst({ where: eq(users.email, user.email!) });
  if (!dbUser) redirect("/login");

  const orgMember = await db.query.organizationMembers.findFirst({ where: eq(organizationMembers.userId, dbUser.id) });
  if (!orgMember) return <div>No Org</div>;

  const project = await db.query.projects.findFirst({ where: eq(projects.organizationId, orgMember.organizationId) });
  if (!project) return <div>No Project</div>;

  // Fetch real API keys
  const keys = await db.query.apiKeys.findMany({
     where: eq(apiKeys.projectId, project.id),
     orderBy: (apiKeys, { desc }) => [desc(apiKeys.createdAt)]
  });

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">API Keys</h1>
        <p className="text-muted">Manage your API keys to access ContextOS engines for project <span className="font-mono text-accent">{project.name}</span>.</p>
      </div>

      <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-8 shadow-[0_0_20px_rgba(255,255,255,0.02)]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Your Keys</h3>
          <form action={createApiKey}>
             <input type="hidden" name="projectId" value={project.id} />
             <button type="submit" className="px-5 py-2.5 bg-accent text-white font-medium rounded-lg text-sm shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] transition-all">
               Create New Key
             </button>
          </form>
        </div>
        
        {keys.length === 0 ? (
           <div className="text-center py-10 text-muted border border-dashed border-white/10 rounded-xl">
             You have no active API keys.
           </div>
        ) : (
          <div className="space-y-4">
            {keys.map(key => (
               <div key={key.id} className="p-5 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-colors">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-medium text-white">{key.name}</span>
                    <span className="text-sm font-mono text-muted group-hover:text-white/70 transition-colors">
                       ctx_live_•••••••••••••••••••••••••••••••••{key.keyHash.slice(-4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xs text-muted">Created {new Date(key.createdAt).toLocaleDateString()}</span>
                    <form action={revokeApiKey}>
                       <input type="hidden" name="keyId" value={key.id} />
                       <button type="submit" className="text-sm text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-md hover:bg-red-400/10">Revoke</button>
                    </form>
                  </div>
                </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
