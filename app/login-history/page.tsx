'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  FaDesktop, FaMobileAlt, FaSearch, 
  FaChevronLeft, FaChevronRight, FaUserCircle 
} from 'react-icons/fa';
import Navbar from '../components/navbar/page';
import Topbar from '../components/topbar/page';

export default function MyLoginHistory() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchHistory(parsedUser);
    }
  }, []);

  const fetchHistory = async (currentUser: any) => {
    try {
      // API call to fetch history
      const response = await axios.get(`/api/login-history?userId=${currentUser.id}`);
      
      // Filter based on user identity
      const filtered = response.data.filter((item: any) => 
        item.adminName === currentUser.name || item.userId === currentUser.id
      );
      setHistoryData(filtered);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic including Name
  const filteredData = useMemo(() => {
    return historyData.filter((item: any) => {
      const search = searchTerm.toLowerCase();
      const name = (item.adminName || item.userName || "").toLowerCase();
      return (
        name.includes(search) ||
        item.date?.toLowerCase().includes(search) ||
        item.ipAddress?.toLowerCase().includes(search) ||
        item.device?.toLowerCase().includes(search) ||
        item.browser?.toLowerCase().includes(search)
      );
    });
  }, [searchTerm, historyData]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="h-screen w-screen bg-slate-50 flex overflow-hidden font-sans text-slate-900">
      <Navbar />
      <div className="flex-1 flex flex-col h-full">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-8 pb-32">
          <div className="max-w-7xl mx-auto">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Security Logs</p>
                <h1 className="text-xl font-black text-slate-800">Login Activity History</h1>
              </div>

              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search by name, IP or device..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl w-full md:w-96 shadow-sm focus:ring-2 focus:ring-blue-500/10 outline-none font-bold text-sm"
                />
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-32 text-center">
                   <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-xl animate-spin mx-auto mb-4" />
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          {/* New Name Column Header */}
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Account Name</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Session Date</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Exact Time</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Device Info</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Network IP</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Browser</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {currentItems.map((row: any, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-all">
                            {/* Name Column Body */}
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                        <FaUserCircle size={18} />
                                    </div>
                                    <span className="font-black text-slate-800 text-sm uppercase">{row.adminName || row.userName || "Unknown"}</span>
                                </div>
                            </td>
                            <td className="px-8 py-6 font-bold text-slate-600 text-sm">{row.date}</td>
                            <td className="px-8 py-6 text-sm font-bold text-slate-500">{row.time}</td>
                            <td className="px-8 py-6 text-xs font-black uppercase text-slate-700">
                               <div className="flex items-center gap-2">
                                 {row.device?.toLowerCase() === "computer" ? <FaDesktop className="text-blue-500"/> : <FaMobileAlt className="text-indigo-500"/>} {row.device}
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold text-[11px] border border-slate-200">{row.ipAddress}</span>
                            </td>
                            <td className="px-8 py-6 text-xs font-bold text-slate-600 uppercase tracking-tighter">{row.browser}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Section */}
                  <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest">
                      Logs {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all"
                      >
                        <FaChevronLeft size={12} />
                      </button>
                      
                      <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                              currentPage === i + 1 
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                              : "bg-white border border-slate-200 text-slate-400 hover:border-blue-400"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all"
                      >
                        <FaChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}