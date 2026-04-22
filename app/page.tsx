'use client';
import React from 'react';
import { 
  PlayCircle, 
  Lock, 
  UserPlus, 
  Info, 
  ArrowRight, 
  Feather, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';
import { useRouter } from "next/navigation";

export default function CreativeTestMaker() {
  const router = useRouter();

  return (
    <div className="h-screen w-screen bg-[#0b0f1a] flex items-center justify-center p-4 md:p-8 font-sans overflow-hidden relative  bg-center bg-cover"
      style={{ backgroundImage: "url('https://img.sanishtech.com/u/30b626bb602e6a23377f720c2e48c3fa.png')" }}
    
    >
      
      {/* 1. AMBIENT BACKGROUND GLOWS (VIP FEEL) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-xl blur-[120px]" />

      {/* 2. MAIN VIP CONTAINER */}
      <div className="relative z-10 w-full max-w-7xl h-full max-h-[85vh] bg-[#161b2a]/60 backdrop-blur-2xl rounded-xl shadow-[0_32px_120px_-20px_rgba(0,0,0,0.8)] overflow-hidden border border-white/10 flex flex-col">
        
        {/* TOP NAVBAR */}
        <nav className="flex justify-between items-center px-10 py-2 bg-transparent flex-shrink-0 border-b border-white/5">
          <div className="flex items-center gap-3">
            
            {/* <span className="text-white font-black tracking-tighter text-xl uppercase">Test Mind <span className="text-amber-500">.</span> */}
            {/* </span> */}
          </div>
          
          <div className="flex items-center gap-8">
            <button 
              className="text-slate-400 hover:text-white transition-all font-bold text-xs uppercase tracking-widest" 
              onClick={()=> router.push('/auth/login')}
            >
              Sign In
            </button>
            <button 
              onClick={()=> router.push('/auth/signup') } 
              className="bg-white text-slate-900 px-7 py-3 rounded-xl font-black hover:bg-amber-500 hover:text-white transition-all shadow-xl text-xs uppercase tracking-widest"
            >
              Get Access
            </button>
          </div>
        </nav>

        {/* CONTENT AREA */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* LEFT SECTION: BRANDING & HERO */}
          <div className="flex-1 p-5 lg:px-20 flex flex-col justify-center space-y-10 relative">
            {/* Faded Background Image to match the Dark Academic theme */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none grayscale"
              style={{ 
                backgroundImage: "url('https://img.sanishtech.com/u/9e451a8226d589c08220048bbcf5eac9.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />

            {/* <div className="space-y-4 relative z-10"> */}
              
              <h1 className="text-2xl lg:text-6xl mt-20 font-black text-white  ">
                TEST MIND . <br /> 
                {/* <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 italic font-serif">TESTMIND.</span> */}
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-md font-medium leading-relaxed">
Experience the fastest way to transform your syllabus into structured assessments
              </p>
            {/* </div> */}

            <div className="flex flex-col sm:flex-row gap-5 relative z-10">
              <button 
                className="group bg-amber-500 text-white p-3  rounded-2xl font-black text-lg hover:bg-amber-400 transition-all shadow-[0_20px_50px_rgba(245,158,11,0.3)] flex items-center justify-center gap-3" 
                onClick={() => router.push('/auth/signup')}
              >
                Create Now
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white p-3 rounded-2xl font-black text-lg hover:bg-white/10 transition-all backdrop-blur-md" 
                onClick={()=> router.push('https://www.youtube.com/watch?v=uXJEuA0eX8A')} 
              >
                Watch Demo 
                <PlayCircle className="w-6 h-6 text-amber-400" />
              </button>
            </div>

            <div className="flex items-center gap-6 pt-10 border-t border-white/5 relative z-10">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Enterprise Security
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <Sparkles className="w-4 h-4 text-amber-500" /> AI Optimization
                </div>
            </div>
          </div>

          {/* RIGHT SECTION: INTERACTIVE GLASS TILES */}
          <div className="flex-1 bg-white/5 p-20 lg:p-20 flex items-center justify-center relative">
            <div className="grid grid-cols-2 gap-2  w-full max-w-lg relative z-10">
              
              {/* Login Card */}
              <div className="group h-full bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl  flex flex-col justify-between shadow-2xl transition-all hover:-translate-y-3 cursor-pointer" onClick={() => router.push('/auth/login')}>
                <Lock className="w-12 h-12 text-white/90" strokeWidth={1.5} />
                <span className="text-white font-black text-2xl tracking-tighter">Login</span>
              </div>
              
              {/* Signup Card */}
              <div className="group bg-slate-800/40 backdrop-blur-xl border border-white/10 p-3 rounded-xl  flex flex-col justify-between shadow-2xl transition-all hover:-translate-y-3 cursor-pointer hover:border-amber-500/50" onClick={() => router.push('/auth/signup')}>
                <UserPlus className="w-12 h-12 text-amber-400" strokeWidth={1.5} />
                <span className="text-white font-black text-2xl tracking-tighter">Signup</span>
              </div>

              {/* Information Card */}
              <div className="group bg-slate-800/40 backdrop-blur-xl border border-white/10 p-3 rounded-xl flex flex-col justify-between shadow-2xl transition-all hover:-translate-y-3 cursor-pointer hover:border-blue-400/50" onClick={() => router.push('https://creativetestmaker.com/ctm-octa/index')}>
                <Info className="w-12 h-12 text-blue-400" strokeWidth={1.5} />
                <span className="text-white font-black text-2xl tracking-tighter">Information</span>
              </div>

              {/* Demo Video Card */}
              <div className="relative group rounded-xl  overflow-hidden shadow-2xl transition-all hover:-translate-y-3 cursor-pointer" onClick={() => router.push('https://www.youtube.com/watch?v=uXJEuA0eX8A')}>
                <img 
                  src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&q=80&w=400" 
                  className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:scale-110 transition-transform duration-700"
                  alt="Demo"
                />
                <div className="relative h-full p-8 flex flex-col justify-between z-10">
                  <PlayCircle className="w-14 h-14 text-white fill-white/10" />
                  <span className="text-white font-black text-2xl tracking-tighter uppercase text-[14px]">Demo Video</span>
                </div>
              </div>
            </div>
            
            {/* Dotted Grid Decoration */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: `radial-gradient(white 1px, transparent 1px)`, backgroundSize: '30px 30px' }}></div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="w-full flex justify-between items-center px-12 py-6 bg-black/20 border-t border-white/5 text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black">
          <div>© 2026 Creative Developers Pakistan</div>
          <div className="flex gap-8">
            <span className="hover:text-amber-500 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-amber-500 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </footer>
      </div>
    </div>
  );
}