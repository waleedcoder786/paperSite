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
      const response = await axios.get(`/api/login-history?userId=${currentUser.id}`);
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

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="h-screen w-screen bg-slate-50 flex overflow-hidden font-sans text-slate-900">
      <Navbar />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-32">
          <div className="max-w-7xl mx-auto">
            
            {/* Header & Search Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
              <div className="text-center lg:text-left">
                <p className="text-slate-500 text-[10px] md:text-sm font-medium uppercase tracking-wider">Security Logs</p>
                <h1 className="text-lg md:text-xl font-black text-slate-800">Login Activity History</h1>
              </div>

              <div className="relative w-full lg:w-96">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search name, IP or device..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl w-full shadow-sm focus:ring-2 focus:ring-blue-500/10 outline-none font-bold text-sm"
                />
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-20 md:p-32 text-center">
                   <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-xl animate-spin mx-auto mb-4" />
                   <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Security Data...</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table - Hidden on Mobile */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Account</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date & Time</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Device Info</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Network IP</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Browser</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {currentItems.map((row: any, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-all">
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                        <FaUserCircle size={18} />
                                    </div>
                                    <span className="font-black text-slate-800 text-sm uppercase truncate max-w-[120px]">{row.adminName || row.userName || "Unknown"}</span>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <div className="font-bold text-slate-600 text-sm">{row.date}</div>
                                <div className="text-[10px] font-bold text-slate-400">{row.time}</div>
                            </td>
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

                  {/* Mobile List View - Hidden on Tablet/Desktop */}
                  <div className="md:hidden divide-y divide-slate-100">
                    {currentItems.map((row: any, idx) => (
                      <div key={idx} className="p-5 hover:bg-slate-50 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                              <FaUserCircle size={20} />
                            </div>
                            <div>
                              <p className="font-black text-slate-800 text-xs uppercase">{row.adminName || row.userName || "Unknown"}</p>
                              <p className="text-[10px] text-slate-400 font-bold">{row.date} • {row.time}</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 font-bold text-[9px] uppercase border border-blue-100">
                            {row.ipAddress}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500 bg-slate-50 p-2.5 rounded-lg">
                          <div className="flex items-center gap-2">
                            {row.device?.toLowerCase() === "computer" ? <FaDesktop /> : <FaMobileAlt />}
                            {row.device}
                          </div>
                          <div className="tracking-tighter italic">{row.browser}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Empty State */}
                  {!loading && currentItems.length === 0 && (
                    <div className="p-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
                      No matching records found
                    </div>
                  )}

                  {/* Pagination Section */}
                  <div className="px-6 py-6 md:px-10 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest order-2 md:order-1">
                      {filteredData.length > 0 ? (
                        <>Showing {Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}</>
                      ) : "No logs available"}
                    </p>
                    
                    <div className="flex items-center gap-2 order-1 md:order-2">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all active:scale-90"
                      >
                        <FaChevronLeft size={10} />
                      </button>
                      
                      <div className="flex gap-1 overflow-x-auto max-w-[150px] md:max-w-none no-scrollbar">
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`min-w-[36px] h-9 rounded-xl text-[10px] font-black transition-all ${
                              currentPage === i + 1 
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105" 
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
                        className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all active:scale-90"
                      >
                        <FaChevronRight size={10} />
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