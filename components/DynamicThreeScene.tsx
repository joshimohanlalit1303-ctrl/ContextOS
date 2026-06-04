"use client";

import dynamic from "next/dynamic";
import React from "react";

const ThreeScene = dynamic(() => import("@/components/ThreeScene"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-screen fixed inset-0 pointer-events-none z-0 bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0]">
      {/* Mesh Gradient Fallback */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-400/20 blur-[120px] rounded-full pointer-events-none animate-pulse duration-[10000ms]"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-purple-400/10 blur-[120px] rounded-full pointer-events-none animate-pulse duration-[12000ms]"></div>
      <div className="absolute inset-0 bg-white/40 pointer-events-none" />
    </div>
  )
});

export default function DynamicThreeScene() {
  return <ThreeScene />;
}
