"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FaFileAlt, FaSave, FaHistory, FaChalkboardTeacher,
  FaArrowRight, FaPlus, FaTrashAlt, FaUsers
} from "react-icons/fa";
import Navbar from "../components/navbar/page";
import Header from "../components/topbar/page";
import axios from "axios";
import { PlusCircle } from "lucide-react";

// const API_BASE = "https://testbackend-production-69cb.up.railway.app/api";
const API_BASE = "/api";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<{ papers: any[]; teachers: any[]; users: any[] }>({ papers: [], teachers: [], users: [] });
  const [loggedUser, setLoggedUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Optimized Fetching with AbortController
  const fetchDashboardData = useCallback(async (user: any, signal: AbortSignal) => {
    try {
      const userId = user.id || user._id;
      const responses = await Promise.allSettled([
        axios.get(`${API_BASE}/papers`, { params: { userId }, signal }),
        user.role !== 'teacher' ? axios.get(`${API_BASE}/teachers`, { signal }) : Promise.resolve({ data: [] }),
        user.role === 'superadmin' ? axios.get(`${API_BASE}/users`, { signal }) : Promise.resolve({ data: [] })
      ]);

      setData({
        papers: responses[0].status === 'fulfilled' ? (responses[0].value as any).data : [],
        teachers: responses[1].status === 'fulfilled' ? (responses[1].value as any).data : [],
        users: responses[2].status === 'fulfilled' ? (responses[2].value as any).data : []
      });
    } catch (err) {
      if (!axios.isCancel(err)) console.error("Fetch error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const storedUser = typeof window !== "undefined" ? localStorage.getItem('user') : null;
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setLoggedUser(parsedUser);
      fetchDashboardData(parsedUser, controller.signal);
    } else {
      router.replace("/auth/login");
    }
    return () => controller.abort();
  }, [fetchDashboardData, router]);

  // 2. Static Stats Calculation (Lag-Free)
  const filteredStats = useMemo(() => {
    if (!loggedUser) return [];
    const currentId = loggedUser.id || loggedUser._id;
    
    const stats = [
      { label: 'Generate Paper', value: data.papers.length, color: 'bg-blue-500', textCol: 'text-blue-500', lightColor: 'bg-blue-50/80', icon: <FaPlus />, path: '/generate-paper' },
      { label: 'Saved Papers', value: data.papers.length, color: 'bg-emerald-500', textCol: 'text-emerald-500', lightColor: 'bg-emerald-50/80', icon: <FaSave />, path: '/saved-papers' },
      { label: 'Past Papers', value: 'Punjab', color: 'bg-purple-500', textCol: 'text-purple-500', lightColor: 'bg-purple-50/80', icon: <FaHistory />, path: '/past-papers' },
      { label: 'Total Teachers', value: data.teachers.filter(t => String(t.adminId) === String(currentId)).length, color: 'bg-indigo-500', textCol: 'text-indigo-500', lightColor: 'bg-indigo-50/80', icon: <FaChalkboardTeacher />, path: '/teachers' },
      { label: 'Users', value: data.users.filter((u: any) => u.role === 'admin').length, color: 'bg-slate-700', textCol: 'text-slate-700', lightColor: 'bg-slate-100/80', icon: <FaUsers />, path: '/users' },
      { label: 'Add Data', value: "DB", color: 'bg-orange-500', textCol: 'text-orange-500', lightColor: 'bg-orange-50/80', icon: <PlusCircle />, path: '/add-data' },
      { label: 'Remove Data', value: "DB", color: 'bg-red-500', textCol: 'text-red-500', lightColor: 'bg-red-50/80', icon: <FaTrashAlt />, path: '/removeData' },
    ];

    const role = loggedUser.role;
    if (role === 'teacher') return stats.filter(s => ['Generate Paper', 'Saved Papers', 'Past Papers'].includes(s.label));
    if (role === 'superadmin') return stats.filter(s => ['Users', 'Add Data', 'Remove Data'].includes(s.label));
    if (role === 'admin') return stats.filter(s => !['Users', 'Add Data', 'Remove Data'].includes(s.label));
    return stats;
  }, [data, loggedUser]);

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden font-sans antialiased">
      <Navbar />

      <main className="flex-1 flex flex-col min-w-0 bg-transparent relative overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto pb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredStats.map((stat, idx) => (
                <div
                  key={idx}
                  onClick={() => router.push(stat.path)}
                  className="group relative cursor-pointer will-change-transform"
                >
                  {/* Original Unique Shape */}
                  <div className={`relative z-20 bg-white p-6 sm:p-8 h-48 sm:h-56 lg:h-60 flex flex-col justify-between
                    rounded-[30px_10px_30px_10px] sm:rounded-[40px_10px_40px_10px]
                    border-2 border-transparent ${stat.lightColor}
                    shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] transition-all duration-200
                    hover:-translate-y-1 hover:shadow-xl hover:border-white overflow-hidden`}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 ${stat.color} text-white rounded-full text-lg flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                        {stat.icon}
                      </div>
                      <div className={`flex items-center gap-2 text-[10px] font-bold text-slate-400 group-hover:${stat.textCol} transition-colors uppercase tracking-widest`}>
                        <span>Explore</span>
                        <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-md sm:text-md font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</h3>
                      <div className="h-10 flex items-center">
                        {isLoading ? (
                          <div className={`w-6 h-6 border-2 border-slate-200 border-t-current ${stat.textCol} rounded-full animate-spin`} />
                        ) : (
                          <span className={`text-2xl sm:text-4xl font-black text-slate-800 tracking-tighter group-hover:${stat.textCol} transition-colors`}>
                            {stat.value}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Background Blur Overlay (Optimized) */}
                  <div className={`absolute inset-0 z-10 rounded-[40px_10px_40px_10px] ${stat.color} opacity-5 blur-xl group-hover:opacity-10 transition-opacity`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}