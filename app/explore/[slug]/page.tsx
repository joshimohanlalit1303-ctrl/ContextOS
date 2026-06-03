import { notFound } from "next/navigation";
import { exploreData } from "@/lib/data/explore";
import CTABanner from "@/sections/CTABanner";
import { getUserCount } from "@/app/actions/get-user-count";

export async function generateStaticParams() {
  return Object.keys(exploreData).map((slug) => ({ slug }));
}

export default async function ExplorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = exploreData[slug];

  if (!data) {
    notFound();
  }

  const userCount = await getUserCount();

  return (
    <main className="min-h-screen bg-bg relative pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-6 mb-24">
        {/* Hero Section */}
        <div className="mb-16 border-b border-white/5 pb-12">
          <p className="font-mono text-accent text-sm tracking-widest uppercase mb-4">
            Use Case Showcase
          </p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
            {data.title}
          </h1>
          <p className="text-xl text-muted max-w-2xl leading-relaxed">
            {data.subtitle}
          </p>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="prose prose-invert max-w-none">
            <h3 className="text-2xl font-semibold mb-4 text-white">How it works</h3>
            <p className="text-muted text-lg leading-relaxed">
              {data.description}
            </p>
            <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <h4 className="text-white font-medium mb-2 mt-0">Zero infrastructure required.</h4>
              <p className="text-sm text-muted mb-0">
                ContextOS handles the embeddings, vector storage, and semantic retrieval entirely on the edge. You just pass in strings.
              </p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d12] shadow-2xl sticky top-32">
            <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex gap-2 items-center">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
              <span className="text-xs text-muted font-mono ml-2">{slug}-integration.ts</span>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="text-sm font-mono text-emerald-400 leading-relaxed">
                <code>{data.codeSnippet}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 bg-bg">
        <CTABanner userCount={userCount} />
      </div>
    </main>
  );
}
