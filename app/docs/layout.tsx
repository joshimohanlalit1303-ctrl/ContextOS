"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { docsNavigation } from '@/lib/data/docs';
import clsx from 'clsx';
import 'highlight.js/styles/github-dark.css'; // Changed to a dark theme for hljs

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/10 hidden md:block fixed h-screen overflow-y-auto pt-24 pb-12 px-6 no-scrollbar bg-[#0a0a0a]">
        <nav className="space-y-8">
          {docsNavigation.map((section, idx) => (
            <div key={idx}>
              <h4 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4">
                {section.section}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link, i) => {
                  const href = `/docs/${link.slug}`;
                  const isActive = pathname === href;
                  return (
                     <li key={i}>
                      <Link 
                        href={href} 
                        className={clsx(
                          "block text-[14px] transition-colors py-1",
                          isActive 
                            ? "text-indigo-400 font-semibold" 
                            : "text-gray-500 hover:text-white"
                        )}
                      >
                        {link.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pt-24 pb-24 px-8 md:px-16 max-w-4xl bg-[#050505]">
        {children}
      </main>
    </div>
  );
}
