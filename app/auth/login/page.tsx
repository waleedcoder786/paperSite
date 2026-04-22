'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // New State for the Attractive Loader
  const [showObsidianLoader, setShowObsidianLoader] = useState(false);
  const [percent, setPercent] = useState(0);

  const API_BASE = "/api/auth"; 
  const maskData = (data: string) => btoa(data);

  // Percent increment logic for the loader
  useEffect(() => {
    if (showObsidianLoader) {
      const timer = setInterval(() => {
        setPercent((prev) => (prev < 100 ? prev + 1 : 100));
      }, 15);
      return () => clearInterval(timer);
    }
  }, [showObsidianLoader]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/login`, {
        email: email.trim(),
        password
      });

      const { type, data } = response.data;
      
      if (data.expiryDate) {
        const expiryDate = new Date(data.expiryDate).getTime();
        const currentDate = new Date().getTime();

        if (currentDate > expiryDate) {
          toast.error("Your plan has expired. Please contact support.");
          setLoading(false);
          return; 
        }
      }

      let finalRole = data.role || (type === 'teacher' ? 'teacher' : 'admin');
      loginSuccess(data, finalRole);

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Invalid Credentials";
      toast.error(errorMsg);
      setLoading(false); 
    }
  };

  const loginSuccess = (userData: any, role: string) => {
    const tokenData = { 
      id: userData._id || userData.id, 
      email: userData.email, 
      name: userData.name,
      role: role 
    };
    
    const token = btoa(JSON.stringify(tokenData));
    let cookieMaxAge = 86400; 

    document.cookie = `auth_token=${token}; path=/; max-age=${cookieMaxAge}`;
    document.cookie = `user_role=${role}; path=/; max-age=${cookieMaxAge}`;

    localStorage.setItem('user', JSON.stringify({
      ...tokenData,
      email: maskData(userData.email),
      // ... (rest of your storage logic)
    }));

    toast.success(`Welcome ${tokenData.name}!`);
    
    // Yahan hum Obsidian Loader show karenge
    setShowObsidianLoader(true);

    // 2.5 seconds baad redirect
    setTimeout(() => {
      router.push('/dashboard');
      router.refresh();
    }, 2500);
  };

  // --- LOADER UI COMPONENT ---
  if (showObsidianLoader) {
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

  // --- NORMAL LOGIN UI ---
  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 font-sans relative bg-center bg-cover"
      style={{ backgroundImage: "url('https://img.sanishtech.com/u/30b626bb602e6a23377f720c2e48c3fa.png')" }}
    >      
      <Toaster />
      
      <div className="relative z-10 w-full max-w-[1100px] h-full min-h-[500px] backdrop-blur-sm rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row border border-white/20">

        {/* Left Side: Branding */}
        <div className="hidden md:flex relative w-[80%] p-10 flex-col justify-between overflow-hidden bg-[#18202b]">
          <div className="absolute inset-0 bg-center bg-cover opacity-80 transition-transform duration-700 hover:scale-105"
               style={{ backgroundImage: "url('https://img.sanishtech.com/u/9e451a8226d589c08220048bbcf5eac9.png')" }} />
          <div className="relative z-10">
            <div className="text-white text-[18px] font-bold">Test Mind<span className="text-[#e2a85a] ml-0.5">.</span></div>
            <div className="mt-24">
              <h2 className="text-[48px] font-extrabold text-white leading-[1.1]">Welcome back,<br />Educator.</h2>
            </div>
          </div>
          <div className="relative z-10 text-[11px] text-slate-300/80 tracking-widest uppercase">© 2026 Creative Developers</div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-[45%] bg-white/95 p-10 lg:p-14 flex flex-col justify-center">
          <div className="w-full max-w-[320px] mx-auto">
            <h1 className="text-[32px] font-bold text-[#111827] mb-2">Log in</h1>
            <p className="text-slate-500 text-sm mb-8">Please enter your account details.</p>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-1.5">
                <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-wider">Username</label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#18202b]/10 focus:border-[#18202b] transition-all text-[15px]" 
                  placeholder="name@institute.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#18202b]/10 focus:border-[#18202b] transition-all pr-12 text-[15px]"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1">
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" disabled={loading}
                  className="w-full bg-[#18202b] text-white py-3 rounded-lg font-bold hover:bg-[#2c3746] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {loading ? "Authenticating..." : "Log in"}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
               <Link href="/register" className="text-[13px] font-semibold text-gray-500">
                  Don't have an account? <span className="text-[#18202b] underline">Register</span>
               </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}