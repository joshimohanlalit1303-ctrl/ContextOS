import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { Plug2, CheckCircle2, ArrowRight } from 'lucide-react'

// Define the static integrations we want to generate
const integrations = {
  'cursor': {
    name: 'Cursor AI',
    description: 'Add persistent memory to your Cursor AI IDE workflows. Give Cursor the context it needs across all your chat sessions and projects.',
    icon: '⚡',
  },
  'claude-desktop': {
    name: 'Claude Desktop',
    description: 'Inject infinite memory into Claude Desktop. Allow Claude to remember your preferences, past coding patterns, and project rules.',
    icon: '🧠',
  },
  'chatgpt': {
    name: 'ChatGPT',
    description: 'Sync your local project context directly into ChatGPT. Stop copying and pasting system prompts and let Libro handle your context window.',
    icon: '💬',
  },
  'windsurf': {
    name: 'Windsurf',
    description: 'Enhance your Windsurf AI coding experience with semantic memory. Automatically pull in exact file contexts without manual hunting.',
    icon: '🏄',
  }
}

type Props = {
  params: Promise<{ slug: string }>
}

// Dynamically generate SEO metadata for each page!
export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const resolvedParams = await params
  const slug = resolvedParams.slug as keyof typeof integrations
  const data = integrations[slug]

  if (!data) return {}

  return {
    title: `Integrate ${data.name} with Libro Memory Engine`,
    description: data.description,
    keywords: [`${data.name} memory`, `${data.name} context`, 'AI agents', 'Libro integration', 'semantic search'],
  }
}

export default async function IntegrationPage({ params }: Props) {
  const resolvedParams = await params
  const slug = resolvedParams.slug as keyof typeof integrations
  const data = integrations[slug]

  if (!data) notFound()

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-24 selection:bg-white selection:text-black relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-white transition-colors mb-12">
          ← Back to home
        </Link>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-xl">
            {data.icon}
          </div>
          <Plug2 className="w-6 h-6 text-indigo-400 opacity-50" />
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xl">
            <span className="text-2xl font-bold tracking-tighter">L</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Connect <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{data.name}</span> to Libro
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
          {data.description} Stop starting from zero. Give your AI a brain.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
            <h3 className="text-xl font-bold mb-4">Why connect {data.name}?</h3>
            <ul className="space-y-4">
              {['Infinite Context Window', 'Zero Data Scraping', 'Cross-Project Memory', 'Instant Semantic Search'].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 p-8 rounded-3xl backdrop-blur-md flex flex-col justify-center items-start">
            <h3 className="text-xl font-bold mb-4 text-white">Ready to get started?</h3>
            <p className="text-indigo-200 mb-8 text-sm leading-relaxed">
              Create a free developer account to get your personalized MCP URL and API key.
            </p>
            <Link href="/login" className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors flex items-center gap-2 group">
              Get Your API Key
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
