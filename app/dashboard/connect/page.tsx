import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ensureApiKey } from '../actions'
import { CopyButton } from '@/components/CopyButton'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const MCP_SERVER_URL = 'https://libro-mcp-server.onrender.com'

const tools = [
  {
    id: 'claude-desktop',
    name: 'Claude Desktop',
    icon: '🤖',
    description: 'Anthropic\'s desktop app',
    getConfig: (url: string) => JSON.stringify({
      mcpServers: {
        libro: {
          type: "sse",
          url
        }
      }
    }, null, 2),
    instruction: 'Create or edit your config file. Run this command to open it:',
    commands: [
      { os: 'Mac', cmd: 'nano ~/Library/Application\\ Support/Claude/claude_desktop_config.json' },
      { os: 'Windows (Command Prompt)', cmd: 'notepad %APPDATA%\\Claude\\claude_desktop_config.json' }
    ],
    step: 'Then paste the config below and restart Claude Desktop. You\'ll see a 🔌 icon when connected.',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    icon: '⚡',
    description: 'AI-first code editor',
    getConfig: (url: string) => JSON.stringify({
      mcpServers: {
        libro: {
          type: "sse",
          url
        }
      }
    }, null, 2),
    instruction: 'Open Cursor → Settings → MCP → Add Server and paste:',
    filePath: null,
    step: 'Restart Cursor after saving.',
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    icon: '🏄',
    description: 'Codeium\'s AI IDE',
    getConfig: (url: string) => JSON.stringify({
      mcpServers: {
        libro: {
          type: "sse",
          url
        }
      }
    }, null, 2),
    instruction: 'Open Windsurf → Settings → MCP Servers and paste:',
    filePath: null,
    step: 'Restart Windsurf after saving.',
  },
  {
    id: 'antigravity',
    name: 'Antigravity IDE',
    icon: '🪐',
    description: 'Google DeepMind\'s AI coding tool',
    getConfig: (url: string) => JSON.stringify({
      mcpServers: {
        libro: {
          type: "sse",
          url
        }
      }
    }, null, 2),
    instruction: 'Add to your Antigravity MCP config:',
    filePath: '~/.gemini/config/mcp_servers.json',
    step: 'Reload Antigravity after saving.',
  },
  {
    id: 'claude-code',
    name: 'Claude Code (CLI)',
    icon: '🖥️',
    description: 'Terminal-based Claude agent',
    getConfig: (url: string) => `claude mcp add libro --type sse "${url}"`,
    instruction: 'Run this command in your terminal:',
    filePath: null,
    step: 'Done! All future Claude Code sessions now have Hive Mind access.',
  },
  {
    id: 'python',
    name: 'Python SDK',
    icon: '🐍',
    description: 'Direct Python integration',
    getConfig: (url: string) => {
      const params = new URL(url)
      const apiKey = params.searchParams.get('apiKey') || 'YOUR_API_KEY'
      const userId = params.searchParams.get('userId') || 'YOUR_USER_ID'
      return `pip install libro-sdk

from libro import LibroClient

client = LibroClient(api_key="${apiKey}")

# Save a memory
client.ingest(user_id="${userId}", text="We use TypeScript and Next.js.")

# Retrieve context
result = client.get_context(user_id="${userId}", query="What stack are we using?")
print(result.context)`
    },
    instruction: 'Install and use the Python SDK:',
    filePath: null,
    step: 'Works in any Python agent or script.',
  },
  {
    id: 'nodejs',
    name: 'Node.js / TypeScript',
    icon: '🟨',
    description: 'Direct JS/TS integration',
    getConfig: (url: string) => {
      const params = new URL(url)
      const apiKey = params.searchParams.get('apiKey') || 'YOUR_API_KEY'
      const userId = params.searchParams.get('userId') || 'YOUR_USER_ID'
      return `npm install libro-sdk

import { LibroClient } from 'libro-sdk';

const libro = new LibroClient({ apiKey: '${apiKey}' });

// Save a memory
await libro.ingest({ userId: '${userId}', text: 'We use TypeScript and Next.js.' });

// Retrieve context
const result = await libro.getContext({ userId: '${userId}', query: 'What stack?' });
console.log(result.context);`
    },
    instruction: 'Install and use the Node.js SDK:',
    filePath: null,
    step: 'Works in any Node.js agent, backend, or script.',
  },
]

