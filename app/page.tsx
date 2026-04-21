// 'use client';
// import React from 'react';
// import { PlayCircle, Lock, UserPlus, Info } from 'lucide-react'; // Using Lucide for clean icons
// import { useRouter } from "next/navigation";


// export default function CreativeTestMaker() {

//   const router = useRouter();


//   return (
//     // h-screen and overflow-hidden prevent the page from scrolling
//     <div className="h-screen w-screen bg-[#f3f4f6] flex items-center justify-center p-4 md:p-8 font-sans overflow-hidden">
      
//       {/* Main Container: h-full ensures it takes up available space without exceeding it */}
//       <div className="w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col">
        
//         {/* Top Navbar */}
//         <nav className="flex justify-end items-center gap-6 p-4 md:p-6 bg-white border-b border-gray-50 flex-shrink-0">
//           <button className="text-gray-600 hover:text-black transition-colors font-medium text-sm md:text-base" onClick={()=> router.push('/auth/login')}>Login</button>
//           <button onClick={()=> router.push('/auth/signup') } className="bg-[#3b82f6] text-white px-5 py-2 rounded-full font-semibold hover:bg-blue-600 transition-all shadow-md text-sm md:text-base">
//             Signup
//           </button>
//         </nav>

//         {/* Content Area: flex-1 allows this to expand to fill the middle space */}
//         <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
//           {/* Left Section: Branding & CTA */}
//           <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center space-y-6">
//             <div className="space-y-2">
//               <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
//                 Creative <br /> Test Maker.
//               </h1>
//               <p className="text-gray-500 text-base md:text-lg max-w-sm">
//                 Where ideas transform into insights.
//               </p>
//             </div>

//             <div className="flex flex-col gap-3 w-fit">
//               <button className="bg-[#3b82f6] text-white px-8 py-3 rounded-xl font-bold text-base md:text-lg hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-200" onClick={() => router.push('/auth/signup')}>
//                 Start Creating 
//               </button>
//               <button className="flex items-center justify-center gap-2 border-2 border-blue-400 text-blue-600 px-8 py-3 rounded-xl font-bold text-base md:text-lg hover:bg-blue-50 transition-all" onClick={()=> router.push('https://www.youtube.com/watch?v=uXJEuA0eX8A')} >
//                 Watch Demo 
//                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
//               </button>
//             </div>
//           </div>

//           {/* Right Section: Interactive Cards */}
//           <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-8 lg:p-16 flex flex-col justify-center items-center relative overflow-hidden">
//             {/* Abstract Decoration */}
//             <div className="absolute inset-0 opacity-5 pointer-events-none">
//               <svg width="100%" height="100%"><circle cx="20%" cy="20%" r="2" fill="black"/><path d="M0 0 L100 100" stroke="black" strokeWidth="0.5"/></svg>
//             </div>

//             <div className="w-full max-w-[280px] space-y-3 z-10">
//               {/* Login Card */}
//               <div className="bg-[#93c5fd] p-4 rounded-xl flex flex-col items-center justify-center text-blue-900 cursor-pointer hover:scale-105 transition-transform shadow-sm" onClick={() => router.push('/auth/login')}>
//                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-1"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
//                 <span className="font-bold text-sm">Login</span>
//               </div>

//               {/* Signup Card */}
//               <div className="bg-[#fbbf24] p-4 rounded-xl flex flex-col items-center justify-center text-amber-900 cursor-pointer hover:scale-105 transition-transform shadow-sm"  onClick={() => router.push('/auth/signup')}>
//                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-1"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
//                 <span className="font-bold text-sm">Signup</span>
//               </div>

//               {/* Information Card */}
//               <div className="bg-[#3b82f6] p-4 rounded-xl flex flex-col items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform shadow-sm" onClick={() => router.push('https://creativetestmaker.com/ctm-octa/index')} >
//                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-1"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
//                 <span className="font-bold text-sm">Information</span>
//               </div>

