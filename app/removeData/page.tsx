"use client"
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  X, Trash2, Square, CheckSquare, Loader2, 
  DatabaseZap, CheckCircle2, ChevronRight, AlertTriangle,
  BookOpen, Users, Target, ListChecks, Layers, 
  HelpCircle 
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
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState<{level: string, id: string | string[], type: 'hierarchy' | 'bulk'}>({
    level: '', id: '', type: 'bulk'
  });

  const [selBoard, setSelBoard] = useState("");
  const [selClassId, setSelClassId] = useState("");
  const [selSubject, setSelSubject] = useState("");
  const [selChapter, setSelChapter] = useState("");
  const [selTopic, setSelTopic] = useState("");
  const [selType, setSelType] = useState("mcq");
  const [selCategory, setSelCategory] = useState("Exercise Questions");

  // const API_URL = "http://localhost:5000/api/classes"; 
  const API_URL = "/api/classes"; 

  // --- FETCH DATA FROM IMAGE STRUCTURE ---
  const fetchLatestData = async () => {
    setIsFetching(true);
    try {
      const res = await axios.get(API_URL);
      // Image structure: res.data[0].data -> { punjab: {...}, Federal: {...} }
      const wrapper = Array.isArray(res.data) ? res.data[0] : res.data;
      const actualData = wrapper?.data || {};

      const boardsArray = Object.keys(actualData).map(key => ({
        keyName: key,               // e.g. "punjab"
        displayName: actualData[key].name, // e.g. "Punjab Board"
        ...actualData[key]
      }));
      
      setDbData(boardsArray);
    } catch (err) {
      toast.error("Database connection failed");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { fetchLatestData(); }, []);

  // --- DATA MAPPING LOGIC ---
  const availableBoards = useMemo(() => 
    dbData.map(b => ({ n: b.displayName, v: b.keyName })), [dbData]);
  
  const selectedBoardObj = useMemo(() => 
    dbData.find(b => b.keyName === selBoard), [dbData, selBoard]);

  const classesList = selectedBoardObj?.classes || [];
  const selectedClassObj = useMemo(() => 
    classesList.find((c: any) => String(c.id) === String(selClassId)), [classesList, selClassId]);

  const availableSubjects = selectedClassObj?.subjects || [];
  const selectedSubjectObj = useMemo(() => 
    availableSubjects.find((s: any) => s.name === selSubject), [availableSubjects, selSubject]);

  const availableChapters = useMemo(() => 
    (selectedSubjectObj?.chapters || []).map((ch: any) => typeof ch === 'string' ? { name: ch } : ch), 
    [selectedSubjectObj]);

  const selectedChapterObj = useMemo(() => 
    availableChapters.find((ch: any) => ch.name === selChapter), [availableChapters, selChapter]);

  const availableTopics = selectedChapterObj?.topics || [];

  const typeKey = selType === 'mcq' ? 'mcqs' : selType === 'short' ? 'shorts' : 'longs';
  
  const currentQuestions = useMemo(() => {
    const topicObj = availableTopics.find((t: any) => t.name === selTopic);
    return topicObj?.questionTypes?.[typeKey]?.categories
      ?.find((c: any) => c.name === selCategory)?.questions || [];
  }, [availableTopics, selTopic, typeKey, selCategory]);

  const getQuestionId = (q: any, index: number) => String(q.id || q._id || `idx-${index}`);

  // --- DELETE HANDLERS ---
  const handleFinalDelete = async () => {
    setIsDeleteModalOpen(false);
    setIsDeleting(true);
    try {
      const endpoint = deleteConfig.type === 'hierarchy' ? `${API_URL}/hierarchy-delete` : `${API_URL}/delete-bulk`;
      const payload = {
        ...deleteConfig,
        board: selBoard,
        classId: selClassId,
        subjectName: deleteConfig.level === 'subject' ? deleteConfig.id : selSubject,
        chapterName: deleteConfig.level === 'chapter' ? deleteConfig.id : selChapter,
        topicName: deleteConfig.level === 'topic' ? deleteConfig.id : selTopic,
        type: selType,
        category: selCategory,
        questionIds: deleteConfig.type === 'bulk' ? selectedIds : undefined
      };

      await axios.delete(endpoint, { data: payload });
      toast.success("Deleted Successfully!");
      
      setSelectedIds([]);
      if (deleteConfig.level === 'board') setSelBoard("");
      
      await fetchLatestData();
      onSuccess();
    } catch (err) {
      toast.error("Action failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteLevel = (level: string, id: string) => {
    setDeleteConfig({ level, id, type: 'hierarchy' });
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="absolute inset-0 z-[100] bg-white flex animate-in slide-in-from-bottom duration-500 font-sans overflow-hidden">
      <Navbar />
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        <Header />

        {/* --- TOOLBAR --- */}
        <div className="px-8 py-5 bg-white border-b flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-2xl">
              <Trash2 className="text-red-600" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Delete Manager</h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Database Clean-up Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentQuestions.length > 0 && (
              <button 
                onClick={() => selectedIds.length === currentQuestions.length ? setSelectedIds([]) : setSelectedIds(currentQuestions.map((q:any, i:number) => getQuestionId(q, i)))}
                className="px-6 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-xs font-black uppercase flex items-center gap-2 transition-all"
              >
                {selectedIds.length === currentQuestions.length ? <CheckCircle2 size={16} className="text-blue-600"/> : <Square size={16}/>}
                {selectedIds.length === currentQuestions.length ? "Deselect All" : "Select All"}
              </button>
            )}

            {selectedIds.length > 0 && (
              <button 
                onClick={() => { setDeleteConfig({ level: 'Questions', id: selectedIds, type: 'bulk' }); setIsDeleteModalOpen(true); }} 
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase shadow-lg flex items-center gap-2 transition-all active:scale-95"
              >
                <Trash2 size={18} /> Delete ({selectedIds.length})
              </button>
            )}

            <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
              <X size={24} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* --- HIERARCHY SELECTORS --- */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {/* Board Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><Layers size={22}/></div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Board</span>
                </div>
                {selBoard && <button onClick={() => deleteLevel('board', selBoard)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>}
              </div>
              <select value={selBoard} onChange={(e) => { setSelBoard(e.target.value); setSelClassId(""); setSelSubject(""); setSelChapter(""); setSelTopic(""); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 ring-blue-500/20">
                <option value="">Select Board</option>
                {availableBoards.map((b, i) => <option key={i} value={b.v}>{b.n}</option>)}
              </select>
            </div>

            {/* Other Hierarchy Cards */}
            {[
              { label: 'Class', val: selClassId, set: setSelClassId, list: classesList.map((c:any)=>({n:c.title, v:c.id})), disabled: !selBoard, icon: Users, color: 'orange', level: 'class' },
              { label: 'Subject', val: selSubject, set: setSelSubject, list: availableSubjects.map((s:any)=>({n:s.name, v:s.name})), disabled: !selClassId, icon: BookOpen, color: 'violet', level: 'subject' },
              { label: 'Chapter', val: selChapter, set: setSelChapter, list: availableChapters.map((ch:any)=>({n:ch.name, v:ch.name})), disabled: !selSubject, icon: Target, color: 'emerald', level: 'chapter' },
              { label: 'Topic', val: selTopic, set: setSelTopic, list: availableTopics.map((t:any)=>({n:t.name, v:t.name})), disabled: !selChapter, icon: ListChecks, color: 'rose', level: 'topic' },
            ].map((item, i) => (
              <div key={i} className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all ${item.disabled ? 'opacity-40' : 'hover:shadow-md'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                      <div className={`p-3 bg-${item.color}-50 rounded-2xl text-${item.color}-600`}><item.icon size={22}/></div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.label}</span>
                  </div>
                  {item.val && <button onClick={() => deleteLevel(item.level, item.val)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>}
                </div>
                <select disabled={item.disabled} value={item.val} onChange={(e) => item.set(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-700 outline-none disabled:cursor-not-allowed">
                  <option value="">Select {item.label}</option>
                  {item.list.map((opt:any, idx:number) => <option key={idx} value={opt.v}>{opt.n}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* Type & Category */}
          <div className="mt-8 flex flex-wrap gap-6">
            <div className="flex-1 min-w-[300px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Question Type</label>
              <div className="flex gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                {['mcq', 'short', 'long'].map(type => (
                  <button key={type} onClick={() => setSelType(type)}
                    className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${selType === type ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 min-w-[300px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Category</label>
              <select value={selCategory} onChange={(e) => setSelCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-700 shadow-sm outline-none">
                <option value="Exercise Questions">Exercise Questions</option>
                <option value="Additional Questions">Additional Questions</option>
                <option value="Past Papers">Past Papers</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- QUESTIONS GRID --- */}
        <div className="flex-1 overflow-y-auto px-8 pb-12 bg-slate-50/50">
          {isFetching ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="animate-spin text-blue-600" size={48} />
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">Syncing Database...</p>
            </div>
          ) : currentQuestions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {currentQuestions.map((q: any, index: number) => {
                const qId = getQuestionId(q, index);
                const isSelected = selectedIds.includes(qId);
                return (
                  <div key={qId} onClick={() => isSelected ? setSelectedIds(prev => prev.filter(id => id !== qId)) : setSelectedIds(prev => [...prev, qId])}
                    className={`group relative bg-white border-2 rounded-3xl p-7 cursor-pointer transition-all duration-300 hover:shadow-xl ${isSelected ? 'border-red-500 shadow-2xl ring-4 ring-red-50' : 'border-slate-100 hover:border-slate-200'}`}>
                    <div className={`absolute top-5 right-5 w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${isSelected ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-50 border border-slate-100 text-slate-300'}`}>
                      {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                    </div>
                    <div className="text-[10px] font-black tracking-widest text-slate-300 mb-3 uppercase">Question #{index + 1}</div>
                    <p className="text-slate-700 leading-relaxed text-sm font-bold line-clamp-4 pr-8">{q.question}</p>
                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-black uppercase text-slate-400">
                        <span className="px-3 py-1 bg-slate-100 rounded-full">{selType}</span>
                        {isSelected && <span className="text-red-500 animate-pulse">Selected</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[50vh] flex flex-col items-center justify-center text-center">
              <DatabaseZap size={80} className="text-slate-200 mb-4 opacity-30" />
              <p className="text-xl font-black text-slate-300 uppercase tracking-tighter">No Questions Found</p>
              <p className="text-xs text-slate-400 mt-2">Select a complete hierarchy path to fetch data.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[500] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-md text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle size={40} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Are you sure?</h2>
            <p className="text-slate-500 text-sm mt-4 leading-relaxed font-medium">
              You are about to delete <span className="text-red-600 font-black">{deleteConfig.type === 'bulk' ? selectedIds.length + ' questions' : deleteConfig.level + ': ' + deleteConfig.id}</span>. This action is permanent.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="py-4 bg-slate-100 hover:bg-slate-200 rounded-2xl font-black text-[10px] uppercase text-slate-600 transition-all">Cancel</button>
              <button onClick={handleFinalDelete} className="py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[10px] uppercase transition-all shadow-lg shadow-red-200">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETING OVERLAY --- */}
      {isDeleting && (
        <div className="fixed inset-0 z-[600] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center">
          <Loader2 size={60} className="animate-spin text-red-600 mb-4" />
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Wiping data from server...</p>
        </div>
      )}
    </div>
  );
};

export default DeleteManager;