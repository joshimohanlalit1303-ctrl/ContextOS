import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut as logout } from '../login/actions'
import { generateApiKey, deleteApiKey } from './actions'
import { Key, Trash2, LogOut, Database, Code2, Zap, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { CopyButton } from '@/components/CopyButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch API keys
  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch memory count
  const { count: memoryCount } = await supabase
    .from('memories')
    .select('*', { count: 'exact', head: true })

  // Fetch API key count
  const keyCount = apiKeys?.length || 0

  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-12 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
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

        {/* Stats Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-xl">
                <Database className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-medium">Memory Usage</h2>
            </div>
            <div className="text-4xl font-light mb-1">{memoryCount || 0}</div>
            <p className="text-sm text-neutral-400">Embeddings stored</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-xl">
                <Key className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-medium">API Keys</h2>
            </div>
            <div className="text-4xl font-light mb-1">{keyCount}</div>
            <p className="text-sm text-neutral-400">Active keys</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-xl">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-medium">Engine Status</h2>
            </div>
            <div className="text-4xl font-light mb-1 text-green-400">Live</div>
            <p className="text-sm text-neutral-400">All systems operational</p>
          </div>
        </div>

        {/* Quick Start */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Code2 className="w-5 h-5 text-neutral-400" />
            <h2 className="text-xl font-medium">Quick Start</h2>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <p className="text-neutral-400 text-sm mb-6">Install the SDK and give your AI app persistent memory in 3 lines.</p>
            
            {/* Install */}
            <div className="mb-4">
              <p className="text-xs text-neutral-500 mb-2 font-mono">1. Install</p>
              <div className="bg-black/60 p-4 rounded-xl border border-white/10 font-mono text-sm flex items-center justify-between gap-4">
                <span>npm install libro-sdk</span>
                <CopyButton text="npm install libro-sdk" />
              </div>
            </div>

            {/* Usage */}
            <div className="mb-4">
              <p className="text-xs text-neutral-500 mb-2 font-mono">2. Initialize</p>
              <div className="bg-black/60 p-4 rounded-xl border border-white/10 font-mono text-sm text-neutral-300">
                <div className="text-neutral-500">{"// Your API key is below ↓"}</div>
                <div>{"const libro = new LibroClient({"}</div>
                <div className="pl-4">{"apiKey: 'YOUR_KEY',"}</div>
                <div className="pl-4">{"baseUrl: 'https://libro.co.in'"}</div>
                <div>{"});"}</div>
              </div>
            </div>

            {/* Use */}
            <div>
              <p className="text-xs text-neutral-500 mb-2 font-mono">3. Use</p>
              <div className="bg-black/60 p-4 rounded-xl border border-white/10 font-mono text-sm text-neutral-300">
                <div className="text-green-400">{"// Store a memory"}</div>
                <div>{"await libro.ingest({ userId, text: '...' });"}</div>
                <div className="mt-2 text-green-400">{"// Retrieve context"}</div>
                <div>{"const ctx = await libro.getContext({ userId, query });"}</div>
              </div>
            </div>
          </div>
        </section>

        {/* API Keys */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-neutral-400" />
              <h2 className="text-xl font-medium">API Keys</h2>
            </div>
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
                    <th className="px-6 py-4 font-normal">Name</th>
                    <th className="px-6 py-4 font-normal">Key</th>
                    <th className="px-6 py-4 font-normal">Created</th>
                    <th className="px-6 py-4 text-right font-normal">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {apiKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium">
                        <div className="flex items-center gap-3">
                          <Key className="w-4 h-4 text-neutral-500" />
                          Default Key
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[180px] inline-block">{key.key.substring(0, 20)}...</span>
                          <CopyButton text={key.key} />
                        </div>
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
                <h3 className="text-lg font-medium mb-2">No API keys yet</h3>
                <p className="text-neutral-400 text-sm">Create your first API key to start using the Libro SDK.</p>
              </div>
            )}
          </div>
        </section>

        {/* Docs link */}
        <section>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Documentation</h3>
                <p className="text-sm text-neutral-400">Full SDK reference, examples, and guides.</p>
              </div>
            </div>
            <Link href="/docs" className="text-sm text-white border border-white/20 px-4 py-2 rounded-xl hover:bg-white/10 transition-colors">
              View Docs →
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
