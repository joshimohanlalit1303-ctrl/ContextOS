import HeroCinematic from "@/sections/HeroCinematic";
import NarrativeJourney from "@/sections/NarrativeJourney";
import UseCases from "@/sections/UseCases";
import { getUserCount } from "@/app/actions/get-user-count";
import DynamicThreeScene from "@/components/DynamicThreeScene";

export default async function Home() {
  const userCount = await getUserCount();

  return (
    <div className="bg-[#050505] min-h-screen selection:bg-white selection:text-black relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0 opacity-20"></div>
      <DynamicThreeScene />
      
      <div className="relative z-10 w-full">
        <HeroCinematic />
        <NarrativeJourney />
        <UseCases />
        <SemanticSEO />
      </div>
    </div>
  );
}

function SemanticSEO() {
  return (
    <section aria-label="About Libro AMM Layer" className="max-w-5xl mx-auto px-6 py-12 text-gray-500/60 text-xs border-t border-white/5 mt-10">
      <h3 className="font-semibold mb-2 text-gray-400/70">The Open-Source AMM Layer and Vector Memory Engine</h3>
      <p className="mb-2 leading-relaxed">
        Libro is designed for engineers building advanced AI agents and modern LLM applications. Instead of provisioning traditional vector databases like Pinecone, or piecing together complex RAG architectures with Langchain, Libro serves as a fully integrated AI Memory Management (AMM) layer. 
      </p>
      <p className="leading-relaxed">
        Our core infrastructure features zero-latency edge embeddings, automated semantic chunking, multilingual vectorization, and GDPR-compliant data sovereignty. Add infinite, persistent context to Claude, OpenAI, or any Anthropic model with our free SDK.
      </p>
    </section>
  )
}
