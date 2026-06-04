"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import Link from "next/link";
import clsx from "clsx";
import { Logo } from "./Logo";

const navLinks = [
  { label: "Developers", href: "/#developers" },
  { label: "Use Cases", href: "/#use-cases" },
  { label: "Docs", href: "/docs" },
];

const GithubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function Navbar() {
  return (
    <LazyMotion features={domAnimation}>
      <m.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 inset-x-0 z-50 transition-colors duration-300 pointer-events-none"
      >
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border-b border-gray-200" />
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between pointer-events-auto relative z-10">
          
          {/* Left: Logo & Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Logo className="w-6 h-6 text-black" />
              <span className="font-bold text-xl text-black tracking-tighter">Libro</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-[14px] text-gray-500 hover:text-black transition-colors rounded-md hover:bg-gray-100 font-medium tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-6">
            <Link
              href="https://github.com/libro"
              target="_blank"
              className="flex items-center gap-2 text-[13px] text-gray-500 hover:text-black uppercase tracking-wide transition-colors font-medium whitespace-nowrap"
            >
              <GithubIcon />
              <span className="hidden md:inline-block">GitHub</span>
            </Link>
            <Link
              href="/#waitlist"
              className="px-5 py-2 bg-black text-white text-[13px] font-semibold rounded shadow-md hover:shadow-lg transition-all uppercase tracking-wide whitespace-nowrap"
            >
              Join Waitlist
            </Link>
          </div>

        </div>
      </m.header>
    </LazyMotion>
  );
}
