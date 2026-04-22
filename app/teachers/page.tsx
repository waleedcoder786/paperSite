"use client";
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/navbar/page';
import Header from '../components/topbar/page';
import {
  HiOutlineUserAdd, HiOutlineX, HiCheck, HiOutlineDotsVertical,
  HiOutlinePencil, HiOutlineLocationMarker, HiOutlinePhone,
  HiOutlineTrash, HiOutlineInbox, HiOutlineLockClosed,
  HiChevronLeft, HiChevronRight,
} from 'react-icons/hi';
import axios from 'axios';
import toast from 'react-hot-toast';

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
    name: '', email: '', phone: '', city: '', password: '', confirmPassword: ''
  });

  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const classesList = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
  const subjectsList = ["Physics", "Chemistry", "Math", "Computer", "English", "Urdu", "Islamiat", "Stats"];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const admin = JSON.parse(storedUser);
    const adminId = admin.id || admin._id || admin.data?._id || admin.data?.id;
    if (adminId) fetchTeachers(adminId);
  }, []);

  const fetchTeachers = async (adminId: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}?adminId=${adminId}`);
      setTeachers(res.data);
    } catch (err) {
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastTeacher = currentPage * teachersPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage;
  const currentTeachers = teachers.slice(indexOfFirstTeacher, indexOfLastTeacher);
  const totalPages = Math.ceil(teachers.length / teachersPerPage);

  const toggleClass = (item: string) => {
    setSelectedClasses(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const toggleSubject = (item: string) => {
    setSelectedSubjects(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleEditClick = (teacher: any) => {
    setEditingTeacherId(teacher._id || teacher.id);
    setFormData({
      name: teacher.name, email: teacher.email, phone: teacher.phone, city: teacher.city,
      password: '', confirmPassword: ''
    });
    setSelectedClasses(teacher.classes || []);
    setSelectedSubjects(teacher.subjects || []);
    setIsFormOpen(true);
    setOpenMenuId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return toast.error("Session expired.");
    const admin = JSON.parse(storedUser);
    const actualAdminId = admin._id || admin.id || admin.data?._id || admin.data?.id;

    if (formData.password !== formData.confirmPassword) return toast.error("Passwords mismatch");

    const { confirmPassword, ...data } = formData;
    const payload = {
      ...data,
      classes: selectedClasses,
      subjects: selectedSubjects,
      adminId: actualAdminId,
      role: "teacher"
    };

    try {
      if (editingTeacherId) {
        await axios.put(`${API_BASE_URL}/${editingTeacherId}`, payload);
        toast.success("Updated!");
      } else {
        await axios.post(API_BASE_URL, payload);
        toast.success("Registered!");
      }
      fetchTeachers(actualAdminId);
      closeForm();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error saving");
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTeacherId(null);
    setFormData({ name: '', email: '', phone: '', city: '', password: '', confirmPassword: '' });
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
      toast.success("Deleted");
    } catch {
      toast.error("Error deleting");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col lg:flex-row overflow-hidden font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <div className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800">Teachers</h2>
                <p className="text-slate-500 text-xs sm:text-sm">Manage academic staff records</p>
              </div>
              <button
                onClick={() => setIsFormOpen(true)}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                <HiOutlineUserAdd /> Add Teacher
              </button>
            </div>

            {loading ? (
              <div className="text-center py-20 text-slate-400 italic">Connecting to Database...</div>
            ) : teachers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                <HiOutlineInbox className="text-5xl text-slate-200 mb-2" />
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No Teachers Found</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr className="text-slate-500 uppercase text-[10px] tracking-widest text-left">
                        <th className="px-6 py-4 font-bold">Profile</th>
                        <th className="px-6 py-4 font-bold">Contact</th>
                        <th className="px-6 py-4 font-bold">Classes</th>
                        <th className="px-6 py-4 font-bold">Subjects</th>
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
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 border flex items-center justify-center text-slate-400 font-black overflow-hidden">
                                  {t.logo ? <img src={t.logo} className="w-full h-full object-cover" /> : t.name?.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800 capitalize truncate max-w-[120px]">{t.name}</div>
                                  <div className="text-[10px] text-slate-400 flex items-center gap-1"><HiOutlineLocationMarker /> {t.city || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              <div className="font-medium truncate max-w-[150px]">{t.email}</div>
                              <div className="text-[10px] text-blue-500 font-bold mt-1">Added: {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-1 flex-wrap max-w-[150px]">
                                {t.classes?.slice(0, 3).map((c: string) => (
                                  <span key={c} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">{c}</span>
                                ))}
                                {t.classes?.length > 3 && <span className="text-[10px] text-slate-400">+{t.classes.length - 3}</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-1 flex-wrap max-w-[150px]">
                                {t.subjects?.slice(0, 2).map((s: string) => (
                                  <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold">{s}</span>
                                ))}
                                {t.subjects?.length > 2 && <span className="text-[10px] text-slate-400">+{t.subjects.length - 2}</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right relative">
                              <button onClick={() => setOpenMenuId(openMenuId === tId ? null : tId)} className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
                                <HiOutlineDotsVertical />
                              </button>
                              {openMenuId === tId && (
                                <div ref={menuRef} className="absolute right-6 mt-2 w-48 bg-white border border-slate-100 shadow-2xl rounded-xl z-50 py-1">
                                  <button onClick={() => handleEditClick(t)} className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-slate-50"><HiOutlinePencil className="text-blue-500" /> Edit</button>
                                  <button onClick={() => confirmDelete(t)} className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 text-red-600 hover:bg-red-50"><HiOutlineTrash /> Delete</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden grid grid-cols-1 divide-y divide-slate-100">
                  {currentTeachers.map((t, idx) => {
                    const tId = t._id || t.id;
                    return (
                      <div key={idx} className="p-4 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border flex items-center justify-center font-black text-slate-400 uppercase">
                               {t.name?.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800">{t.name}</h3>
                              <p className="text-xs text-slate-500 flex items-center gap-1"><HiOutlineLocationMarker /> {t.city}</p>
                            </div>
                          </div>
                          <button onClick={() => setOpenMenuId(openMenuId === tId ? null : tId)} className="p-2 text-slate-400"><HiOutlineDotsVertical /></button>
                        </div>
                        {openMenuId === tId && (
                           <div className="flex gap-2 mb-2">
                             <button onClick={() => handleEditClick(t)} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">Edit</button>
                             <button onClick={() => confirmDelete(t)} className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold">Delete</button>
                           </div>
                        )}
                        <div className="space-y-2">
                          <div className="text-xs text-slate-600 truncate"><strong>Email:</strong> {t.email}</div>
                          <div className="flex flex-wrap gap-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase mr-2">Classes:</span>
                            {t.classes?.map((c: string) => <span key={c} className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold">{c}</span>)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-slate-500 order-2 sm:order-1">
                    Showing <span className="font-bold">{indexOfFirstTeacher + 1}</span> to <span className="font-bold">{Math.min(indexOfLastTeacher, teachers.length)}</span> of <span className="font-bold">{teachers.length}</span>
                  </p>
                  <div className="flex gap-1 sm:gap-2 order-1 sm:order-2">
                    <button disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30"><HiChevronLeft /></button>
                    <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                        <button key={i} onClick={() => paginate(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-bold ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600'}`}>{i + 1}</button>
                        ))}
                    </div>
                    <button disabled={currentPage === totalPages} onClick={() => paginate(currentPage + 1)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30"><HiChevronRight /></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL: FORM (Responsive) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-6">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-4 flex justify-between items-center bg-slate-900 text-white">
              <h3 className="text-lg sm:text-xl font-black">{editingTeacherId ? 'Edit Profile' : 'Add Teacher'}</h3>
              <button onClick={closeForm} className="w-8 h-8 flex justify-center items-center bg-white/10 hover:bg-red-500 rounded-full transition-all"><HiOutlineX /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 sm:p-8 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} type="text" placeholder="Full Name" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm text-slate-700 focus:ring-2 ring-blue-100" />
                <input required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} type="email" placeholder="Email Address" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm text-slate-700 focus:ring-2 ring-blue-100" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} type="tel" placeholder="Phone" className="w-full pl-12  text-slate-800 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm focus:ring-2 ring-blue-100" />
                </div>
                <div className="relative">
                  <HiOutlineLocationMarker className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} type="text" placeholder="City" className="w-full pl-12 pr-4 py-3 text-slate-800 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm focus:ring-2 ring-blue-100" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required={!editingTeacherId} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} type="password" placeholder="Password" className="w-full px-4 py-3 text-slate-800 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm focus:ring-2 ring-blue-100" />
                <input required={!editingTeacherId} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} type="password" placeholder="Confirm Password" className="w-full text-slate-800 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm focus:ring-2 ring-blue-100" />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign Classes</label>
                <div className="flex flex-wrap gap-2">
                  {classesList.map(cls => (
                    <button key={cls} type="button" onClick={() => toggleClass(cls)} className={`px-3 py-2 rounded-lg text-[10px] font-bold border-2 transition-all ${selectedClasses.includes(cls) ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-100 text-slate-500"}`}>{cls}</button>
                  ))}
                </div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pt-2">Assign Subjects</label>
                <div className="flex flex-wrap gap-2">
                  {subjectsList.map(sub => (
                    <button key={sub} type="button" onClick={() => toggleSubject(sub)} className={`px-3 py-2 rounded-lg text-[10px] font-bold border-2 transition-all flex items-center gap-1 ${selectedSubjects.includes(sub) ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-100 text-slate-500"}`}>{selectedSubjects.includes(sub) && <HiCheck />} {sub}</button>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white font-black rounded-xl text-xs uppercase tracking-widest mt-4 hover:bg-slate-800 active:scale-95 transition-all">
                {editingTeacherId ? 'Update Record' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL (Responsive) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><HiOutlineTrash size={28} /></div>
            <h2 className="text-lg sm:text-xl font-black text-slate-800">Are you sure?</h2>
            <p className="text-slate-500 mt-2 text-xs sm:text-sm">Delete <span className="font-bold">{teacherToDelete?.name}</span>?</p>
            <div className="grid grid-cols-2 gap-3 mt-8">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-3 bg-red-600 text-white rounded-xl font-bold text-[10px] uppercase">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;