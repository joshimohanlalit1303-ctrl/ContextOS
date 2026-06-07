"use client";

import { ReactLenis } from "lenis/react";
import React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "@/lib/utils/isomorphic-effect";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Sync Lenis with GSAP ScrollTrigger
  useIsomorphicLayoutEffect(() => {
    // Lenis handles the scroll sync inherently if configured, or we can just let Lenis run and ScrollTrigger will hook into native scroll events.
    // To perfectly sync ScrollTrigger to Lenis:
    // ScrollTrigger.update is called by Lenis internally if we use lenis instance on scroll, but react-lenis automatically wires this up usually.
    // For safety, we can manually trigger update on scroll if needed, but react-lenis default is good.
  }, []);

  // Only apply smooth scrolling to the landing page
  if (pathname !== "/") {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.0, syncTouch: true }}>
      {children}
    </ReactLenis>
  );
}
