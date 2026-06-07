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
      </div>
    </div>
  );
}
