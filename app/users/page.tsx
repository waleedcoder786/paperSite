'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '../components/navbar/page';
import Header from '../components/topbar/page';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  HiOutlineX, HiOutlinePhone, HiOutlineLockClosed, 
  HiOutlineUser, HiOutlineMail, HiOutlineOfficeBuilding, 
  HiOutlineBadgeCheck, HiOutlineLocationMarker, HiOutlinePhotograph,
  HiChevronLeft, HiChevronRight, HiSearch
} from 'react-icons/hi';
import {
  Trash2, Edit, ChevronDown, ChevronUp, GraduationCap, 
  AlertTriangle, UserPlus
} from 'lucide-react';

// API BASE URL
const API_URL = 'http://localhost:5000/api';

export default function UsersPage() {
  const router = useRouter();
  const [subAdmins, setSubAdmins] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAdmin, setExpandedAdmin] = useState<string | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ id: string; type: 'users' | 'teachers' } | null>(null);

  // --- Search & Pagination States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', institute: '', 
    watermark: '', address: '', logo: '', 
    password: '', confirmPassword: '', role: 'admin',
    profilePic: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'superadmin') {
      toast.error('Access Denied!');
      router.push('/dashboard');
      return;
    }
    fetchData(user.id || user._id);
  }, []);

  const fetchData = async (currentUserId: string) => {
    try {
      const [userRes, teacherRes] = await Promise.all([
        axios.get(`${API_URL}/users`),
        axios.get(`${API_URL}/teachers`)
      ]);
      
      const standardizedUsers = userRes.data.map((u: any) => ({ ...u, id: u._id || u.id }));
      const standardizedTeachers = teacherRes.data.map((t: any) => ({ ...t, id: t._id || t.id }));

      const filteredAdmins = standardizedUsers.filter((u: any) => 
        String(u.id) !== String(currentUserId) && u.role === 'admin'
      );
      
      setSubAdmins(filteredAdmins);
      setTeachers(standardizedTeachers);
    } catch {
      toast.error('Data loading failed');
    } finally {
      setLoading(false);
    }
  };

  // --- Filtered Data & Pagination Logic ---
  const filteredAdmins = subAdmins.filter(admin => 
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    admin.institute.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAdmins = filteredAdmins.slice(indexOfFirstItem, indexOfLastItem);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const openCreateForm = () => {
    setEditingAdminId(null);
    setFormData({ 
        name: '', email: '', phone: '', institute: '', 
        watermark: '', address: '', logo: '', 
        password: '', confirmPassword: '', role: 'admin', 
        profilePic: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' 
    });
    setIsFormOpen(true);
  };

  const openEditForm = (admin: any) => {
    setEditingAdminId(admin.id);
    setFormData({
      ...admin,
      watermark: admin.watermark || '',
      address: admin.address || '',
      logo: admin.logo || '',
      confirmPassword: admin.password 
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match');

    try {
      const { confirmPassword, ...payload } = formData;
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (editingAdminId) {
        await axios.put(`${API_URL}/users/${editingAdminId}`, payload);
        toast.success('Admin updated successfully');
      } else {
        await axios.post(`${API_URL}/users`, payload);
        toast.success('Admin registered successfully');
      }

      setIsFormOpen(false);
      fetchData(user.id || user._id);
    } catch {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const deleteUrl = `${API_URL}/${deletingItem.type}/${deletingItem.id}`;
      const res = await axios.delete(deleteUrl);
      if (res.status === 200 || res.status === 204) {
        toast.success('Record Deleted Successfully');
        setIsDeleteModalOpen(false);
        fetchData(user.id || user._id); 
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Server connection error');
    }
  };

  return (
    <div className="h-screen w-screen bg-[#f8fafc] flex overflow-hidden font-sans text-black">
      <Navbar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 p-10 overflow-y-auto">
          <div className="max-w-5xl mx-auto pb-20">
            <header className="mb-8 flex flex-wrap justify-between items-end gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Admin Control</h1>
                <p className="text-slate-500 text-sm">Managing Sub-Administrators</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative">
                   <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                    type="text" 
                    placeholder="Search name or school..." 
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm w-64 focus:ring-2 ring-slate-100 transition-all"
                   />
                </div>
                <button onClick={openCreateForm} className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl hover:bg-slate-800 transition-all">
                  <UserPlus size={18} /> Add New Admin
                </button>
              </div>
            </header>

            {loading ? (
              <div className="text-center py-20 font-bold text-slate-400">Loading Admin Directory...</div>
            ) : (
              <div className="space-y-4">
                {currentAdmins.length > 0 ? (
                  currentAdmins.map(admin => (
                    <div key={admin.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-5 flex justify-between items-center">
                        <div className="flex gap-4 items-center">
                          {admin.logo ? (
                              <img src={admin.logo} alt="logo" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                          ) : (
                              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 border uppercase">{admin.name.charAt(0)}</div>
                          )}
                          <div>
                            <h3 className="font-bold text-slate-800">{admin.name}</h3>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                              {admin.institute} {admin.watermark && `| ${admin.watermark}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setExpandedAdmin(expandedAdmin === admin.id ? null : admin.id)} className="px-3 py-1.5 bg-slate-100 text-[10px] font-black uppercase rounded-lg flex items-center gap-2">
                            {teachers.filter(t => String(t.adminId || t.userId) === String(admin.id)).length} Teachers
                            {expandedAdmin === admin.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          <button onClick={() => openEditForm(admin)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><Edit size={18} /></button>
                          <button onClick={() => {setDeletingItem({id: admin.id, type: 'users'}); setIsDeleteModalOpen(true)}} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
                        </div>
                      </div>

                      {expandedAdmin === admin.id && (
                        <div className="p-5 bg-slate-50 border-t border-slate-100 grid grid-cols-1 gap-2">
                          {admin.address && (
                              <p className="text-[10px] text-slate-500 mb-2 flex items-center gap-1 italic"><HiOutlineLocationMarker/> {admin.address}</p>
                          )}
                          {teachers.filter(t => String(t.adminId || t.userId) === String(admin.id)).length > 0 ? (
                            teachers.filter(t => String(t.adminId || t.userId) === String(admin.id)).map(teacher => (
                              <div key={teacher.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                                <div className="flex gap-3 items-center">
                                    <div className="bg-slate-900 p-2 rounded-lg text-white"><GraduationCap size={16}/></div>
                                    <div>
                                        <p className="font-bold text-sm">{teacher.name}</p>
                                        <div className="flex gap-1 mt-1">
                                            {teacher.subjects?.map((s:any) => <span key={s} className="bg-emerald-50 text-emerald-600 text-[9px] px-1.5 py-0.5 rounded font-bold">{s}</span>)}
                                            {teacher.classes?.map((c:any) => <span key={c} className="bg-blue-50 text-blue-600 text-[9px] px-1.5 py-0.5 rounded font-bold">{c}</span>)}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => {setDeletingItem({id: teacher.id, type: 'teachers'}); setIsDeleteModalOpen(true)}} className="text-slate-200 hover:text-red-500 transition-colors"><HiOutlineX /></button>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-xs text-slate-400 py-2">No teachers linked to this admin.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No matching admins found</p>
                  </div>
                )}

                {/* --- Pagination Controls --- */}
                {filteredAdmins.length > itemsPerPage && (
                  <div className="mt-8 flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all text-slate-600"
                      >
                        <HiChevronLeft size={20} />
                      </button>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-9 h-9 rounded-lg text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-slate-900 text-white shadow-lg' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all text-slate-600"
                      >
                        <HiChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL (Form) - SAME AS BEFORE */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-2">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-4 flex justify-between items-center bg-slate-900 text-white">
              <h3 className="text-xl font-black tracking-tight">{editingAdminId ? 'Update Admin Profile' : 'Register New Admin'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="w-8 h-8 flex justify-center items-center bg-white/10 hover:bg-red-500 rounded-full transition-all"><HiOutlineX /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-8 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} type="text" placeholder="Full Name" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-md outline-none text-sm text-slate-700" />
                </div>
                <div className="relative">
                  <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} type="email" placeholder="Email Address" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-md outline-none text-sm text-slate-700" />
                </div>
              </div>

              <div className="relative">
                <HiOutlineOfficeBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input required value={formData.institute} onChange={(e) => setFormData({ ...formData, institute: e.target.value })} type="text" placeholder="Institute / School Name" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-md outline-none text-sm text-slate-700 font-bold" />
              </div>

              <div className="relative">
                <HiOutlineLocationMarker className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} type="text" placeholder="Institute Address (Optional)" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-md outline-none text-sm text-slate-700" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} type="tel" placeholder="Phone" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-md outline-none text-sm text-slate-700" />
                </div>
                <div className="relative">
                  <HiOutlineBadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={formData.watermark} onChange={(e) => setFormData({ ...formData, watermark: e.target.value })} type="text" placeholder="Watermark (Optional)" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-md outline-none text-sm text-slate-700" />
                </div>
              </div>

              <div className="relative">
                <HiOutlinePhotograph className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={formData.logo} onChange={(e) => setFormData({ ...formData, logo: e.target.value })} type="url" placeholder="Institute Logo URL (Optional)" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-md outline-none text-sm text-slate-700" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} type="password" placeholder="Password" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-md outline-none text-sm text-slate-700" />
                </div>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} type="password" placeholder="Confirm Password" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-md outline-none text-sm text-slate-700" />
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-slate-900 text-white font-black rounded-xl text-xs uppercase tracking-widest mt-4 hover:bg-slate-800 transition-colors">
                {editingAdminId ? 'Save Profile Changes' : 'Initialize Admin Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL - SAME AS BEFORE */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[300] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold">Are you sure?</h2>
            <p className="text-slate-500 text-xs mt-2 uppercase font-black tracking-widest">Linked faculty will be permanently wiped.</p>
            <div className="grid grid-cols-2 gap-3 mt-8">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-3 bg-slate-100 rounded-xl font-bold text-[10px] uppercase">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-3 bg-red-600 text-white rounded-xl font-bold text-[10px] uppercase shadow-lg shadow-red-200">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}