"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ObsidianLoader() {
  const [percent, setPercent] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    const timer = setInterval(() => {
      setPercent((prev) => {
        if (prev < 100) return prev + 1;
        clearInterval(timer);
        return 100;
      });
    }, 15);

    const redirectTimer = setTimeout(() => {
      // router.push("/dashboard"); 
    }, 2200);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#2A4E6E] overflow-hidden">
      
      {/* 1. BACKGROUND IMAGE (Properly Layered) */}
      <div 
        className="absolute inset-0 opacity-20 bg-center bg-cover grayscale"
        style={{ 
          backgroundImage: "url('https://img.sanishtech.com/u/9e451a8226d589c08220048bbcf5eac9.png')",
        }}
      />

      {/* 2. GLOW OVERLAY (To make it premium) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-black" />
      
      {/* 3. CENTRAL ANIMATION UNIT */}
      <div className="relative z-20 w-48 h-48 flex items-center justify-center">
        
        {/* Outer Rotating Ring */}
        <div className="absolute inset-0 border-[1px] border-white/5 rounded-full" />
        <div className="absolute inset-0 border-t-[1px] border-amber-500 rounded-full animate-spin-slow shadow-[0_0_20px_rgba(245,158,11,0.3)]" />
        
        {/* Inner Pulsing Core */}
        <div className="w-32 h-32 rounded-full border border-white/10 flex flex-col items-center justify-center backdrop-blur-3xl bg-white/[0.03] shadow-[inset_0_0_25px_rgba(255,255,255,0.05)] relative z-10">
            <span className="text-4xl font-black text-white tracking-tighter">
                {percent}<span className="text-amber-500 text-sm">%</span>
            </span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Loading</span>
        </div>

        {/* Orbiting Particle */}
        <div className="absolute inset-0 animate-spin-reverse">
            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full blur-[1px] absolute top-0 left-1/2 -translate-x-1/2 shadow-[0_0_15px_#f59e0b]" />
        </div>
      </div>

      {/* 4. LOADING TEXT SECTION */}
      <div className="mt-16 text-center space-y-6 relative z-20">
        <div className="flex flex-col items-center">
            <h1 className="text-white text-xl font-black uppercase tracking-[0.2em] opacity-90">
                Welcome in <span className="text-amber-500">TESTMIND.</span>
            </h1>
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent mt-3 animate-width-grow" />
        </div>

        {/* Dynamic Status Steps */}
        <div className="h-6 overflow-hidden">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] animate-pulse">
                {percent < 35 ? "Synchronizing Assets" : 
                 percent < 75 ? "Securing Encrypted Tunnel" : 
                 "Finalizing VIP Access"}
            </p>
        </div>
      </div>

      {/* 5. DECORATIVE SIDE ELEMENTS */}
      <div className="absolute bottom-10 right-10 flex gap-4 z-20">
        <div className="w-1 h-1 bg-amber-500/60 rounded-full animate-ping" />
        <div className="w-1 h-1 bg-amber-500/60 rounded-full animate-ping [animation-delay:0.2s]" />
        <div className="w-1 h-1 bg-amber-500/60 rounded-full animate-ping [animation-delay:0.4s]" />
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes width-grow {
          0% { width: 0; opacity: 0; }
          100% { width: 64px; opacity: 1; }
        }
        .animate-spin-slow {
          animation: spin-slow 2.5s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 4s linear infinite;
        }
        .animate-width-grow {
          animation: width-grow 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}