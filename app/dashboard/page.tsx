import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut as logout } from '../login/actions'
import { generateApiKey, deleteApiKey } from './actions'
import { Key, Trash2, LogOut, Database, Code2, Zap, BookOpen, Brain, Plug2, Clock, Map } from 'lucide-react'
import Link from 'next/link'
import { CopyButton } from '@/components/CopyButton'
import MCPSetupWizard from '@/components/MCPSetupWizard'
import KnowledgeGraph from '@/components/KnowledgeGraph'
import { db } from '@/lib/db'
import { users, passports, memories } from '@/lib/db/schema'
import { eq, desc, count, inArray } from 'drizzle-orm'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import MemoryExplorer from '@/components/MemoryExplorer'
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch API keys (fast, required for all children)
  const { data: apiKeys, error: apiKeysError } = await supabase
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false });

  const apiKeyIds = (apiKeys || []).map(k => k.id);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 pt-28 md:p-12 md:pt-32 relative overflow-hidden font-sans">
      {/* VisionOS Dark Glass Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-16 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Developer Dashboard</h1>
            <p className="text-gray-400 text-sm font-medium">{user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Home
            </Link>
            <form action={logout}>
              <button className="flex items-center text-sm font-medium text-gray-400 hover:text-red-400 transition-colors">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </form>
          </div>
        </header>

        {/* Stats Row */}
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStats user={user} apiKeys={apiKeys || []} apiKeysError={apiKeysError} />
        </Suspense>

        {/* Connect CTA — primary action */}
        <Link href="/dashboard/connect" className="block mb-12 group">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 flex items-center justify-between hover:bg-white/10 hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-indigo-500/30 transition-colors" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Plug2 className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Quick Setup</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Connect an AI Agent →</h2>
              <p className="text-gray-400 font-medium text-sm">Get ready-to-paste configs for Claude, Cursor, Windsurf, Antigravity, ChatGPT & more.</p>
            </div>
            <div className="relative z-10 shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                <span className="text-2xl">🔌</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Recent Passports */}
        <Suspense fallback={<PassportsSkeleton />}>
          <RecentPassports user={user} />
        </Suspense>

        {/* Hive Mind Constellation Graph */}
        <Suspense fallback={<GraphSkeleton />}>
          <HiveMindGraph apiKeyIds={apiKeyIds} />
        </Suspense>


        {/* Recent Memories Section - API Memories */}
        <Suspense fallback={<MemoriesSkeleton />}>
          <RecentMemories apiKeyIds={apiKeyIds} />
        </Suspense>

        {/* Hive Identity */}
        <HiveIdentity user={user} apiKeys={apiKeys || []} />

        {/* Quick Start */}
        <QuickStart />

        {/* API Keys */}
        <ApiKeysSection apiKeys={apiKeys || []} />

        {/* Docs link */}
        <section>
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-8 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                <BookOpen className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Documentation</h3>
                <p className="text-sm font-medium text-gray-400">Full SDK reference, examples, and guides.</p>
              </div>
            </div>
            <Link href="/docs" className="text-sm font-semibold text-black bg-white border border-white px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors shadow-sm">
              View Docs →
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}

/* ==============================================================================
   Async Server Components (For Suspense boundaries)
   ============================================================================== */

