'use client'

import { useState } from 'react'
import { searchMemories } from '@/app/dashboard/actions'
import { Brain, Search, Loader2 } from 'lucide-react'

type SearchResult = {
  id: string;
  content: string;
  metadata: any;
  similarity: number;
  created_at: string;
}

export default function VectorPlayground() {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    setHasSearched(true)
    try {
      const data = await searchMemories(query)
      setResults(data)
    } catch (error) {
      console.error('Search failed:', error)
      alert('Failed to search memories.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
          <Search className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Vector Search Playground</h2>
          <p className="text-sm text-slate-400">Test semantic retrieval against your stored memories.</p>
        </div>
      </div>

      <div className="bg-[#0f111a] border border-white/10 rounded-2xl p-6 shadow-xl">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Brain className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g., What is Lalit's favorite programming language?"
              className="block w-full pl-11 pr-4 py-3 bg-[#1a1d27] border border-white/5 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
          </button>
        </form>

        {hasSearched && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Retrieval Results</h3>
            {isSearching ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((result, idx) => (
                  <div key={result.id} className="p-4 rounded-xl border border-white/5 bg-white/5 flex gap-4 items-start">
                    <div className="flex flex-col items-center justify-center bg-[#1a1d27] rounded-lg px-3 py-2 min-w-[80px]">
                      <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">Score</span>
                      <span className="text-sm font-bold text-emerald-400">
                        {(result.similarity * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{result.content}</p>
                      {Object.keys(result.metadata || {}).length > 0 && (
                        <div className="mt-3 flex gap-2 flex-wrap">
                          {Object.entries(result.metadata).map(([k, v]) => (
                            <span key={k} className="px-2 py-1 bg-white/5 text-slate-400 text-xs rounded-md border border-white/10 font-mono">
                              {k}: {String(v)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-white/5 border-dashed">
                <p className="text-slate-400">No matching memories found for this query.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
