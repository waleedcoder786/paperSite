"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Navbar from "../components/navbar/page";
import Header from "../components/topbar/page";
import { 
  Plus, UploadCloud, Loader2, DatabaseZap, 
  Database, ArrowLeft, GraduationCap, ChevronRight
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const WhiteAdminPanel = () => {
  // --- SELECTION STATES ---
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [type, setType] = useState("mcq"); 
  const [inputMode, setInputMode] = useState<"manual" | "excel">("manual");
  const [allClassesData, setAllClassesData] = useState<any[]>([]);
  
  // --- HIERARCHY TOGGLES ---
  const [isNewClass, setIsNewClass] = useState(false);
  const [isNewSubject, setIsNewSubject] = useState(false);
  const [isNewChapter, setIsNewChapter] = useState(false);
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

  // const API_URL = "https://backendrepoo-production.up.railway.app/api/classes";
  const API_URL = "https://testbackend-production-69cb.up.railway.app/api/classes";

  useEffect(() => {
    fetchDB();
  }, []);

  const fetchDB = async () => {
    try {
      const res = await axios.get(`${API_URL}`);
      setAllClassesData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Database Connection Error");
    }
  };

  // --- HIERARCHY DATA FILTERING ---
  const classesList = allClassesData[0]?.classes || [];
  const selectedClassObj = classesList.find((c: any) => c.id === formData.classId);
  const availableSubjects = selectedClassObj?.subjects || [];
  const selectedSubjectObj = availableSubjects.find((s: any) => s.name === formData.subjectName);
  const availableChapters = (selectedSubjectObj?.chapters || []).map((ch: any) => typeof ch === 'string' ? { name: ch } : ch);
  const selectedChapterObj = availableChapters.find((ch: any) => ch.name === formData.chapterName);
  const availableTopics = selectedChapterObj?.topics?.map((t: any) => t.name) || [];

  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.classId || !formData.subjectName || !formData.chapterName || !formData.topic) {
        return toast.error("Please fill all hierarchy fields!");
    }
    
    setLoading(true);
    try {
      await axios.post(`${API_URL}/add-question`, {
        ...formData,
        board: selectedBoard,
        type,
        newQuestion: {
          question: formData.question,
          options: type === 'mcq' ? formData.options : undefined,
          answer: formData.answer,
        }
      });
      toast.success("Saved Successfully!");
      setFormData({ ...formData, question: "", answer: "", options: { A: "", B: "", C: "", D: "" } });
      fetchDB();
    } catch (err) {
      toast.error("Save failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formData.topic) return toast.error("Select path first!");

    setBulkLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const data: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        
        toast.loading(`Importing to ${selectedBoard}...`, { id: 'bulk' });
        for (const row of data) {
          await axios.post(`${API_URL}/add-question`, {
            ...formData, 
            board: selectedBoard,
            type,
            newQuestion: {
              question: row.question,
              options: type === 'mcq' ? { A: row.A, B: row.B, C: row.C, D: row.D } : undefined,
              answer: String(row.answer || ""),
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
      
      {/* SIDEBAR - ALWAYS VISIBLE */}
      <Navbar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* TOPBAR - ALWAYS VISIBLE */}
        <Header />

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]/60 p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {!selectedBoard ? (
              /* ================= BOARD SELECTION VIEW ================= */
              <div className="min-h-[70vh] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-12 space-y-3">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">Select Active Board</h1>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Your progress will be saved under the selected board</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
                  {["LAHORE BOARD", "FEDERAL BOARD"].map((board) => (
                    <button
                      key={board}
                      onClick={() => setSelectedBoard(board)}
                      className="group bg-white border border-slate-200 hover:border-blue-500 p-10 rounded-3xl transition-all duration-300 hover:shadow-xl active:scale-95 flex flex-col items-center gap-6"
                    >
                      <div className="w-16 h-16 bg-slate-50 group-hover:bg-blue-600 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-white transition-all">
                        <DatabaseZap size={32} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-slate-800 tracking-tight">{board}</span>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* ================= CONTENT VIEW (AFTER SELECTION) ================= */
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                
                {/* STATUS BAR */}
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSelectedBoard(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400" title="Change Board">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Current Database</p>
                            <h2 className="text-lg font-black text-blue-600 tracking-tight">{selectedBoard}</h2>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {['mcq', 'short', 'long'].map(t => (
                        <button key={t} onClick={() => setType(t)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === t ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                            {t}
                        </button>
                        ))}
                    </div>
                </div>

                {/* HIERARCHY SELECTOR */}
                <div className="bg-white rounded-md p-8 shadow-xl border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Class</label>
                        <button onClick={() => setIsNewClass(!isNewClass)} className="text-[9px] font-black text-blue-600 uppercase">{isNewClass ? 'Select' : 'New+'}</button>
                      </div>
                      {isNewClass ? <input type="text" placeholder="e.g. 10" value={formData.classId} onChange={(e) => setFormData({...formData, classId: e.target.value})} className="w-full bg-blue-50/50 p-4 rounded-md border border-blue-200 outline-none text-sm font-bold text-blue-700" /> :
                        <select value={formData.classId} onChange={(e) => setFormData({...formData, classId: e.target.value, subjectName: "", chapterName: "", topic: ""})} className="w-full bg-slate-50 p-4 rounded-md border border-slate-200 text-sm font-bold">
                          <option value="">Select Class</option>
                          {classesList.map((c: any) => <option key={c.id} value={c.id}>{c.title || c.id}</option>)}
                        </select>}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Subject</label>
                        <button onClick={() => setIsNewSubject(!isNewSubject)} className="text-[9px] font-black text-blue-600 uppercase">{isNewSubject ? 'Select' : 'New+'}</button>
                      </div>
                      {isNewSubject ? <input type="text" placeholder="e.g. English" value={formData.subjectName} onChange={(e) => setFormData({...formData, subjectName: e.target.value})} className="w-full bg-blue-50/50 p-4 rounded-md border border-blue-200 outline-none text-sm font-bold text-blue-700" /> :
                        <select disabled={!formData.classId} value={formData.subjectName} onChange={(e) => setFormData({...formData, subjectName: e.target.value, chapterName: "", topic: ""})} className="w-full bg-slate-50 p-4 rounded-md border border-slate-200 text-sm font-bold disabled:opacity-50">
                          <option value="">Select Subject</option>
                          {availableSubjects.map((s: any) => <option key={s.name} value={s.name}>{s.name}</option>)}
                        </select>}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Chapter</label>
                        <button onClick={() => setIsNewChapter(!isNewChapter)} className="text-[9px] font-black text-blue-600 uppercase">{isNewChapter ? 'Select' : 'New+'}</button>
                      </div>
                      {isNewChapter ? <input type="text" placeholder="Chapter..." value={formData.chapterName} onChange={(e) => setFormData({...formData, chapterName: e.target.value})} className="w-full bg-blue-50/50 p-4 rounded-md border border-blue-200 outline-none text-sm font-bold text-blue-700" /> :
                        <select disabled={!formData.subjectName} value={formData.chapterName} onChange={(e) => setFormData({...formData, chapterName: e.target.value, topic: ""})} className="w-full bg-slate-50 p-4 rounded-md border border-slate-200 text-sm font-bold disabled:opacity-50">
                          <option value="">Select Chapter</option>
                          {availableChapters.map((ch: any, i: number) => <option key={i} value={ch.name}>{ch.name}</option>)}
                        </select>}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Topic</label>
                        <button onClick={() => setIsNewTopic(!isNewTopic)} className="text-[9px] font-black text-blue-600 uppercase">{isNewTopic ? 'Select' : 'New+'}</button>
                      </div>
                      {isNewTopic ? <input type="text" placeholder="New Topic..." value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})} className="w-full bg-blue-50/50 p-4 rounded-md border border-blue-200 outline-none text-sm font-bold text-blue-700" /> :
                        <select disabled={!formData.chapterName} value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})} className="w-full bg-slate-50 p-4 rounded-md border border-slate-200 text-sm font-bold disabled:opacity-50">
                          <option value="">Choose Topic</option>
                          {availableTopics.map((t: string, i: number) => <option key={i} value={t}>{t}</option>)}
                        </select>}
                    </div>
                </div>

                {/* INPUT FORM SECTION */}
                <div className="w-full space-y-6">
                    <div className="flex gap-4 p-1.5 bg-slate-200/50 shadow-2xl border border-slate-200 rounded-md w-fit">
                      <button onClick={() => setInputMode("manual")} className={`px-10 py-3 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${inputMode === "manual" ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500'}`}>Manual</button>
                      <button onClick={() => setInputMode("excel")} className={`px-10 py-3 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${inputMode === "excel" ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500'}`}>Excel Bulk</button>
                    </div>

                    {inputMode === "manual" ? (
                      <form onSubmit={handleSaveManual} className="bg-white rounded-md p-10 shadow-2xl border border-slate-300 space-y-2">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Question</label>
                            <textarea required rows={3} value={formData.question} onChange={(e) => setFormData({...formData, question: e.target.value})} className="w-full bg-slate-50 p-6 rounded-md border border-slate-300 focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-700 transition-all" placeholder="Enter question..."></textarea>
                        </div>
                        {type === 'mcq' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            {['A', 'B', 'C', 'D'].map(o => (
                              <div key={o} className="flex items-center gap-4 bg-slate-50 p-3 rounded-md border border-slate-300">
                                  <span className="w-10 h-10 flex items-center justify-center bg-white rounded-md font-black text-slate-400">{o}</span>
                                  <input type="text" placeholder={`Option ${o}`} value={(formData.options as any)[o]} onChange={(e) => setFormData({...formData, options: {...formData.options, [o]: e.target.value}})} className="bg-transparent flex-1 outline-none text-sm font-bold text-slate-600" />
                              </div>
                            ))}
                            <div className="col-span-full pt-4">
                              <p className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest text-center">Correct Answer</p>
                              <div className="flex gap-4">
                                {['A','B','C','D'].map(a => (
                                  <button key={a} type="button" onClick={() => setFormData({...formData, answer: a})} className={`flex-1 py-4 rounded-md font-black transition-all border ${formData.answer === a ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}>{a}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        {type !== 'mcq' && (
                          <div className="space-y-2 pt-4">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Solution Detail</label>
                            <textarea rows={5} value={formData.answer} onChange={(e) => setFormData({...formData, answer: e.target.value})} className="w-full bg-slate-50 p-6 rounded-2xl border border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-600" placeholder="Enter the complete answer..."></textarea>
                          </div>
                        )}
                        <button disabled={loading} className="w-full bg-slate-900 text-white mt-8 py-5 rounded-md font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl active:scale-95 disabled:opacity-50">
                          {loading ? <Loader2 className="animate-spin" /> : <><DatabaseZap size={20} /> Save to {selectedBoard}</>}
                        </button>
                      </form>
                    ) : (
                      <div className="bg-white rounded-md p-20 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center space-y-8 shadow-inner">
                        <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><UploadCloud size={40} /></div>
                        <div className="text-center"><p className="text-lg font-black text-slate-800">Excel Import Mode</p></div>
                        <input type="file" id="xl-input" className="hidden" accept=".xlsx, .xls" onChange={handleExcelUpload} />
                        <label htmlFor="xl-input" className="bg-blue-600 text-white px-12 py-4 rounded-xl font-black uppercase tracking-widest cursor-pointer hover:bg-blue-700 shadow-lg transition-all">
                          {bulkLoading ? "Uploading..." : "Choose Spreadsheet"}
                        </label>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default WhiteAdminPanel;