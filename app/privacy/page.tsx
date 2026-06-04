import React from "react";
import Navbar from "@/components/Navbar";

export default function PrivacyPolicy() {
  return (
    <div className="bg-[#f8fafc] min-h-screen selection:bg-black selection:text-white relative">
      <Navbar />
      
      <main className="relative z-10 w-full max-w-4xl mx-auto pt-40 pb-24 px-6">
        <div className="glass bg-white/60 border border-gray-200/50 rounded-3xl p-10 md:p-16 shadow-2xl backdrop-blur-xl prose prose-slate max-w-none prose-headings:text-black prose-p:text-gray-600 prose-a:text-indigo-600 prose-strong:text-black">
          <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold tracking-widest uppercase mb-4 not-prose">
            Legal
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-black mb-2 mt-0">Privacy Policy</h1>
          <p className="text-gray-400 font-medium mb-12 not-prose">Last Updated: October 2026</p>

          <section className="mb-12">
            <h2>1. Introduction</h2>
            <p>
              Libro ("we", "our", or "us") is committed to protecting your privacy and the privacy of your users. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our API, SDKs, and dashboard (collectively, the "Service").
            </p>
          </section>

          <section className="mb-12">
            <h2>2. Data We Process (And Data We Don't)</h2>
            <p>
              Because of Libro's unique <strong>Zero-Cost Local Vectorization</strong> architecture, the way we handle your users' conversational data is significantly more secure than traditional API-based vector databases:
            </p>
            <ul>
              <li><strong>No Third-Party AI APIs:</strong> We do not send your raw conversation strings to OpenAI, Anthropic, or any third-party embedding provider. All vectorization happens locally within your serverless environment using open-source models.</li>
              <li><strong>Encrypted Storage:</strong> Memory vectors and metadata are stored in our secure, SOC2-compliant PostgreSQL infrastructure.</li>
              <li><strong>Data Ownership:</strong> You retain full ownership of all data ingested into Libro. We claim no rights to use your data for training generalized AI models.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2>3. Information We Collect from Developers</h2>
            <p>
              When you create a developer account to use Libro, we collect:
            </p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, and authentication data via Google Auth.</li>
              <li><strong>Payment Information:</strong> Processed securely via Stripe (we do not store full credit card details).</li>
              <li><strong>Usage Data:</strong> API request volumes, latency metrics, and error logs for debugging and billing purposes.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2>4. GDPR and Data Deletion</h2>
            <p>
              We provide full support for General Data Protection Regulation (GDPR) compliance. If your end-user requests data deletion, you can utilize the <code>ctx.forget(userId)</code> method in our SDK. This performs a hard, cascading delete of all vectors, profiles, and metadata associated with that specific <code>endUserId</code> across our entire infrastructure.
            </p>
          </section>

          <section className="mb-12">
            <h2>5. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact our security team at <a href="mailto:security@libro.dev">security@libro.dev</a>.
            </p>
          </section>
        </div>
      </main>
      
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
