import Link from 'next/link';
import { Home, Briefcase, UserPlus, Search, ArrowRight, Sparkles } from 'lucide-react';

export const metadata = {
  title: '404 – Page Not Found | OptioHire',
  description: 'The page you are looking for could not be found. Browse jobs, sign up, or return home.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden px-4">
      
      {/* Decorative animated blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 opacity-10 rounded-full filter blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-500 opacity-10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/3 right-10 w-64 h-64 bg-indigo-500 opacity-10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '0.75s' }} />

      <div className="relative z-10 w-full max-w-2xl text-center">

        {/* 404 Giant Number */}
        <div className="relative mb-4">
          <p className="text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-400 to-indigo-400 leading-none select-none tracking-tighter">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Sparkles className="w-10 h-10 text-yellow-400 opacity-80 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
          Oops! This page got lost in the hiring process.
        </h1>

        {/* Subtext */}
        <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
          The page you're looking for doesn't exist or has been moved. But don't worry — great opportunities are just one click away.
        </p>

        {/* CTA Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">

          {/* Home Button */}
          <Link
            href="/"
            className="group flex flex-col items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/60 rounded-2xl p-6 text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
              <Home className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-base">Go Home</p>
              <p className="text-slate-400 text-sm mt-1">Back to the OptioHire homepage with all our features and info.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
          </Link>

          {/* Browse Jobs Button */}
          <Link
            href="/jobs"
            className="group flex flex-col items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-400/60 rounded-2xl p-6 text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(45,212,191,0.15)] hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center group-hover:bg-teal-500/30 transition-colors">
              <Briefcase className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <p className="font-semibold text-base">Browse Jobs</p>
              <p className="text-slate-400 text-sm mt-1">Discover hundreds of top roles across tech, health, sales & more.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-teal-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
          </Link>

          {/* Sign Up Button */}
          <Link
            href="/auth/options?mode=signup"
            className="group flex flex-col items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-400/60 rounded-2xl p-6 text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
              <UserPlus className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="font-semibold text-base">Join OptioHire</p>
              <p className="text-slate-400 text-sm mt-1">Sign up free and get matched with the best jobs or top talent instantly.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
          </Link>

        </div>

        {/* Search bar hint */}
        <div className="mt-10 flex items-center justify-center gap-2 text-slate-500 text-sm">
          <Search className="w-4 h-4" />
          <span>Looking for something specific? Try <Link href="/jobs" className="text-blue-400 hover:underline font-medium">searching our job board</Link>.</span>
        </div>

        {/* Brand footer */}
        <div className="mt-14 flex items-center justify-center gap-2 opacity-50">
          <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
            <span className="text-white text-xs font-black">O</span>
          </div>
          <span className="text-slate-400 text-sm font-medium">OptioHire – AI-Powered Hiring</span>
        </div>

      </div>
    </div>
  );
}
