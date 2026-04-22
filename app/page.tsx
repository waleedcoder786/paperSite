'use client';
import React from 'react';
import { 
  PlayCircle, 
  Lock, 
  UserPlus, 
  Info, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';
import { useRouter } from "next/navigation";

export default function CreativeTestMaker() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-[#0b0f1a] flex items-center justify-center p-0 sm:p-4 md:p-8 font-sans overflow-x-hidden relative bg-center bg-cover"
      style={{ backgroundImage: "url('https://img.sanishtech.com/u/30b626bb602e6a23377f720c2e48c3fa.png')" }}
    >
      
      {/* 1. AMBIENT BACKGROUND GLOWS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-xl blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-xl blur-[120px] pointer-events-none" />

      {/* 2. MAIN CONTAINER */}
      <div className="relative z-10 w-full max-w-7xl min-h-screen sm:min-h-0 sm:h-[90vh] md:h-[85vh] bg-[#161b2a]/70 backdrop-blur-2xl sm:rounded-xl shadow-[0_32px_120px_-20px_rgba(0,0,0,0.8)] overflow-hidden border-none sm:border border-white/10 flex flex-col">
        
        {/* TOP NAVBAR */}
        <nav className="flex justify-between items-center px-6 md:px-10 py-5 sm:py-6 bg-transparent flex-shrink-0 border-b border-white/5">
          <div className="flex items-center gap-3">
             <span className="text-white font-black tracking-tighter text-xl uppercase">
               TEST MIND<span className="text-amber-500">.</span>
             </span>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-8">
            <button 
              className="text-slate-400 hover:text-white transition-all font-bold text-[10px] sm:text-xs uppercase tracking-widest" 
              onClick={()=> router.push('/auth/login')}
            >
              Sign In
            </button>
            <button 
              onClick={()=> router.push('/auth/signup') } 
              className="bg-white text-slate-900 px-4 py-2 sm:px-7 sm:py-3 rounded-lg sm:rounded-lg font-black hover:bg-amber-500 hover:text-white transition-all shadow-xl text-[10px] sm:text-xs uppercase tracking-widest"
            >
              Get Access
            </button>
          </div>
        </nav>

        {/* CONTENT AREA */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">
          
          {/* LEFT SECTION: HERO */}
          <div className="flex-1 p-8 sm:p-12 lg:px-20 flex flex-col justify-center space-y-8 sm:space-y-10 relative border-b lg:border-b-0 lg:border-r border-white/5">
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none grayscale"
              style={{ 
                backgroundImage: "url('https://img.sanishtech.com/u/9e451a8226d589c08220048bbcf5eac9.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />

            <div className="space-y-2 relative z-10">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white  mt-20 uppercase tracking-tighter">
                TEST MIND<span className="text-amber-500">.</span> <br /> 
              </h1>
              <p className="text-slate-400 text-base sm:text-lg lg:text-xl max-w-md font-medium leading-relaxed">
                Experience the fastest way to transform your syllabus into structured assessments with institutional precision.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 relative z-10">
              <button 
                className="group bg-amber-500 text-white px-8 py-4 rounded-xl sm:rounded-xl font-black text-base sm:text-lg hover:bg-amber-400 transition-all shadow-[0_20px_50px_rgba(245,158,11,0.3)] flex items-center justify-center gap-3" 
                onClick={() => router.push('/auth/signup')}
              >
                Create Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl sm:rounded-xl font-black text-base sm:text-lg hover:bg-white/10 transition-all backdrop-blur-md" 
                onClick={()=> window.open('https://www.youtube.com/watch?v=uXJEuA0eX8A', '_blank')} 
              >
                Watch Demo 
                <PlayCircle className="w-5 h-5 text-amber-400" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-10 border-t border-white/5 relative z-10">
                <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Enterprise Security
                </div>
                <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <Sparkles className="w-4 h-4 text-amber-500" /> AI Optimization
                </div>
            </div>
          </div>

          {/* RIGHT SECTION: TILES */}
          <div className="flex-1 bg-white/[0.02] p-8 sm:p-12 lg:p-16 flex items-center justify-center relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg relative z-10">
              
              {/* Login Card */}
              <div className="group  sm:h-48 lg:h-36 bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl flex flex-col justify-between shadow-2xl transition-all hover:-translate-y-2 cursor-pointer" onClick={() => router.push('/auth/login')}>
                <Lock className="w-10 h-10 text-white/90" strokeWidth={1.5} />
                <span className="text-white font-black text-2xl lg:text-3xl tracking-tighter uppercase">Login</span>
              </div>
              
              {/* Signup Card */}
              <div className="group  sm:h-48 lg:h-36 bg-slate-800/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col justify-between shadow-2xl transition-all hover:-translate-y-2 cursor-pointer hover:border-amber-500/50" onClick={() => router.push('/auth/signup')}>
                <UserPlus className="w-10 h-10 text-amber-400" strokeWidth={1.5} />
                <span className="text-white font-black text-2xl lg:text-3xl tracking-tighter uppercase">Signup</span>
              </div>

              {/* Information Card */}
              <div className="group  sm:h-48 lg:h-36 bg-slate-800/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col justify-between shadow-2xl transition-all hover:-translate-y-2 cursor-pointer hover:border-blue-400/50" onClick={() => window.open('https://creativetestmaker.com/ctm-octa/index', '_blank')}>
                <Info className="w-10 h-10 text-blue-400" strokeWidth={1.5} />
                <span className="text-white font-black text-2xl lg:text-3xl tracking-tighter uppercase">Guide</span>
              </div>

              {/* Demo Video Card */}
              <div className="relative group  sm:h-48 lg:h-36 rounded-2xl overflow-hidden shadow-2xl transition-all hover:-translate-y-2 cursor-pointer" onClick={() => window.open('https://www.youtube.com/watch?v=uXJEuA0eX8A', '_blank')}>
                <img 
                  src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&q=80&w=400" 
                  className="absolute inset-0 w-full h-full object-cover brightness-[0.3] group-hover:scale-110 transition-transform duration-700"
                  alt="Demo"
                />
                <div className="relative h-full p-6 flex flex-col justify-between z-10">
                  <PlayCircle className="w-10 h-10 text-white fill-white/10" />
                  <span className="text-white font-black text-2xl lg:text-3xl tracking-tighter uppercase">Demo</span>
                </div>
              </div>
            </div>
            
            {/* Dotted Grid Decoration */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" 
                 style={{ backgroundImage: `radial-gradient(white 1px, transparent 1px)`, backgroundSize: '24px 24px' }}></div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="w-full flex flex-col sm:flex-row justify-between items-center px-8 sm:px-12 py-6 bg-black/40 border-t border-white/5 text-[8px] sm:text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black gap-4 sm:gap-0">
          <div>© 2026 Creative Developers Pakistan</div>
          <div className="flex gap-6 sm:gap-8">
            <span className="hover:text-amber-500 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-amber-500 cursor-pointer transition-colors">Terms</span>
          </div>
        </footer>
      </div>
    </div>
  );
}