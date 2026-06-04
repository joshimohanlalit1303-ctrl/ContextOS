import Link from "next/link";
import { signInWithGithub } from "./actions";
import { Logo } from "@/components/Logo";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const resolvedParams = await searchParams;
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#fafafa] selection:bg-black selection:text-white">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-400/20 blur-[120px] rounded-full pointer-events-none animate-pulse duration-[10000ms]"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-purple-400/10 blur-[120px] rounded-full pointer-events-none animate-pulse duration-[12000ms]"></div>

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-black transition-colors z-20 text-sm font-semibold group">
        <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Back to Home
      </Link>

      <div className="relative z-10 w-full max-w-[420px] p-4">
        <div className="glass bg-white/70 border border-gray-200/60 rounded-3xl p-10 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
          {/* Shine effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none"></div>

          <div className="text-center mb-10 relative z-10">
            <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black text-white shadow-xl mb-6 hover:scale-105 transition-transform">
              <Logo className="w-8 h-8 text-white" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-500 font-medium text-sm">Sign in to your developer dashboard.</p>
          </div>

          {resolvedParams?.message && (
            <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center relative z-10 animate-in fade-in slide-in-from-top-2">
              {resolvedParams.message}
            </div>
          )}

          <div className="flex flex-col gap-4 relative z-10">
            <form action={signInWithGithub}>
              <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-black text-white hover:bg-gray-900 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 transition-all font-semibold text-[15px] group">
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                </svg>
                Continue with GitHub
              </button>
            </form>
          </div>
          
          <div className="mt-8 text-center relative z-10">
             <p className="text-xs text-gray-400 font-medium max-w-[250px] mx-auto leading-relaxed">
               By signing in, you agree to Libro's Terms of Service and Privacy Policy.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