export default async function ConnectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Auto-provision API key if user doesn't have one
  const apiKey = await ensureApiKey()
  const userId = user.id
  const mcpUrl = `${MCP_SERVER_URL}/sse?apiKey=${apiKey}&userId=${userId}`

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-black p-8 pt-28 md:p-12 md:pt-32">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Connect Your AI Agent</h1>
          <p className="text-gray-500 font-medium">One Hive Mind URL — works with every major AI tool. Pick your tool and paste the config.</p>
        </div>

        {/* Your Hive URL — the hero section */}
        <div className="bg-black rounded-3xl p-8 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Your Hive Mind MCP URL</p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4 mb-4">
              <span className="text-emerald-400 font-mono text-sm break-all">{mcpUrl}</span>
              <div className="shrink-0">
                <CopyButton text={mcpUrl} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Your Hive ID (userId)</p>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono text-xs truncate">{userId}</span>
                  <CopyButton text={userId} />
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">API Key</p>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono text-xs">{apiKey.substring(0, 18)}...</span>
                  <CopyButton text={apiKey} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tool grid */}
        <h2 className="text-xl font-bold text-gray-900 mb-6">Choose your AI tool</h2>
        <div className="grid gap-6">
          {tools.map((tool) => {
            const config = tool.getConfig(mcpUrl)
            return (
              <div key={tool.id} className="bg-white border border-gray-200/60 shadow-sm rounded-3xl p-8">
                <div className="flex items-start gap-4 mb-6">
                  <span className="text-3xl">{tool.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{tool.name}</h3>
                    <p className="text-gray-500 text-sm font-medium">{tool.description}</p>
                  </div>
                </div>

                {tool.commands && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{tool.instruction}</p>
                    <div className="flex flex-col gap-3">
                      {tool.commands.map((c: any, i: number) => (
                        <div key={i} className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{c.os}</span>
                          <div className="relative">
                            <div className="bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 font-mono text-xs text-gray-600 pr-12 overflow-x-auto whitespace-nowrap">
                              {c.cmd}
                            </div>
                            <div className="absolute right-2 top-1.5">
                              <CopyButton text={c.cmd} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tool.filePath && !tool.commands && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{tool.instruction}</p>
                    <div className="relative">
                      <div className="bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 font-mono text-xs text-gray-600">
                        {tool.filePath}
                      </div>
                      <div className="absolute right-2 top-1.5">
                        <CopyButton text={tool.filePath} />
                      </div>
                    </div>
                  </div>
                )}
                
                {!tool.filePath && !tool.commands && (
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{tool.instruction}</p>
                )}

                <div className="relative">
                  <pre className="bg-gray-950 text-gray-100 rounded-2xl p-5 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                    {config}
                  </pre>
                  <div className="absolute top-3 right-3">
                    <CopyButton text={config} />
                  </div>
                </div>

                <p className="mt-4 text-sm text-gray-500 font-medium flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {tool.step}
                </p>
              </div>
            )
          })}
        </div>

        {/* Test section */}
        <div className="mt-10 bg-blue-50 border border-blue-100 rounded-3xl p-8">
          <h3 className="font-bold text-blue-900 text-lg mb-2">🧪 Test your connection</h3>
          <p className="text-blue-700 text-sm font-medium mb-4">Once connected, ask your AI agent:</p>
          <div className="space-y-3">
            {[
              'Use libro_ingest to remember that our stack is Next.js with TypeScript.',
              'Use libro_get_context to recall what we know about our tech stack.',
              'Use libro_forget to delete any outdated memories about our stack.',
            ].map((prompt) => (
              <div key={prompt} className="bg-white/60 rounded-xl px-4 py-3 flex items-center justify-between gap-4 border border-blue-100">
                <span className="text-blue-800 text-sm font-mono italic">&quot;{prompt}&quot;</span>
                <CopyButton text={prompt} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
