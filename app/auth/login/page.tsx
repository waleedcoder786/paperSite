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
  
  const [showObsidianLoader, setShowObsidianLoader] = useState(false);
  const [percent, setPercent] = useState(0);

  const API_BASE = "/api/auth"; 
  const maskData = (data: string) => btoa(data);

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
    }));

    toast.success(`Welcome ${tokenData.name}!`);
    setShowObsidianLoader(true);

    setTimeout(() => {
      router.push('/dashboard');
      router.refresh();
    }, 2500);
  };

  if (showObsidianLoader) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#2A4E6E] overflow-hidden p-6">
        <div 
          className="absolute inset-0 opacity-20 bg-center bg-cover grayscale"
          style={{ backgroundImage: "url('https://img.sanishtech.com/u/9e451a8226d589c08220048bbcf5eac9.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-black" />
        
        <div className="relative z-20 w-32 h-32 sm:w-48 sm:h-48 flex items-center justify-center">
          <div className="absolute inset-0 border-[1px] border-white/5 rounded-full" />
          <div className="absolute inset-0 border-t-[1px] border-amber-500 rounded-full animate-spin-slow" />
          
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-white/10 flex flex-col items-center justify-center backdrop-blur-3xl bg-white/[0.03] relative z-10">
              <span className="text-2xl sm:text-4xl font-black text-white tracking-tighter">
                  {percent}<span className="text-amber-500 text-xs sm:text-sm">%</span>
              </span>
              <span className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1 sm:mt-2">Loading</span>
          </div>

          <div className="absolute inset-0 animate-spin-reverse">
              <div className="w-2 h-2 bg-amber-500 rounded-full absolute top-0 left-1/2 -translate-x-1/2 shadow-[0_0_15px_#f59e0b]" />
          </div>
        </div>

        <div className="mt-12 sm:mt-16 text-center space-y-4 sm:space-y-6 relative z-20">
          <div className="flex flex-col items-center">
              <h1 className="text-white text-base sm:text-xl font-black uppercase tracking-[0.2em] opacity-90 px-4">
                  Welcome to <span className="text-amber-500">TESTMIND.</span>
              </h1>
              <div className="w-12 sm:w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent mt-3 animate-width-grow" />
          </div>
          <div className="h-6 overflow-hidden">
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] animate-pulse px-4">
                  {percent < 35 ? "Synchronizing Assets" : percent < 75 ? "Securing Encrypted Tunnel" : "Finalizing VIP Access"}
              </p>
          </div>
        </div>

        <style jsx>{`
          @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
          @keyframes width-grow { 0% { width: 0; opacity: 0; } 100% { width: 64px; opacity: 1; } }
          .animate-spin-slow { animation: spin-slow 2.5s linear infinite; }
          .animate-spin-reverse { animation: spin-reverse 4s linear infinite; }
          .animate-width-grow { animation: width-grow 0.8s ease-out forwards; }
        `}</style>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-0 sm:p-6 lg:p-8 font-sans relative bg-center bg-cover"
      style={{ backgroundImage: "url('https://img.sanishtech.com/u/30b626bb602e6a23377f720c2e48c3fa.png')" }}
    >      
      <Toaster />
      
      {/* Overlay to darken background on mobile for better focus */}
      <div className="absolute inset-0 bg-black/40 sm:hidden" />

      <div className="relative z-10 w-full max-w-[1100px] h-full sm:h-auto min-h-screen sm:min-h-[550px] bg-white sm:backdrop-blur-sm sm:bg-white/95 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border-none sm:border border-white/20">

        {/* Left Side: Branding (Desktop Only) */}
        <div className="hidden md:flex relative w-[55%] lg:w-[60%] p-10 flex-col justify-between overflow-hidden bg-[#18202b]">
          <div className="absolute inset-0 bg-center bg-cover opacity-80"
               style={{ backgroundImage: "url('https://img.sanishtech.com/u/9e451a8226d589c08220048bbcf5eac9.png')" }} />
          <div className="relative z-10">
            <div className="text-white text-[18px] font-bold">Test Mind<span className="text-[#e2a85a] ml-0.5">.</span></div>
            <div className="mt-24">
              <h2 className="text-[40px] lg:text-[48px] font-extrabold text-white leading-[1.1]">Welcome back,<br />Educator.</h2>
            </div>
          </div>
          <div className="relative z-10 text-[11px] text-slate-300/80 tracking-widest uppercase">© 2026 Creative Developers</div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-[45%] lg:w-[40%] bg-white p-8 sm:p-10 lg:p-14 flex flex-col justify-center min-h-screen sm:min-h-0">
          
          {/* Mobile Only Branding */}
          <div className="md:hidden mb-8">
             <div className="text-[#18202b] text-[20px] font-black tracking-tight">TEST MIND<span className="text-amber-500">.</span></div>
          </div>

          <div className="w-full max-w-[320px] mx-auto">
            <h1 className="text-[28px] sm:text-[32px] font-bold text-[#111827] mb-2">Log in</h1>
            <p className="text-slate-500 text-sm mb-8">Please enter your account details.</p>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">Username / Email</label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#18202b]/10 focus:border-[#18202b] transition-all text-[15px]" 
                  placeholder="name@institute.com"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">Password</label>
                  <button type="button" className="text-[10px] font-bold text-amber-600 uppercase hover:underline">Forgot?</button>
                </div>
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
                  className="w-full bg-[#18202b] text-white py-3.5 rounded-lg font-bold hover:bg-[#2c3746] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-[#18202b]/20"
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {loading ? "Authenticating..." : "Login "}
                </button>
              </div>
            </form>

            <div className="mt-10 text-center">
               <p className="text-[13px] font-semibold text-gray-500">
                  Don't have an account? <Link href="/register" className="text-[#18202b] border-b-2 border-amber-400/50 pb-0.5 ml-1">Register Now</Link>
               </p>
            </div>
            
            <div className="md:hidden mt-12 text-center text-[10px] text-gray-400 uppercase tracking-widest font-medium">
               © 2026 Creative Developers
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}