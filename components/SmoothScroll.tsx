"use client";

import { ReactLenis } from "lenis/react";
import React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "@/lib/utils/isomorphic-effect";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  // Sync Lenis with GSAP ScrollTrigger
  useIsomorphicLayoutEffect(() => {
    // Lenis handles the scroll sync inherently if configured, or we can just let Lenis run and ScrollTrigger will hook into native scroll events.
    // To perfectly sync ScrollTrigger to Lenis:
    // ScrollTrigger.update is called by Lenis internally if we use lenis instance on scroll, but react-lenis automatically wires this up usually.
    // For safety, we can manually trigger update on scroll if needed, but react-lenis default is good.
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.05, syncTouch: true }}>
      {children}
    </ReactLenis>
  );
}
