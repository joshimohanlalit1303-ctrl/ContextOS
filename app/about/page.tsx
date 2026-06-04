"use client";

import React from "react";
import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <div className="bg-[#f8fafc] min-h-screen selection:bg-black selection:text-white relative">
      <Navbar />
      
      <main className="relative z-10 w-full max-w-4xl mx-auto pt-40 pb-24 px-6">
        <div className="glass bg-white/60 border border-gray-200/50 rounded-3xl p-10 md:p-16 shadow-2xl backdrop-blur-xl">
          <div className="inline-block px-4 py-1.5 rounded-full bg-black text-white text-xs font-bold tracking-widest uppercase mb-8">
            About Us
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-black mb-8 leading-tight">
            Building the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">memory engine</span> for the next generation of AI.
          </h1>
          
          <div className="space-y-6 text-gray-600 text-lg md:text-xl font-medium leading-relaxed">
            <p>
              AI models have fundamentally changed how we interact with technology. But while models have grown increasingly capable, their ability to remember context across sessions has remained fragile, expensive, and difficult to scale.
            </p>
            <p>
              Libro was born out of frustration with existing vector databases and RAG pipelines. We realized that developers shouldn't have to string together embedding APIs, Pinecone clusters, and complex chunking algorithms just to make an AI remember a user's name.
            </p>
            <p>
              We've built an edge-native memory infrastructure that abstracts away the complexity. By bringing semantic vectorization to the edge and automating the chunking process, we allow developers to add infinite memory to their AI agents with a single line of code.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-200 pt-16">
            <div>
              <h3 className="text-2xl font-bold text-black mb-4">Our Mission</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                To provide the fundamental contextual layer that allows artificial intelligence to build long-term, meaningful relationships with users.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-black mb-4">Our Backers</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                We are backed by leading venture firms and visionary angels who believe in an AI-first future where memory is infrastructure, not an afterthought.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Decorative background blurs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
