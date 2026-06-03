import { Check } from "lucide-react";

export default function Pricing() {
  return (
    <section id="pricing" className="py-28 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <p className="font-mono text-xs text-accent tracking-widest mb-4">PRICING</p>
        <h2 className="text-4xl md:text-[48px] font-bold text-white tracking-tight">Pay for what you remember.</h2>
        <p className="text-muted mt-4 text-lg">No massive DB instances. Just raw compute and storage.</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
        <div className="bg-card border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-colors">
          <h3 className="text-xl text-white font-medium tracking-tight">Hobby</h3>
          <p className="text-muted text-sm mt-2">For personal projects.</p>
          <div className="my-6">
            <span className="text-4xl font-bold text-white tracking-tight">$0</span><span className="text-muted">/mo</span>
          </div>
          <ul className="space-y-4 mb-8 text-sm text-white/70">
            <li className="flex items-center gap-3"><Check className="w-4 h-4 text-accent" /> 10,000 reqs/mo</li>
            <li className="flex items-center gap-3"><Check className="w-4 h-4 text-accent" /> 50MB Storage</li>
            <li className="flex items-center gap-3"><Check className="w-4 h-4 text-accent" /> Community Support</li>
          </ul>
          <button className="w-full py-2.5 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors font-medium">Get Started</button>
        </div>

        <div className="bg-[#100b1a] border border-accent/30 rounded-2xl p-8 relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(236,72,153,0.1)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-accent to-purple-500 text-white px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(236,72,153,0.4)]">Most Popular</div>
          <h3 className="text-xl text-white font-medium tracking-tight">Pro</h3>
          <p className="text-muted text-sm mt-2">For scaling applications.</p>
          <div className="my-6">
            <span className="text-4xl font-bold text-white tracking-tight">$29</span><span className="text-muted">/mo</span>
          </div>
          <ul className="space-y-4 mb-8 text-sm text-white/90">
            <li className="flex items-center gap-3"><Check className="w-4 h-4 text-accent" /> 500,000 reqs/mo</li>
            <li className="flex items-center gap-3"><Check className="w-4 h-4 text-accent" /> 5GB Storage</li>
            <li className="flex items-center gap-3"><Check className="w-4 h-4 text-accent" /> Priority Support</li>
            <li className="flex items-center gap-3"><Check className="w-4 h-4 text-accent" /> Metadata Indexing</li>
          </ul>
          <button className="w-full py-2.5 bg-accent rounded-lg text-white font-medium shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] hover:brightness-110 transition-all">Upgrade to Pro</button>
        </div>

        <div className="bg-card border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-colors">
          <h3 className="text-xl text-white font-medium tracking-tight">Enterprise</h3>
          <p className="text-muted text-sm mt-2">For massive scale.</p>
          <div className="my-6">
            <span className="text-4xl font-bold text-white tracking-tight">Custom</span>
          </div>
          <ul className="space-y-4 mb-8 text-sm text-white/70">
            <li className="flex items-center gap-3"><Check className="w-4 h-4 text-accent" /> Unlimited Reqs</li>
            <li className="flex items-center gap-3"><Check className="w-4 h-4 text-accent" /> Dedicated Edge Nodes</li>
            <li className="flex items-center gap-3"><Check className="w-4 h-4 text-accent" /> SLA 99.99%</li>
            <li className="flex items-center gap-3"><Check className="w-4 h-4 text-accent" /> SOC2 Compliance</li>
          </ul>
          <button className="w-full py-2.5 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors font-medium">Contact Sales</button>
        </div>
      </div>
    </section>
  );
}
