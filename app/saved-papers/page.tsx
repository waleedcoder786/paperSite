"use client";
import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../components/navbar/page";
import Header from "../components/topbar/page";
import { CiSearch } from "react-icons/ci";
import { 
  HiOutlineDocumentText, 
  HiOutlineEye, 
  HiOutlineDotsVertical, 
  HiOutlineDownload, 
  HiOutlineTrash, 
  HiOutlineExclamation, 
  HiOutlinePencil, 
  HiOutlineChevronLeft, 
  HiOutlineChevronRight,
  HiOutlineCalendar,
  HiOutlineAcademicCap,
  HiOutlineUser,
} from "react-icons/hi";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";

const API_BASE = "https://testbackend-production-69cb.up.railway.app/api";

interface Paper {
  id: string;
  paperName: string;
  className?: string;
  subject?: string;
  createdAt: string;
  userId: string;
}

function SavedPapersPage() {
  const [savedPapers, setSavedPapers] = useState<Paper[]>([]);
  const [myTeachers, setMyTeachers] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paperToDelete, setPaperToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
      fetchAllData(parsedUser);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAllData = async (user: any) => {
    const currentUserId = user?.id || user?._id;
    
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const papersPromise = axios.get(`${API_BASE}/papers`, {
        params: { userId: currentUserId } 
      });

      // Hamesha teachers fetch karein agar user admin ya superadmin ho
      const teachersPromise = (user.role === 'admin' || user.role === 'superadmin')
        ? axios.get(`${API_BASE}/teachers`, { params: { adminId: currentUserId } }) 
        : Promise.resolve({ data: [] });

      const [papersRes, teachersRes] = await Promise.all([
        papersPromise.catch(() => ({ data: [] })),
        teachersPromise.catch(() => ({ data: [] }))
      ]);

      const formattedPapers = (papersRes.data || []).map((p: any) => ({
        ...p,
        id: p._id || p.id
      }));

      setSavedPapers(formattedPapers);
      setMyTeachers(teachersRes.data || []);
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredPapers = useMemo(() => {
    const myId = currentUser?.id || currentUser?._id;
    const role = currentUser?.role;
    const myTeacherIds = myTeachers.map(t => t.id || t._id);

    return savedPapers.filter((paper) => {
      const matchesSearch = paper.paperName.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (role === 'teacher') {
        return matchesSearch && paper.userId === myId;
      }
      
      if (role === 'admin') {
        const isMyOwn = paper.userId === myId;
        const isFromMyTeacher = myTeacherIds.includes(paper.userId);
        if (!(isMyOwn || isFromMyTeacher)) return false;

        if (filterType === "mine") return matchesSearch && isMyOwn;
        if (filterType === "teachers") return matchesSearch && isFromMyTeacher;
        return matchesSearch;
      }

      return matchesSearch;
    });
  }, [searchQuery, savedPapers, filterType, currentUser, myTeachers]);

  const paginatedPapers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPapers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPapers, currentPage]);

  const totalPages = Math.ceil(filteredPapers.length / itemsPerPage);

  const handleDelete = async () => {
    if (!paperToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`${API_BASE}/papers/${paperToDelete}`);
      setSavedPapers((prev) => prev.filter((p) => p.id !== paperToDelete));
      toast.success("Paper deleted successfully");
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to delete paper");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative flex h-screen w-screen bg-[#F8FAFC] font-sans overflow-hidden text-slate-900">
      <Navbar />

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineExclamation size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Delete Paper?</h3>
            <p className="text-slate-500 text-sm mt-2 font-medium">This document will be permanently removed from your database.</p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-all">Cancel</button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-200 disabled:opacity-50 transition-all">
                {isDeleting ? "Deleting..." : "Delete Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden" onClick={() => setOpenMenuId(null)}>
        <Header />
        
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 pb-20">

            {/* Top Navigation & Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Saved Papers</h1>
                <p className="text-slate-400 mt-1 uppercase text-sm font-black tracking-[2px] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {filteredPapers.length} Documents Available
                </p>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                {currentUser?.role !== 'teacher' && (
                  <div className="flex bg-slate-200/50 p-1.5 rounded-md backdrop-blur-sm">
                    {['all', 'mine', 'teachers'].map((type) => (
                      <button 
                        key={type}
                        onClick={() => { setFilterType(type); setCurrentPage(1); }}
                        className={`px-6 py-2 text-[10px] font-black rounded-md transition-all uppercase tracking-widest ${filterType === type ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}

                <div className="relative group min-w-[280px]">
                  <CiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by paper name..."
                    className="w-full pl-12 pr-4 py-3.5 text-gray-700 text-sm bg-white border-2 border-slate-100 rounded-md outline-none focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Grid Content */}
            {loading ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[...Array(4)].map((_, i) => (
                   <div key={i} className="h-64 bg-white rounded-[30px] border-2 border-slate-50 animate-pulse flex flex-col p-6 space-y-4">
                     <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
                     <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                     <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                   </div>
                 ))}
               </div>
            ) : filteredPapers.length === 0 ? (
              <div className="py-32 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <HiOutlineDocumentText className="text-slate-300" size={40} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No papers found</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">Try adjusting your filters or search query to find what you're looking for.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {paginatedPapers.map((paper) => {
                  const currentId = currentUser?.id || currentUser?._id;
                  const isTeacherPaper = paper.userId !== currentId;
                  
                  // Logic to find teacher name from the list
                  const teacher = myTeachers.find(t => (t.id || t._id) === paper.userId);
                  const teacherName = teacher ? (teacher.name || teacher.fullName) : "Other Teacher";
                  
                  return (
                    <div key={paper.id} className="group relative bg-white border-2 border-slate-50 rounded-md p-6 hover:shadow-2xl hover:shadow-blue-900/5 hover:border-blue-300 transition-all duration-500">
                      
                      {/* Teacher's Name Badge (Added) */}
                      {isTeacherPaper === true ? (
                        <div className="absolute bottom-18 left-6 bg-blue-500 text-white text-[8px] font-black px-3 py-1.5 rounded-md shadow-lg flex items-center gap-1.5 z-10 tracking-[0.1em]">
                          <HiOutlineUser size={12}/> {teacherName.toUpperCase()}
                        </div>
                      ): <div className="absolute bottom-18 left-6 bg-blue-500 text-white text-[8px] font-black px-3 py-1.5 rounded-md shadow-lg flex items-center gap-1.5 z-10 tracking-[0.1em]">
                          {/* <HiOutlineUser size={12}/> mine */}
                        </div>
                      }

                      <div className="flex justify-between items-start mb-6">
                        <div className={`w-14 h-14 rounded-md flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 duration-500 ${isTeacherPaper ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                          <HiOutlineDocumentText size={28} />
                        </div>
                        
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === paper.id ? null : paper.id);
                            }}
                            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
                          >
                            <HiOutlineDotsVertical size={20} />
                          </button>

                          {openMenuId === paper.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-[20px] shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                              <Link href={`/view-paper/${paper.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors">
                                <HiOutlineEye className="text-blue-500" size={18} /> View Paper
                              </Link>
                              <Link href={`/editpaper/${paper.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors">
                                <HiOutlinePencil className="text-emerald-500" size={18} /> Edit Paper
                              </Link>
                              <button 
                                onClick={() => { setPaperToDelete(paper.id); setIsModalOpen(true); }} 
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 text-xs font-bold border-t border-slate-50 transition-colors"
                              >
                                <HiOutlineTrash size={18} /> Delete Paper
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-base font-black text-slate-900 capitalize line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{paper.paperName}</h3>
                        
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex items-center gap-2.5 text-slate-500 text-[11px] font-bold">
                            <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                               <HiOutlineAcademicCap size={14} />
                            </div>
                            Class {paper.className || "N/A"}
                          </div>
                          <div className="flex items-center gap-2.5 text-slate-500 text-[11px] font-bold">
                            <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                               <HiOutlineCalendar size={14} />
                            </div>
                            {new Date(paper.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-5 border-t border-slate-50 flex items-center justify-between">
                        <span className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest ${isTeacherPaper ? 'bg-amber-100/50 text-amber-700' : 'bg-emerald-100/50 text-emerald-700'}`}>
                          {paper.subject || "General"}
                        </span>
                        <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
                          <HiOutlineDownload size={20} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-16 flex items-center justify-center gap-6">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="group w-12 h-12 flex items-center justify-center bg-white border-2 border-slate-50 rounded-2xl disabled:opacity-50 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
                  >
                    <HiOutlineChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform"/>
                  </button>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-900">{currentPage}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">of {totalPages}</span>
                  </div>

                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="group w-12 h-12 flex items-center justify-center bg-white border-2 border-slate-50 rounded-2xl disabled:opacity-50 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
                  >
                    <HiOutlineChevronRight size={24} className="group-hover:translate-x-1 transition-transform"/>
                  </button>
                </div>
            )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}

export default SavedPapersPage;
