"use client";

import React, { useState, useRef } from "react";
import { joinWaitlist } from "@/app/actions/waitlist";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRouter } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

export default function WaitlistForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const containerRef = useRef(null);
  const router = useRouter();

  useGSAP(() => {
    gsap.from(containerRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
      },
      y: 50,
      opacity: 0,
      scale: 0.95,
      duration: 1,
      ease: "power3.out",
    });
  }, { scope: containerRef });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    
    const formData = new FormData(e.currentTarget);
    const result = await joinWaitlist(formData);

    if (result?.error) {
      setStatus("error");
      setMessage(result.error);
    } else if (result?.redirect) {
      router.push(result.redirect);
    } else if (result?.success) {
      setStatus("success");
      setMessage("You're on the list! We'll be in touch soon.");
    }
  };

  if (status === "success") {
    return (
      <div className="glass bg-green-50/50 border border-green-200/50 rounded-2xl p-6 text-center max-w-md mx-auto shadow-xl backdrop-blur-md animate-in fade-in zoom-in duration-500">
        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Requested</h3>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto relative group mt-8">
      {/* Sleek Technical Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400 rounded-2xl blur-sm opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-300 animate-pulse"></div>
      <form 
        onSubmit={handleSubmit} 
        className="relative glass bg-white/40 border border-white/60 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl flex flex-col gap-4"
      >
        <div className="space-y-3">
          <input 
            type="text" 
            name="name"
            required
            placeholder="Your Name"
            className="w-full px-4 py-3.5 bg-white/60 border border-white/80 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black sm:text-[15px] font-medium tracking-wide transition-all"
          />
          <input 
            type="email" 
            name="email"
            required
            placeholder="Work Email"
            className="w-full px-4 py-3.5 bg-white/60 border border-white/80 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black sm:text-[15px] font-medium tracking-wide transition-all"
          />
          <input 
            type="text" 
            name="company"
            placeholder="Company (Optional)"
            className="w-full px-4 py-3.5 bg-white/60 border border-white/80 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black sm:text-[15px] font-medium tracking-wide transition-all"
          />
          <textarea 
            name="useCase"
            placeholder="How do you plan to use Libro? (Optional)"
            rows={3}
            className="w-full px-4 py-3.5 bg-white/60 border border-white/80 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black sm:text-[15px] font-medium tracking-wide transition-all resize-none"
          />
        </div>
        <button 
          type="submit" 
          disabled={status === "loading"}
          className="w-full shrink-0 mt-2 bg-gradient-to-b from-gray-800 to-black text-white px-8 py-4 rounded-xl font-medium tracking-wide border border-black/50 hover:shadow-lg hover:from-gray-700 hover:to-black transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
        >
          {status === "loading" ? (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            "Request Early Access"
          )}
        </button>
      </form>
      {status === "error" && (
        <p className="absolute -bottom-8 left-0 right-0 text-center text-red-500 font-medium text-sm animate-in fade-in slide-in-from-top-2">
          {message}
        </p>
      )}
    </div>
  );
}
