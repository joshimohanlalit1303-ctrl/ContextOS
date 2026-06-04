"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitTextReveal from "@/components/SplitTextReveal";

gsap.registerPlugin(ScrollTrigger);

export default function StorytellingSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Parallax background
    if (parallaxRef.current) {
      gsap.to(parallaxRef.current, {
        y: 200,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    // Story text fading in on scroll
    const storyBlocks = gsap.utils.toArray(".story-block", containerRef.current);
    storyBlocks.forEach((block: any) => {
      gsap.fromTo(
        block,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: block,
            start: "top 80%",
            end: "bottom 60%",
            scrub: 1,
          },
        }
      );
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative py-48 px-6 bg-white overflow-hidden text-center">
      {/* Parallax abstract background element */}
      <div 
        ref={parallaxRef}
        className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-blue-50 to-transparent rounded-full opacity-60 pointer-events-none blur-3xl z-0"
      />

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col gap-40">
        <div className="story-block">
          <h2 className="text-4xl md:text-5xl font-semibold text-black mb-6 tracking-tight">
            Designed for <span className="text-accent">persistence</span>.
          </h2>
          <p className="text-xl md:text-2xl text-gray-500 font-light leading-relaxed">
            Usually, AI forgets the moment the tab closes. Libro remembers. It seamlessly integrates into your product, turning brief interactions into lifelong relationships.
          </p>
        </div>

        <div className="story-block">
          <h2 className="text-4xl md:text-5xl font-semibold text-black mb-6 tracking-tight">
            Infinite context. <span className="text-green">Zero</span> latency.
          </h2>
          <p className="text-xl md:text-2xl text-gray-500 font-light leading-relaxed">
            By running lightweight semantic indexing at the edge, Libro injects relevant memory instantly without bloated token windows or complex RAG pipelines.
          </p>
        </div>
        
        <div className="story-block">
          <h2 className="text-4xl md:text-5xl font-semibold text-black mb-6 tracking-tight">
            As simple as <span className="text-black">ctx.remember()</span>.
          </h2>
          <p className="text-xl md:text-2xl text-gray-500 font-light leading-relaxed">
            We stripped away the complexity. Three lines of code and your application gains a perfect memory. Welcome to the future of conversational design.
          </p>
        </div>
      </div>
    </section>
  );
}
