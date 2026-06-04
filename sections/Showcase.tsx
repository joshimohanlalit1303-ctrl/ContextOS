/* eslint-disable */

// @ts-nocheck
"use client";

import CardSwap, { Card } from "@/components/CardSwap";

export default function Showcase() {
  return (
    <section className="relative py-32 bg-bg overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center">
        {/* Text Side */}
        <div className="md:w-1/2 mb-16 md:mb-0 pr-8">
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-6">
            <span className="font-bold">Multiple sessions.</span>
            <br />
            <span className="font-light text-muted">Infinite recall.</span>
          </h2>
          <p className="text-muted text-lg max-w-md">
            Your users don't want to repeat themselves. Libro automatically groups related conversations and surfaces relevant context precisely when needed, keeping your agents flawlessly informed.
          </p>
        </div>

        {/* Cards Side */}
        <div className="md:w-1/2 w-full h-[500px] relative">
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <CardSwap
              width={400}
              height={280}
              cardDistance={40}
              verticalDistance={40}
              delay={3500}
              pauseOnHover={true}
              skewAmount={5}
            >
              <Card>
                <div className="flex flex-col h-full text-white">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-accent text-lg">👩‍💻</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Alex Carter</h3>
                      <p className="text-sm text-muted">Session: Bug Triage</p>
                    </div>
                  </div>
                  <p className="text-muted leading-relaxed font-mono text-sm mt-auto">
                    &gt; Retrieved user preference:
                    <br />
                    <span className="text-green">"Always respond in Python."</span>
                  </p>
                </div>
              </Card>

              <Card>
                <div className="flex flex-col h-full text-white">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="text-purple-400 text-lg">🚀</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">StartupBot</h3>
                      <p className="text-sm text-muted">Session: Ideation</p>
                    </div>
                  </div>
                  <p className="text-muted leading-relaxed font-mono text-sm mt-auto">
                    &gt; Recalling previous startup:
                    <br />
                    <span className="text-purple-400">"Focused on B2B SaaS for HR."</span>
                  </p>
                </div>
              </Card>

              <Card>
                <div className="flex flex-col h-full text-white">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <span className="text-emerald-400 text-lg">📚</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Study Companion</h3>
                      <p className="text-sm text-muted">Session: Biology 101</p>
                    </div>
                  </div>
                  <p className="text-muted leading-relaxed font-mono text-sm mt-auto">
                    &gt; Identified weak point:
                    <br />
                    <span className="text-emerald-400">"Needs more help with Mitosis."</span>
                  </p>
                </div>
              </Card>
            </CardSwap>
          </div>
        </div>
      </div>
    </section>
  );
}
