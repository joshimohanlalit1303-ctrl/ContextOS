import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut as logout } from '../login/actions'
import { generateApiKey, deleteApiKey } from './actions'
import { Key, Trash2, LogOut, Database, Code2 } from 'lucide-react'
import Link from 'next/link'
import { CopyButton } from '@/components/CopyButton'

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

      </div>
    </div>
  )
}
