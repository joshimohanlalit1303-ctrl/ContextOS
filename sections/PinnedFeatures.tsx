"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import clsx from "clsx";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: "Semantic Chunking",
    description: "Automatically parses conversations into distinct atomic memories.",
    icon: "🧠",
  },
  {
    title: "Graph Relationships",
    description: "Builds implicit connection graphs between people, places, and preferences.",
    icon: "🕸️",
  },
  {
    title: "GDPR Compliant",
    description: "Everything is sandboxed. Forget users with a single API call.",
    icon: "🛡️",
  },
];

export default function PinnedFeatures() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const panels = gsap.utils.toArray(".feature-panel", containerRef.current);

    gsap.to(panels, {
      yPercent: -100 * (panels.length - 1),
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        pin: pinRef.current,
        start: "top top",
        end: `+=${panels.length * 100}%`,
        scrub: 1,
        snap: 1 / (panels.length - 1),
      },
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="bg-gray-50 text-black">
      <div ref={pinRef} className="h-screen flex flex-col md:flex-row overflow-hidden">
        {/* Left side static text */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-12 md:px-24 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-gray-200 bg-white">
          <h2 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight">
            Built for scale.
          </h2>
          <p className="text-xl text-gray-500 font-light max-w-md">
            Under the hood, Libro is powered by enterprise-grade infrastructure. We handle the hard parts so you can focus on user experience.
          </p>
        </div>

        {/* Right side scrolling panels */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden bg-gray-50">
          <div className="absolute inset-0 flex flex-col w-full h-full">
            {features.map((feature, i) => (
              <div
                key={i}
                className={clsx(
                  "feature-panel flex-shrink-0 w-full h-full flex flex-col justify-center px-12 md:px-24"
                )}
              >
                <div className="text-6xl mb-6">{feature.icon}</div>
                <h3 className="text-3xl font-medium mb-3">{feature.title}</h3>
                <p className="text-lg text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
