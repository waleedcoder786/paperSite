"use client";
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/navbar/page';
import Header from '../components/topbar/page';
import {
  HiOutlineUserAdd,
  HiOutlineX,
  HiCheck,
  HiOutlineDotsVertical,
  HiOutlinePencil,
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineTrash,
  HiOutlineInbox,
  HiOutlineLockClosed,
  HiChevronLeft,
  HiChevronRight,
} from 'react-icons/hi';
import axios from 'axios';
import toast from 'react-hot-toast';

// Update to your backend port
// const API_BASE_URL = "https://testbackend-production-69cb.up.railway.app/api/teachers";
// const API_BASE_URL = "http://localhost:5000/api/teachers";
const API_BASE_URL = "/api/teachers";

function Page() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<any | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const teachersPerPage = 4;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    password: '',
    confirmPassword: ''
  });

  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const classesList = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
  const subjectsList = ["Physics", "Chemistry", "Math", "Computer", "English", "Urdu", "Islamiat", "Stats"];

  /* ---------- Outside Click Logic ---------- */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------- Load Teachers from Backend ---------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const admin = JSON.parse(storedUser);
    // Use admin.id or admin._id depending on your login response
    const adminId = admin.id || admin._id || admin.data?._id || admin.data?.id;
    if (adminId) fetchTeachers(adminId);
  }, []);

  

  const fetchTeachers = async (adminId: string) => {
    console.log(adminId);
    
    setLoading(true);
    try {
      // ✅ Yahan userId ko adminId se replace kar diya gaya hai
      const res = await axios.get(`${API_BASE_URL}?adminId=${adminId}`);
      // The backend returns an array of teachers filtered by adminId
      setTeachers(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load teachers from server");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Pagination ---------- */
  const indexOfLastTeacher = currentPage * teachersPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage;
  const currentTeachers = teachers.slice(indexOfFirstTeacher, indexOfLastTeacher);
  const totalPages = Math.ceil(teachers.length / teachersPerPage);

  const toggleClass = (item: string) => {
    setSelectedClasses(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleSubject = (item: string) => {
    setSelectedSubjects(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleEditClick = (teacher: any) => {
    setEditingTeacherId(teacher._id || teacher.id);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      city: teacher.city,
      password: '', // Keep empty unless changing
      confirmPassword: ''
    });
    setSelectedClasses(teacher.classes || []);
    setSelectedSubjects(teacher.subjects || []);
    setIsFormOpen(true);
    setOpenMenuId(null);
  };

  const confirmDelete = (teacher: any) => {
    setTeacherToDelete(teacher);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  /* ---------- SAVE / UPDATE (BACKEND STORE) ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("Session expired. Please login again.");
      return;
    }

    const admin = JSON.parse(storedUser);
    
    // Console check taake aapko pata chale actual ID kis field mein aa rahi hai
    console.log("Admin Data from Storage:", admin);

    // Check karein ke ID kahan hai (kuch systems mein ye sirf ._id hota hai)
    const actualAdminId = admin._id || admin.id || admin.data?._id || admin.data?.id;

    if (!actualAdminId) {
      toast.error("Admin ID not found in session!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const { confirmPassword, ...data } = formData;

    const payload = {
      ...data,
      classes: selectedClasses,
      subjects: selectedSubjects,
      adminId: actualAdminId, // Yahan humne ensure kiya ke ID mil gayi hai
      institute: admin.institute || admin.schoolName || admin.data?.institute || "",
      watermark: admin.watermark || admin.data?.watermark || "",
      address: admin.address || admin.data?.address || "",
      logo: admin.logo || admin.data?.logo || "",
      role: "teacher"
    };

    try {
      if (editingTeacherId) {
        const res = await axios.put(`${API_BASE_URL}/${editingTeacherId}`, payload);
        setTeachers(prev => prev.map(t => ((t._id || t.id) === editingTeacherId ? res.data : t)));
        toast.success("Teacher updated!");
        fetchTeachers(actualAdminId);
      } else {
        const res = await axios.post(API_BASE_URL, payload);
        setTeachers(prev => [res.data, ...prev]);
        toast.success("Teacher registered!");
        fetchTeachers(actualAdminId); 
      }
      closeForm();
    } catch (err: any) {
      console.error("Payload sent:", payload); // Debugging ke liye
      toast.error(err.response?.data?.error || "Validation Failed: Check console");
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTeacherId(null);
    setFormData({
      name: '', email: '', phone: '', city: '',
      password: '', confirmPassword: ''
    });
    setSelectedClasses([]);
    setSelectedSubjects([]);
  };

  const handleDelete = async () => {
    if (!teacherToDelete) return;
    const teacherId = teacherToDelete._id || teacherToDelete.id;
    try {
      await axios.delete(`${API_BASE_URL}/${teacherId}`);
      setTeachers(prev => prev.filter(t => (t._id || t.id) !== teacherId));
      setShowDeleteModal(false);
      toast.success("Deleted from database");
    } catch {
      toast.error("Error deleting teacher");
    }
  };

  return (
    <div className="h-screen w-screen bg-[#f8fafc] flex overflow-hidden font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 p-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Teachers</h2>
                <p className="text-slate-500 text-sm">Manage your academic staff records</p>
              </div>
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all"
              >
                <HiOutlineUserAdd /> Add Teacher
              </button>
            </div>

            {loading ? (
              <div className="text-center py-20 animate-pulse text-slate-400 font-medium italic">Connecting to Database...</div>
            ) : teachers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                <HiOutlineInbox className="text-5xl text-slate-200 mb-2" />
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No Teachers Found</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-slate-500 uppercase text-[10px] tracking-widest">
                      <th className="px-6 py-4 text-left font-bold">Teacher Profile</th>
                      <th className="px-6 py-4 text-left font-bold">Contact & Date</th>
                      <th className="px-6 py-4 text-left font-bold">Classes</th>
                      <th className="px-6 py-4 text-left font-bold">Subjects</th>
                      <th className="px-6 py-4 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentTeachers.map((t, idx) => {
                      const tId = t._id || t.id;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 border overflow-hidden">
                                {t.logo ? (
                                  <img src={t.logo} alt="admin-logo" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-black">{t.name?.charAt(0)}</div>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 capitalize">{t.name}</div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><HiOutlineLocationMarker /> {t.city || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            <div className="font-medium">{t.email}</div>
                            <div className="text-[10px] text-blue-500 font-bold mt-1">
                              Added: {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1 flex-wrap max-w-[200px]">
                              {t.classes?.map((c: string) => (
                                <span key={c} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">{c}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1 flex-wrap max-w-[200px]">
                              {t.subjects?.map((s: string) => (
                                <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold">{s}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === tId ? null : tId);
                              }}
                              className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                            >
                              <HiOutlineDotsVertical />
                            </button>
                            {openMenuId === tId && (
                              <div ref={menuRef} className="absolute right-6 mt-2 w-48 bg-white border border-slate-100 shadow-2xl rounded-xl z-50 py-1">
                                <button onClick={() => handleEditClick(t)} className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-slate-50 text-slate-700">
                                  <HiOutlinePencil className="text-blue-500" /> Edit Teacher
                                </button>
                                <button onClick={() => confirmDelete(t)} className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 text-red-600 hover:bg-red-50">
                                  <HiOutlineTrash /> Delete Teacher
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* --- Pagination --- */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Showing <span className="font-bold">{indexOfFirstTeacher + 1}</span> to <span className="font-bold">{Math.min(indexOfLastTeacher, teachers.length)}</span> of <span className="font-bold">{teachers.length}</span>
                  </p>
                  <div className="flex gap-2">
                    <button disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all"><HiChevronLeft /></button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button key={i} onClick={() => paginate(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-md' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{i + 1}</button>
                    ))}
                    <button disabled={currentPage === totalPages} onClick={() => paginate(currentPage + 1)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all"><HiChevronRight /></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- MODAL: ADD / EDIT FORM --- */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-2">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-4 flex justify-between items-center bg-slate-900 text-white">
              <h3 className="text-xl font-black">{editingTeacherId ? 'Edit Teacher Profile' : 'Register Teacher'}</h3>
              <button onClick={closeForm} className="w-8 h-8 flex justify-center items-center bg-white/10 hover:bg-red-500 rounded-full transition-all"><HiOutlineX /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} type="text" placeholder="Full Name" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-md outline-none text-sm text-slate-700" />
                <input required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} type="email" placeholder="Email Address" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-md outline-none text-sm text-slate-700" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} type="tel" placeholder="Phone" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-md outline-none text-sm text-slate-700" />
                </div>
                <div className="relative">
                  <HiOutlineLocationMarker className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} type="text" placeholder="City" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-md outline-none text-sm text-slate-700" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    required={!editingTeacherId} 
                    value={formData.password} 
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                    type="password" 
                    placeholder={editingTeacherId ? "New Password (optional)" : "Password"} 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-md outline-none text-sm text-slate-700" 
                  />
                </div>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    required={!editingTeacherId} 
                    value={formData.confirmPassword} 
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} 
                    type="password" 
                    placeholder="Confirm Password" 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-md outline-none text-sm text-slate-700" 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Assign Classes</label>
                <div className="flex flex-wrap gap-2">
                  {classesList.map(cls => (
                    <button key={cls} type="button" onClick={() => toggleClass(cls)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border-2 transition-all ${selectedClasses.includes(cls) ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-100 text-slate-500"}`}>{cls}</button>
                  ))}
                </div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block pt-2">Assign Subjects</label>
                <div className="flex flex-wrap gap-2">
                  {subjectsList.map(sub => (
                    <button key={sub} type="button" onClick={() => toggleSubject(sub)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border-2 transition-all flex items-center gap-1 ${selectedSubjects.includes(sub) ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-100 text-slate-500"}`}>{selectedSubjects.includes(sub) && <HiCheck />} {sub}</button>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white font-black rounded-xl text-xs uppercase tracking-widest mt-4 hover:bg-slate-800 transition-colors">
                {editingTeacherId ? 'Update Teacher Record' : 'Save Teacher Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><HiOutlineTrash size={32} /></div>
            <h2 className="text-xl font-black text-slate-800">Are you sure?</h2>
            <p className="text-slate-500 mt-2 text-sm">Delete <span className="font-bold">{teacherToDelete?.name}</span>? This cannot be undone.</p>
            <div className="grid grid-cols-2 gap-3 mt-8">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;