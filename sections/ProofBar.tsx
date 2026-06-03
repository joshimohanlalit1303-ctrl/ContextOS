"use client";

import dynamic from "next/dynamic";

const CurvedLoop = dynamic(() => import("@/components/CurvedLoop"), { ssr: false });

export default function ProofBar() {
  return (
    <section className="py-20 border-y border-white/5 bg-bg/50 relative overflow-hidden h-[400px]">
      <CurvedLoop 
        marqueeText="VERCEL AI ✦ LANGCHAIN ✦ CREWAI ✦ MEMORY ✦ RECALL ✦ SESSIONS ✦ AGENTS ✦ CONTEXT ✦ "
        speed={1.5}
        curveAmount={400}
        direction="left"
        interactive={true}
        className="text-[3rem] md:text-[5rem] opacity-70"
      />
    </section>
  );
}
