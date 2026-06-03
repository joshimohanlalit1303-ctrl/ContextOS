"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";

const PixelTrail = dynamic(() => import("@/components/PixelTrail"), { ssr: false });

export default function CTABanner({ userCount = 74 }: { userCount?: number }) {
  return (
    <section className="relative py-24 px-6 bg-surface border-y border-white/5 overflow-hidden flex justify-center items-center min-h-[500px]">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-40">
        <PixelTrail
          gridSize={50}
          trailSize={0.1}
          maxAge={250}
          interpolate={5}
          color="#EC4899"
          className="opacity-50"
        />
      </div>
      
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-24 pb-32"
      >
        <h2 className="text-[40px] md:text-[64px] font-bold tracking-tight leading-[1.1] mb-6 text-white">
          Stop writing context logic.
          <br />
          <span className="text-muted font-light">Start building AI features.</span>
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center justify-center gap-4 mt-10"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link href="/login" className="bg-white text-black px-8 py-3.5 rounded-full text-[15px] font-medium hover:bg-white/90 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2">
              Get API Key
            </Link>
            <button className="border border-white/15 text-white px-8 py-3.5 rounded-full text-[15px] font-medium hover:bg-white/5 transition-colors">
              View Documentation
            </button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
