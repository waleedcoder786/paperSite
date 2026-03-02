"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Navbar from "../components/navbar/page";
import Header from "../components/topbar/page";
import { 
  FileText, Plus, Database, UploadCloud, 
  Loader2, MousePointer2, FileSpreadsheet, ChevronRight,
  Layers, Tag, Info, BookOpen, AlertCircle, DatabaseZap
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const WhiteAdminPanel = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [type, setType] = useState("mcq"); 
  const [inputMode, setInputMode] = useState<"manual" | "excel">("manual");
  const [allClassesData, setAllClassesData] = useState<any[]>([]);
  const [isNewTopic, setIsNewTopic] = useState(false);

  const [formData, setFormData] = useState({
    classId: "", 
    subjectName: "",
    chapterName: "",
    category: "Exercise Questions",
    topic: "",
    question: "",
    options: { A: "", B: "", C: "", D: "" },
    answer: "", 
  });

  const API_URL = "https://backendrepoo-production.up.railway.app/api/classes"; 

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUser && (storedUser.role === "superadmin" || storedUser.email === "admin@example.com")) {
      setUser(storedUser);
      fetchDB();
    }
  }, []);

  const fetchDB = async () => {
    try {
      const res = await axios.get(`${API_URL}`);
      if (Array.isArray(res.data)) {
        setAllClassesData(res.data);
      }
    } catch (err) {
      toast.error("Database Connection Error");
    }
  };

  // --- HIERARCHY LOGIC ---
  const classesList = allClassesData[0]?.classes || (Array.isArray(allClassesData) ? allClassesData : []);
  const selectedClassObj = classesList.find((c: any) => c.id === formData.classId);
  const availableSubjects = selectedClassObj?.subjects || [];
  const selectedSubjectObj = availableSubjects.find((s: any) => s.name === formData.subjectName);
  const availableChapters = (selectedSubjectObj?.chapters || []).map((ch: any) => typeof ch === 'string' ? { name: ch } : ch);
  const selectedChapterObj = availableChapters.find((ch: any) => ch.name === formData.chapterName);
  const availableTopics = selectedChapterObj?.topics?.map((t: any) => t.name) || [];

  const isPathSelected = formData.classId !== "" && formData.subjectName !== "" && formData.chapterName !== "";

  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPathSelected) return toast.error("Select Class, Subject & Chapter!");
    if (!formData.topic) return toast.error("Please provide a Topic!");
    
    setLoading(true);
    try {
      await axios.post(`${API_URL}/add-question`, {
        ...formData,
        type,
        newQuestion: {
          q_no: Date.now(),
          question: formData.question,
          options: type === 'mcq' ? formData.options : undefined,
          answer: formData.answer,
          topic: formData.topic
        }
      });
      toast.success("Saved in Database!");
      // Reset only question specific fields
      setFormData({ ...formData, question: "", answer: "", options: { A: "", B: "", C: "", D: "" } });
      setIsNewTopic(false);
      fetchDB(); // Refresh UI to see new topic in dropdown
    } catch (err) {
      toast.error("Save failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formData.topic) return toast.error("Select topic first!");

    setBulkLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const data: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        
        toast.loading(`Importing ${data.length} items...`, { id: 'bulk' });
        for (const row of data) {
          await axios.post(`${API_URL}/add-question`, {
            ...formData,
            type,
            newQuestion: {
              q_no: Date.now() + Math.random(),
              question: row.question,
              options: type === 'mcq' ? { A: row.A, B: row.B, C: row.C, D: row.D } : undefined,
              answer: String(row.answer || ""),
              topic: formData.topic
            }
          });
        }
        toast.success("Bulk Upload Complete!", { id: 'bulk' });
        fetchDB();
      } catch (err) {
        toast.error("Upload failed");
      } finally {
        setBulkLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex h-screen bg-[#FCFCFD] text-slate-800 overflow-hidden font-sans">
      <Toaster position="top-center" />
      <Navbar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]/60 p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* 1. TYPE SELECTOR */}
            <div className="flex bg-white w-fit p-1.5 rounded-xl shadow-sm border border-slate-200">
              {['mcq', 'short', 'long'].map(t => (
                <button 
                  key={t} onClick={() => setType(t)}
                  className={`px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${type === t ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* 2. HIERARCHY SELECTOR */}
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Class</label>
                  <select value={formData.classId} onChange={(e) => setFormData({...formData, classId: e.target.value, subjectName: "", chapterName: "", topic: ""})} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 focus:border-blue-500 outline-none text-sm font-semibold">
                    <option value="">Select Class</option>
                    {classesList.map((c: any) => <option key={c.id} value={c.id}>{c.title || c.id}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Subject</label>
                  <select disabled={!formData.classId} value={formData.subjectName} onChange={(e) => setFormData({...formData, subjectName: e.target.value, chapterName: "", topic: ""})} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 focus:border-blue-500 outline-none text-sm font-semibold disabled:opacity-50">
                    <option value="">Select Subject</option>
                    {availableSubjects.map((s: any) => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Chapter</label>
                  <select disabled={!formData.subjectName} value={formData.chapterName} onChange={(e) => setFormData({...formData, chapterName: e.target.value, topic: ""})} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 focus:border-blue-500 outline-none text-sm font-semibold disabled:opacity-50">
                    <option value="">Select Chapter</option>
                    {availableChapters.map((ch: any, i: number) => <option key={i} value={ch.name}>{ch.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between px-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Topic</label>
                    <button type="button" onClick={() => { setIsNewTopic(!isNewTopic); setFormData({...formData, topic: ""}); }} className="text-[9px] font-black text-blue-600 hover:underline">
                      {isNewTopic ? 'Cancel' : 'Create+'}
                    </button>
                  </div>
                  {isNewTopic ? (
                    <input autoFocus type="text" placeholder="New Topic..." value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})} className="w-full bg-blue-50/50 p-3 rounded-xl border border-blue-200 outline-none text-sm font-bold text-blue-700" />
                  ) : (
                    <select disabled={!formData.chapterName} value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 focus:border-blue-500 outline-none text-sm font-semibold disabled:opacity-50">
                      <option value="">Choose Topic</option>
                      {availableTopics.map((t: string, i: number) => <option key={i} value={t}>{t}</option>)}
                    </select>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Section</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-indigo-50/50 text-indigo-700 p-3 rounded-xl border border-indigo-100 outline-none text-sm font-bold">
                    <option value="Exercise Questions">Exercise</option>
                    <option value="Additional Questions">Additional</option>
                    <option value="Pastpapers Questions">Pastpapers</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. INPUT MODE */}
            <div className="flex gap-4 p-1 bg-slate-200/50 rounded-xl w-fit">
              <button onClick={() => setInputMode("manual")} className={`px-6 py-2 rounded-lg text-xs font-bold uppercase ${inputMode === "manual" ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Manual</button>
              <button onClick={() => setInputMode("excel")} className={`px-6 py-2 rounded-lg text-xs font-bold uppercase ${inputMode === "excel" ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Excel Import</button>
            </div>

            {/* 4. WORKSPACE */}
            <div className={`${!isPathSelected ? 'opacity-30 pointer-events-none' : 'opacity-100'} transition-all`}>
              {inputMode === "manual" ? (
                <form onSubmit={handleSaveManual} className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100 space-y-6">
                  <textarea required rows={2} value={formData.question} onChange={(e) => setFormData({...formData, question: e.target.value})} className="w-full bg-slate-50 p-4 rounded-xl border border-transparent focus:border-blue-500 outline-none font-medium" placeholder="Type question statement..."></textarea>
                  
                  {type === 'mcq' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['A', 'B', 'C', 'D'].map(o => (
                        <div key={o} className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="w-8 h-8 flex items-center justify-center bg-white rounded-lg font-black text-slate-400">{o}</span>
                          <input type="text" placeholder={`Option ${o}`} value={(formData.options as any)[o]} onChange={(e) => setFormData({...formData, options: {...formData.options, [o]: e.target.value}})} className="bg-transparent flex-1 outline-none text-sm font-medium" />
                        </div>
                      ))}
                      <div className="col-span-full pt-4">
                        <p className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-widest">Correct Answer</p>
                        <div className="flex gap-3">
                          {['A','B','C','D'].map(a => (
                            <button key={a} type="button" onClick={() => setFormData({...formData, answer: a})} className={`flex-1 py-3 rounded-xl font-black transition-all ${formData.answer === a ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}>{a}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {type !== 'mcq' && (
                    <textarea rows={4} value={formData.answer} onChange={(e) => setFormData({...formData, answer: e.target.value})} className="w-full bg-slate-50 p-4 rounded-xl border border-transparent focus:border-blue-500 outline-none font-medium" placeholder="Solution / Reference Key..."></textarea>
                  )}

                  <button disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase flex items-center justify-center gap-3 hover:bg-slate-800 transition-all">
                    {loading ? <Loader2 className="animate-spin" /> : <><DatabaseZap size={18} /> Store Data</>}
                  </button>
                </form>
              ) : (
                <div className="bg-white rounded-2xl p-16 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center space-y-6">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><UploadCloud size={32} /></div>
                  <div className="text-center">
                    <p className="font-bold">Import Excel for "{formData.topic || 'New Topic'}"</p>
                    <p className="text-xs text-slate-400 mt-1">Format: question, A, B, C, D, answer (for MCQ)</p>
                  </div>
                  <input type="file" id="xl-input" className="hidden" accept=".xlsx, .xls" onChange={handleExcelUpload} />
                  <label htmlFor="xl-input" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold cursor-pointer hover:bg-slate-800">
                    {bulkLoading ? "Processing..." : "Choose File"}
                  </label>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WhiteAdminPanel;
