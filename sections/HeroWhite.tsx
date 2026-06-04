"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import SplitTextReveal from "@/components/SplitTextReveal";

export default function HeroWhite({ userCount = 74 }: { userCount?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Floating nodes animation
    if (nodesRef.current) {
      const nodes = gsap.utils.toArray(".memory-node", nodesRef.current);
      nodes.forEach((node: any) => {
        gsap.to(node, {
          x: () => gsap.utils.random(-100, 100),
          y: () => gsap.utils.random(-100, 100),
          rotation: () => gsap.utils.random(-45, 45),
          duration: () => gsap.utils.random(5, 15),
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });
    }

    // Buttons and bottom text reveal
    gsap.fromTo(
      ".hero-bottom-el",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.1, delay: 1, ease: "power3.out" }
    );
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 pt-24 pb-16 overflow-hidden bg-white text-foreground"
    >
      {/* Background Floating Memory Nodes */}
      <div ref={nodesRef} className="absolute inset-0 z-0 pointer-events-none opacity-40">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="memory-node absolute rounded-full bg-accent/10 blur-xl"
            style={{
              width: `${Math.random() * 200 + 50}px`,
              height: `${Math.random() * 200 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl mx-auto">
        <div className="hero-bottom-el px-4 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-muted font-medium text-xs tracking-wide mb-8 shadow-sm">
          INTRODUCING THE CONTEXT LAYER
        </div>

        <h1 className="text-[56px] md:text-[88px] tracking-[-0.04em] leading-[1.05] font-semibold text-black">
          <SplitTextReveal text="Memory that" type="words" delay={0.1} />
          <br />
          <span className="text-gray-400">
            <SplitTextReveal text="feels like magic." type="words" delay={0.3} />
          </span>
        </h1>

        <p className="hero-bottom-el text-[19px] md:text-[22px] text-gray-500 max-w-2xl mx-auto leading-relaxed mt-8 font-light">
          Drop-in context infrastructure for your AI applications. 
          Zero pipeline changes. Absolute perfection.
        </p>

        <div className="hero-bottom-el mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="bg-black text-white px-8 py-4 rounded-full text-[16px] font-medium hover:bg-black/80 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center">
            Get Started
          </Link>
          <button className="bg-white border border-gray-200 text-black px-8 py-4 rounded-full text-[16px] font-medium hover:bg-gray-50 transition-colors shadow-sm">
            Read the docs
          </button>
        </div>
      </div>
    </section>
  );
}
