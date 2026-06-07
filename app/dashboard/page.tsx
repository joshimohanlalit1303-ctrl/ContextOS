import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut as logout } from '../login/actions'
import { generateApiKey, deleteApiKey } from './actions'
import { Key, Trash2, LogOut, Database, Code2, Zap, BookOpen, Brain, Globe, Plug2 } from 'lucide-react'
import Link from 'next/link'
import { CopyButton } from '@/components/CopyButton'
import MCPSetupWizard from '@/components/MCPSetupWizard'
import BenchmarkDashboard from '@/components/BenchmarkDashboard'
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch data in parallel for speed and health check
  const [
    { data: apiKeys, error: apiKeysError },
    { count: memoryCount, error: memoryError }
  ] = await Promise.all([
    supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('memories')
      .select('*', { count: 'exact', head: true })
  ]);

  // Determine engine health
  const isEngineLive = !apiKeysError && !memoryError;
  const keyCount = apiKeys?.length || 0;

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-black p-8 pt-28 md:p-12 md:pt-32 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-16 border-b border-gray-200 pb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Developer Dashboard</h1>
            <p className="text-gray-500 text-sm font-medium">{user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
              Home
            </Link>
            <form action={logout}>
              <button className="flex items-center text-sm font-medium text-gray-500 hover:text-red-500 transition-colors">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </form>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-gray-200/60 shadow-sm rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                <Database className="w-5 h-5 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Memory Usage</h2>
            </div>
            <div className="text-4xl font-bold tracking-tight text-gray-900 mb-1">{memoryCount || 0}</div>
            <p className="text-sm font-medium text-gray-500">Embeddings stored</p>
          </div>

          <div className="bg-white border border-gray-200/60 shadow-sm rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                <Key className="w-5 h-5 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">API Keys</h2>
            </div>
            <div className="text-4xl font-bold tracking-tight text-gray-900 mb-1">{keyCount}</div>
            <p className="text-sm font-medium text-gray-500">Active keys</p>
          </div>

          <div className="bg-white border border-gray-200/60 shadow-sm rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                <Zap className="w-5 h-5 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Engine Status</h2>
            </div>
            <div className={`text-4xl font-bold tracking-tight mb-1 ${isEngineLive ? 'text-emerald-500' : 'text-red-500'}`}>
              {isEngineLive ? 'Live' : 'Degraded'}
            </div>
            <p className="text-sm font-medium text-gray-500">
              {isEngineLive ? 'All systems operational' : 'Database connection issues'}
            </p>
          </div>
        </div>

        {/* Connect CTA — primary action */}
        <Link href="/dashboard/connect" className="block mb-12 group">
          <div className="bg-black rounded-3xl p-8 flex items-center justify-between hover:bg-gray-900 transition-colors cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Plug2 className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Quick Setup</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Connect an AI Agent →</h2>
              <p className="text-gray-400 font-medium text-sm">Get ready-to-paste configs for Claude, Cursor, Windsurf, Antigravity, ChatGPT & more.</p>
            </div>
            <div className="relative z-10 shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl">🔌</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Hive Identity */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-bold tracking-tight text-gray-900">Your Hive Identity</h2>
          </div>
          <div className="bg-white border border-gray-200/60 shadow-sm rounded-3xl p-8 space-y-6">
            <p className="text-gray-500 font-medium text-sm">Use these credentials to connect any AI agent to your personal Hive Mind.</p>

            {/* User ID */}
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Your User ID (Hive Name)</p>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 font-mono text-sm flex items-center justify-between gap-4">
                <span className="text-gray-800 truncate">{user.id}</span>
                <CopyButton text={user.id} />
              </div>
              <p className="text-xs text-gray-400 mt-2">This is your unique identifier — it labels your personal memory bucket.</p>
            </div>

            {/* MCP Connection URL */}
            {apiKeys && apiKeys.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Ready-to-Use MCP Server URL</p>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 font-mono text-xs flex items-center justify-between gap-4">
                  <span className="text-emerald-700 truncate">{`https://libro-mcp-server.onrender.com/sse?apiKey=${apiKeys[0].key}&userId=${user.id}`}</span>
                  <CopyButton text={`https://libro-mcp-server.onrender.com/sse?apiKey=${apiKeys[0].key}&userId=${user.id}`} />
                </div>
                <p className="text-xs text-gray-400 mt-2">Paste this URL into Claude Desktop, Cursor, Windsurf, or Antigravity to connect instantly.</p>
                
                <div className="mt-8">
                  <MCPSetupWizard apiKey={apiKeys[0].key} userId={user.id} />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Benchmarks */}
        <section className="mb-12">
          <BenchmarkDashboard />
        </section>

        {/* Quick Start */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Code2 className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-bold tracking-tight text-gray-900">Quick Start</h2>
          </div>
          <div className="bg-white border border-gray-200/60 shadow-sm rounded-3xl p-8">
            <p className="text-gray-500 font-medium text-sm mb-6">Install the SDK and give your AI app persistent memory in 3 lines.</p>
            
            {/* Install */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">1. Install</p>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 font-mono text-sm flex items-center justify-between gap-4">
                <span className="text-gray-800 font-medium">npm install libro-sdk</span>
                <CopyButton text="npm install libro-sdk" />
              </div>
            </div>

            {/* Usage */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">2. Initialize</p>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 font-mono text-sm text-gray-700">
                <div className="text-gray-400">{"// Your API key is below ↓"}</div>
                <div><span className="text-purple-600 font-semibold">const</span> libro = <span className="text-purple-600 font-semibold">new</span> LibroClient({"{"}</div>
                <div className="pl-4">apiKey: <span className="text-emerald-600">'YOUR_KEY'</span>,</div>
                <div className="pl-4">baseUrl: <span className="text-emerald-600">'https://libro.co.in'</span></div>
                <div>{"});"}</div>
              </div>
            </div>

            {/* Use */}
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">3. Use</p>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 font-mono text-sm text-gray-700">
                <div className="text-gray-400">{"// Store a memory"}</div>
                <div><span className="text-purple-600 font-semibold">await</span> libro.ingest({"{"} userId, text: <span className="text-emerald-600">'...'</span> {"}"});</div>
                <div className="mt-3 text-gray-400">{"// Retrieve context"}</div>
                <div><span className="text-purple-600 font-semibold">const</span> ctx = <span className="text-purple-600 font-semibold">await</span> libro.getContext({"{"} userId, query {"}"});</div>
              </div>
            </div>
          </div>
        </section>

        {/* API Keys */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-bold tracking-tight text-gray-900">API Keys</h2>
            </div>
            <form action={generateApiKey}>
              <button className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm">
                + Create New Key
              </button>
            </form>
          </div>

          <div className="bg-white border border-gray-200/60 shadow-sm rounded-3xl overflow-hidden">
            {apiKeys && apiKeys.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Key</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {apiKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900 text-sm">
                        <div className="flex items-center gap-3">
                          <Key className="w-4 h-4 text-gray-400" />
                          Default Key
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-600">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 inline-flex">
                          <span className="truncate max-w-[180px]">{key.key.substring(0, 20)}...</span>
                          <CopyButton text={key.key} />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">
                        {new Date(key.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <form action={deleteApiKey.bind(null, key.id)}>
                          <button className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50">
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
                <div className="p-4 bg-gray-50 rounded-full mb-4">
                  <Key className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No API keys yet</h3>
                <p className="text-gray-500 text-sm font-medium">Create your first API key to start using the Libro SDK.</p>
              </div>
            )}
          </div>
        </section>

        {/* Docs link */}
        <section>
          <div className="bg-white border border-gray-200/60 shadow-sm rounded-3xl p-8 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl">
                <BookOpen className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Documentation</h3>
                <p className="text-sm font-medium text-gray-500">Full SDK reference, examples, and guides.</p>
              </div>
            </div>
            <Link href="/docs" className="text-sm font-semibold text-black border border-gray-200 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              View Docs →
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
