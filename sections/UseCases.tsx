"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import Link from "next/link";
import { Bot, Code2, GraduationCap, HeadphonesIcon, TrendingUp, ArrowRight } from "lucide-react";

const tabs = [
  { id: "AI Chatbots", icon: Bot },
  { id: "Coding Assistants", icon: Code2 },
  { id: "Tutors", icon: GraduationCap },
  { id: "Customer Support", icon: HeadphonesIcon },
  { id: "Sales AI", icon: TrendingUp },
] as const;

type Tab = typeof tabs[number]["id"];

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
    <section id="use-cases" className="py-32 px-6 max-w-7xl mx-auto relative z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="h-[1px] w-12 bg-indigo-500/50" />
          <p className="font-mono text-sm text-indigo-400 tracking-[0.2em] uppercase font-semibold">
            Use Cases
          </p>
        </div>
        <h2 className="text-[42px] md:text-[56px] font-bold text-white tracking-tight leading-tight">
          Memory for every AI product.
        </h2>
      </motion.div>

      <div className="mt-20 flex flex-col md:flex-row gap-12 lg:gap-24">
        {/* Vertical Tabs (Desktop) / Horizontal Scroll (Mobile) */}
        <div className="w-full md:w-72 shrink-0 overflow-x-auto no-scrollbar border-b md:border-b-0 md:border-l border-white/10 pb-4 md:pb-0 relative">
          <div className="flex md:flex-col gap-2 w-max md:w-full">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "group flex items-center gap-4 px-6 py-4 text-[15px] font-medium transition-all relative rounded-xl md:rounded-none md:rounded-r-xl",
                    isActive
                      ? "text-white bg-white/5 md:bg-transparent"
                      : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]"
                  )}
                >
                  {/* Active Indicator line for Desktop */}
                  {isActive && (
                    <motion.div
                      layoutId="active-tab-indicator"
                      className="hidden md:block absolute left-[-1px] top-0 bottom-0 w-[2px] bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                    />
                  )}
                  <Icon className={clsx("w-5 h-5 transition-colors", isActive ? "text-indigo-400" : "text-gray-600 group-hover:text-gray-400")} />
                  {tab.id}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {tabData[activeTab].map((card, i) => {
                const tabSlug = activeTab.toLowerCase().replace(/\s+/g, '-');
                return (
                  <div
                    key={i}
                    className="group relative bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-colors duration-500 rounded-3xl p-8 flex flex-col h-full overflow-hidden"
                  >
                    {/* Hover Glow */}
                    <div className="absolute top-0 left-0 w-full h-full bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    <h3 className="text-white font-semibold text-[18px] tracking-tight relative z-10">
                      {card.title}
                    </h3>
                    <p className="text-gray-400 text-[15px] leading-relaxed mt-3 flex-1 relative z-10">
                      {card.body}
                    </p>
                    <Link href={`/explore/${tabSlug}`} className="inline-flex items-center gap-2 text-indigo-400 font-medium text-sm mt-8 cursor-pointer hover:text-indigo-300 transition-colors w-max relative z-10 group/link">
                      Explore 
                      <ArrowRight className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" />
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
