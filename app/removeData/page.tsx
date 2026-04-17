"use client";

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
  // --- STATE ---
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

  // --- DATA FETCHING ---
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

  // --- ACTIONS ---
  const handleFinalDelete = async () => {
    setIsDeleteModalOpen(false);
    setIsDeleting(true);
    try {
        const endpoint = API_URL; 
        
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

        await axios.delete(endpoint, { data: payload });
        
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
    <div className="absolute inset-0 z-[100] bg-white flex animate-in slide-in-from-bottom duration-500 font-sans ">
      <Navbar />
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        <Header />

        {/* TOOLBAR */}
        <div className="px-8 py-5 bg-white border-b flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-2xl">
              <Trash2 className="text-red-600" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter">Delete Manager</h1>
              <p className="text-xs text-slate-500 font-medium">Delete content from the database</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentQuestions.length > 0 && (
              <button 
                onClick={() => selectedIds.length === currentQuestions.length 
                  ? setSelectedIds([]) 
                  : setSelectedIds(currentQuestions.map((q:any, i:number) => getQuestionId(q, i)))}
                className="px-6 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold flex items-center gap-2 transition-all"
              >
                {selectedIds.length === currentQuestions.length ? (
                  <CheckCircle2 size={18} className="text-green-600"/>
                ) : (
                  <Square size={18} className="text-slate-500"/>
                )}
                Selected All
              </button>
            )}

            {selectedIds.length > 0 && (
              <button 
                onClick={() => { 
                  setDeleteConfig({ level: 'Questions', id: selectedIds, type: 'bulk' }); 
                  setIsDeleteModalOpen(true); 
                }} 
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-2xl text-sm font-semibold shadow-lg flex items-center gap-2 transition-all"
              >
                <Trash2 size={18} /> Selected Questions ({selectedIds.length})
              </button>
            )}

            <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
              <X size={24} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* HIERARCHY SELECTORS */}
        <div className="p-8 overflow-y-auto max-h-[450px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            
            {/* Board Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-2xl">
                  <Layers className="text-blue-600" size={24} />
                </div>
                <div className="font-bold text-slate-700">Board</div>
              </div>
              <select 
                value={selBoard} 
                onChange={(e) => { setSelBoard(e.target.value); setSelClassId(""); setSelSubject(""); setSelChapter(""); setSelTopic(""); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-slate-900 text-sm focus:border-blue-500"
              >
                <option value="">Select Board</option>
                {availableBoards.map((item, idx) => (
                  <option key={idx} value={item.v}>{item.n}</option>
                ))}
              </select>
              {selBoard && (
                <button 
                  onClick={() => deleteLevel('Board', selBoard)}
                  className="mt-4 w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2 border border-red-200 rounded-xl text-xs font-bold"
                >
                  <Trash2 size={14} /> Delete Board
                </button>
              )}
            </div>

            {/* Dynamic Level Cards (Class, Subject, Chapter, Topic) */}
            {[
              { label: 'Class', val: selClassId, set: setSelClassId, list: classesList.map((c:any)=>({n:c.title, v:c.id})), disabled: !selBoard, icon: Users, color: 'amber' },
              { label: 'Subject', val: selSubject, set: setSelSubject, list: availableSubjects.map((s:any)=>({n:s.name, v:s.name})), disabled: !selClassId, icon: BookOpen, color: 'violet' },
              { label: 'Chapter', val: selChapter, set: setSelChapter, list: availableChapters.map((ch:any)=>({n:ch.name, v:ch.name})), disabled: !selSubject, icon: Target, color: 'teal' },
              { label: 'Topic', val: selTopic, set: setSelTopic, list: availableTopics.map((t:any)=>({n:t.name, v:t.name})), disabled: !selChapter, icon: ListChecks, color: 'rose' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 bg-${item.color}-100 rounded-2xl`}>
                    <item.icon className={`text-${item.color}-600`} size={24} />
                  </div>
                  <div className="font-bold text-slate-700">{item.label}</div>
                </div>
                <select 
                  disabled={item.disabled}
                  value={item.val} 
                  onChange={(e) => { item.set(e.target.value); }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-slate-900 text-sm disabled:opacity-50"
                >
                  <option value="">Select {item.label}</option>
                  {item.list.map((opt: any, idx: number) => (
                    <option key={idx} value={opt.v}>{opt.n}</option>
                  ))}
                </select>
                {item.val && (
                  <button 
                    onClick={() => deleteLevel(item.label, item.val)}
                    className="mt-4 w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2 border border-red-200 rounded-2xl text-xs font-bold transition-all"
                  >
                    <Trash2 size={14} /> Delete {item.label}
                  </button>
                )}
              </div>
            ))}
          </div>
        {/* QUESTIONS GRID SECTION */}
        <div className="flex-1 mt-8 py-4 pt-0  min-h-0 ">
          {selTopic ? (
            <div className="bg-white  h-[30px] border border-slate-300 shadow-md  flex flex-col ">
              
              {/* Tabs for Question Types */}
              <div className="p-2 bg-slate-50 flex gap-2 border-b">
                {[
                  { id: 'mcq', label: 'MCQs', icon: HelpCircle },
                  { id: 'short', label: 'Short Questions', icon: ListChecks },
                  { id: 'long', label: 'Long Questions', icon: Target },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setSelType(t.id); setSelectedIds([]); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-sm font-bold transition-all ${
                      selType === t.id ? 'bg-white shadow-md text-blue-600 border border-slate-300' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <t.icon size={18} /> {t.label}
                  </button>
                ))}
              </div>

              {/* Question List */}
              <div className="flex-1 py-4">
                {currentQuestions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    {currentQuestions.map((q: any, i: number) => {
                      const qId = getQuestionId(q, i);
                      const isSelected = selectedIds.includes(qId);
                      
                      return (
                        <div 
                          key={qId}
                          onClick={() => {
                            setSelectedIds(prev => 
                              isSelected ? prev.filter(id => id !== qId) : [...prev, qId]
                            );
                          }}
                          className={`p-5 rounded-md border-2 cursor-pointer transition-all relative group ${
                            isSelected ? 'border-red-500 bg-blue-50/30' : 'border-slate-100 hover:border-red-400'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`mt-1 p-1 rounded-md border-2 ${isSelected ? 'bg-red-600 border-red-600' : 'border-slate-200'}`}>
                              <CheckSquare size={14} className={isSelected ? 'text-white' : 'text-transparent'} />
                            </div>
                            <div className="flex-1">
                              <p className="text-slate-800 font-medium text-sm leading-relaxed mb-3" dir="auto">
                                {i +1}. {q.question}
                              </p>
                              {q.options && (
                                <div className="grid grid-cols-4 gap-1">
                                  {Object.entries(q.options).map(([key, val]: any) => (
                                    <div key={key} className="text-[11px] bg-white border border-slate-100 p-2 rounded-xl text-slate-500">
                                      <span className="font-bold text-blue-500 uppercase mr-1">{key}:</span> {val}
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
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                    <DatabaseZap size={48} className="opacity-20" />
                    <p className="font-medium text-sm">No questions available in this topic.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-slate-200 rounded-md flex flex-col items-center justify-center text-slate-400 gap-4">
               <ChevronRight size={40} className="opacity-20 rotate-90" />
               <p className="text-sm font-semibold italic mb-20">Please select a topic to view questions.</p>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-md text-center shadow-2xl">
            <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle size={40} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Are you sure you want to delete?</h2>
            <p className="text-slate-500 mt-4 text-sm">
              {deleteConfig.type === 'bulk' 
                ? `You are about to permanently delete ${selectedIds.length} questions.` 
                : `You are about to delete "${deleteConfig.level}" and all its data. This action cannot be undone.`}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold">Cancel</button>
              <button onClick={handleFinalDelete} className="py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* LOADING OVERLAY */}
      {isDeleting && (
        <div className="fixed inset-0 z-[600] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center">
          <Loader2 size={60} className="animate-spin text-red-600 mb-4" />
          <h2 className="text-xl text-slate-900 font-black">Deleting from database...</h2>
        </div>
      )}
    </div>
  );
};

export default DeleteManager;