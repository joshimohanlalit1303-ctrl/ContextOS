"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import clsx from "clsx";

const tabs = ["Performance", "Developer XP", "Global Architecture", "Compliance"] as const;
type Tab = typeof tabs[number];

const tabData: Record<
  Tab,
  {
    title: string;
    bullets: string[];
    rightContent: React.ReactNode;
  }
> = {
  Performance: {
    title: "Sub-100ms recall at any scale",
    bullets: [
      "pgvector IVFFlat cosine index",
      "Auto-deduplicated memory pool",
      "Scales with your user base",
    ],
    rightContent: (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-white/10 rounded-2xl p-6 shadow-sm">
          <p className="text-muted text-sm mb-1">Avg recall</p>
          <p className="text-3xl font-bold text-white tracking-tight">47ms</p>
        </div>
        <div className="bg-card border border-white/10 rounded-2xl p-6 shadow-sm">
          <p className="text-muted text-sm mb-1">Dedup rate</p>
          <p className="text-3xl font-bold text-white tracking-tight">94%</p>
        </div>
        <div className="bg-card border border-white/10 rounded-2xl p-6 shadow-sm sm:col-span-2">
          <p className="text-muted text-sm mb-1">Uptime</p>
          <p className="text-3xl font-bold text-white tracking-tight">99.9%</p>
        </div>
      </div>
    ),
  },
  "Developer XP": {
    title: "3 lines. Ship in an afternoon.",
    bullets: [
      "JS + Python SDKs",
      "REST API with OpenAPI spec",
      "Works with any LLM or agent framework",
    ],
    rightContent: (
      <div className="bg-card border border-white/10 rounded-2xl p-6 shadow-sm font-mono text-sm leading-relaxed overflow-x-auto">
        <span className="text-muted">{`// 1. Initialize`}</span>
        <br />
        <span className="text-muted">const</span> <span className="text-white">ctx</span> = <span className="text-muted">new</span> <span className="text-accent">ContextOS</span>()
        <br />
        <br />
        <span className="text-muted">{`// 2. Store context`}</span>
        <br />
        <span className="text-muted">await</span> <span className="text-white">ctx</span>.<span className="text-accent">remember</span>(userId, text)
        <br />
        <br />
        <span className="text-muted">{`// 3. Retrieve context`}</span>
        <br />
        <span className="text-muted">await</span> <span className="text-white">ctx</span>.<span className="text-accent">recall</span>(userId, query)
      </div>
    ),
  },
  "Global Architecture": {
    title: "100% Free, Local & Multilingual.",
    bullets: [
      "Zero-Cost Edge Vectorization (Node.js)",
      "Native support for 50+ languages",
      "Infinite semantic chunking algorithm",
    ],
    rightContent: (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-white/10 rounded-2xl p-6 shadow-sm">
          <p className="text-muted text-sm mb-1">Embedding Cost</p>
          <p className="text-3xl font-bold text-white tracking-tight">$0.00</p>
        </div>
        <div className="bg-card border border-white/10 rounded-2xl p-6 shadow-sm">
          <p className="text-muted text-sm mb-1">Token Limit</p>
          <p className="text-3xl font-bold text-white tracking-tight">Infinite</p>
        </div>
        <div className="bg-card border border-white/10 rounded-2xl p-6 shadow-sm sm:col-span-2">
          <p className="text-muted text-sm mb-1">Languages Supported</p>
          <p className="text-3xl font-bold text-white tracking-tight">50+</p>
        </div>
      </div>
    ),
  },
  Compliance: {
    title: "GDPR-ready from day one.",
    bullets: [
      "Hard delete via forget()",
      "TTL policies per memory",
      "Zero plaintext storage",
    ],
    rightContent: (
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-card border border-white/10 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <span className="text-white font-medium">GDPR Compliant</span>
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </div>
        <div className="bg-card border border-white/10 rounded-2xl p-6 shadow-sm flex items-center justify-between opacity-50">
          <span className="text-white font-medium">SOC 2 Type II</span>
          <span className="text-xs font-mono text-muted uppercase tracking-wider">Coming Q3</span>
        </div>
        <div className="bg-card border border-white/10 rounded-2xl p-6 shadow-sm flex items-center justify-between opacity-50">
          <span className="text-white font-medium">HIPAA Ready</span>
          <span className="text-xs font-mono text-muted uppercase tracking-wider">Coming Q4</span>
        </div>
      </div>
    ),
  },
};

export default function Features() {
  const [activeTab, setActiveTab] = useState<Tab>("Performance");

  return (
    <section id="developers" className="py-28 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <p className="font-mono text-xs text-muted tracking-widest mb-4">BUILT FOR DEVELOPERS</p>
        <h2 className="text-[48px] font-[700] text-white tracking-tight leading-tight">
          Proof, not promises.
        </h2>
        <p className="text-[17px] text-muted mt-4">
          Less redundant context. Lower token costs. Faster responses.
        </p>
      </motion.div>

      {/* Tab Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        className="mt-12 inline-flex flex-wrap gap-2"
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "px-5 py-2.5 rounded-full text-sm transition-all duration-300",
              activeTab === tab
                ? "bg-white/10 text-white border border-white/10"
                : "text-muted hover:text-white border border-transparent"
            )}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* Content Area */}
      <div className="mt-12 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-start"
          >
            {/* Left Col */}
            <div>
              <h3 className="text-3xl font-semibold text-white tracking-tight mb-8">
                {tabData[activeTab].title}
              </h3>
              <ul className="space-y-4">
                {tabData[activeTab].bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    <span className="text-muted leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Col */}
            <div className="w-full">
              {tabData[activeTab].rightContent}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
