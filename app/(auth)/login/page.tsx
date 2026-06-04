import { login, signup } from './actions'
import { MoveLeft } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error: string }
}) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md px-8 z-10">
        <Link href="/" className="inline-flex items-center text-sm text-neutral-400 hover:text-white mb-8 transition-colors">
          <MoveLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>
        
        <div className="mb-10">
          <h1 className="text-3xl font-light mb-2">Welcome to Libro</h1>
          <p className="text-neutral-400">Sign in to manage your API keys</p>
        </div>

        <form className="flex flex-col gap-4">
          <div className="space-y-1">
            <label className="text-sm text-neutral-400 pl-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-colors"
              placeholder="you@example.com"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm text-neutral-400 pl-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {searchParams?.error && (
            <p className="text-red-400 text-sm mt-2 text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">
              {searchParams.error}
            </p>
          )}

          <div className="flex flex-col gap-3 mt-6">
            <button
              formAction={login}
              className="w-full bg-white text-black font-medium rounded-2xl px-4 py-3 hover:bg-neutral-200 transition-colors"
            >
              Log In
            </button>
            <button
              formAction={signup}
              className="w-full bg-transparent border border-white/20 text-white font-medium rounded-2xl px-4 py-3 hover:bg-white/5 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
