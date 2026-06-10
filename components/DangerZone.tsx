'use client'

import { useState } from 'react'
import { deleteAllMemories } from '@/app/dashboard/actions'
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react'

export default function DangerZone() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDeleteAll = async () => {
    setIsDeleting(true)
    try {
      await deleteAllMemories()
      setShowConfirm(false)
      alert('All memories have been permanently wiped.')
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete memories.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="mt-24 mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-red-500">Danger Zone</h2>
          <p className="text-sm text-red-400/80">Irreversible destructive actions.</p>
        </div>
      </div>

      <div className="bg-red-950/20 border border-red-500/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Wipe All Memories</h3>
            <p className="text-sm text-slate-400 max-w-md">
              Permanently delete all ingested embeddings, text chunks, and metadata from the database. 
              This action cannot be undone and will immediately break any agents relying on this context.
            </p>
          </div>
          
          <div className="shrink-0">
            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 hover:text-red-400 font-semibold rounded-xl transition-all flex items-center gap-2 shadow-sm shadow-red-500/10"
              >
                <Trash2 className="w-5 h-5" />
                Delete All Memories
              </button>
            ) : (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAll}
                  disabled={isDeleting}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-red-600/20"
                >
                  {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Yes, wipe everything'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
