"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const chapters = [
  {
    id: "chapter-1",
    subtitle: "01 / FRAGMENTATION",
    title: "Your digital life is fragmented.",
    description: "Floating notes drift apart. Files scatter in the void. Messages remain disconnected. Standard AI applications forget you the moment you close the tab.",
  },
  {
    id: "chapter-2",
    subtitle: "02 / COHESION",
    title: "Libro connects everything.",
    description: "Disparate data points magnetically attract. Our real-time memory nodes connect through an implicit graph, structuring your unstructured life.",
  },
  {
    id: "chapter-3",
    subtitle: "03 / INTELLIGENCE",
    title: "Ask anything.",
    description: "The memory graph lights up. Semantic indexing at the edge processes relationships in milliseconds, injecting relevant memory without bloated token windows.",
  },
  {
    id: "chapter-4",
    subtitle: "04 / RECALL",
    title: "Instant recall.",
    description: "The entire graph reorganizes around your intent. Fly through your connected memories and retrieve exactly what you need, exactly when you need it.",
  },
];

export default function NarrativeJourney() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const sections = gsap.utils.toArray(".narrative-section", containerRef.current);

    sections.forEach((section: any) => {
      const textBlock = section.querySelector(".narrative-text");
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          end: "bottom 25%",
          scrub: 1,
        }
      });

      tl.fromTo(
        textBlock,
        { opacity: 0, y: 100, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power2.out",
        }
      ).to(
        textBlock,
        {
          opacity: 0,
          y: -100,
          scale: 1.05,
          duration: 1,
          ease: "power2.in",
        },
        "+=0.5" // hold visible for a moment
      );
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full z-10 pointer-events-none">
      {chapters.map((chapter) => (
        <section
          key={chapter.id}
          className="narrative-section w-full h-[150vh] flex items-center justify-center px-6"
        >
          <div className="narrative-text text-center max-w-4xl mx-auto p-12 md:p-20 rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl border border-white/5 bg-white/5 transform-gpu pointer-events-auto">
            <div className="text-indigo-400 font-mono text-sm tracking-[0.2em] mb-6 font-semibold">
              {chapter.subtitle}
            </div>
            <h2 className="text-[48px] md:text-[72px] font-bold text-white tracking-tight leading-[1.1] mb-8">
              {chapter.title}
            </h2>
            <p className="text-[20px] md:text-[26px] text-gray-400 font-light leading-relaxed">
              {chapter.description}
            </p>
          </div>
        </section>
      ))}
      {/* Buffer at the end to allow for full scroll out */}
      <div className="h-[50vh] w-full" />
    </div>
  );
}
