"use client";

import React from "react";
import Navbar from "@/components/Navbar";

export default function SecurityPage() {
  return (
    <div className="bg-[#f8fafc] min-h-screen selection:bg-black selection:text-white relative">
      <Navbar />
      
      <main className="relative z-10 w-full max-w-4xl mx-auto pt-40 pb-24 px-6">
        <div className="glass bg-white/60 border border-gray-200/50 rounded-3xl p-10 md:p-16 shadow-2xl backdrop-blur-xl">
          <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold tracking-widest uppercase mb-8">
            Trust & Security
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-black mb-8 leading-tight">
            Built for enterprise-grade <br/>
            <span className="text-emerald-500">privacy and compliance.</span>
          </h1>
          
          <div className="space-y-8 text-gray-600 text-lg font-medium leading-relaxed">
            <p>
              Libro handles the most sensitive conversational data for AI applications. We do not take this responsibility lightly. Our infrastructure is designed from the ground up to guarantee data isolation, encryption, and strict privacy controls.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
              <div className="bg-white/50 p-6 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-black mb-2">Encryption At Rest & Transit</h3>
                <p className="text-gray-500 text-base">All memory vectors and metadata are encrypted at rest using AES-256 and in transit using TLS 1.3.</p>
              </div>

              <div className="bg-white/50 p-6 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-black mb-2">SOC2 Type II Compliant</h3>
                <p className="text-gray-500 text-base">Our internal processes, access controls, and infrastructure are independently audited for SOC2 compliance.</p>
              </div>

              <div className="bg-white/50 p-6 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-black mb-2">Zero Training Policy</h3>
                <p className="text-gray-500 text-base">We never use your API payloads to train foundational models. Your users' data remains exclusively your property.</p>
              </div>

              <div className="bg-white/50 p-6 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-black mb-2">GDPR Data Deletion</h3>
                <p className="text-gray-500 text-base">We provide hard-delete API endpoints for instantaneous removal of user memory across all edge replicas.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
