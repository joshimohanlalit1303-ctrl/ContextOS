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
      <div className="hero-parallax relative z-10 flex flex-col items-center w-full max-w-5xl mx-auto transform-gpu">
        
        <div className="hero-pill px-6 py-2 rounded-full border border-blue-200 bg-blue-50/50 text-blue-700 font-bold text-[13px] tracking-[0.2em] mb-12 shadow-xl shadow-blue-500/10 hover:scale-105 transition-transform duration-500 cursor-default">
          LIBRO IS LIVE
        </div>

        <h1 className="text-[72px] md:text-[110px] tracking-[-0.05em] leading-[1.05] font-bold text-black drop-shadow-sm">
          <div className="hero-title-line transform-gpu origin-bottom">
            Memory that feels
          </div>
          <div className="hero-title-line transform-gpu origin-bottom text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 pb-4">
            like magic.
          </div>
        </h1>

        <p className="hero-desc text-[20px] md:text-[24px] text-gray-500 max-w-2xl mx-auto leading-relaxed mt-10 font-light">
          Drop-in context infrastructure for your AI applications. 
          Zero pipeline changes. Full data sovereignty.
        </p>

        <div className="hero-actions mt-14 w-full relative z-20 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md border border-gray-200/50 px-6 py-4 rounded-xl shadow-sm cursor-copy hover:bg-white/80 transition-colors" onClick={() => navigator.clipboard.writeText('npm install libro-sdk')}>
            <span className="text-gray-400 font-mono text-sm">$</span>
            <code className="text-gray-800 font-mono font-medium tracking-tight">npm install libro-sdk</code>
            <svg className="w-4 h-4 ml-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </div>
          <p className="text-sm text-gray-400 font-medium">v1.0.4 • Read the Documentation</p>
        </div>

        <div className="mt-10 w-full relative z-20 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-bold text-[16px] hover:bg-gray-900 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20 transition-all"
          >
            Get Started Free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-900 px-8 py-4 rounded-2xl font-bold text-[16px] hover:bg-gray-50 hover:-translate-y-1 hover:shadow-xl transition-all"
          >
            Read the Docs →
          </Link>
        </div>
      </div>
    </section>
  );
}
