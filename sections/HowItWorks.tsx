"use client";

import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    icon: "R",
    code: "ctx.remember()",
    title: "Store context",
    body: "After each user interaction, call remember(). We embed, deduplicate, and store — you move on.",
  },
  {
    num: "02",
    icon: "S",
    code: "ctx.recall()",
    title: "Retrieve what matters",
    body: "Before each AI call, recall() runs a semantic search and returns the most relevant memories for that exact query.",
  },
  {
    num: "03",
    icon: "F",
    code: "ctx.forget()",
    title: "Delete on request",
    body: "One call to forget() hard-deletes everything for a user. GDPR compliance in a single line.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-28 px-6 bg-surface border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center md:text-left mb-20"
        >
          <p className="font-mono text-xs text-muted tracking-widest mb-4 uppercase">
            How It Works
          </p>
          <h2 className="text-[42px] font-[700] text-white tracking-tight leading-tight">
            One API. Full memory.
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line (Desktop Only) */}
          <div className="hidden md:block absolute top-6 left-[10%] right-[10%] border-t border-dashed border-white/10 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="flex flex-col items-center md:items-start text-center md:text-left"
              >
                <div className="font-mono text-xs text-muted/40 mb-4">{step.num}</div>
                
                <div className="w-12 h-12 rounded-xl bg-bg border border-white/10 flex items-center justify-center mb-6 shadow-sm shadow-black/50">
                  <span className="text-accent font-mono font-bold">{step.icon}</span>
                </div>
                
                <div className="font-mono text-xs text-accent bg-accent/10 px-2 py-1 rounded mb-3">
                  {step.code}
                </div>
                
                <h3 className="text-white font-medium text-lg tracking-tight mb-2">
                  {step.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed max-w-sm">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
