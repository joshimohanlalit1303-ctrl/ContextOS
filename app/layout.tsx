import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import clsx from "clsx";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://libro.dev"),
  title: {
    template: "%s | Libro",
    default: "Libro - The User Context Layer For AI Applications",
  },
  description: "Transform conversations into structured, evolving user understanding. Build AI agents with infinite memory using our zero-cost local vectorization, semantic deduplication, and drop-in SDK.",
  keywords: ["AI Memory", "Vector Database", "RAG Architecture", "LLM Context", "Semantic Chunking", "Libro", "AI Agents", "Context Window"],
  authors: [{ name: "Libro Team" }],
  creator: "Libro",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://libro.dev",
    title: "Libro - The Brain for AI Agents",
    description: "Build AI applications that actually remember your users. Drop-in infinite memory SDK with local embeddings, semantic chunking, and full privacy compliance.",
    siteName: "Libro",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Libro - User Context Layer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Libro - Memory for AI",
    description: "The User Context Layer for modern AI apps. Infinite memory, zero pipeline changes.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={clsx(inter.className, "min-h-screen bg-background antialiased selection:bg-primary selection:text-primary-foreground")}>
        <SmoothScroll>
          <Navbar />
          {children}
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
