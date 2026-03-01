'use client';
import React, { useEffect, useState } from 'react';
import { FaGraduationCap, FaArrowLeft, FaChevronRight, FaCheckCircle, FaBookOpen } from "react-icons/fa";
import Navbar from '../components/navbar/page';
import PaperPreview from '../paper/page'; 
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function GeneratePaper() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedClassName, setSelectedClassName] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [selectedChapters, setSelectedChapters] = useState<any[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]); // Topics state
  const [showPreview, setShowPreview] = useState(false);
  const [step, setStep] = useState(1);
  
  const [classes, setClasses] = useState<any[]>([]);
  const [fullData, setFullData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

    const API_BASE = "https://backendrepoo-production.up.railway.app/api";
 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/classes`); 
        let rawData = res.data;
        let allDataFromDB = Array.isArray(rawData) ? (rawData[0]?.classes || rawData) : (rawData.classes || []);

        const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(loggedInUser);

        const isAdmin = loggedInUser.role === 'admin' || loggedInUser.role === 'superadmin';
        let finalClasses = isAdmin ? allDataFromDB : allDataFromDB.filter((c: any) => 
          loggedInUser.classes?.includes(c.title)
        ).map((c: any) => ({
          ...c,
          subjects: (c.subjects || []).filter((s: any) => loggedInUser.subjects?.includes(s.name))
        })).filter((c: any) => c.subjects?.length > 0);

        setClasses(finalClasses);
        const dataMap: any = {};
        finalClasses.forEach((c: any) => { dataMap[c.id || c.title] = c; });
        setFullData(dataMap);
      } catch (error) { 
        toast.error("Database Connection Failed");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentSubjects = (selectedClassId && fullData && fullData[selectedClassId]) ? (fullData[selectedClassId].subjects || []) : [];

  const handleBack = () => {
    if (step === 3) { setStep(2); setSelectedChapters([]); setSelectedTopics([]); setSelectedSubject(null); }
    else if (step === 2) { setStep(1); setSelectedClassId(null); setSelectedClassName(null); }
  };

  const toggleChapter = (chapterObj: any) => {
    const chName = chapterObj.name || chapterObj;
    setSelectedChapters(prev => {
      const isExist = prev.find(c => (c.name || c) === chName);
      if (isExist) {
        // Agar chapter unselect ho raha hai, to uske topics bhi unselect kar do
        const chapterTopics = chapterObj.topics?.map((t: any) => typeof t === 'string' ? t : t.name) || [];
        setSelectedTopics(topics => topics.filter(t => !chapterTopics.includes(t)));
        return prev.filter(c => (c.name || c) !== chName);
      }
      return [...prev, chapterObj];
    });
  };

  const toggleTopic = (topicName: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicName) ? prev.filter(t => t !== topicName) : [...prev, topicName]
    );
  };

  // --- PREVIEW RENDER WITH TOPICS ---
  if (showPreview) {
    return (
      <PaperPreview 
        className={selectedClassName || ''}
        subject={selectedSubject}
        chapters={selectedChapters.map(c => c.name || c)}
        topics={selectedTopics} 
        onClose={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-[#f8fafc] flex overflow-hidden font-sans">
      <Toaster position="top-center"/>
      <Navbar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 z-10">
          <div className="flex items-center gap-4">
            {step > 1 && (
              <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                <FaArrowLeft />
              </button>
            )}
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              {step === 3 ? `${selectedSubject?.name}` : step === 2 ? `${selectedClassName} Subjects` : 'Generate Test Paper'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Step {step} of 3</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12">
          {loading ? (
             <div className="h-full flex items-center justify-center font-black text-slate-300 animate-pulse uppercase tracking-widest">Loading...</div>
          ) : (
            <>
              {/* STEP 1: CLASSES */}
              {step === 1 && (
                <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
                  <h2 className="text-3xl font-black text-slate-900 mb-10 tracking-tight">Select Class</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {classes.length > 0 ? classes.map((item: any) => (
                      <div 
                        key={item.id} 
                        onClick={() => { setSelectedClassId(item.id); setSelectedClassName(item.title); setStep(2); }} 
                        className="group relative bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer h-72"
                      >
                        <img src={item.img || item.image} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 opacity-20 group-hover:opacity-40" alt={item.title} />
                        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-transparent group-hover:opacity-0 transition-opacity duration-500" />
                        <div className="relative p-8 h-full flex flex-col justify-between z-10">
                          <div>
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color || 'from-blue-600 to-blue-400'} flex items-center justify-center text-white shadow-lg mb-4`}>
                              <FaGraduationCap size={20} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800">{item.title}</h3>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{item.sub}</p>
                          </div>
                          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all">
                            View Subjects <FaChevronRight size={10} />
                          </div>
                        </div>
                      </div>
                    )) : (
                        <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed text-slate-400 font-bold">
                            No classes available.
                        </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: SUBJECTS */}
              {step === 2 && (
                <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
                  <h2 className="text-3xl font-black text-slate-900 mb-10 tracking-tight">Select Subject</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {currentSubjects.map((sub: any, i: number) => (
                      <div key={i} onClick={() => { setSelectedSubject(sub); setStep(3); }} className="group bg-white p-2 rounded-xl border border-slate-100 hover:border-blue-500 cursor-pointer transition-all shadow-sm hover:shadow-xl">
                        <div className="h-45 rounded-xl bg-slate-100 mb-4 overflow-hidden">
                          <img src={sub.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={sub.name} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 text-center pb-2">{sub.name}</h3>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: CHAPTERS & TOPICS */}
              {step === 3 && (
                <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-10">
                  <div className="sticky top-0 z-20 bg-[#f8fafc] py-4 mb-6 border-b border-slate-200 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">Select Chapters & Topics</h2>
                      <div className="flex gap-3 mt-1 text-[10px] font-bold uppercase">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">Chapters: {selectedChapters.length}</span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">Topics: {selectedTopics.length}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowPreview(true)} 
                      disabled={selectedChapters.length === 0}
                      className="px-8 py-3 rounded-xl font-black text-sm bg-slate-900 text-white shadow-lg hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 transition-all active:scale-95"
                    >
                      Generate Paper
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedSubject.chapters.map((chapter: any, idx: number) => {
                      const chapterName = chapter.name || chapter;
                      const chapterTopics = chapter.topics || [];
                      const isChapterSelected = selectedChapters.find(c => (c.name || c) === chapterName);

                      return (
                        <div key={idx} className={`rounded-2xl border transition-all overflow-hidden ${isChapterSelected ? 'border-blue-400 bg-white shadow-lg' : 'border-slate-200 bg-white/50'}`}>
                          <div 
                            onClick={() => toggleChapter(chapter)}
                            className={`p-5 cursor-pointer flex items-center justify-between border-b ${isChapterSelected ? 'bg-blue-50/50 border-blue-100' : 'border-transparent'}`}
                          >
                            <div className="flex items-center gap-4">
                              <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${isChapterSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                 {idx + 1}
                              </span>
                              <h3 className={`font-bold ${isChapterSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                                {chapterName}
                              </h3>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isChapterSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                              {isChapterSelected && <FaCheckCircle className="text-white text-xs" />}
                            </div>
                          </div>

                          {/* Topics List with flex-wrap for better UI */}
                          <div className="p-4 bg-white/30">
                            <div className="flex flex-wrap gap-2">
                              {chapterTopics.length > 0 ? chapterTopics.map((topic: any, tIdx: number) => {
                                const topicName = typeof topic === 'string' ? topic : topic.name;
                                const isTopicSelected = selectedTopics.includes(topicName);

                                return (
                                  <div
                                    key={tIdx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!isChapterSelected) toggleChapter(chapter);
                                      toggleTopic(topicName);
                                    }}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border text-[11px] font-bold transition-all ${isTopicSelected ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                  >
                                    <span>{topicName}</span>
                                    {isTopicSelected && <FaCheckCircle className="text-green-600" />}
                                  </div>
                                );
                              }) : (
                                <div className="text-[10px] text-slate-400 italic">No topics available.</div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
