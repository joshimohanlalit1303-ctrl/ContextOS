import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.libro.co.in"),
  title: {
    template: "%s | Libro",
    default: "Libro - The Best Free AMM (AI Memory Management) Layer",
  },
  description: "The ultimate free AMM Layer for AI Applications. Transform conversations into structured, evolving user understanding. Build AI agents with infinite memory using our zero-cost local vectorization, semantic deduplication, and drop-in SDK.",
  keywords: ["AMM Layer", "AI Memory Management", "Best Free AMM", "AI Memory", "Vector Database", "RAG Architecture", "LLM Context", "Semantic Chunking", "Libro", "AI Agents", "Context Window", "Pinecone Alternative", "Langchain Alternative", "Vector Search", "Developer Tools", "Open Source AI"],
  authors: [{ name: "Libro Team" }],
  creator: "Libro",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.libro.co.in",
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

import Script from "next/script";
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Libro AMM Layer",
                "applicationCategory": "DeveloperApplication",
                "operatingSystem": "Web",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "description": "Libro is the best free AMM (AI Memory Management) Layer for AI applications. Add infinite memory to your AI agents with zero pipeline changes. An alternative to complex Pinecone or Langchain setups."
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Libro",
                "url": "https://www.libro.co.in",
                "logo": "https://www.libro.co.in/logo.png",
                "sameAs": [
                  "https://github.com/joshimohanlalit1303-ctrl/ContextOS",
                  "https://twitter.com/libro_ai"
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Libro",
                "url": "https://www.libro.co.in",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://www.libro.co.in/explore/{search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              }
            ])
          }}
        />

        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-TMM4LXTKJ2`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-TMM4LXTKJ2');
            `,
          }}
        />
      </head>
      <body className={clsx(inter.className, "min-h-screen bg-background antialiased selection:bg-primary selection:text-primary-foreground")}>
        <SmoothScroll>
          <Navbar />
          {children}
          <Footer />
          <Analytics />
        </SmoothScroll>
      </body>
    </html>
  );
}
