"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const productLinks = [
  { label: "Docs", href: "/docs" },
  { label: "API Reference", href: "/docs#quickstart" },
  { label: "Changelog", href: "#" },
  { label: "Status", href: "#" }
];
const companyLinks = [
  { label: "About", href: "/about" },
  { label: "GitHub", href: "https://github.com/libro" }
];
const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Security", href: "/security" }
];

export default function Footer() {
  const pathname = usePathname() || "";
  const isDocs = pathname.startsWith("/docs");

  return (
    <footer className={clsx("relative z-10 w-full border-t border-gray-200/50 bg-white/70 backdrop-blur-2xl py-12 px-6 mt-20", isDocs && "md:ml-64")}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold text-xl text-black tracking-tighter">
                Libro
              </span>
            </Link>
            <p className="text-gray-500 text-sm mt-2 font-medium">
              Memory infrastructure for the AI era.
            </p>
          </div>

          <div>
            <h4 className="text-black font-semibold mb-4 text-sm">Product</h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-500 text-sm hover:text-black transition-colors font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-black font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-500 text-sm hover:text-black transition-colors font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-black font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-500 text-sm hover:text-black transition-colors font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-6 flex justify-between items-center text-xs text-gray-400 font-medium tracking-wide">
          <p>© 2025 Libro</p>
          <p>Built for AI</p>
        </div>
      </div>
    </footer>
  );
}