//               {/* Demo Video Card */}
//               <div className="relative h-20 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-lg group">
//                 <img 
//                   src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=400" 
//                   className="w-full h-full object-cover brightness-50 group-hover:brightness-75 transition-all"
//                   alt="Video thumbnail"
//                 />
//                 <div className="absolute inset-0 flex flex-col items-center justify-center text-white" onClick={() => router.push('https://www.youtube.com/watch?v=uXJEuA0eX8A')} >
//                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white" className="mb-1 text-red-500"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
//                    <span className="font-bold text-[10px] uppercase">Demo Video</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <footer className="w-full text-center py-3 bg-white text-[9px] text-gray-400 uppercase tracking-widest border-t border-gray-50 flex-shrink-0">
//           Copyright © 2026 Creative Developers Pakistan
//         </footer>
//       </div>
//     </div>
//   );
// }




// 2nd design

'use client';
import React from 'react';
import { useRouter } from "next/navigation";

export default function CreativeTestMaker() {
  const router = useRouter();

  return (
    <div className="min-h-screen  flex flex-col relative overflow-hidden font-sans"
         style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
      
      {/* Background Orbs - Exact CSS conversion */}
      <div className="absolute w-[400px] h-[400px] top-[-100px] left-[-100px] rounded-full pointer-events-none" 
           style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)' }} />
      <div className="absolute w-[350px] h-[350px] bottom-[-80px] right-[-80px] rounded-full pointer-events-none" 
           style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)' }} />
      <div className="absolute w-[200px] h-[200px] top-1/2 right-[20%] rounded-full pointer-events-none" 
           style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)' }} />

      {/* Navbar */}
      <nav className="flex justify-between items-center px-12 py-5 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-[10px] text-white font-medium text-lg">
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#818cf8] to-[#60a5fa]" />
          Test Mind
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/auth/login')}
            className="text-white/70 border border-white/15 px-5 py-2 rounded-full text-sm hover:bg-white/10 hover:text-white transition-all">
            Login
          </button>
          <button 
            onClick={() => router.push('/auth/signup')}
            className="bg-gradient-to-br from-[#6366f1] to-[#3b82f6] text-white px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-all">
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row flex-1 items-center px-12 py-16 gap-[60px] relative z-[5] overflow-hidden">
        
        {/* Hero Left */}
        <div className="flex-[1.1]">
          <div className="inline-flex items-center gap-1.5 bg-[#6366f126] border border-[#6366f166] text-[#a5b4fc] text-xs px-3.5 py-1.5 rounded-full mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[#818cf8]" />
            AI-Powered Quiz Platform
          </div>

          <h1 className="text-[56px] font-bold text-white leading-[1.1] mb-5 tracking-tight">
            Where ideas<br />become <span className="bg-gradient-to-br from-[#818cf8] via-[#60a5fa] to-[#a78bfa] bg-clip-text text-transparent">insights.</span>
          </h1>

          <p className="text-white/55 text-[17px] leading-relaxed mb-9 max-w-[420px]">
            Create stunning tests and quizzes in seconds. Engage your audience, track performance, and unlock the power of knowledge.
          </p>

          <div className="flex items-center gap-3 mb-12">
            <button 
              onClick={() => router.push('/auth/signup')}
              className="bg-gradient-to-br from-[#6366f1] to-[#3b82f6] text-white px-8 py-3.5 rounded-xl font-medium text-base shadow-[0_4px_24px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(99,102,241,0.5)] transition-all">
              Start Creating →
            </button>
            <button 
              onClick={() => router.push('https://www.youtube.com/watch?v=uXJEuA0eX8A')}
              className="flex items-center gap-2 border border-white/25 text-white/80 px-6 py-3.5 rounded-xl text-[15px] hover:bg-white/5 transition-all">
              <div className="w-7 h-7 bg-white/15 rounded-full flex items-center justify-center">
                <svg width="10" height="12" viewBox="0 0 10 12" fill="white"><path d="M0 0 L10 6 L0 12 Z"/></svg>
              </div>
              Watch Demo
            </button>
          </div>

          <div className="flex gap-9">
            <div>
              <div className="text-[26px] font-semibold text-white">10K+</div>
              <div className="text-xs text-white/45 mt-0.5">Tests Created</div>
            </div>
            <div className="w-[0.5px] bg-white/15" />
            <div>
              <div className="text-[26px] font-semibold text-white">50K+</div>
              <div className="text-xs text-white/45 mt-0.5">Active Users</div>
            </div>
            <div className="w-[0.5px] bg-white/15" />
            <div>
              <div className="text-[26px] font-semibold text-white">98%</div>
              <div className="text-xs text-white/45 mt-0.5">Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Hero Right */}
        <div className="flex-1 w-full max-w-[520px] flex flex-col gap-3.5">
          {/* Card: Login */}
          <div onClick={() => router.push('/auth/login')} 
               className="bg-white/[0.04] border border-white/10 p-5 pr-6 rounded-2xl flex items-center gap-4 hover:bg-white/[0.08] hover:translate-x-1 hover:border-white/20 transition-all cursor-pointer">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div className="flex-1">
              <div className="text-white text-[15px] font-medium">Login to your account</div>
              <div className="text-white/45 text-[13px]">Access your dashboard & tests</div>
            </div>
            <div className="text-white/30 text-lg">›</div>
          </div>

          {/* Card: Signup */}
          <div onClick={() => router.push('/auth/signup')} 
               className="bg-white/[0.04] border border-white/10 p-5 pr-6 rounded-2xl flex items-center gap-4 hover:bg-white/[0.08] hover:translate-x-1 hover:border-white/20 transition-all cursor-pointer">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
            </div>
            <div className="flex-1">
              <div className="text-white text-[15px] font-medium">Create a free account</div>
              <div className="text-white/45 text-[13px]">Get started in under a minute</div>
            </div>
            <div className="text-white/30 text-lg">›</div>
          </div>

          {/* Card: Info */}
          <div onClick={() => router.push('https://creativetestmaker.com/ctm-octa/index')} 
               className="bg-white/[0.04] border border-white/10 p-5 pr-6 rounded-2xl flex items-center gap-4 hover:bg-white/[0.08] hover:translate-x-1 hover:border-white/20 transition-all cursor-pointer">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </div>
            <div className="flex-1">
              <div className="text-white text-[15px] font-medium">Platform information</div>
              <div className="text-white/45 text-[13px]">Features, pricing & more</div>
            </div>
            <div className="text-white/30 text-lg">›</div>
          </div>

          {/* Video Card */}
          <div onClick={() => router.push('https://www.youtube.com/watch?v=uXJEuA0eX8A')} 
               className="bg-white/[0.04] border border-white/10 p-4 pr-5 rounded-2xl flex items-center gap-4 hover:bg-white/[0.07] hover:border-white/25 transition-all cursor-pointer relative overflow-hidden group">
            <div className="w-[72px] h-12 rounded-lg bg-gradient-to-br from-[#1e1b4b] to-[#312e81] flex items-center justify-center flex-shrink-0">
              <div className="w-7 h-7 bg-red-500/90 rounded-full flex items-center justify-center">
                <svg width="10" height="12" viewBox="0 0 10 12" fill="white"><path d="M0 0 L10 6 L0 12 Z"/></svg>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-white/45 text-[13px] mb-0.5">Watch the walkthrough</div>
              <div className="text-white text-[15px] font-medium">Full Platform Demo</div>
            </div>
            <div className="bg-red-500/15 border border-red-500/30 text-[#fca5a5] text-[11px] px-2.5 py-0.5 rounded-full">Live</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-5 text-[11px] text-white/20 uppercase tracking-[2px] border-t border-white/5 relative z-[5]">
        Copyright © 2026 Creative Developers Pakistan
      </footer>
    </div>
  );
}
