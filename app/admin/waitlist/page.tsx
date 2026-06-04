"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { getWaitlist, grantWaitlistAccess } from "@/app/actions/waitlist";

type WaitlistEntry = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  useCase: string | null;
  grantedAccess: boolean;
  grantedAt: Date | null;
  createdAt: Date;
};

export default function AdminWaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    const res = await getWaitlist();
    if (res.success && res.data) {
      setEntries(res.data);
    }
    setIsLoading(false);
  }

  async function handleGrantAccess(id: string) {
    setIsProcessing(id);
    const res = await grantWaitlistAccess(id);
    if (res.success) {
      await fetchData();
    }
    setIsProcessing(null);
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen selection:bg-black selection:text-white relative">
      <Navbar />
      
      <main className="relative z-10 w-full max-w-6xl mx-auto pt-40 pb-24 px-6">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tighter text-black mb-2">Waitlist Admin</h1>
          <p className="text-gray-500 font-medium">Manage developer access to Libro</p>
        </div>

        <div className="glass bg-white/60 border border-gray-200/50 rounded-3xl shadow-xl backdrop-blur-xl overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500 font-medium">Loading waitlist entries...</div>
          ) : entries.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-medium">No waitlist entries found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200/50">
                    <th className="p-4 font-semibold text-xs tracking-wider text-gray-500 uppercase">User</th>
                    <th className="p-4 font-semibold text-xs tracking-wider text-gray-500 uppercase">Company</th>
                    <th className="p-4 font-semibold text-xs tracking-wider text-gray-500 uppercase">Use Case</th>
                    <th className="p-4 font-semibold text-xs tracking-wider text-gray-500 uppercase">Status</th>
                    <th className="p-4 font-semibold text-xs tracking-wider text-gray-500 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-white/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-black text-sm">{entry.name}</div>
                        <div className="text-xs text-gray-500">{entry.email}</div>
                        <div className="text-[10px] text-gray-400 mt-1">{new Date(entry.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-700 font-medium">{entry.company || "—"}</td>
                      <td className="p-4 text-xs text-gray-600 max-w-xs truncate" title={entry.useCase || ""}>
                        {entry.useCase || "—"}
                      </td>
                      <td className="p-4">
                        {entry.grantedAccess ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-700">
                            Access Granted
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-amber-100 text-amber-700">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {!entry.grantedAccess && (
                          <button
                            onClick={() => handleGrantAccess(entry.id)}
                            disabled={isProcessing === entry.id}
                            className="px-4 py-1.5 bg-black text-white text-xs font-semibold rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
                          >
                            {isProcessing === entry.id ? "Processing..." : "Grant Access"}
                          </button>
                        )}
                        {entry.grantedAccess && (
                          <span className="text-xs text-gray-400">
                            Granted {entry.grantedAt ? new Date(entry.grantedAt).toLocaleDateString() : ""}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Decorative background blur */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
