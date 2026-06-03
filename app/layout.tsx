import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import clsx from "clsx";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | ContextOS",
    default: "ContextOS - The User Context Layer For AI Applications",
  },
  description: "Transform conversations into structured, evolving user understanding with 0-cost local vectorization, 50+ languages support, and infinite semantic chunking.",
  keywords: ["AI", "Context", "LLM", "Vector Database", "RAG", "Embeddings", "ContextOS", "Memory"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://contextos.dev",
    title: "ContextOS - User Context Layer",
    description: "Build AI applications that actually remember your users. Local embeddings, semantic chunking, and full GDPR compliance.",
    siteName: "ContextOS",
  },
  twitter: {
    card: "summary_large_image",
    title: "ContextOS",
    description: "The User Context Layer for modern AI apps.",
  },
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={clsx(inter.className, "min-h-screen bg-background antialiased selection:bg-primary selection:text-primary-foreground")}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
