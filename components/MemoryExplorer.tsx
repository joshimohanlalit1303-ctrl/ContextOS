'use client'

import React, { useState, useTransition } from 'react'
import { Brain, Trash2, Edit2, Check, X, Loader2 } from 'lucide-react'
import { deleteMemory, updateMemory } from '@/app/dashboard/actions'

export default function MemoryExplorer({ initialMemories }: { initialMemories: any[] }) {
  const [memories, setMemories] = useState(initialMemories)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this memory? This cannot be undone.')) return
    
    startTransition(async () => {
      try {
        await deleteMemory(id)
        setMemories(prev => prev.filter(m => m.id !== id))
      } catch (err) {
        console.error('Failed to delete memory', err)
        alert('Failed to delete memory')
      }
    })
  }

  const startEditing = (id: string, content: string) => {
    setEditingId(id)
    setEditContent(content)
  }

  const saveEdit = (id: string) => {
    startTransition(async () => {
      try {
        await updateMemory(id, editContent)
        setMemories(prev => prev.map(m => m.id === id ? { ...m, content: editContent } : m))
        setEditingId(null)
      } catch (err) {
        console.error('Failed to update memory', err)
        alert('Failed to update memory')
      }
    })
  }

  if (memories.length === 0) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold tracking-tight text-white">Memory Explorer</h2>
          </div>
        </div>

        <div className="bg-white/5 border border-indigo-500/20 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
          <div className="p-12 text-center flex flex-col items-center">
            <div className="p-4 bg-white/5 rounded-full mb-4 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <Brain className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No memories yet</h3>
            <p className="text-gray-400 text-sm font-medium">Connect an agent and start sending context to see it appear here.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-5 h-5 text-indigo-400" />
        <h2 className="text-xl font-bold tracking-tight text-white">Memory Explorer</h2>
      </div>

      <div className="bg-white/5 border border-indigo-500/20 backdrop-blur-xl shadow-[0_0_30px_-5px_rgba(99,102,241,0.15)] rounded-3xl overflow-hidden relative">
        {isPending && (
          <div className="absolute top-4 right-4 flex items-center gap-2 text-indigo-400 text-sm font-medium bg-indigo-500/10 px-3 py-1.5 rounded-full">
            <Loader2 className="w-4 h-4 animate-spin" />
            Updating...
          </div>
        )}
        <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto custom-scrollbar">
          {memories.map((memory) => (
            <div key={memory.id} className="p-6 hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                      {new Date(memory.createdAt).toLocaleString()}
                    </span>
                    {memory.metadata?.source && (
                      <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
                        {memory.metadata.source}
                      </span>
                    )}
                  </div>
                  
                  {editingId === memory.id ? (
                    <div className="mt-3 relative">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full h-32 bg-black/50 border border-indigo-500/30 rounded-xl p-4 text-sm text-gray-300 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 font-mono resize-none"
                      />
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => saveEdit(memory.id)}
                          disabled={isPending}
                          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" /> Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          disabled={isPending}
                          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-sans mt-2">
                      {memory.content}
                    </div>
                  )}
                </div>

                {editingId !== memory.id && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-8">
                    <button
                      onClick={() => startEditing(memory.id, memory.content)}
                      className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                      title="Edit memory"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(memory.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete memory"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
