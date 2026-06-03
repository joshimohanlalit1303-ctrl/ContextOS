import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, organizationMembers, projects, passports } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { FileJson, Target, ListTodo, BrainCircuit } from "lucide-react";

export default async function DashboardOverview() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch Drizzle user
  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, user.email!),
  });
  if (!dbUser) redirect("/login");

  // Get user's org
  const orgMember = await db.query.organizationMembers.findFirst({
    where: eq(organizationMembers.userId, dbUser.id)
  });
  
  if (!orgMember) return <div>No Organization Found</div>;

  // Get org's project
  const project = await db.query.projects.findFirst({
    where: eq(projects.organizationId, orgMember.organizationId)
  });

  if (!project) return <div>No Project Found</div>;

  // Fetch all Passports for this user
  const userPassports = await db.query.passports.findMany({
    where: eq(passports.userId, dbUser.id),
    orderBy: [desc(passports.updatedAt)],
    with: {
      tasks: true,
      decisions: true
    }
  });

  const totalPassports = userPassports.length;
  const totalTasks = userPassports.reduce((acc, p) => acc + p.tasks.length, 0);

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Context Passports</h1>
        <p className="text-muted">Manage your AI project contexts and seamlessly switch between platforms.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col gap-2 shadow-[0_0_20px_rgba(255,255,255,0.02)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FileJson className="w-10 h-10" />
          </div>
          <span className="text-sm font-medium text-muted uppercase tracking-wider z-10">Total Passports</span>
          <span className="text-4xl font-light text-white z-10">{totalPassports}</span>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col gap-2 shadow-[0_0_20px_rgba(255,255,255,0.02)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ListTodo className="w-10 h-10" />
          </div>
          <span className="text-sm font-medium text-muted uppercase tracking-wider z-10">Tasks Tracked</span>
          <span className="text-4xl font-light text-white z-10">{totalTasks}</span>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col gap-2 shadow-[0_0_20px_rgba(255,255,255,0.02)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BrainCircuit className="w-10 h-10" />
          </div>
          <span className="text-sm font-medium text-muted uppercase tracking-wider z-10">AI Extraction Status</span>
          <span className="text-4xl font-light text-green-400 z-10">Online</span>
        </div>
      </div>

      <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-8 min-h-[400px]">
        <h3 className="text-xl font-semibold text-white mb-6">Recent Passports</h3>
        
        {totalPassports === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted text-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
            <span className="text-3xl mb-3">🚀</span>
            <p className="text-sm font-medium">No Passports Yet</p>
            <p className="text-xs opacity-70 mt-1 max-w-xs">Use the Chrome Extension to save your first Context Passport from any AI chat.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {userPassports.map((passport) => (
               <div key={passport.id} className="bg-glass border border-glassborder rounded-xl p-5 hover:border-blue-500/50 transition-colors">
                 <h4 className="text-lg font-semibold text-white mb-2">{passport.project}</h4>
                 <div className="flex items-start gap-2 text-sm text-white/70 mb-4">
                   <Target className="w-4 h-4 mt-0.5 text-blue-400 shrink-0" />
                   <p className="line-clamp-2">{passport.goal}</p>
                 </div>
                 <div className="flex gap-4 text-xs text-white/50 border-t border-glassborder pt-3">
                   <span>{passport.tasks.length} Tasks</span>
                   <span>{passport.decisions.length} Decisions</span>
                   <span>Updated {new Date(passport.updatedAt).toLocaleDateString()}</span>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </>
  );
}
