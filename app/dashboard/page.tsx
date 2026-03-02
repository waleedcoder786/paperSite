"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FaFileAlt,
  FaSave,
  FaHistory,
  FaChalkboardTeacher,
  FaArrowRight,
  FaPlus,
  FaUsers
} from "react-icons/fa";
import Navbar from "../components/navbar/page";
import Header from "../components/topbar/page";
import axios from "axios";
import { PlusCircle } from "lucide-react";

const API_BASE = "http://localhost:5000/api";
// const API_BASE = "https://backendrepoo-production.up.railway.app/api";


interface User {
  id?: string;
  _id?: string;
  role?: string;
  [key: string]: any;
}

export default function DashboardPage() {
  const router = useRouter();

  const [savedPapers, setSavedPapers] = useState<any[]>([]);
  const [savedTec, setSavedTec] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();
    
    const storedUserString = localStorage.getItem('user');
    const storedUser = storedUserString ? JSON.parse(storedUserString) : null;
    setLoggedUser(storedUser);

    const fetchDashboardData = async () => {
      setIsLoading(true);
      
      if (!storedUser) {
        setIsLoading(false);
        return;
      }

      const currentUserId = storedUser.id || storedUser._id;
      
      try {
        const papersPromise = axios.get(`${API_BASE}/papers`, {
          params: { userId: currentUserId },
          signal: abortController.signal
        });

        let teachersPromise = Promise.resolve({ data: [] });
        if (storedUser.role !== 'teacher') {
          teachersPromise = axios.get(`${API_BASE}/teachers`, {
             signal: abortController.signal
          });
        }

        let usersPromise = Promise.resolve({ data: [] });
        if (storedUser.role === 'superadmin') {
          usersPromise = axios.get(`${API_BASE}/users`, {
             signal: abortController.signal
          });
        }

        const [papersRes, teachersRes, usersRes] = await Promise.all([
          papersPromise, 
          teachersPromise, 
          usersPromise
        ]);

        setSavedPapers(papersRes.data || []);
        setSavedTec(teachersRes.data || []);
        setAllUsers(usersRes.data || []);

      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("Dashboard Fetch error:", err);
        }
      } finally {
        // Round animation ko feel karne ke liye 1 sec delay
        setTimeout(() => setIsLoading(false), 1000);
      }
    };
    
    fetchDashboardData();

    return () => abortController.abort();
  }, []);

  const filteredStats = useMemo(() => {
    const currentId = loggedUser?.id || loggedUser?._id;

    // ✅ Filter 1: Admin ko sirf uske apne banaye huye teachers dikhenge
    const myTeachersCount = savedTec.filter(
      (teacher) => String(teacher.adminId) === String(currentId)
    ).length;

    // ✅ Filter 2: Users card mein sirf unki count ho jin ka role 'admin' ho
    const adminsCount = allUsers.filter(user => user.role === 'admin').length;

    const allStats = [
      { label: 'Generate Paper', value: savedPapers.length || 0, color: 'bg-blue-500', textCol: 'text-blue-500', lightColor: 'bg-blue-100/50', icon: <FaPlus />, path: '/generate-paper' },
      { label: 'Saved Papers', value: savedPapers.length || 0, color: 'bg-emerald-500', textCol: 'text-emerald-500', lightColor: 'bg-emerald-100/50', icon: <FaSave />, path: '/saved-papers' },
      { label: 'Past Papers', value: 'Punjab', color: 'bg-purple-500', textCol: 'text-purple-500', lightColor: 'bg-purple-100/50', icon: <FaHistory />, path: '/past-papers' },
      { label: 'Total Teachers', value: myTeachersCount || 0, color: 'bg-indigo-500', textCol: 'text-indigo-500', lightColor: 'bg-indigo-100/50', icon: <FaChalkboardTeacher />, path: '/teachers' },
      { label: 'Paper History', value: '0', color: 'bg-cyan-500', textCol: 'text-cyan-500', lightColor: 'bg-cyan-100/50', icon: <FaFileAlt />, path: '/paper-history' },
      { label: 'Users', value: adminsCount || 0, color: 'bg-slate-700', textCol: 'text-slate-700', lightColor: 'bg-slate-200/50', icon: <FaUsers />, path: '/users' },
      { label: 'Add Data', value: "DB", color: 'bg-orange-500', textCol: 'text-orange-500', lightColor: 'bg-orange-100/50', icon: <PlusCircle />, path: '/add-data' },
    ];

    if (loggedUser?.role === 'teacher') {
      return allStats.filter(stat => ['Generate Paper', 'Saved Papers', 'Past Papers', 'Paper History'].includes(stat.label));
    }
    if (loggedUser?.role === 'superadmin') {
      return allStats.filter(stat => ['Users', 'Add Data'].includes(stat.label));
    }
    if (loggedUser?.role === 'admin') {
      return allStats.filter(stat => !['Users', 'Add Data'].includes(stat.label));
    }
    return allStats;
  }, [savedPapers, savedTec, loggedUser, allUsers]);

  return (
    <div className="h-screen w-full bg-[#f0f4f8] flex flex-col md:flex-row font-sans relative overflow-hidden">
      
      <div className="hidden sm:block absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
      <div className="hidden sm:block absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>

      <Navbar />

      <main className="flex-1 flex flex-col min-w-0 h-full relative z-10 overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 lg:p-12 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto pb-10">
              {filteredStats.map((stat, index) => (
                <div
                  key={index}
                  onClick={() => router.push(stat.path)}
                  className="group relative cursor-pointer"
                >
                  <div
                    className={`relative z-20 bg-white p-6 sm:p-8 h-48 sm:h-56 lg:h-60 flex flex-col justify-between
                    rounded-[30px_10px_30px_10px] sm:rounded-[40px_10px_40px_10px]
                    border-[3px] border-transparent ${stat.lightColor}
                    shadow-lg transition-all duration-300 
                    hover:-translate-y-2 hover:shadow-2xl hover:border-white
                    overflow-hidden`}
                  >
                    <div className={`absolute -bottom-10 -right-10 w-24 h-24 sm:w-32 sm:h-32 ${stat.color} opacity-10 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-700`}></div>

                    <div className="flex justify-between items-start relative z-10">
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 ${stat.color} text-white rounded-full flex items-center justify-center shadow-lg text-xl sm:text-2xl transform group-hover:rotate-12 transition-transform duration-300`}>
                        {stat.icon}
                      </div>
                      <div className={`flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm font-bold text-slate-400 group-hover:${stat.textCol} transition-colors uppercase tracking-widest`}>
                        <span className="hidden xs:block">Explore</span>
                        <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-sm sm:text-lg font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {stat.label}
                      </h3>
                      <div className="flex items-center gap-2 h-10">
                        {isLoading ? (
                          // ✅ Round Spinner matching card theme
                          <div className={`w-7 h-7 border-4 border-slate-200 border-t-current ${stat.textCol} rounded-full animate-spin`}></div>
                        ) : (
                          <span className={`text-2xl sm:text-4xl font-black text-slate-800 tracking-tighter group-hover:${stat.textCol} transition-colors`}>
                            {stat.value}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`absolute inset-0 z-10 rounded-[35px_15px_35px_15px] ${stat.color} opacity-10 blur-xl translate-y-4 scale-95 group-hover:translate-y-6 group-hover:scale-100 transition-all duration-300`}></div>
                </div>
              ))}
            </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}