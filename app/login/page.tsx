import Link from "next/link";
import { signInWithGithub } from "./actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const resolvedParams = await searchParams;
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg relative overflow-hidden">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-muted hover:text-white transition-colors z-10 text-sm">
        Back to Home
      </Link>

      <div className="relative z-10 w-full max-w-md p-8">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6">
            <span className="font-bold text-3xl text-white tracking-tighter drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">ContextOS</span>
          </Link>
          <h1 className="text-2xl font-semibold text-white mb-2">Welcome back</h1>
          <p className="text-muted text-sm">Sign in to your developer dashboard.</p>
        </div>

        {resolvedParams?.message && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {resolvedParams.message}
          </div>
        )}

        <div className="flex flex-col gap-4 mt-8">
          <form action={signInWithGithub}>
            <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg bg-[#24292e] text-white hover:bg-[#2f363d] transition-colors border border-[#1b1f23]/20 font-medium text-[15px] shadow-[0_0_20px_rgba(36,41,46,0.5)]">
              Continue with GitHub
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
