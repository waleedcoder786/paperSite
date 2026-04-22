'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaTimes, FaSearch, FaCheckSquare, FaArrowLeft, 
  FaSpinner, FaDatabase, FaRandom, FaListUl, FaLayerGroup, FaColumns 
} from "react-icons/fa";
import toast from 'react-hot-toast';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectName: string;
  className: string;
  chapters: string[]; 
  topics: string[]; 
  onAddQuestions: (questions: any[], config: any) => void;
  editData?: any; 
}

export default function QuestionMenuModal({ 
  isOpen, 
  onClose, 
  subjectName, 
  onAddQuestions, 
  className, 
  chapters,
  topics, 
  editData 
}: ModalProps) {

  const [viewMode, setViewMode] = useState<'filters' | 'selection'>('filters');
  const [tempSelected, setTempSelected] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState('MCQs'); 
  const [selectedSource, setSelectedSource] = useState<string[]>(['Exercise Questions']);
  const [requiredCount, setRequiredCount] = useState<number>(10);
  const [defaultMarks, setDefaultMarks] = useState<number>(1);
  const [attemptCount, setAttemptCount] = useState<number>(8);
  const [layoutCols, setLayoutCols] = useState<number>(1); 
  
  const [displayQuestions, setDisplayQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterOnlySelected, setFilterOnlySelected] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(false);

  const API_BASE = "/api";

  const toggleSource = (val: string) => {
    if (val === 'All') {
      setSelectedSource(['Exercise Questions', 'Additional Questions', 'Pastpapers Questions']);
    } else {
      setSelectedSource(prev => 
        prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]
      );
    }
  };

  useEffect(() => {
    if (isOpen && editData && !isInitialLoad) {
      setSelectedType(editData.config.typeName || 'MCQs');
      setRequiredCount(editData.config.total);
      setAttemptCount(editData.config.attempt);
      setDefaultMarks(editData.config.marks);
      setLayoutCols(editData.config.layoutCols || 1);
      setTempSelected(editData.questions);
      setDisplayQuestions(editData.questions);
      setViewMode('selection');
      setFilterOnlySelected(true); 
      setIsInitialLoad(true);
    } 
    if (!isOpen) {
      setViewMode('filters'); setTempSelected([]); setDisplayQuestions([]);
      setFilterOnlySelected(false); setIsInitialLoad(false);
    }
  }, [isOpen, editData, isInitialLoad]);

  useEffect(() => {
    if(!editData || (isOpen && viewMode === 'filters')) {
        const type = selectedType.toLowerCase();
        if (type.includes('mcq')) { setDefaultMarks(1); setAttemptCount(requiredCount); setLayoutCols(1); } 
        else if (type.includes('short')) { setDefaultMarks(2); setAttemptCount(Math.min(8, requiredCount)); } 
        else if (type.includes('long')) { setDefaultMarks(5); setAttemptCount(Math.min(3, requiredCount)); }
    }
  }, [selectedType, requiredCount, editData, isOpen, viewMode]);

  if (!isOpen) return null;

  const shuffle = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

  const handleSearchTrigger = async () => {
    if (selectedSource.length === 0) {
      toast.error("Please select at least one Source Material.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/classes`);
      let rootData = response.data;
      if (Array.isArray(rootData)) rootData = rootData[0]?.data || rootData[0];

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const boardKey = Object.keys(rootData).find(key => 
        key.toLowerCase() === (user.board || 'punjab').toLowerCase()
      ) || Object.keys(rootData)[0];

      const boardData = rootData[boardKey];
      const classData = boardData.classes.find((c: any) => 
        String(c.title).toLowerCase().trim() === className.toLowerCase().trim() ||
        String(c.id) === className.replace(/\D/g, '')
      );

      if (!classData) { toast.error(`Class ${className} not found.`); return; }

      const targetSubject = classData.subjects?.find((sub: any) => 
          sub.name.toLowerCase().trim() === subjectName.toLowerCase().trim()
      );
      
      if (!targetSubject?.chapters) { toast.error("Subject or chapters not found."); return; }

      let allQuestions: any[] = [];
      const filteredChapters = targetSubject.chapters.filter((ch: any) => chapters.includes(ch.name || ch));

      filteredChapters.forEach((chapter: any) => {
        if (chapter.topics && Array.isArray(chapter.topics)) {
          const topicsToProcess = (topics && topics.length > 0) 
            ? chapter.topics.filter((t: any) => topics.includes(t.name || t))
            : chapter.topics;

          topicsToProcess.forEach((topic: any) => {
            const typeKey = Object.keys(topic.questionTypes || {}).find(k => 
              k.toLowerCase().startsWith(selectedType.toLowerCase().substring(0, 3))
            );
            if (typeKey && topic.questionTypes[typeKey]) {
              const typeData = topic.questionTypes[typeKey];
              if (typeData.categories && Array.isArray(typeData.categories)) {
                const matchedCats = typeData.categories.filter((cat: any) => selectedSource.includes(cat.name.trim()));
                matchedCats.forEach((c: any) => { if (c.questions) allQuestions = [...allQuestions, ...c.questions]; });
              }
            }
          });
        }
      });

      if (allQuestions.length === 0) {
        toast.error(`No questions found for the selected criteria.`);
      } else {
        const questionsWithTags = allQuestions.map((q, i) => ({ 
          ...q, 
          type: selectedType.toLowerCase(),
          marks: defaultMarks, 
          tempId: `${selectedType}-${i}-${Math.random().toString(36).substr(2, 5)}`
        }));
        setDisplayQuestions(questionsWithTags);
        setViewMode('selection');
        setFilterOnlySelected(false);
      }
    } catch (error) {
      toast.error("Failed to connect to the database.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRandomSelect = () => {
    setFilterOnlySelected(false);
    const shuffled = shuffle(displayQuestions);
    setTempSelected(shuffled.slice(0, Number(requiredCount)));
  };

  const toggleSelection = (q: any) => {
    const isSelected = tempSelected.some(item => item.tempId === q.tempId);
    if (isSelected) {
      setTempSelected(tempSelected.filter(item => item.tempId !== q.tempId));
    } else if (tempSelected.length < Number(requiredCount)) {
      setTempSelected([...tempSelected, q]);
    }
  };

  const visibleQuestions = filterOnlySelected 
    ? displayQuestions.filter(q => tempSelected.some(s => s.tempId === q.tempId))
    : displayQuestions;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/80 backdrop-blur-md p-0 sm:p-4 font-sans text-black">
      <div className="bg-[#fcfdfe] w-full max-w-6xl h-[95vh] sm:h-auto rounded-t-2xl sm:rounded-sm shadow-2xl overflow-hidden border border-white/20 flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-8 py-3 flex justify-between items-center border-b-4 border-blue-600 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 bg-blue-600 rounded-sm hidden sm:block">
              <FaDatabase size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-xl font-black uppercase tracking-tight truncate max-w-[200px] sm:max-w-none">
                {editData ? `Editing Batch` : subjectName}
              </h2>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Class {className} • {chapters.length} Ch • {topics.length > 0 ? 'Topic Mode' : 'Full Ch'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-red-500 p-2 rounded-full transition-all bg-slate-800"><FaTimes size={18} /></button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {viewMode === 'filters' ? (
            <div className="p-6 sm:p-10 space-y-6 sm:space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                {/* Category */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Category</label>
                  <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} 
                          className="bg-white border-2 border-slate-100 rounded-xl p-3 sm:p-4 font-bold outline-none focus:border-blue-600 text-slate-700 text-sm">
                    <option value="MCQs">MCQs (Objectives)</option>
                    <option value="shorts">Short Questions</option>
                    <option value="longs">Long Questions</option>
                  </select>
                </div>

                {/* Source Material */}
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Source Material</label>
                  <div className="flex flex-wrap gap-2">
                    {["Exercise Questions", "Additional Questions", "Pastpapers Questions"].map((src) => (
                      <button
                        key={src}
                        onClick={() => toggleSource(src)}
                        className={`flex-1 sm:flex-none px-3 py-2 sm:py-3 rounded-xl text-[9px] sm:text-[11px] font-black uppercase border-2 transition-all ${
                          selectedSource.includes(src) 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'bg-white border-slate-100 text-slate-600'
                        }`}
                      >
                        {src.split(' ')[0]}
                      </button>
                    ))}
                    <button onClick={() => toggleSource('All')} className="px-3 py-2 sm:py-3 rounded-xl text-[9px] sm:text-[11px] font-black uppercase border-2 border-dashed border-slate-300 text-slate-400">
                      All
                    </button>
                  </div>
                </div>

                {/* Numbers Row */}
                <div className="grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-3 gap-4 sm:col-span-2 lg:col-span-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Total Qs</label>
                        <input type="number" value={requiredCount} onChange={(e) => setRequiredCount(Number(e.target.value))} 
                            className="bg-white border-2 border-slate-100 rounded-xl p-3 font-bold text-sm outline-none focus:border-blue-600" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Marks/Q</label>
                        <input type="number" value={defaultMarks} onChange={(e) => setDefaultMarks(Number(e.target.value))} 
                            className="bg-white border-2 border-slate-100 rounded-xl p-3 font-bold text-sm outline-none focus:border-blue-600" />
                    </div>
                    {!selectedType.toLowerCase().includes('mcq') && (
                        <div className="flex flex-col gap-1 col-span-2 lg:col-span-1">
                            <label className="text-[10px] font-black text-blue-600 uppercase ml-1">To Attempt</label>
                            <input type="number" value={attemptCount} onChange={(e) => setAttemptCount(Number(e.target.value))} 
                                className="bg-blue-50 border-2 border-blue-100 rounded-xl p-3 font-bold text-sm outline-none focus:border-blue-600" />
                        </div>
                    )}
                </div>
              </div>

              <button onClick={handleSearchTrigger} disabled={isLoading}
                      className="w-full bg-slate-900 hover:bg-blue-600 text-white py-4 sm:py-6 rounded-2xl font-black flex items-center justify-center gap-4 uppercase transition-all shadow-xl disabled:opacity-50 text-sm">
                {isLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                {isLoading ? "Fetching..." : "Find Questions"}
              </button>
            </div>
          ) : (
            <div className="p-4 flex flex-col h-full">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <button onClick={() => setViewMode('filters')} className="flex items-center gap-2 text-blue-600 font-black uppercase text-[10px] sm:text-xs">
                  <FaArrowLeft /> Back to Filters
                </button>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex-1 sm:flex-none bg-slate-100 text-slate-600 px-3 py-1.5 rounded-sm font-black text-[9px] flex items-center justify-center gap-2">
                     <FaColumns /> {layoutCols} COL
                  </div>
                  <div className="flex-2 sm:flex-none bg-blue-600 text-white px-4 py-1.5 rounded-sm shadow-lg font-black text-[10px] sm:text-xs text-center">
                    {tempSelected.length} / {requiredCount} SELECTED
                  </div>
                </div>
              </div>

              <div className={`grid gap-3 sm:gap-4 pb-24 sm:pb-4 ${layoutCols === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {visibleQuestions.map((q, idx) => {
                  const isSelected = tempSelected.some(item => item.tempId === q.tempId);
                  const isMCQ = selectedType.toLowerCase().includes('mcq');
                  return (
                    <div key={q.tempId} onClick={() => toggleSelection(q)}
                         className={`p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer flex gap-3 sm:gap-4 ${
                           isSelected ? 'border-blue-600 bg-blue-50/50 shadow-md' : 'bg-white border-slate-100'
                         }`}>
                      <div className={`w-5 h-5 mt-1 rounded-sm border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 bg-slate-50'
                      }`}>
                        {isSelected && <FaCheckSquare size={10} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <p className="font-bold text-slate-800 text-xs sm:text-sm leading-snug">
                              <span className="text-blue-600 mr-1">{idx + 1}.</span> {q.question || q.text}
                            </p>
                            <span className="bg-slate-100 text-slate-500 text-[8px] sm:text-[10px] font-black px-2 py-1 rounded ml-2 whitespace-nowrap">
                              {q.marks}M
                            </span>
                        </div>
                        {isMCQ && q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2 ml-4">
                            {Object.entries(q.options).map(([key, value]) => (
                              <div key={key} className="text-[11px] sm:text-[12px] flex items-center gap-2">
                                <span className="font-black text-blue-600 uppercase">{key})</span>
                                <span className="text-slate-600 font-medium">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer for Selection Mode */}
        {viewMode === 'selection' && (
            <div className="fixed bottom-0 left-0 right-0 sm:static bg-white border-t-2 border-slate-100 p-3 sm:p-4 grid grid-cols-4 gap-2 sm:gap-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                <button onClick={() => setFilterOnlySelected(false)} className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-4 rounded-xl font-black uppercase text-[8px] sm:text-xs transition-all ${!filterOnlySelected ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <FaLayerGroup className="text-sm sm:text-base" /> <span className="hidden sm:inline">All</span>
                </button>
                <button onClick={() => setFilterOnlySelected(true)} className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-4 rounded-xl font-black uppercase text-[8px] sm:text-xs transition-all ${filterOnlySelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <FaListUl className="text-sm sm:text-base" /> <span className="hidden sm:inline">Selected</span>
                </button>
                <button onClick={handleRandomSelect} className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 bg-purple-600 text-white py-2 sm:py-4 rounded-xl font-black uppercase text-[8px] sm:text-xs shadow-lg">
                    <FaRandom className="text-sm sm:text-base" /> <span className="hidden sm:inline">Random</span>
                </button>
                <button 
                    disabled={tempSelected.length < Number(requiredCount)}
                    onClick={() => { 
                        onAddQuestions(tempSelected, { total: requiredCount, attempt: attemptCount, marks: defaultMarks, type: selectedType, layoutCols: layoutCols }); 
                        onClose(); 
                    }} 
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-4 rounded-xl font-black uppercase text-[8px] sm:text-xs transition-all shadow-lg ${tempSelected.length < Number(requiredCount) ? 'bg-slate-300 text-slate-500' : 'bg-green-600 text-white'}`}>
                    <FaCheckSquare className="text-sm sm:text-base" /> <span>{editData ? "Update" : "Add"}</span>
                </button>
            </div>
        )}
      </div>
    </div>
  );
}