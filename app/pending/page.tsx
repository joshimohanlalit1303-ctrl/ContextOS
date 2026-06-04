import React from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PendingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen selection:bg-black selection:text-white relative flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center relative z-10 w-full max-w-2xl mx-auto px-6 mt-16">
        <div className="glass bg-white/60 border border-amber-200/50 rounded-3xl p-10 shadow-xl backdrop-blur-xl text-center w-full">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-black mb-4">You're on the waitlist!</h1>
          <p className="text-gray-500 font-medium mb-8">
            You successfully logged in as <strong className="text-black">{user.email}</strong>, but your account is still pending admin approval. 
            We will email you as soon as you have been granted access to the Libro dashboard.
          </p>
          
          <form action="/login" method="POST">
             <button formAction={async () => {
                "use server";
                const supabase = await createClient();
                await supabase.auth.signOut();
                redirect("/");
             }} className="px-6 py-3 bg-black text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
               Sign Out
             </button>
          </form>
        </div>
      </main>

      {/* Decorative background blur */}
      <div className="fixed top-[20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
