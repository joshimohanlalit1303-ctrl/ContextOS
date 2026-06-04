import HeroCinematic from "@/sections/HeroCinematic";
import NarrativeJourney from "@/sections/NarrativeJourney";
import { getUserCount } from "@/app/actions/get-user-count";
import DynamicThreeScene from "@/components/DynamicThreeScene";

export default async function Home() {
  const userCount = await getUserCount();

  return (
    <div className="bg-[#f5f5f7] min-h-screen selection:bg-black selection:text-white relative">
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0"></div>
      <DynamicThreeScene />
      
      <div className="relative z-10 w-full">
        <HeroCinematic />
        <NarrativeJourney />
      </div>
    </div>
  );
}
