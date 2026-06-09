"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";

export default function HeroCinematic() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      ".hero-pill",
      { y: 40, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power4.out", delay: 0.1 }
    );

    tl.fromTo(
      ".hero-title-line",
      { y: 50, opacity: 0, rotateX: -20 },
      { y: 0, opacity: 1, rotateX: 0, duration: 1.4, ease: "expo.out", stagger: 0.1 },
      "-=0.9"
    );

    tl.fromTo(
      ".hero-desc",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power4.out" },
      "-=1.0"
    );

    tl.fromTo(
      ".hero-actions",
      { y: 30, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "expo.out" },
      "-=1.0"
    );

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5) * 30;
      const yPos = (clientY / window.innerHeight - 0.5) * 30;

      gsap.to(".hero-parallax", {
        x: xPos,
        y: yPos,
        duration: 2,
        ease: "power3.out"
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);

  }, { scope: containerRef });

  return (
    <section 
      id="waitlist"
      ref={containerRef} 
      className="relative w-full min-h-screen flex flex-col justify-center items-center text-center px-6 perspective-1000 overflow-hidden pt-32 pb-24"
    >
      {/* Background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="hero-parallax relative z-10 flex flex-col items-center w-full max-w-5xl mx-auto transform-gpu">
        
        <div className="hero-pill px-6 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 font-bold text-[13px] tracking-[0.2em] mb-12 shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:scale-105 hover:bg-indigo-500/20 transition-all duration-500 cursor-default">
          LIBRO IS LIVE
        </div>

        <h1 className="text-[64px] md:text-[96px] tracking-[-0.05em] leading-[1.05] font-bold text-white drop-shadow-sm">
          <div className="hero-title-line transform-gpu origin-bottom">
            The Free AMM Layer
          </div>
          <div className="hero-title-line transform-gpu origin-bottom text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 pb-4">
            for AI Agents.
          </div>
        </h1>

        <h2 className="hero-desc text-[20px] md:text-[24px] text-gray-400 max-w-2xl mx-auto leading-relaxed mt-10 font-light">
          The ultimate open-source alternative to Pinecone and Langchain. 
          Drop-in vector search and semantic chunking with zero pipeline changes.
        </h2>

        <div className="hero-actions mt-14 w-full relative z-20 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-xl shadow-2xl cursor-copy hover:bg-white/10 transition-colors" onClick={() => navigator.clipboard.writeText('npm install @libro/sdk')}>
            <span className="text-gray-500 font-mono text-sm">$</span>
            <code className="text-gray-200 font-mono font-medium tracking-tight">npm install @libro/sdk</code>
            <svg className="w-4 h-4 ml-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </div>
          <p className="text-sm text-gray-500 font-medium">v1.0.4 • Read the Documentation</p>
        </div>

        <div className="mt-10 w-full relative z-20 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-2xl font-bold text-[16px] hover:bg-gray-200 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all"
          >
            Get Started Free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center justify-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-2xl font-bold text-[16px] hover:bg-white/10 hover:-translate-y-1 transition-all"
          >
            Read the Docs →
          </Link>
        </div>

        <div className="mt-12 hero-actions flex justify-center relative z-20">
          <a href="https://www.producthunt.com/products/libro-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-libro-2" target="_blank" rel="noopener noreferrer">
            <img 
              alt="Libro - The open-source brain for AI agents. | Product Hunt" 
              width={250} 
              height={54} 
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1165986&theme=light&t=1780910992135" 
              className="hover:scale-105 hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
