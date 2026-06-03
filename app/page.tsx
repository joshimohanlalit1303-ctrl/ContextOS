import Hero from "@/sections/Hero";
import ProofBar from "@/sections/ProofBar";
import Features from "@/sections/Features";
import HowItWorks from "@/sections/HowItWorks";
import UseCases from "@/sections/UseCases";
import Showcase from "@/sections/Showcase";
import Pricing from "@/sections/Pricing";
import CTABanner from "@/sections/CTABanner";
import { getUserCount } from "@/app/actions/get-user-count";

export default async function Home() {
  const userCount = await getUserCount();

  return (
    <>
      <Hero userCount={userCount} />
      <div className="bg-3d-grid-container relative">
        <ProofBar />
        <Features />
        <Showcase />
        <HowItWorks />
        <UseCases />
        <Pricing />
        <CTABanner userCount={userCount} />
      </div>
    </>
  );
}
