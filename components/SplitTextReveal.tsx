"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import clsx from "clsx";

gsap.registerPlugin(ScrollTrigger);

interface SplitTextRevealProps {
  text: string;
  className?: string;
  type?: "words" | "chars";
  delay?: number;
}

export default function SplitTextReveal({
  text,
  className = "",
  type = "words",
  delay = 0,
}: SplitTextRevealProps) {
  const containerRef = useRef<HTMLHeadingElement | HTMLParagraphElement>(null);

  const elements =
    type === "words" ? text.split(" ") : text.split("");

  useGSAP(
    () => {
      const q = gsap.utils.selector(containerRef);
      
      gsap.fromTo(
        q(".reveal-el"),
        { y: 40, opacity: 0, rotateX: -20 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.05,
          delay: delay,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <span
      ref={containerRef as any}
      className={clsx("inline-block perspective-1000", className)}
    >
      {elements.map((el, i) => (
        <React.Fragment key={i}>
          <span
            className="reveal-el inline-block whitespace-pre transform-gpu"
            style={{ opacity: 0 }}
          >
            {el}
          </span>
          {type === "words" && i < elements.length - 1 && " "}
        </React.Fragment>
      ))}
    </span>
  );
}
