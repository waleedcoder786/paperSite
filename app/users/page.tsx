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
  HiOutlineBadgeCheck, HiOutlineLocationMarker,
  HiChevronLeft, HiChevronRight, HiSearch, HiOutlineLightningBolt, HiOutlineShieldCheck
} from 'react-icons/hi';
import {
  Trash2, Edit, ChevronDown, ChevronUp, GraduationCap, 
  AlertTriangle, UserPlus, Crown
} from 'lucide-react';

const API_URL = '/api';

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

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Reduced for better mobile UX

  const [selectedPlan, setSelectedPlan] = useState('basic');

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

  const calculateExpiry = (plan: string) => {
    let date = new Date();
    if (plan === 'basic') date.setMonth(date.getMonth() + 3);
    else if (plan === 'pro') date.setFullYear(date.getFullYear() + 1);
    else if (plan === 'premier') date.setFullYear(date.getFullYear() + 3);
    return date.toISOString();
  };

  const validateForm = () => {
    if (formData.name.trim().length < 4) {
      toast.error("Name must be at least 4 characters");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Invalid email format");
      return false;
    }
    const phoneRegex = /^[0-9]{11}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      toast.error("Phone must be exactly 11 digits");
      return false;
    }
    if (!editingAdminId || formData.password) {
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return false;
      }
    }
    return true;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const expiryDate = calculateExpiry(selectedPlan);
      const { confirmPassword, ...dataPayload } = formData;
      
      const payload = { 
        ...dataPayload, 
        planType: selectedPlan,
        accessType: selectedPlan === 'basic' ? 'half' : 'full',
        expiryDate: expiryDate 
      };

      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (editingAdminId) {
        await axios.put(`${API_URL}/users/${editingAdminId}`, payload);
        toast.success('Admin updated successfully');
      } else {
        await axios.post(`${API_URL}/users`, payload);
        toast.success(`Registered with ${selectedPlan.toUpperCase()} plan`);
      }

      setIsFormOpen(false);
      fetchData(user.id || user._id);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Email already exists or server error';
      toast.error(errorMsg);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await axios.delete(`${API_URL}/${deletingItem.type}/${deletingItem.id}`);
      toast.success('Record Deleted Successfully');
      setIsDeleteModalOpen(false);
      fetchData(user.id || user._id); 
    } catch {
      toast.error('Deletion failed');
    }
  };

  const filteredAdmins = subAdmins.filter(admin => 
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    admin.institute.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const currentAdmins = filteredAdmins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openCreateForm = () => {
    setEditingAdminId(null);
    setSelectedPlan('basic');
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
    setSelectedPlan(admin.planType || 'basic');
    setFormData({
      ...admin,
      watermark: admin.watermark || '',
      address: admin.address || '',
      logo: admin.logo || '',
      confirmPassword: admin.password 
    });
    setIsFormOpen(true);
  };

  return (
    <div className="h-screen w-screen bg-[#f8fafc] flex overflow-hidden font-sans text-black">
      <Navbar />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header />
        <div className="flex-1 p-4 md:p-10 overflow-y-auto">
          <div className="max-w-5xl mx-auto pb-24">
            
            <header className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900">Admin Control</h1>
                <p className="text-slate-500 text-xs md:text-sm">Managing Sub-Administrators</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 sm:flex-none">
                   <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                    type="text" 
                    placeholder="Search name or school..." 
                    value={searchQuery}
                    onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
                    className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 ring-slate-100 transition-all text-black"
                   />
                </div>
                <button onClick={openCreateForm} className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-slate-800 transition-all whitespace-nowrap">
                  <UserPlus size={18} /> Add New Admin
                </button>
              </div>
            </header>

            {loading ? (
              <div className="text-center py-20 font-bold text-slate-400 uppercase tracking-widest">Loading...</div>
            ) : (
              <div className="space-y-4">
                {currentAdmins.map(admin => (
                  <div key={admin.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 md:p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 text-black">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 flex-shrink-0 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 border uppercase overflow-hidden">
                          {admin.logo ? <img src={admin.logo} className="w-full h-full object-cover" alt="logo" /> : admin.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-slate-800 truncate">{admin.name}</h3>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${admin.planType === 'premier' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {admin.planType || 'Basic'}
                              </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{admin.institute}</p>
                          <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">
                             Expires: {admin.expiryDate ? new Date(admin.expiryDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between md:justify-end items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                        <button onClick={() => setExpandedAdmin(expandedAdmin === admin.id ? null : admin.id)} className="px-3 py-1.5 bg-slate-100 text-[10px] font-black uppercase rounded-lg flex items-center gap-2 text-slate-600 hover:bg-slate-200 transition-all">
                          {teachers.filter(t => String(t.adminId || t.userId) === String(admin.id)).length} Teachers 
                          {expandedAdmin === admin.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        <div className="flex items-center gap-1">
                            <button onClick={() => openEditForm(admin)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><Edit size={18} /></button>
                            <button onClick={() => {setDeletingItem({id: admin.id, type: 'users'}); setIsDeleteModalOpen(true)}} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    </div>

                    {expandedAdmin === admin.id && (
                      <div className="p-4 md:p-5 bg-slate-50 border-t border-slate-100 space-y-2">
                         {admin.address && (
                            <p className="text-[10px] text-slate-500 mb-2 flex items-start gap-1 italic uppercase font-bold"><HiOutlineLocationMarker className="flex-shrink-0 mt-0.5"/> {admin.address}</p>
                          )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {teachers.filter(t => String(t.adminId || t.userId) === String(admin.id)).length > 0 ? (
                            teachers.filter(t => String(t.adminId || t.userId) === String(admin.id)).map(teacher => (
                                <div key={teacher.id} className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center text-sm shadow-sm">
                                <div className="flex gap-3 items-center min-w-0">
                                    <div className="bg-slate-900 p-2 rounded-lg text-white flex-shrink-0"><GraduationCap size={14}/></div>
                                    <span className="font-bold text-slate-700 truncate">{teacher.name}</span>
                                </div>
                                <button onClick={() => {setDeletingItem({id: teacher.id, type: 'teachers'}); setIsDeleteModalOpen(true)}} className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0 ml-2"><HiOutlineX /></button>
                                </div>
                            ))
                            ) : (
                            <p className="col-span-full text-center text-[10px] text-slate-400 py-2 font-bold uppercase tracking-widest">No faculty found.</p>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {totalPages > 1 && (
                   <div className="mt-8 flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl border border-slate-200 gap-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest order-2 sm:order-1">Page {currentPage} of {totalPages}</p>
                      <div className="flex gap-2 order-1 sm:order-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 text-slate-600 transition-all"><HiChevronLeft size={20} /></button>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 text-slate-600 transition-all"><HiChevronRight size={20} /></button>
                      </div>
                   </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL FORM - FULLY RESPONSIVE */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-2 md:p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl flex flex-col h-full max-h-[95vh] md:max-h-[90vh] overflow-hidden text-black">
            <div className="p-4 flex justify-between items-center bg-slate-900 text-white font-bold uppercase tracking-tight flex-shrink-0">
              <h3 className="text-sm">{editingAdminId ? 'Modify Admin' : 'Register Admin'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="w-8 h-8 flex justify-center items-center hover:bg-white/10 rounded-full transition-all"><HiOutlineX /></button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-5 md:p-8 overflow-y-auto space-y-6 scrollbar-hide">
              {/* Plan Selection UI */}
               <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-100">
                <label className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-4">Select Subscription Plan</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  {[
                    { id: 'basic', title: 'Basic', duration: '3 Months', access: 'Half Access', icon: <HiOutlineShieldCheck /> },
                    { id: 'pro', title: 'Pro', duration: '1 Year', access: 'Full Access', icon: <HiOutlineLightningBolt /> },
                    { id: 'premier', title: 'Premier', duration: '3 Years', access: 'Full Access', icon: <Crown size={18} /> }
                  ].map((plan) => (
                    <div 
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-row sm:flex-col gap-3 items-center sm:items-start ${selectedPlan === plan.id ? 'border-slate-900 bg-white shadow-md' : 'border-slate-200 bg-white/50 hover:border-slate-300'}`}
                    >
                      <div className={`w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center ${selectedPlan === plan.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {plan.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-sm">{plan.title}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{plan.duration}</p>
                        <p className={`text-[9px] font-black px-2 py-0.5 rounded-md mt-1 inline-block ${plan.id === 'basic' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                            {plan.access}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="User Name (Min 4 chars)" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:border-slate-400 transition-all"/>
                </div>
                <div className="relative">
                  <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} type="email" placeholder="Email Address" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:border-slate-400 transition-all"/>
                </div>
              </div>

              <div className="relative">
                <HiOutlineOfficeBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input required value={formData.institute} onChange={(e) => setFormData({...formData, institute: e.target.value})} placeholder="Institute / School Name" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold outline-none focus:border-slate-400 transition-all"/>
              </div>

              <div className="relative">
                <HiOutlineLocationMarker className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Location Address" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:border-slate-400 transition-all"/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="Phone (11 Digits)" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:border-slate-400 transition-all"/>
                </div>
                <div className="relative">
                  <HiOutlineBadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={formData.watermark} onChange={(e) => setFormData({...formData, watermark: e.target.value})} placeholder="Watermark Label" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:border-slate-400 transition-all"/>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required={!editingAdminId} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} type="password" placeholder="Password (Min 6 chars)" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:border-slate-400 transition-all"/>
                </div>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required={!editingAdminId} value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} type="password" placeholder="Verify Password" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:border-slate-400 transition-all"/>
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-slate-900 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex-shrink-0">
                {editingAdminId ? 'Save Profile' : 'Activate Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[300] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-sm text-center shadow-2xl text-black">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertTriangle size={32} />
            </div>
            <h2 className="font-bold text-lg md:text-xl">Are you sure?</h2>
            <p className="text-slate-500 text-[10px] mt-1 font-black uppercase tracking-widest">Data recovery is not possible.</p>
            <div className="grid grid-cols-2 gap-3 mt-8">
              <button onClick={() => setIsDeleteModalOpen(false)} className="py-3 bg-slate-100 rounded-xl font-bold text-[10px] uppercase hover:bg-slate-200 transition-all">Cancel</button>
              <button onClick={handleDelete} className="py-3 bg-red-600 text-white rounded-xl font-bold text-[10px] uppercase shadow-lg shadow-red-100 hover:bg-red-700 transition-all">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}