import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, passports, passportTasks, passportDecisions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, Target, ListTodo, BrainCircuit, CheckCircle2, Circle } from "lucide-react";

export default async function PassportDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, user.email!),
  });
  if (!dbUser) redirect("/login");

  const passport = await db.query.passports.findFirst({
    where: eq(passports.id, id),
    with: {
      tasks: true,
      decisions: true
    }
  });

  if (!passport || passport.userId !== dbUser.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <h2 className="text-2xl font-bold text-black mb-4">Passport Not Found</h2>
        <Link href="/dashboard" className="text-blue-500 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard" 
          className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-black hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">{passport.project}</h1>
          <p className="text-gray-500 font-medium">Passport Details & Context</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-8">
        <div className="flex items-start gap-4">
           <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 mt-1">
             <Target className="w-6 h-6 text-blue-500" />
           </div>
           <div>
             <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Primary Goal</h3>
             <p className="text-lg text-black font-medium leading-relaxed">{passport.goal}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tasks */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
             <ListTodo className="w-5 h-5 text-gray-700" />
             <h3 className="text-xl font-bold text-black">Extracted Tasks</h3>
          </div>
          
          {passport.tasks.length === 0 ? (
            <p className="text-gray-500 italic">No tasks extracted.</p>
          ) : (
            <ul className="space-y-4">
              {passport.tasks.map(task => (
                <li key={task.id} className="flex items-start gap-3">
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
                  )}
                  <span className={`text-black font-medium ${task.completed ? "line-through text-gray-400" : ""}`}>
                    {task.task}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Decisions */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
             <BrainCircuit className="w-5 h-5 text-gray-700" />
             <h3 className="text-xl font-bold text-black">Key Decisions</h3>
          </div>
          
          {passport.decisions.length === 0 ? (
            <p className="text-gray-500 italic">No decisions extracted.</p>
          ) : (
            <ul className="space-y-4">
              {passport.decisions.map(decision => (
                <li key={decision.id} className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-black font-medium text-sm leading-relaxed">
                    {decision.decision}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
         <h3 className="text-lg font-bold text-black mb-4">Context Summary</h3>
         <p className="text-gray-600 font-medium leading-relaxed">
           {passport.summary}
         </p>
      </div>
    </>
  );
}
