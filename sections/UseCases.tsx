"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import Link from "next/link";

const tabs = [
  "AI Chatbots",
  "Coding Assistants",
  "Tutors",
  "Customer Support",
  "Sales AI",
] as const;
type Tab = typeof tabs[number];

const tabData: Record<Tab, { title: string; body: string }[]> = {
  "AI Chatbots": [
    {
      title: "Persistent personality",
      body: "Your bot remembers user preferences, past topics, and communication style across every conversation.",
    },
    {
      title: "No redundant onboarding",
      body: "Users never repeat themselves. Context flows automatically from session to session.",
    },
  ],
  "Coding Assistants": [
    {
      title: "Project-aware context",
      body: "Remember the user's stack, coding style, active bugs, and architectural decisions across sessions.",
    },
    {
      title: "Team memory",
      body: "Share context across team members. The assistant knows what the whole team discussed.",
    },
  ],
  Tutors: [
    {
      title: "Adaptive learning path",
      body: "Track what each student knows, what confused them, and what worked — personalize every lesson.",
    },
    {
      title: "Progress continuity",
      body: "Pick up exactly where the last session ended, no re-explaining needed.",
    },
  ],
  "Customer Support": [
    {
      title: "Full case history",
      body: "Every past issue, resolution, and preference available instantly. No more asking customers to repeat.",
    },
    {
      title: "Escalation context",
      body: "When a ticket escalates, all memory travels with it.",
    },
  ],
  "Sales AI": [
    {
      title: "Relationship memory",
      body: "Track every interaction, objection, decision-maker, and milestone across the full sales cycle.",
    },
    {
      title: "Deal intelligence",
      body: "Surface the right context at the right moment in the pipeline.",
    },
  ],
};

export default function UseCases() {
  const [activeTab, setActiveTab] = useState<Tab>("AI Chatbots");

  return (
    <section id="use-cases" className="py-28 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <p className="font-mono text-xs text-muted tracking-widest mb-4">USE CASES</p>
        <h2 className="text-[42px] md:text-[48px] font-[700] text-white tracking-tight leading-tight">
          Memory for every AI product.
        </h2>
      </motion.div>

      <div className="mt-16 flex flex-col md:flex-row gap-12 lg:gap-20">
        {/* Vertical Tabs (Desktop) / Horizontal Scroll (Mobile) */}
        <div className="w-full md:w-64 shrink-0 overflow-x-auto no-scrollbar border-b md:border-b-0 md:border-l border-white/10 pb-4 md:pb-0 md:pl-4">
          <div className="flex md:flex-col gap-2 w-max md:w-full">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "px-4 py-3 text-sm text-left transition-colors relative rounded-lg md:rounded-none md:rounded-r-lg",
                  activeTab === tab
                    ? "text-white bg-white/5 md:bg-transparent"
                    : "text-muted hover:text-white"
                )}
              >
                {/* Active Indicator line for Desktop */}
                {activeTab === tab && (
                  <motion.div
                    layoutId="active-tab-indicator"
                    className="hidden md:block absolute left-[-17px] top-0 bottom-0 w-[2px] bg-white"
                  />
                )}
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {tabData[activeTab].map((card, i) => {
                const tabSlug = activeTab.toLowerCase().replace(/\s+/g, '-');
                return (
                  <div
                    key={i}
                    className="bg-card border border-white/5 hover:border-white/10 transition-colors rounded-2xl p-7 flex flex-col h-full"
                  >
                    <h3 className="text-white font-medium text-[16px] tracking-tight">
                      {card.title}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed mt-2 flex-1">
                      {card.body}
                    </p>
                    <Link href={`/explore/${tabSlug}`} className="text-accent text-xs mt-6 cursor-pointer hover:underline w-max">
                      Explore &rarr;
                    </Link>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
