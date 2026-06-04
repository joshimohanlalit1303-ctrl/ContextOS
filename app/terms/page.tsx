import React from "react";
import Navbar from "@/components/Navbar";

export default function TermsOfService() {
  return (
    <div className="bg-[#f8fafc] min-h-screen selection:bg-black selection:text-white relative">
      <Navbar />
      
      <main className="relative z-10 w-full max-w-4xl mx-auto pt-40 pb-24 px-6">
        <div className="glass bg-white/60 border border-gray-200/50 rounded-3xl p-10 md:p-16 shadow-2xl backdrop-blur-xl prose prose-slate max-w-none prose-headings:text-black prose-p:text-gray-600 prose-a:text-indigo-600 prose-strong:text-black">
          <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold tracking-widest uppercase mb-4 not-prose">
            Legal
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-black mb-2 mt-0">Terms of Service</h1>
          <p className="text-gray-400 font-medium mb-12 not-prose">Last Updated: October 2026</p>

          <section className="mb-12">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Libro API, SDKs, or dashboard (collectively, the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2>2. Description of Service</h2>
            <p>
              Libro provides memory infrastructure and vectorization APIs for artificial intelligence applications. The Service allows developers to store, retrieve, and manage semantic context for their end-users. We reserve the right to modify, suspend, or discontinue the Service at any time with reasonable notice.
            </p>
          </section>

          <section className="mb-12">
            <h2>3. API Usage and Fair Use</h2>
            <p>
              You agree to use the API in accordance with your subscribed tier's rate limits. Libro employs automated rate limiting and abuse detection. We reserve the right to throttle or suspend API keys that generate disproportionate load, engage in malicious scraping, or violate our Acceptable Use Policy.
            </p>
            <p>
              Our <strong>Local Edge Vectorization</strong> pipeline operates within your application's compute environment. You are responsible for ensuring your deployment platform (e.g., Vercel, AWS) permits the execution of the necessary Node.js binaries and machine learning models required by our SDK.
            </p>
          </section>

          <section className="mb-12">
            <h2>4. Data Privacy & Security</h2>
            <p>
              Your data is governed by our <a href="/privacy">Privacy Policy</a>. You are solely responsible for ensuring you have obtained necessary consent from your end-users before transmitting their personal data or conversations to the Libro API.
            </p>
          </section>

          <section className="mb-12">
            <h2>5. Limitation of Liability</h2>
            <p>
              In no event shall Libro be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of your use or inability to use the Service.
            </p>
          </section>
        </div>
      </main>

      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
