'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Briefcase, ArrowRight } from 'lucide-react'

export default function SigninChoicePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
        {/* Candidate Choice */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 cursor-pointer flex flex-col items-center text-center group"
          onClick={() => window.location.href = 'https://candidate.optiohire.com/auth/signin'}
        >
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors">
            <User className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 font-figtree">Job Seeker Login</h2>
          <p className="text-slate-600 mb-8 font-figtree">Access your profile, track applications, and manage your career growth.</p>
          <button className="mt-auto flex items-center gap-2 text-green-600 font-semibold group-hover:gap-3 transition-all">
            Sign In <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* HR Choice */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 cursor-pointer flex flex-col items-center text-center group"
          onClick={() => window.location.href = 'https://console.optiohire.com/auth/signin'}
        >
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#2D2DDD] transition-colors">
            <Briefcase className="w-8 h-8 text-[#2D2DDD] group-hover:text-white transition-colors" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 font-figtree">Employer Login</h2>
          <p className="text-slate-600 mb-8 font-figtree">Manage your dashboard, review candidates, and make hiring decisions.</p>
          <button className="mt-auto flex items-center gap-2 text-[#2D2DDD] font-semibold group-hover:gap-3 transition-all">
            Sign In <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
