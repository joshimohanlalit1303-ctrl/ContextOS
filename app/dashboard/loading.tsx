import { Skeleton } from "@/components/ui/skeleton";
import { Database, Key, Zap, Brain, Plug2, Clock, Map } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 pt-28 md:p-12 md:pt-32 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Skeleton */}
        <header className="flex items-center justify-between mb-16 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Developer Dashboard</h1>
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-20" />
          </div>
        </header>

        {/* Stats Row Skeleton */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 backdrop-blur-md shadow-lg rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                <Database className="w-5 h-5 text-indigo-400 opacity-50" />
              </div>
              <h2 className="text-lg font-semibold text-gray-200">Memory Usage</h2>
            </div>
            <Skeleton className="h-10 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md shadow-lg rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                <Key className="w-5 h-5 text-indigo-400 opacity-50" />
              </div>
              <h2 className="text-lg font-semibold text-gray-200">API Keys</h2>
            </div>
            <Skeleton className="h-10 w-16 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md shadow-lg rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                <Zap className="w-5 h-5 text-indigo-400 opacity-50" />
              </div>
              <h2 className="text-lg font-semibold text-gray-200">Engine Status</h2>
            </div>
            <Skeleton className="h-10 w-20 mb-2" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>

        {/* Connect CTA Skeleton */}
        <div className="block mb-12 group">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Plug2 className="w-5 h-5 text-indigo-400 opacity-50" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-64 mb-3" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="w-14 h-14 rounded-2xl" />
          </div>
        </div>
        
        {/* Passports Skeleton */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Map className="w-5 h-5 text-indigo-400 opacity-50" />
            <h2 className="text-xl font-bold tracking-tight text-white">Context Passports</h2>
          </div>
          <div className="bg-white/5 border border-indigo-500/20 backdrop-blur-md shadow-lg rounded-3xl overflow-hidden p-6">
             <Skeleton className="h-12 w-full mb-4" />
             <Skeleton className="h-12 w-full mb-4" />
             <Skeleton className="h-12 w-full" />
          </div>
        </section>

        {/* Hive Mind Constellation Skeleton */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-5 h-5 text-indigo-400 opacity-50" />
            <h2 className="text-xl font-bold tracking-tight text-white">Hive Mind Constellation</h2>
          </div>
          <Skeleton className="w-full h-[500px] rounded-3xl" />
        </section>
        
        {/* Memories Skeleton */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-gray-400 opacity-50" />
            <h2 className="text-xl font-bold tracking-tight text-white">API Embeddings (Memories)</h2>
          </div>
          <div className="bg-white/5 border border-white/10 backdrop-blur-md shadow-lg rounded-3xl overflow-hidden p-6">
             <Skeleton className="h-12 w-full mb-4" />
             <Skeleton className="h-12 w-full mb-4" />
             <Skeleton className="h-12 w-full" />
          </div>
        </section>

      </div>
    </div>
  );
}
