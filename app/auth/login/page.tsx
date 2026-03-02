'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const API_BASE = "http://localhost:5000/api"; 
  // const API_BASE = "https://backendrepoo-production.up.railway.app/api"; // Local backend URL  

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/login`, {
        email: email.trim(), // Trim spaces
        password
      });

      const { type, data } = response.data;
      
      // Backend se aane wala role hi final hai
      let finalRole = data.role || (type === 'teacher' ? 'teacher' : 'admin');

      loginSuccess(data, finalRole);

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Invalid Credentials";
      toast.error(errorMsg);
    } finally { 
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
    document.cookie = `auth_token=${token}; path=/; max-age=86400`;
    document.cookie = `user_role=${role}; path=/; max-age=86400`;

    localStorage.setItem('user', JSON.stringify({
      ...tokenData,
      schoolName: userData.institute || "Creative School", 
      watermark: userData.watermark || "",
      logo: userData.logo || "",
      address: userData.address || "",
      classes: userData.classes || [],
      subjects: userData.subjects || []
    }));

    toast.success(`Welcome ${tokenData.name}!`);
    router.push('/dashboard');
    setTimeout(() => { router.refresh(); }, 200);
  };

  return (
    <div className="h-screen w-screen bg-[#f3f4f6] flex items-center justify-center p-4 font-sans text-black">
      <div className="w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col md:flex-row">
        
        {/* Left Side: Branding */}
        <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#1e40af] to-[#3b82f6] p-10 flex-col justify-between text-white">
          <div>
            <Link href="/" className="text-xl font-bold tracking-tight">Creative Test Maker.</Link>
            <div className="mt-16 space-y-4">
              <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight">Welcome back, <br /> Educator.</h2>
              <p className="text-blue-100 text-sm">Pick up right where you left off and manage your assessments.</p>
            </div>
          </div>
          <footer className="text-[10px] text-blue-200 uppercase tracking-widest">© 2026 Creative Developers</footer>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Log In</h1>
              <p className="text-gray-500 text-sm mt-1">Access your dashboard with your credentials.</p>
            </div>
            
            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-blue-100" 
                  placeholder="name@institute.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm pr-12 outline-none focus:ring-2 focus:ring-blue-100" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600">
                    {!showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-[#3b82f6] text-white py-4 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-md disabled:bg-gray-400"
              >
                {loading ? "Verifying..." : "Log in"}
              </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">
                    Don't have an account? <Link href="/register" className="text-blue-600 font-bold hover:underline">Register your Institute</Link>
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}