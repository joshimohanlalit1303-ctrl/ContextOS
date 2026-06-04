"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import WaitlistForm from "@/components/WaitlistForm";

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
      className="relative w-full h-screen flex flex-col justify-center items-center text-center px-6 perspective-1000 overflow-hidden"
    >
      <div className="hero-parallax relative z-10 flex flex-col items-center w-full max-w-5xl mx-auto transform-gpu">
        
        <div className="hero-pill px-6 py-2 rounded-full glass text-gray-800 font-semibold text-[13px] tracking-[0.2em] mb-12 shadow-xl shadow-black/5 hover:scale-105 transition-transform duration-500 cursor-default">
          LIBRO EARLY ACCESS
        </div>

        <h1 className="text-[72px] md:text-[110px] tracking-[-0.05em] leading-[1.05] font-bold text-black drop-shadow-sm">
          <div className="hero-title-line transform-gpu origin-bottom">
            Memory that feels
          </div>
          <div className="hero-title-line transform-gpu origin-bottom text-transparent bg-clip-text bg-gradient-to-r from-gray-500 via-gray-700 to-black pb-4">
            like magic.
          </div>
        </h1>

        <p className="hero-desc text-[20px] md:text-[24px] text-gray-500 max-w-2xl mx-auto leading-relaxed mt-10 font-light">
          Drop-in context infrastructure for your AI applications. 
          Zero pipeline changes. Join the exclusive developer waitlist.
        </p>

        <div className="hero-actions mt-14 w-full relative z-20">
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
