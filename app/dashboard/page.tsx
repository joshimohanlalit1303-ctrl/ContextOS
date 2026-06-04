import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, organizationMembers, projects, passports } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { FileJson, Target, ListTodo, BrainCircuit } from "lucide-react";
import Link from "next/link";

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
        <h1 className="text-3xl font-bold tracking-tight text-black">Context Passports</h1>
        <p className="text-gray-500 font-medium">Manage your AI project contexts and seamlessly switch between platforms.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white border border-gray-200 p-6 rounded-2xl flex flex-col gap-2 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <FileJson className="w-10 h-10 text-black" />
          </div>
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider z-10">Total Passports</span>
          <span className="text-4xl font-semibold text-black z-10">{totalPassports}</span>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-2xl flex flex-col gap-2 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ListTodo className="w-10 h-10 text-black" />
          </div>
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider z-10">Tasks Tracked</span>
          <span className="text-4xl font-semibold text-black z-10">{totalTasks}</span>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-2xl flex flex-col gap-2 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <BrainCircuit className="w-10 h-10 text-black" />
          </div>
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider z-10">AI Extraction Status</span>
          <span className="text-4xl font-semibold text-green-500 z-10">Online</span>
        </div>
      </div>

      <div className="mt-12 bg-white border border-gray-200 shadow-sm rounded-2xl p-8 min-h-[400px]">
        <h3 className="text-xl font-bold text-black mb-6">Recent Passports</h3>
        
        {totalPassports === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-gray-500 text-center border border-dashed border-gray-300 rounded-xl bg-gray-50">
            <span className="text-3xl mb-3">🚀</span>
            <p className="text-sm font-semibold text-black">No Passports Yet</p>
            <p className="text-xs mt-1 max-w-xs text-gray-500 font-medium">Use the Chrome Extension to save your first Context Passport from any AI chat.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {userPassports.map((passport) => (
               <Link href={`/dashboard/passports/${passport.id}`} key={passport.id} className="block">
                 <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-500/50 hover:shadow-md transition-all h-full">
                   <h4 className="text-lg font-bold text-black mb-2">{passport.project}</h4>
                   <div className="flex items-start gap-2 text-sm text-gray-600 mb-4 font-medium">
                     <Target className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
                     <p className="line-clamp-2">{passport.goal}</p>
                   </div>
                   <div className="flex gap-4 text-xs font-semibold text-gray-400 border-t border-gray-100 pt-3">
                     <span>{passport.tasks.length} Tasks</span>
                     <span>{passport.decisions.length} Decisions</span>
                     <span>Updated {new Date(passport.updatedAt).toLocaleDateString()}</span>
                   </div>
                 </div>
               </Link>
             ))}
          </div>
        )}
      </div>
    </>
  );
}
