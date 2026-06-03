"use client";

import { useState } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import FaultyTerminal from "@/components/FaultyTerminal";
import DecryptedText from "@/components/DecryptedText";
import Link from "next/link";

const tabs = ["JS", "Python", "cURL"] as const;
type Tab = typeof tabs[number];

export default function Hero({ userCount = 74 }: { userCount?: number }) {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<Tab>("JS");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const textAnimation = {
    initial: { y: shouldReduceMotion ? 0 : 30, opacity: 0 },
    whileInView: { y: 0, opacity: 1 },
    viewport: { once: true, margin: "-80px" },
  };

  return (
    <LazyMotion features={domAnimation}>
    <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 pt-24 pb-16 overflow-hidden">
      {/* Background Terminal */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <FaultyTerminal
          scale={1.5}
          gridMul={[2, 1]}
          digitSize={1.2}
          timeScale={1}
          pause={false}
          scanlineIntensity={1}
          glitchAmount={1}
          flickerAmount={1}
          noiseAmp={1}
          chromaticAberration={0}
          tint="#EC4899"
          mouseReact={true}
          brightness={1}
        />
      </div>

      {/* Content wrapper to keep z-index above terminal */}
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Top Badge */}
      <m.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        className="px-3 py-1 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-mono tracking-wider mb-8"
      >
        NEW · Semantic memory API
      </m.div>

      {/* H1 */}
      <h1 className="text-[42px] md:text-[72px] tracking-[-0.04em] leading-[1.05] flex flex-col items-center">
        <m.span
          {...textAnimation}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-[700] text-white"
        >
          <DecryptedText text="AI memory that" animateOn="view" revealDirection="start" speed={50} maxIterations={10} />
        </m.span>
        <m.span
          {...textAnimation}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: shouldReduceMotion ? 0 : 0.12 }}
          className="font-[200] text-white"
        >
          <DecryptedText text="persists across sessions." animateOn="view" revealDirection="start" speed={60} maxIterations={15} />
        </m.span>
      </h1>

      {/* Subtext */}
      <m.p
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: shouldReduceMotion ? 0 : 0.35, ease: "easeOut" }}
        className="text-[17px] text-muted max-w-xl mx-auto leading-relaxed mt-6"
      >
        Drop-in memory infrastructure for any AI app. Three endpoints. Zero pipeline changes. Built for production.
      </m.p>

      {/* CTA Row */}
      <m.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: shouldReduceMotion ? 0 : 0.5, ease: "easeOut" }}
        className="mt-10 flex flex-col items-center justify-center gap-4"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="bg-white text-black px-8 py-3.5 rounded-full text-[15px] font-medium hover:bg-white/90 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2">
            Get API Key
          </Link>
          <button className="border border-white/15 text-muted px-7 py-3 rounded-full text-sm hover:text-white hover:border-white/30 transition-colors">
            Read the docs
          </button>
        </div>
      </m.div>

      {/* Code Demo Block */}
      <m.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, delay: shouldReduceMotion ? 0 : 0.7, ease: "easeOut" }}
        className="mt-16 w-full max-w-2xl mx-auto text-left"
      >
        <div className="bg-card border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(79,123,255,0.08)]">
          {/* Top Bar */}
          <div className="flex items-center justify-between bg-surface px-4 py-3 border-b border-white/5">
            {/* Window Dots */}
            <div className="flex gap-1.5 w-16">
              <div className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]" />
              <div className="w-[10px] h-[10px] rounded-full bg-[#FEBC2E]" />
              <div className="w-[10px] h-[10px] rounded-full bg-[#28C840]" />
            </div>

            {/* Tabs */}
            <div className="flex bg-black/20 p-1 rounded-full border border-white/5">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    "px-3 py-1 text-xs rounded-full font-mono transition-colors",
                    activeTab === tab
                      ? "bg-white/10 text-white border border-white/10"
                      : "text-muted hover:text-white border border-transparent"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="w-16 text-right text-muted text-xs hover:text-white transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Code Area */}
          <div className="p-6 font-mono text-sm leading-7 overflow-x-auto">
            {activeTab === "JS" && (
              <div>
                <span className="text-muted">{`// install: npm i @contextos/sdk`}</span>
                <br />
                <span className="text-muted">import</span> <span className="text-white">{`{ ContextOS }`}</span> <span className="text-muted">from</span> <span className="text-green-400">{`'@contextos/sdk'`}</span>
                <br />
                <br />
                <span className="text-muted">const</span> <span className="text-white">ctx</span> = <span className="text-muted">new</span> <span className="text-accent">ContextOS</span>{`({ apiKey: `}<span className="text-green-400">process.env.CTX_KEY</span>{` })`}
                <br />
                <br />
                <span className="text-muted">{`// store context after each turn`}</span>
                <br />
                <span className="text-muted">await</span> <span className="text-white">ctx</span>.<span className="text-accent">remember</span>{`(`}<span className="text-white">userId</span>, <span className="text-green-400">{`'User prefers Python.'`}</span>{`)`}
                <br />
                <br />
                <span className="text-muted">{`// retrieve before each AI call`}</span>
                <br />
                <span className="text-muted">const</span> <span className="text-white">mem</span> = <span className="text-muted">await</span> <span className="text-white">ctx</span>.<span className="text-accent">recall</span>{`(`}<span className="text-white">userId</span>, <span className="text-white">userMessage</span>{`)`}
              </div>
            )}
            {activeTab === "Python" && (
              <div>
                <span className="text-muted">{`# install: pip install contextos`}</span>
                <br />
                <span className="text-muted">from</span> <span className="text-white">contextos</span> <span className="text-muted">import</span> <span className="text-accent">ContextOS</span>
                <br />
                <br />
                <span className="text-white">ctx</span> = <span className="text-accent">ContextOS</span>{`(api_key=`}<span className="text-green-400">{`"YOUR_API_KEY"`}</span>{`)`}
                <br />
                <br />
                <span className="text-muted">{`# store context after each turn`}</span>
                <br />
                <span className="text-white">ctx</span>.<span className="text-accent">remember</span>{`(user_id, `}<span className="text-green-400">{`"User prefers Python."`}</span>{`)`}
                <br />
                <br />
                <span className="text-muted">{`# retrieve before each AI call`}</span>
                <br />
                <span className="text-white">mem</span> = <span className="text-white">ctx</span>.<span className="text-accent">recall</span>{`(user_id, user_message)`}
              </div>
            )}
            {activeTab === "cURL" && (
              <div>
                <span className="text-muted">{`# store context after each turn`}</span>
                <br />
                <span className="text-accent">curl</span> -X POST https://api.contextos.ai/v1/remember \
                <br />
                &nbsp;&nbsp;-H <span className="text-green-400">{`"Authorization: Bearer YOUR_API_KEY"`}</span> \
                <br />
                &nbsp;&nbsp;-H <span className="text-green-400">{`"Content-Type: application/json"`}</span> \
                <br />
                &nbsp;&nbsp;-d <span className="text-green-400">{`'{"user_id": "user_123", "text": "User prefers Python."}'`}</span>
                <br />
                <br />
                <span className="text-muted">{`# retrieve before each AI call`}</span>
                <br />
                <span className="text-accent">curl</span> -X POST https://api.contextos.ai/v1/recall \
                <br />
                &nbsp;&nbsp;-H <span className="text-green-400">{`"Authorization: Bearer YOUR_API_KEY"`}</span> \
                <br />
                &nbsp;&nbsp;-H <span className="text-green-400">{`"Content-Type: application/json"`}</span> \
                <br />
                &nbsp;&nbsp;-d <span className="text-green-400">{`'{"user_id": "user_123", "query": "Write a script"}'`}</span>
              </div>
            )}
          </div>
        </div>
      </m.div>
      </div>
    </section>
    </LazyMotion>
  );
}
