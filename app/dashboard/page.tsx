import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut as logout } from '../login/actions'
import { generateApiKey, deleteApiKey } from './actions'
import { Key, Trash2, LogOut, Database, Code2 } from 'lucide-react'
import Link from 'next/link'
import { CopyButton } from '@/components/CopyButton'
import { db } from "@/lib/db";
import { users, passports } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Target, FileJson, ListTodo, BrainCircuit } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch API keys
  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch memory count
  const { count } = await supabase
    .from('memories')
    .select('*', { count: 'exact', head: true })

  // Restore Passport Logic
  let userPassports: any[] = [];
  try {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, user.email!),
    });

    if (dbUser) {
      userPassports = await db.query.passports.findMany({
        where: eq(passports.userId, dbUser.id),
        orderBy: [desc(passports.updatedAt)],
        with: {
          tasks: true,
          decisions: true
        }
      });
    }
  } catch (err) {
    console.error("Failed to fetch passports:", err);
  }

  const totalPassports = userPassports.length;
  const totalTasks = userPassports.reduce((acc, p) => acc + (p.tasks?.length || 0), 0);

  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-12 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="flex items-center justify-between mb-16 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-3xl font-light mb-1">Developer Dashboard</h1>
            <p className="text-neutral-400 text-sm">{user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Home
            </Link>
            <form action={logout}>
              <button className="flex items-center text-sm text-neutral-400 hover:text-red-400 transition-colors">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </form>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Stats Card */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-xl">
                <Database className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-medium">Memory Usage</h2>
            </div>
            <div className="text-4xl font-light mb-1">{count || 0}</div>
            <p className="text-sm text-neutral-400">Total embeddings stored</p>
          </div>

          <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/10 rounded-xl">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-medium">Quick Start</h2>
            </div>
            <p className="text-neutral-400 text-sm mb-4">Install the SDK and start giving your AI memory instantly.</p>
            <div className="bg-black/50 p-3 rounded-xl border border-white/10 font-mono text-sm flex items-center justify-between">
              <span className="overflow-x-auto whitespace-nowrap">npm install libro-sdk</span>
              <CopyButton text="npm install libro-sdk" />
            </div>
          </div>
        </div>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium">API Keys</h2>
            <form action={generateApiKey}>
              <button className="bg-white text-black px-4 py-2 rounded-xl text-sm font-medium hover:bg-neutral-200 transition-colors">
                + Create New Key
              </button>
            </form>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
            {apiKeys && apiKeys.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/10 text-sm text-neutral-400">
                  <tr>
                    <th className="px-6 py-4 font-normal">Key Name</th>
                    <th className="px-6 py-4 font-normal">Key String</th>
                    <th className="px-6 py-4 font-normal">Created At</th>
                    <th className="px-6 py-4 text-right font-normal">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {apiKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium flex items-center gap-3">
                        <Key className="w-4 h-4 text-neutral-500" />
                        Default Key
                      </td>
                      <td className="px-6 py-4 font-mono text-xs flex items-center gap-2">
                        <span className="truncate max-w-[200px] inline-block">{key.key.substring(0, 14)}...</span>
                        <CopyButton text={key.key} />
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-400">
                        {new Date(key.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <form action={deleteApiKey.bind(null, key.id)}>
                          <button className="text-neutral-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/5">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center flex flex-col items-center">
                <Key className="w-8 h-8 text-neutral-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">No API keys found</h3>
                <p className="text-neutral-400 text-sm">Create an API key to start using the Libro SDK.</p>
              </div>
            )}
          </div>
        </section>

        {/* --- PASSPORTS SECTION RESTORED --- */}
        <section className="mb-12">
          <div className="flex flex-col gap-2 mb-8">
            <h2 className="text-xl font-medium tracking-tight text-white">Context Passports</h2>
            <p className="text-neutral-400 text-sm">Manage your AI project contexts and seamlessly switch between platforms.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col gap-2 shadow-[0_0_20px_rgba(255,255,255,0.02)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <FileJson className="w-10 h-10" />
              </div>
              <span className="text-sm font-medium text-neutral-400 tracking-wider z-10">Total Passports</span>
              <span className="text-4xl font-light text-white z-10">{totalPassports}</span>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col gap-2 shadow-[0_0_20px_rgba(255,255,255,0.02)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ListTodo className="w-10 h-10" />
              </div>
              <span className="text-sm font-medium text-neutral-400 tracking-wider z-10">Tasks Tracked</span>
              <span className="text-4xl font-light text-white z-10">{totalTasks}</span>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col gap-2 shadow-[0_0_20px_rgba(255,255,255,0.02)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <BrainCircuit className="w-10 h-10" />
              </div>
              <span className="text-sm font-medium text-neutral-400 tracking-wider z-10">Extraction Status</span>
              <span className="text-4xl font-light text-green-400 z-10">Online</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 min-h-[300px]">
            {totalPassports === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-neutral-400 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                <span className="text-3xl mb-3">🚀</span>
                <p className="text-sm font-medium text-white">No Passports Yet</p>
                <p className="text-xs opacity-70 mt-1 max-w-xs">Use the Chrome Extension to save your first Context Passport from any AI chat.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {userPassports.map((passport) => (
                   <Link href={`/dashboard/passports/${passport.id}`} key={passport.id} className="block group">
                     <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-blue-500/50 hover:bg-white/10 transition-all h-full relative overflow-hidden">
                       <h4 className="text-lg font-medium text-white mb-2">{passport.project}</h4>
                       <div className="flex items-start gap-2 text-sm text-neutral-300 mb-4 font-medium">
                         <Target className="w-4 h-4 mt-0.5 text-blue-400 shrink-0" />
                         <p className="line-clamp-2">{passport.goal}</p>
                       </div>
                       <div className="flex gap-4 text-xs font-medium text-neutral-500 border-t border-white/10 pt-4 mt-auto">
                         <span>{passport.tasks?.length || 0} Tasks</span>
                         <span>{passport.decisions?.length || 0} Decisions</span>
                         <span>Updated {new Date(passport.updatedAt).toLocaleDateString()}</span>
                       </div>
                     </div>
                   </Link>
                 ))}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
