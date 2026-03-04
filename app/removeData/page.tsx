"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  X, Trash2, Square, CheckSquare, Loader2, 
  DatabaseZap, CheckCircle2, ChevronRight, AlertTriangle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import Header from "../components/topbar/page";
import Navbar from "../components/navbar/page";

interface DeleteManagerProps {
  onClose: () => void;
  onSuccess: () => void;
}

const DeleteManager = ({ onClose, onSuccess }: DeleteManagerProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [dbData, setDbData] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState<{level: string, id: string | string[], type: 'hierarchy' | 'bulk'}>({
    level: '',
    id: '',
    type: 'bulk'
  });

  const [selClassId, setSelClassId] = useState("");
  const [selSubject, setSelSubject] = useState("");
  const [selChapter, setSelChapter] = useState("");
  const [selTopic, setSelTopic] = useState("");
  const [selType, setSelType] = useState("mcq");
  const [selCategory, setSelCategory] = useState("Exercise Questions");

//   const API_URL = "http://localhost:5000/api/classes";
const API_URL = "https://backendrepoo-production.up.railway.app/api/classes";


  const fetchLatestData = async () => {
    setIsFetching(true);
    try {
      const res = await axios.get(API_URL);
      setDbData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Database connection failed");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchLatestData();
  }, []);

  const classesList = dbData[0]?.classes || [];
  const selectedClassObj = classesList.find((c: any) => c.id === selClassId);
  const availableSubjects = selectedClassObj?.subjects || [];
  const selectedSubjectObj = availableSubjects.find((s: any) => s.name === selSubject);
  const availableChapters = (selectedSubjectObj?.chapters || []).map((ch: any) => typeof ch === 'string' ? { name: ch } : ch);
  const selectedChapterObj = availableChapters.find((ch: any) => ch.name === selChapter);
  const availableTopics = selectedChapterObj?.topics?.map((t: any) => t.name) || [];

  const typeKey = selType === 'mcq' ? 'mcqs' : selType === 'short' ? 'shorts' : 'longs';
  const currentQuestions = selectedChapterObj?.topics
    ?.find((t: any) => t.name === selTopic)
    ?.questionTypes?.[typeKey]?.categories
    ?.find((c: any) => c.name === selCategory)?.questions || [];

  const getQuestionId = (q: any, index: number) => String(q._id || q.id || `idx-${index}`);

  // --- MODAL TRIGGERS ---
  const triggerHierarchyDelete = (level: string, identifier: string) => {
    setDeleteConfig({ level, id: identifier, type: 'hierarchy' });
    setIsDeleteModalOpen(true);
  };

  const triggerBulkDelete = () => {
    setDeleteConfig({ level: 'Questions', id: selectedIds, type: 'bulk' });
    setIsDeleteModalOpen(true);
  };

  // --- CORE DELETE LOGIC (Executed from Modal) ---
  const handleFinalDelete = async () => {
    setIsDeleteModalOpen(false);
    setIsDeleting(true);

    try {
      if (deleteConfig.type === 'hierarchy') {
        await axios.delete(`${API_URL}/hierarchy-delete`, {
          data: {
            level: deleteConfig.level,
            classId: selClassId,
            subjectName: deleteConfig.level === 'class' ? deleteConfig.id : selSubject,
            chapterName: deleteConfig.level === 'subject' ? undefined : (deleteConfig.level === 'chapter' ? deleteConfig.id : selChapter),
            topicName: deleteConfig.level === 'topic' ? deleteConfig.id : undefined,
          }
        });
        if (deleteConfig.level === 'class') setSelClassId("");
        if (deleteConfig.level === 'subject') setSelSubject("");
        if (deleteConfig.level === 'chapter') setSelChapter("");
        if (deleteConfig.level === 'topic') setSelTopic("");
      } else {
        const idsToDelete = currentQuestions
          .filter((q: any, i: number) => selectedIds.includes(getQuestionId(q, i)))
          .map((q: any) => String(q._id || q.id));

        await axios.delete(`${API_URL}/delete-bulk`, {
          data: {
            classId: selClassId, subjectName: selSubject, chapterName: selChapter,
            topicName: selTopic, type: selType, category: selCategory, questionIds: idsToDelete
          }
        });
        setSelectedIds([]);
      }

      toast.success("Deleted successfully!");
      await fetchLatestData();
      onSuccess();
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelect = (uniqueId: string) => {
    setSelectedIds(prev => prev.includes(uniqueId) ? prev.filter(id => id !== uniqueId) : [...prev, uniqueId]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === currentQuestions.length) setSelectedIds([]);
    else setSelectedIds(currentQuestions.map((q: any, i: number) => getQuestionId(q, i)));
  };

  return (
    <div className="absolute inset-0 z-[100] bg-white flex animate-in slide-in-from-bottom duration-500 font-sans overflow-hidden">
      <Navbar />

      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        <Header />

        {/* TOOLBAR */}
        <div className="px-8 py-4 bg-white border-b flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              Delete Manager <ChevronRight size={16} className="text-slate-300" />
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {currentQuestions.length > 0 && (
              <button onClick={toggleSelectAll} className="px-5 py-2.5 rounded-xl border-2 border-slate-100 text-[10px] text-gray-600 font-black uppercase tracking-wider flex items-center gap-2">
                {selectedIds.length === currentQuestions.length ? <CheckCircle2 size={16} className="text-blue-600"/> : <Square size={16} className="text-gray-600"/>}
                Select All
              </button>
            )}
            {selectedIds.length > 0 && (
              <button onClick={triggerBulkDelete} disabled={isDeleting} className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-red-200">
                <Trash2 size={16} /> Confirm Delete ({selectedIds.length})
              </button>
            )}
          </div>
        </div>

        {/* SELECTORS GRID */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-8 grid grid-cols-2 md:grid-cols-6 gap-5">
            {[
              { label: 'Class', val: selClassId, set: setSelClassId, list: classesList.map((c:any)=>({n:c.id, v:c.id})), clear: () => {setSelSubject(""); setSelChapter(""); setSelTopic("");}, level: 'class' },
              { label: 'Subject', val: selSubject, set: setSelSubject, list: availableSubjects.map((s:any)=>({n:s.name, v:s.name})), disabled: !selClassId, clear: () => {setSelChapter(""); setSelTopic("");}, level: 'subject' },
              { label: 'Chapter', val: selChapter, set: setSelChapter, list: availableChapters.map((ch:any)=>({n:ch.name, v:ch.name})), disabled: !selSubject, clear: () => setSelTopic(""), level: 'chapter' },
              { label: 'Topic', val: selTopic, set: setSelTopic, list: availableTopics.map((t:any)=>({n:t, v:t})), disabled: !selChapter, level: 'topic' },
            ].map((s, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{s.label}</label>
                   {s.val && <button onClick={() => triggerHierarchyDelete(s.level, s.val)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={12} /></button>}
                </div>
                <select disabled={s.disabled} value={s.val} onChange={(e) => { s.set(e.target.value); s.clear?.(); }} className="w-full bg-white p-3.5 rounded-md text-gray-800 border border-slate-200 text-xs font-bold outline-none">
                  <option value="">{s.label}</option>
                  {s.list.map((item: any, idx: number) => <option key={idx} value={item.v}>{item.n}</option>)}
                </select>
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
              <select value={selType} onChange={(e) => setSelType(e.target.value)} className="w-full bg-blue-50/50 p-3.5 rounded-md border border-blue-100 text-xs font-black uppercase text-blue-700 outline-none">
                <option value="mcq">MCQs</option><option value="short">Short</option><option value="long">Long</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
              <select value={selCategory} onChange={(e) => setSelCategory(e.target.value)} className="w-full bg-indigo-50/50 p-3.5 rounded-md border border-indigo-100 text-xs font-black uppercase text-indigo-700 outline-none">
                <option value="Exercise Questions">Exercise</option><option value="Additional Questions">Additional</option><option value="Pastpapers Questions">Pastpapers</option>
              </select>
            </div>
          </div>

          {/* QUESTIONS LIST */}
          <div className="px-8 pb-12">
            {isFetching ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Loading Database</p>
              </div>
            ) : currentQuestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentQuestions.map((q: any, index: number) => {
                  const qId = getQuestionId(q, index);
                  const isSel = selectedIds.includes(qId);
                  return (
                    <div key={qId} onClick={() => toggleSelect(qId)} className={`group p-6 rounded-md border-2 transition-all cursor-pointer bg-white ${isSel ? 'border-red-500 shadow-xl ring-8 ring-red-50' : 'border-transparent shadow-sm'}`}>
                      <div className="flex items-center mb-4">
                        <div className={`p-2.5 rounded-xl ${isSel ? 'bg-red-600 text-white' : 'bg-slate-50 text-slate-300'}`}>{isSel ? <CheckSquare size={18} /> : <Square size={18} />}</div>
                        <p className="text-xs ml-2 font-bold text-slate-700 leading-relaxed line-clamp-4">{q.question}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
               <div className="h-96 flex flex-col items-center justify-center text-slate-300">
                  <p className="font-black text-sm uppercase tracking-widest">No Records Found</p>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[300] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-900">Are you sure?</h2>
            <p className="text-slate-500 text-[10px] mt-2 uppercase font-black tracking-widest leading-relaxed">
              {deleteConfig.type === 'bulk' 
                ? `${selectedIds.length} questions will be wiped.` 
                : `${deleteConfig.level}: "${deleteConfig.id}" and all linked data will be permanently wiped.`}
            </p>
            <div className="grid grid-cols-2 gap-3 mt-8">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-3 bg-slate-100 rounded-xl font-bold text-gray-700 text-[10px] uppercase hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={handleFinalDelete} className="px-4 py-3 bg-red-600 text-white rounded-xl font-bold text-[10px] uppercase shadow-lg shadow-red-200 hover:bg-red-700 transition-all">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* BACKGROUND LOADER */}
      {isDeleting && (
        <div className="fixed inset-0 z-[400] bg-white/60 backdrop-blur-md flex flex-col items-center justify-center">
           <Loader2 size={48} className="animate-spin text-red-600 mb-2" />
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Deleting Data...</p>
        </div>
      )}
    </div>
  );
};

export default DeleteManager;