async function DashboardStats({ user, apiKeys, apiKeysError }: { user: any, apiKeys: any[], apiKeysError: any }) {
  let memoryCount = 0;
  let passportCount = 0;
  let memoryError = null;
  const apiKeyIds = apiKeys.map(k => k.id);

  if (apiKeyIds.length > 0) {
    try {
      const [countResult] = await db.select({ value: count() }).from(memories).where(inArray(memories.apiKeyId, apiKeyIds));
      memoryCount = Number(countResult?.value || 0);
    } catch (e: any) {
      memoryError = e.message;
    }
  }

  if (user.email) {
    const internalUser = await db.query.users.findFirst({ where: eq(users.email, user.email) });
    if (internalUser) {
      const [passportCountResult] = await db.select({ value: count() }).from(passports).where(eq(passports.userId, internalUser.id));
      passportCount = Number(passportCountResult?.value || 0);
    }
  }

  const isEngineLive = !apiKeysError && !memoryError;
  const totalEmbeddings = memoryCount + passportCount;

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-12">
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-6 hover:bg-white/10 transition-colors">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/5 rounded-xl border border-white/10">
            <Database className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-200">Memory Usage</h2>
        </div>
        <div className="text-4xl font-bold tracking-tight text-white mb-1">{totalEmbeddings}</div>
        <p className="text-sm font-medium text-gray-400">Embeddings stored</p>
      </div>

      <div className="bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-6 hover:bg-white/10 transition-colors">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/5 rounded-xl border border-white/10">
            <Key className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-200">API Keys</h2>
        </div>
        <div className="text-4xl font-bold tracking-tight text-white mb-1">{apiKeys.length}</div>
        <p className="text-sm font-medium text-gray-400">Active keys</p>
      </div>

      <div className="bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-6 hover:bg-white/10 transition-colors">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/5 rounded-xl border border-white/10">
            <Zap className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-200">Engine Status</h2>
        </div>
        <div className={`text-4xl font-bold tracking-tight mb-1 ${isEngineLive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isEngineLive ? 'Live' : 'Degraded'}
        </div>
        <p className="text-sm font-medium text-gray-400">
          {isEngineLive ? 'All systems operational' : 'Database connection issues'}
        </p>
      </div>
    </div>
  )
}

function StatsSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-12">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
             <Skeleton className="w-9 h-9 rounded-xl" />
             <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-10 w-16 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  )
}

async function RecentPassports({ user }: { user: any }) {
  let recentPassports: any[] = [];
  if (user.email) {
    const internalUser = await db.query.users.findFirst({ where: eq(users.email, user.email) });
    if (internalUser) {
      recentPassports = await db.query.passports.findMany({
        where: eq(passports.userId, internalUser.id),
        orderBy: [desc(passports.createdAt)],
        limit: 5
      });
    }
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Map className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold tracking-tight text-white">Context Passports</h2>
        </div>
      </div>

      <div className="bg-white/5 border border-indigo-500/20 backdrop-blur-xl shadow-[0_0_30px_-5px_rgba(99,102,241,0.15)] rounded-3xl overflow-hidden">
        {recentPassports && recentPassports.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Project / Goal</th>
                <th className="px-6 py-4">Summary</th>
                <th className="px-6 py-4 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentPassports.map((passport) => (
                <tr key={passport.id} className="hover:bg-white/[0.04] transition-colors group">
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/passports/${passport.id}`} className="block">
                      <div className="font-semibold text-indigo-300 group-hover:text-indigo-400 transition-colors">{passport.project}</div>
                      <div className="text-xs text-gray-400 mt-1 max-w-[250px] truncate">{passport.goal}</div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    <Link href={`/dashboard/passports/${passport.id}`} className="block max-w-[350px] truncate">
                      {passport.summary}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500 text-right">
                    {new Date(passport.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="p-4 bg-indigo-500/10 rounded-full mb-4 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <Map className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Passports yet</h3>
            <p className="text-gray-400 text-sm font-medium">Use the Chrome Extension to extract and save a Context Passport.</p>
          </div>
        )}
      </div>
    </section>
  )
}

function PassportsSkeleton() {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-5 h-5 rounded-md" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="bg-white/5 border border-indigo-500/20 backdrop-blur-xl shadow-lg rounded-3xl overflow-hidden p-6">
         <Skeleton className="h-12 w-full mb-4" />
         <Skeleton className="h-12 w-full mb-4" />
         <Skeleton className="h-12 w-full" />
      </div>
    </section>
  )
}

