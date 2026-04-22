"use client";

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  X, Trash2, Square, CheckSquare, Loader2, 
  DatabaseZap, CheckCircle2, ChevronRight, AlertTriangle,
  BookOpen, Users, Target, ListChecks, Layers, 
  HelpCircle, Menu
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

  const API_URL = "/api/classes"; 

  const fetchLatestData = async () => {
    setIsFetching(true);
    try {
      const res = await axios.get(API_URL);
      const wrapper = Array.isArray(res.data) ? res.data[0] : res.data;
      const actualData = wrapper?.data || {};
      const boardsArray = Object.keys(actualData).map(key => ({
        keyName: key,
        displayName: actualData[key].name,
        ...actualData[key]
      }));
      setDbData(boardsArray);
    } catch (err) {
      toast.error("Error connecting to the database");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { fetchLatestData(); }, []);

  const availableBoards = useMemo(() => dbData.map(b => ({ n: b.displayName, v: b.keyName })), [dbData]);
  const selectedBoardObj = useMemo(() => dbData.find(b => b.keyName === selBoard), [dbData, selBoard]);
  const classesList = selectedBoardObj?.classes || [];
  const selectedClassObj = useMemo(() => classesList.find((c: any) => String(c.id) === String(selClassId)), [classesList, selClassId]);
  const availableSubjects = selectedClassObj?.subjects || [];
  const selectedSubjectObj = useMemo(() => availableSubjects.find((s: any) => s.name === selSubject), [availableSubjects, selSubject]);
  const availableChapters = useMemo(() => (selectedSubjectObj?.chapters || []).map((ch: any) => typeof ch === 'string' ? { name: ch } : ch), [selectedSubjectObj]);
  const selectedChapterObj = useMemo(() => availableChapters.find((ch: any) => ch.name === selChapter), [availableChapters, selChapter]);
  const availableTopics = selectedChapterObj?.topics || [];
  const typeKey = selType === 'mcq' ? 'mcqs' : selType === 'short' ? 'shorts' : 'longs';
  
  const currentQuestions = useMemo(() => {
    const topicObj = availableTopics.find((t: any) => t.name === selTopic);
    return topicObj?.questionTypes?.[typeKey]?.categories?.find((c: any) => c.name === selCategory)?.questions || [];
  }, [availableTopics, selTopic, typeKey, selCategory]);

  const getQuestionId = (q: any, index: number) => String(q.id || q._id || `idx-${index}`);

  const handleFinalDelete = async () => {
    setIsDeleteModalOpen(false);
    setIsDeleting(true);
    try {
        const payload = {
            level: deleteConfig.level.toLowerCase(), 
            board: selBoard,
            classId: selClassId,
            subjectName: selSubject,
            chapterName: selChapter,
            topicName: selTopic,
            mode: deleteConfig.type, 
            type: selType,
            category: selCategory,
            questionIds: deleteConfig.type === 'bulk' ? selectedIds : undefined
        };
        await axios.delete(API_URL, { data: payload });
        toast.success(`${deleteConfig.level} deleted successfully`);
        if (deleteConfig.type === 'hierarchy') {
            const lvl = deleteConfig.level.toLowerCase();
            if (lvl === 'board') setSelBoard("");
            if (lvl === 'class') setSelClassId("");
            if (lvl === 'subject') setSelSubject("");
            if (lvl === 'chapter') setSelChapter("");
            if (lvl === 'topic') setSelTopic("");
        }
        setSelectedIds([]);
        await fetchLatestData();
        onSuccess();
    } catch (err: any) {
        toast.error(err.response?.data?.message || "Error deleting data");
    } finally {
        setIsDeleting(false);
    }
  };

  const deleteLevel = (level: string, id: string) => {
    setDeleteConfig({ level, id, type: 'hierarchy' });
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-[100]  bg-white flex flex-col md:flex-row animate-in slide-in-from-bottom duration-500 font-sans overflow-hidden">
      {/* <div className="hidden md:block"> */}
        <Navbar />
      {/* </div> */}

      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] overflow-hidden">
        <Header />

        {/* TOOLBAR */}
        <div className="px-4 md:px-8 py-4 bg-white border-b flex flex-wrap items-center justify-between gap-4 shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 bg-red-100 rounded-xl md:rounded-2xl">
              <Trash2 className="text-red-600 w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-black text-slate-900 tracking-tighter">Delete Manager</h1>
              <p className="hidden sm:block text-[10px] md:text-xs text-slate-500 font-medium">Manage database content</p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto md:ml-0">
            {currentQuestions.length > 0 && (
              <button 
                onClick={() => selectedIds.length === currentQuestions.length 
                  ? setSelectedIds([]) 
                  : setSelectedIds(currentQuestions.map((q:any, i:number) => getQuestionId(q, i)))}
                className="p-2 md:px-4 md:py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs md:text-sm font-semibold flex items-center gap-2 transition-all"
              >
                {selectedIds.length === currentQuestions.length ? <CheckCircle2 size={16} className="text-green-600"/> : <Square size={16} className="text-slate-400"/>}
                <span className="hidden sm:inline">Select All</span>
              </button>
            )}

            {selectedIds.length > 0 && (
              <button 
                onClick={() => { 
                  setDeleteConfig({ level: 'Questions', id: selectedIds, type: 'bulk' }); 
                  setIsDeleteModalOpen(true); 
                }} 
                className="bg-red-600 hover:bg-red-700 text-white p-2 md:px-5 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold shadow-lg flex items-center gap-2 transition-all"
              >
                <Trash2 size={16} /> <span>Delete ({selectedIds.length})</span>
              </button>
            )}

            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* MAIN SCROLLABLE AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          
          {/* HIERARCHY SELECTORS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
            {/* Board Selector */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg"><Layers className="text-blue-600 w-5 h-5" /></div>
                <div className="font-bold text-slate-700 text-sm">Board</div>
              </div>
              <select 
                value={selBoard} 
                onChange={(e) => { setSelBoard(e.target.value); setSelClassId(""); setSelSubject(""); setSelChapter(""); setSelTopic(""); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:ring-2 ring-blue-500/20"
              >
                <option value="">Select Board</option>
                {availableBoards.map((item, idx) => <option key={idx} value={item.v}>{item.n}</option>)}
              </select>
              {selBoard && (
                <button onClick={() => deleteLevel('Board', selBoard)} className="mt-3 w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2 border border-red-100 rounded-xl text-[10px] font-bold">
                  <Trash2 size={12} /> Delete Board
                </button>
              )}
            </div>

            {/* Other Selectors Mapping */}
            {[
              { label: 'Class', val: selClassId, set: setSelClassId, list: classesList.map((c:any)=>({n:c.title, v:c.id})), disabled: !selBoard, icon: Users, color: 'amber' },
              { label: 'Subject', val: selSubject, set: setSelSubject, list: availableSubjects.map((s:any)=>({n:s.name, v:s.name})), disabled: !selClassId, icon: BookOpen, color: 'violet' },
              { label: 'Chapter', val: selChapter, set: setSelChapter, list: availableChapters.map((ch:any)=>({n:ch.name, v:ch.name})), disabled: !selSubject, icon: Target, color: 'teal' },
              { label: 'Topic', val: selTopic, set: setSelTopic, list: availableTopics.map((t:any)=>({n:t.name, v:t.name})), disabled: !selChapter, icon: ListChecks, color: 'rose' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 bg-${item.color}-100 rounded-lg`}><item.icon className={`text-${item.color}-600 w-5 h-5`} /></div>
                  <div className="font-bold text-slate-700 text-sm">{item.label}</div>
                </div>
                <select 
                  disabled={item.disabled}
                  value={item.val} 
                  onChange={(e) => { item.set(e.target.value); }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm disabled:opacity-40"
                >
                  <option value="">Select {item.label}</option>
                  {item.list.map((opt: any, idx: number) => <option key={idx} value={opt.v}>{opt.n}</option>)}
                </select>
                {item.val && (
                  <button onClick={() => deleteLevel(item.label, item.val)} className="mt-3 w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2 border border-red-100 rounded-xl text-[10px] font-bold">
                    <Trash2 size={12} /> Delete {item.label}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* QUESTIONS LIST SECTION */}
          <div className="min-h-[400px]">
            {selTopic ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-2 bg-slate-50 flex flex-wrap gap-1 border-b">
                  {[
                    { id: 'mcq', label: 'MCQs', icon: HelpCircle },
                    { id: 'short', label: 'Shorts', icon: ListChecks },
                    { id: 'long', label: 'Longs', icon: Target },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setSelType(t.id); setSelectedIds([]); }}
                      className={`flex-1 min-w-[80px] flex items-center justify-center gap-2 py-3 rounded-xl text-xs md:text-sm font-bold transition-all ${
                        selType === t.id ? 'bg-white shadow-sm text-blue-600 border border-slate-200' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <t.icon size={16} /> {t.label}
                    </button>
                  ))}
                </div>

                <div className="p-4 md:p-6">
                  {currentQuestions.length > 0 ? (
                    <div className="space-y-3">
                      {currentQuestions.map((q: any, i: number) => {
                        const qId = getQuestionId(q, i);
                        const isSelected = selectedIds.includes(qId);
                        return (
                          <div 
                            key={qId}
                            onClick={() => setSelectedIds(prev => isSelected ? prev.filter(id => id !== qId) : [...prev, qId])}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected ? 'border-red-500 bg-red-50/30' : 'border-slate-50 hover:border-slate-200 bg-white'
                            }`}
                          >
                            <div className="flex gap-4">
                              <div className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 ${isSelected ? 'bg-red-600 border-red-600' : 'border-slate-300'}`}>
                                {isSelected && <CheckSquare size={12} className="text-white" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-slate-800 font-medium text-sm md:text-base mb-2" dir="auto">{i + 1}. {q.question}</p>
                                {q.options && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-3">
                                    {Object.entries(q.options).map(([key, val]: any) => (
                                      <div key={key} className="text-[10px] md:text-xs bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                        <span className="font-bold text-blue-600 uppercase mr-1">{key}:</span> {val}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-20 flex flex-col items-center text-slate-400">
                      <DatabaseZap size={40} className="opacity-20 mb-4" />
                      <p className="text-sm">No questions found in this category.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-[300px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 text-center p-6">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <ChevronRight size={32} className="opacity-20 rotate-90" />
                 </div>
                 <p className="text-sm font-semibold max-w-[200px]">Select a topic above to manage specific questions.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[500] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-10 w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle size={32} className="text-red-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">Are you sure?</h2>
            <p className="text-slate-500 mt-3 text-xs md:text-sm leading-relaxed">
              {deleteConfig.type === 'bulk' 
                ? `Permanently delete ${selectedIds.length} items from the database.` 
                : `Delete "${deleteConfig.level}" and all associated sub-data permanently.`}
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <button onClick={handleFinalDelete} className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-colors">Yes, Delete</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isDeleting && (
        <div className="fixed inset-0 z-[600] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="relative">
             <div className="w-20 h-20 border-4 border-slate-100 border-t-red-600 rounded-full animate-spin" />
             <Trash2 className="absolute inset-0 m-auto text-red-600" size={30} />
          </div>
          <h2 className="text-xl text-slate-900 font-black mt-6 tracking-tight">Syncing Changes...</h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">Removing data from the production server.</p>
        </div>
      )}
    </div>
  );
};

export default DeleteManager;