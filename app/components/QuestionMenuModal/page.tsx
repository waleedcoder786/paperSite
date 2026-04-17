'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaTimes, FaSearch, FaCheckSquare, FaArrowLeft, 
  FaSpinner, FaDatabase, FaRandom, FaListUl, FaLayerGroup, FaColumns, FaTag 
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
      
      // Handling MongoDB Wrapper Structure
      if (Array.isArray(rootData)) {
          rootData = rootData[0]?.data || rootData[0];
      }

      // Step 1: Find Board from local storage or default to Punjab
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const boardKey = Object.keys(rootData).find(key => 
        key.toLowerCase() === (user.board || 'punjab').toLowerCase()
      ) || Object.keys(rootData)[0]; // Fallback to first board if not found

      const boardData = rootData[boardKey];
      if (!boardData || !boardData.classes) {
        toast.error("Board data structure is invalid.");
        return;
      }

      // Step 2: Find Class (Flexible match for "9th" vs "9")
      const classData = boardData.classes.find((c: any) => 
        String(c.title).toLowerCase().trim() === className.toLowerCase().trim() ||
        String(c.id) === className.replace(/\D/g, '')
      );

      if (!classData) {
        toast.error(`Class ${className} not found in ${boardKey}.`);
        return;
      }

      // Step 3: Find Subject
      const targetSubject = classData.subjects?.find((sub: any) => 
          sub.name.toLowerCase().trim() === subjectName.toLowerCase().trim()
      );
      
      if (!targetSubject?.chapters) {
        toast.error("Subject or chapters not found.");
        return;
      }

      let allQuestions: any[] = [];
      
      // Step 4: Filter Selected Chapters
      const filteredChapters = targetSubject.chapters.filter((ch: any) => 
        chapters.includes(ch.name || ch)
      );

      filteredChapters.forEach((chapter: any) => {
        if (chapter.topics && Array.isArray(chapter.topics)) {
          // If topics are selected, only process those. Else process all topics in selected chapter.
          const topicsToProcess = (topics && topics.length > 0) 
            ? chapter.topics.filter((t: any) => topics.includes(t.name || t))
            : chapter.topics;

          topicsToProcess.forEach((topic: any) => {
            // Find key starting with 'MCQ', 'Sho', 'Lon'
            const typeKey = Object.keys(topic.questionTypes || {}).find(k => 
              k.toLowerCase().startsWith(selectedType.toLowerCase().substring(0, 3))
            );

            if (typeKey && topic.questionTypes[typeKey]) {
              const typeData = topic.questionTypes[typeKey];
              if (typeData.categories && Array.isArray(typeData.categories)) {
                // Category Filter (Exercise, etc)
                const matchedCats = typeData.categories.filter((cat: any) => 
                  selectedSource.includes(cat.name.trim())
                );
                matchedCats.forEach((c: any) => {
                  if (c.questions) allQuestions = [...allQuestions, ...c.questions];
                });
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
      console.error(error);
      toast.error("Failed to connect to the database.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRandomSelect = () => {
    setFilterOnlySelected(false);
    const shuffled = shuffle(displayQuestions);
    const limit = Number(requiredCount);
    setTempSelected(shuffled.slice(0, limit));
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 font-sans text-black">
      <div className="bg-[#fcfdfe] w-full max-w-6xl rounded-sm shadow-2xl overflow-hidden border border-white/20">
        
        <div className="bg-slate-900 text-white px-8 py-2 flex justify-between items-center border-b-4 border-blue-600">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600 rounded-sm shadow-lg shadow-blue-500/30">
              <FaDatabase size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">
                {editData ? `Editing Batch` : subjectName}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Class {className} • {chapters.length} Chapters • {topics.length > 0 ? `${topics.length} Selected Topics` : 'All Topics'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-red-500 p-2 rounded-full transition-all bg-slate-800"><FaTimes size={20} /></button>
        </div>

        {viewMode === 'filters' ? (
           <div className="p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Category</label>
                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} 
                        className="bg-white border-2 border-slate-100 rounded-xl p-4 font-bold outline-none focus:border-blue-600 text-slate-700 shadow-sm">
                  <option value="MCQs">MCQs (Objectives)</option>
                  <option value="shorts">Short Questions</option>
                  <option value="longs">Long Questions</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 lg:col-span-2">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Source Material</label>
                <div className="flex flex-wrap gap-2">
                  {["Exercise Questions", "Additional Questions", "Pastpapers Questions"].map((src) => (
                    <button
                      key={src}
                      onClick={() => toggleSource(src)}
                      className={`px-4 py-3 rounded-xl text-[11px] font-black uppercase border-2 transition-all shadow-sm ${
                        selectedSource.includes(src) 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200'
                      }`}
                    >
                      {src === "Pastpapers Questions" ? "Past Papers" : src}
                    </button>
                  ))}
                  <button onClick={() => toggleSource('All')} className="px-4 py-3 rounded-xl text-[11px] font-black uppercase border-2 border-dashed border-slate-300 text-slate-400 hover:border-blue-600 hover:text-blue-600 transition-all">
                    Select All
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Total Qs</label>
                <input type="number" value={requiredCount} onChange={(e) => setRequiredCount(Number(e.target.value))} 
                       className="bg-white border-2 border-slate-100 rounded-xl p-4 font-bold outline-none focus:border-blue-600 text-slate-700 shadow-sm" />
              </div>

              {!selectedType.toLowerCase().includes('mcq') && (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[11px] font-black text-blue-600 uppercase ml-1">To Attempt</label>
                  <input type="number" value={attemptCount} onChange={(e) => setAttemptCount(Number(e.target.value))} 
                          className="bg-blue-50 border-2 border-blue-100 rounded-xl p-4 font-bold outline-none focus:border-blue-600 text-blue-700 shadow-sm" />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Marks/Q</label>
                <input type="number" value={defaultMarks} onChange={(e) => setDefaultMarks(Number(e.target.value))} 
                       className="bg-white border-2 border-slate-100 rounded-xl p-4 font-bold outline-none focus:border-blue-600 text-slate-700 shadow-sm" />
              </div>
              
              {!selectedType.toLowerCase().includes('mcq') && (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[11px] font-black text-purple-600 uppercase ml-1">Qs Per Row</label>
                  <select value={layoutCols} onChange={(e) => setLayoutCols(Number(e.target.value))}
                          className="bg-purple-50 border-2 border-purple-100 rounded-xl p-4 font-bold outline-none focus:border-purple-600 text-purple-700 shadow-sm">
                    <option value={1}>1 Question/Row</option>
                    <option value={2}>2 Questions/Row</option>
                  </select>
                </div>
              )}
            </div>
            <button onClick={handleSearchTrigger} disabled={isLoading}
                    className="w-full bg-slate-900 hover:bg-blue-600 text-white py-6 rounded-2xl font-black flex items-center justify-center gap-4 uppercase transition-all shadow-xl active:scale-[0.98] disabled:opacity-50">
              {isLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
              {isLoading ? "Fetching Data..." : "Find Questions"}
            </button>
          </div>
        ) : (
          <div className="p-3">
             <div className="flex justify-between items-center mb-3 text-black">
              <button onClick={() => setViewMode('filters')} className="flex items-center gap-2 text-blue-600 font-black uppercase text-xs hover:underline">
                <FaArrowLeft /> Back to Filters
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-sm font-black text-[10px] flex items-center gap-2">
                   <FaColumns /> LAYOUT: {layoutCols} COL
                </div>
                <div className="bg-blue-600 text-white px-6 py-1.5 rounded-sm shadow-lg font-black text-xs">
                  SELECTED: {tempSelected.length} / {requiredCount}
                </div>
              </div>
            </div>

            <div className={`grid gap-4 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar mb-6 ${layoutCols === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {visibleQuestions.map((q, idx) => {
                const isSelected = tempSelected.some(item => item.tempId === q.tempId);
                const isMCQ = selectedType.toLowerCase().includes('mcq');
                return (
                  <div key={q.tempId} onClick={() => toggleSelection(q)}
                       className={`p-4 rounded-lg border-2 transition-all cursor-pointer flex gap-4 h-fit ${
                         isSelected ? 'border-blue-600 bg-blue-50/50 shadow-md' : 'bg-white border-slate-100 hover:border-blue-200 shadow-sm'
                       }`}>
                    <div className={`w-6 h-6 mt-1 rounded-sm border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 bg-slate-50'
                    }`}>
                      {isSelected && <FaCheckSquare size={12} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-slate-800 text-sm leading-snug">
                            <span className="text-blue-600 mr-2">{idx + 1}.</span> {q.question || q.text}
                          </p>
                          <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded ml-2 whitespace-nowrap">
                            {q.marks} Marks
                          </span>
                      </div>
                      {isMCQ && q.options && (
                        <div className="grid grid-cols-2 gap-2 mt-3 ml-6">
                          {Object.entries(q.options).map(([key, value]) => (
                            <div key={key} className="text-[12px] flex items-center gap-2">
                              <span className="font-black text-blue-600">{key})</span>
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 border-t-2 border-slate-50">
              <button onClick={() => setFilterOnlySelected(false)} className={`flex items-center justify-center gap-2 py-4 rounded-xl font-black uppercase text-xs transition-all ${!filterOnlySelected ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <FaLayerGroup /> All
              </button>
              <button onClick={() => setFilterOnlySelected(true)} className={`flex items-center justify-center gap-2 py-4 rounded-xl font-black uppercase text-xs transition-all ${filterOnlySelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <FaListUl /> Selected
              </button>
              <button onClick={handleRandomSelect} className="flex items-center justify-center gap-2 bg-purple-600 text-white py-4 rounded-xl font-black uppercase text-xs hover:bg-purple-700 transition-all shadow-lg">
                <FaRandom /> Random Pick
              </button>
              <button 
                disabled={tempSelected.length < Number(requiredCount)}
                onClick={() => { 
                  onAddQuestions(tempSelected, { total: requiredCount, attempt: attemptCount, marks: defaultMarks, type: selectedType, layoutCols: layoutCols }); 
                  onClose(); 
                }} 
                className={`flex items-center justify-center gap-2 py-4 rounded-xl font-black uppercase text-xs transition-all shadow-lg ${tempSelected.length < Number(requiredCount) ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                {editData ? "Update Paper" : "Add In Paper"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}