async function HiveMindGraph({ apiKeyIds }: { apiKeyIds: string[] }) {
  let allMemories: any[] = [];
  if (apiKeyIds.length > 0) {
    allMemories = await db.query.memories.findMany({
      where: inArray(memories.apiKeyId, apiKeyIds),
      orderBy: [desc(memories.createdAt)],
      limit: 200,
      columns: { id: true, content: true, embedding: true }
    });
  }

  const graphNodes: any[] = [];
  const graphLinks: any[] = [];
  
  if (allMemories && allMemories.length > 0) {
    const memoryNodes = allMemories.map(m => {
      let vec = m.embedding;
      if (typeof vec === 'string') {
        try { vec = JSON.parse(vec); } catch(e) { vec = []; }
      }
      return {
        id: m.id,
        name: m.content.substring(0, 35) + (m.content.length > 35 ? '...' : ''),
        embedding: vec || []
      };
    }).filter(n => n.embedding.length > 0);

    memoryNodes.forEach(n => {
      graphNodes.push({ id: n.id, name: n.name });
    });

    for (let i = 0; i < memoryNodes.length; i++) {
      for (let j = i + 1; j < memoryNodes.length; j++) {
        const A = memoryNodes[i].embedding;
        const B = memoryNodes[j].embedding;
        let dotProduct = 0, normA = 0, normB = 0;
        for (let k = 0; k < A.length; k++) {
            dotProduct += A[k] * B[k];
            normA += A[k] * A[k];
            normB += B[k] * B[k];
        }
        const sim = (normA === 0 || normB === 0) ? 0 : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        
        if (sim > 0.70) {
          graphLinks.push({ source: memoryNodes[i].id, target: memoryNodes[j].id });
        }
      }
    }
  }

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-5 h-5 text-indigo-400" />
        <h2 className="text-xl font-bold tracking-tight text-white">Hive Mind Constellation</h2>
      </div>
      <KnowledgeGraph nodes={graphNodes} links={graphLinks} />
    </section>
  )
}

function GraphSkeleton() {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-5 h-5 rounded-md" />
        <Skeleton className="h-6 w-56" />
      </div>
      <Skeleton className="w-full h-[500px] rounded-3xl" />
    </section>
  )
}

async function RecentMemories({ apiKeyIds }: { apiKeyIds: string[] }) {
  let recentMemories: any[] = [];
  if (apiKeyIds.length > 0) {
    recentMemories = await db.query.memories.findMany({
      where: inArray(memories.apiKeyId, apiKeyIds),
      orderBy: [desc(memories.createdAt)],
      limit: 100,
      columns: { id: true, content: true, createdAt: true, endUserId: true, metadata: true }
    });
  }

  return <MemoryExplorer initialMemories={recentMemories} />
}

function MemoriesSkeleton() {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-5 h-5 rounded-md" />
        <Skeleton className="h-6 w-64" />
      </div>
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden p-6">
         <Skeleton className="h-12 w-full mb-4" />
         <Skeleton className="h-12 w-full mb-4" />
         <Skeleton className="h-12 w-full" />
      </div>
    </section>
  )
}

/* ==============================================================================
   Static Components (No async data fetching)
   ============================================================================== */

