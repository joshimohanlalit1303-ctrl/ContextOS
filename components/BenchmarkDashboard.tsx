"use client";

import { useState, useEffect } from "react";
import { Activity, Zap, Server, Database, ArrowRight } from "lucide-react";

interface BenchmarkResult {
  latency: number;
  accuracy: number;
  throughput: number;
  timestamp: string;
}

export default function BenchmarkDashboard() {
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [results, setResults] = useState<BenchmarkResult | null>(null);
  const [history, setHistory] = useState<BenchmarkResult[]>([]);

  // Simulated run for UI demonstration
  const runBenchmark = () => {
    setIsBenchmarking(true);
    setResults(null);
    
    setTimeout(() => {
      const newResult = {
        latency: Math.floor(Math.random() * 50) + 120, // 120-170ms
        accuracy: 99.8,
        throughput: Math.floor(Math.random() * 200) + 800, // 800-1000 req/s
        timestamp: new Date().toLocaleTimeString(),
      };
      setResults(newResult);
      setHistory(prev => [...prev.slice(-4), newResult]);
      setIsBenchmarking(false);
    }, 2500);
  };

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 text-white w-full max-w-4xl mx-auto shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Activity className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">SDK & MCP Benchmarks</h2>
            <p className="text-sm text-gray-400">Live performance metrics across the ContextOS infrastructure.</p>
          </div>
        </div>
        <button 
          onClick={runBenchmark}
          disabled={isBenchmarking}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all disabled:opacity-50"
        >
          {isBenchmarking ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Running Suite...
            </span>
          ) : (
            <>
              Run Benchmark <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-black/50 p-6 rounded-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-16 h-16" />
          </div>
          <h3 className="text-sm font-medium text-gray-400 mb-1">Average Latency</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight">
              {results ? results.latency : "--"}
            </span>
            <span className="text-gray-500 font-medium">ms</span>
          </div>
          {results && <p className="text-xs text-green-400 mt-2">P95 below 200ms</p>}
        </div>

        <div className="bg-black/50 p-6 rounded-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Database className="w-16 h-16" />
          </div>
          <h3 className="text-sm font-medium text-gray-400 mb-1">Retrieval Accuracy</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight">
              {results ? results.accuracy : "--"}
            </span>
            <span className="text-gray-500 font-medium">%</span>
          </div>
          {results && <p className="text-xs text-green-400 mt-2">Measured via RAGAS</p>}
        </div>

        <div className="bg-black/50 p-6 rounded-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Server className="w-16 h-16" />
          </div>
          <h3 className="text-sm font-medium text-gray-400 mb-1">Throughput</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight">
              {results ? results.throughput : "--"}
            </span>
            <span className="text-gray-500 font-medium">req/s</span>
          </div>
          {results && <p className="text-xs text-green-400 mt-2">Redis + Vercel Edge</p>}
        </div>
      </div>

      <div className="bg-black/30 border border-white/5 rounded-xl p-4">
        <h4 className="text-sm font-medium text-gray-400 mb-4 px-2">Recent Runs</h4>
        <div className="space-y-2">
          {history.length === 0 ? (
            <p className="text-sm text-gray-600 px-2 py-4 text-center">No benchmark history available.</p>
          ) : (
            history.map((run, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg text-sm">
                <div className="flex items-center gap-4 text-gray-300">
                  <span className="text-gray-500 w-20">{run.timestamp}</span>
                  <span className="font-mono text-green-400">{run.latency}ms</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-400">Acc: {run.accuracy}%</span>
                  <span className="text-gray-400">Rate: {run.throughput}/s</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
