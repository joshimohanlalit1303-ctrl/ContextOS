import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 w-full">
      <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
      <p className="text-muted text-sm font-medium animate-pulse">Loading data...</p>
    </div>
  );
}
