import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, organizationMembers, projects, apiKeys } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createApiKey, revokeApiKey } from "./actions";
import CreateKeyButton from "./CreateKeyButton";

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
        <h1 className="text-3xl font-bold tracking-tight text-black">API Keys</h1>
        <p className="text-gray-500 font-medium">Manage your API keys to access Libro engines for project <span className="font-mono text-accent">{project.name}</span>.</p>
      </div>

      <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-black">Your Keys</h3>
          <CreateKeyButton projectId={project.id} />
        </div>
        
        {keys.length === 0 ? (
           <div className="text-center py-10 text-gray-500 font-medium border border-dashed border-gray-300 bg-gray-50 rounded-xl">
             You have no active API keys.
           </div>
        ) : (
          <div className="space-y-4">
            {keys.map(key => (
               <div key={key.id} className="p-5 rounded-xl bg-white border border-gray-200 flex justify-between items-center group hover:bg-gray-50 hover:border-blue-500/50 hover:shadow-md transition-all">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-bold text-black">{key.name}</span>
                    <span className="text-sm font-mono text-gray-500 group-hover:text-gray-900 transition-colors">
                       ctx_live_•••••••••••••••••••••••••••••••••{key.keyHash.slice(-4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xs font-semibold text-gray-400">Created {new Date(key.createdAt).toLocaleDateString()}</span>
                    <form action={async (formData) => { "use server"; await revokeApiKey(formData); }}>
                       <input type="hidden" name="keyId" value={key.id} />
                       <button type="submit" className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors px-3 py-1.5 rounded-md hover:bg-red-50">Revoke</button>
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