function HiveIdentity({ user, apiKeys }: { user: any, apiKeys: any[] }) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-5 h-5 text-gray-400" />
        <h2 className="text-xl font-bold tracking-tight text-white">Your Hive Identity</h2>
      </div>
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-8 space-y-6">
        <p className="text-gray-400 font-medium text-sm">Use these credentials to connect any AI agent to your personal Hive Mind.</p>

        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Your User ID (Hive Name)</p>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 font-mono text-sm flex items-center justify-between gap-4">
            <span className="text-gray-200 truncate">{user.id}</span>
            <CopyButton text={user.id} />
          </div>
          <p className="text-xs text-gray-500 mt-2">This is your unique identifier — it labels your personal memory bucket.</p>
        </div>

        {apiKeys && apiKeys.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Ready-to-Use MCP Server URL</p>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 font-mono text-xs flex items-center justify-between gap-4">
              <span className="text-indigo-400 truncate">{`https://libro-mcp-server.onrender.com/sse?apiKey=${apiKeys[0].key}&userId=${user.id}`}</span>
              <CopyButton text={`https://libro-mcp-server.onrender.com/sse?apiKey=${apiKeys[0].key}&userId=${user.id}`} />
            </div>
            <p className="text-xs text-gray-500 mt-2">Paste this URL into Claude Desktop, Cursor, Windsurf, or Antigravity to connect instantly.</p>
            
            <div className="mt-8">
              <MCPSetupWizard apiKey={apiKeys[0].key} userId={user.id} />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function QuickStart() {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Code2 className="w-5 h-5 text-gray-400" />
        <h2 className="text-xl font-bold tracking-tight text-white">Quick Start</h2>
      </div>
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-8">
        <p className="text-gray-400 font-medium text-sm mb-6">Install the SDK and give your AI app persistent memory in 3 lines.</p>
        
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">1. Install</p>
          <div className="bg-[#0a0a0a]/80 backdrop-blur-md p-4 rounded-xl border border-white/10 font-mono text-sm flex items-center justify-between gap-4">
            <span className="text-gray-300 font-medium">npm install @libro/sdk</span>
            <CopyButton text="npm install @libro/sdk" />
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">2. Initialize</p>
          <div className="bg-[#0a0a0a]/80 backdrop-blur-md p-4 rounded-xl border border-white/10 font-mono text-sm text-gray-300">
            <div className="text-gray-500">{"// Your API key is below ↓"}</div>
            <div><span className="text-indigo-400 font-semibold">const</span> libro = <span className="text-indigo-400 font-semibold">new</span> LibroClient({"{"}</div>
            <div className="pl-4">apiKey: <span className="text-emerald-400">'YOUR_KEY'</span>,</div>
            <div className="pl-4">baseUrl: <span className="text-emerald-400">'https://libro.co.in'</span></div>
            <div>{"});"}</div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">3. Use</p>
          <div className="bg-[#0a0a0a]/80 backdrop-blur-md p-4 rounded-xl border border-white/10 font-mono text-sm text-gray-300">
            <div className="text-gray-500">{"// Store a memory"}</div>
            <div><span className="text-indigo-400 font-semibold">await</span> libro.ingest({"{"} userId, text: <span className="text-emerald-400">'...'</span> {"}"});</div>
            <div className="mt-3 text-gray-500">{"// Retrieve context"}</div>
            <div><span className="text-indigo-400 font-semibold">const</span> ctx = <span className="text-indigo-400 font-semibold">await</span> libro.getContext({"{"} userId, query {"}"});</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ApiKeysSection({ apiKeys }: { apiKeys: any[] }) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Key className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-bold tracking-tight text-white">API Keys</h2>
        </div>
        <form action={generateApiKey} className="flex gap-2">
          <input 
            type="text" 
            name="name" 
            placeholder="Key Name (e.g. Production)" 
            defaultValue="Default Key"
            className="bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-all w-48" 
            required 
          />
          <button className="bg-white/10 text-white backdrop-blur-xl border border-white/20 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors shadow-lg whitespace-nowrap">
            + Create New Key
          </button>
        </form>
      </div>

      <div className="bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
        {apiKeys && apiKeys.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Key</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {apiKeys.map((key) => (
                <tr key={key.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-200 text-sm">
                    <div className="flex items-center gap-3">
                      <Key className="w-4 h-4 text-gray-500" />
                      {key.name || 'Default Key'}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">
                    <div className="flex items-center gap-2 bg-[#0a0a0a]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 inline-flex">
                      <span className="truncate max-w-[180px]">{key.key.substring(0, 20)}...</span>
                      <CopyButton text={key.key} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">
                    {new Date(key.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={deleteApiKey.bind(null, key.id)}>
                      <button className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/5">
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
            <div className="p-4 bg-white/5 rounded-full mb-4 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <Key className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No API keys yet</h3>
            <p className="text-gray-400 text-sm font-medium">Create your first API key to start using the Libro SDK.</p>
          </div>
        )}
      </div>
    </section>
  )
}
