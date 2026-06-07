import Link from "next/link";
import { signInWithGithub, signInWithGoogle, signInWithMagicLink } from "./actions";
import { Logo } from "@/components/Logo";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const resolvedParams = await searchParams;
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#fafafa] selection:bg-black selection:text-white">
      {/* Background glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-400/20 blur-[120px] rounded-full pointer-events-none animate-pulse duration-[10000ms]"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-purple-400/10 blur-[120px] rounded-full pointer-events-none animate-pulse duration-[12000ms]"></div>

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-black transition-colors z-20 text-sm font-semibold group">
        <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Back to Home
      </Link>

      <div className="relative z-10 w-full max-w-[420px] p-4">
        <div className="bg-white/70 border border-gray-200/60 rounded-3xl p-10 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none"></div>

          <div className="text-center mb-10 relative z-10">
            <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black text-white shadow-xl mb-6 hover:scale-105 transition-transform">
              <Logo className="w-8 h-8 text-white" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Get Started Free</h1>
            <p className="text-gray-500 font-medium text-sm">Sign in to your developer dashboard — no waitlist.</p>
          </div>

          {resolvedParams?.message && (
            <div className={`mb-8 p-4 rounded-xl text-sm font-medium text-center relative z-10 animate-in fade-in slide-in-from-top-2 ${resolvedParams.message.includes('magic link') || resolvedParams.message.includes('Check') ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-red-50 border border-red-100 text-red-600'}`}>
              {resolvedParams.message}
            </div>
          )}

          <div className="flex flex-col gap-3 relative z-10">
            {/* GitHub */}
            <form action={signInWithGithub}>
              <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-black text-white hover:bg-gray-900 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 transition-all font-semibold text-[15px] group">
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                </svg>
                Continue with GitHub
              </button>
            </form>

            {/* Google */}
            <form action={signInWithGoogle}>
              <button className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-md transition-all font-semibold text-[15px] group">
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </form>

            <div className="flex items-center gap-4 my-1">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">or</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            {/* Magic Link */}
            <form action={signInWithMagicLink} className="flex flex-col gap-3">
              <div className="relative">
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Enter your email" 
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all sm:text-[15px]"
                />
              </div>
              <button className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:shadow-sm transition-all font-semibold text-[15px]">
                Send Magic Link
              </button>
            </form>
          </div>
          
          <div className="mt-8 text-center relative z-10">
             <p className="text-xs text-gray-400 font-medium max-w-[250px] mx-auto leading-relaxed">
               By signing in, you agree to Libro&apos;s Terms of Service and Privacy Policy.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
