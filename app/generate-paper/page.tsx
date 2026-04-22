'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { FaGraduationCap, FaArrowLeft, FaChevronRight, FaCheckCircle, FaUniversity, FaBars } from "react-icons/fa";
import Navbar from '../components/navbar/page';
import PaperPreview from '../paper/page'; 
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = "/api/classes";

export default function GeneratePaper() {
  const BOARD_LOGOS: Record<string, string> = {
    punjab: "https://www.biselahore.com/images/logos/biselogo.png",
    Federal: "https://upload.wikimedia.org/wikipedia/en/2/25/FBISE_Islamabad_%28logo%29.png"
  };

  const [step, setStep] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [fullRawData, setFullRawData] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [fullData, setFullData] = useState<Record<string, any>>({});
  
  const [selection, setSelection] = useState({
    board: null as string | null,
    classId: null as string | null,
    className: null as string | null,
    subject: null as any | null,
    chapters: [] as any[],
    topics: [] as string[],
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const { data: response } = await axios.get(`${API_BASE}`);
        const actualData = Array.isArray(response) ? (response[0]?.data || response[0]) : (response?.data || response);
        setFullRawData(actualData);
      } catch (error) {
        toast.error("Database Connection Failed");
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleBoardSelect = (boardKey: string) => {
    if (!fullRawData) return;
    const boardData = fullRawData[boardKey];
    
    let user: any = {};
    try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch (e) {}

    const allBoardClasses = boardData.classes || [];
    const isAdmin = ['admin', 'superadmin'].includes(user.role);

    const filteredClasses = isAdmin 
      ? allBoardClasses 
      : allBoardClasses.filter((c: any) => user.classes?.includes(c.title))
          .map((c: any) => ({
            ...c,
            subjects: (c.subjects || []).filter((s: any) => user.subjects?.includes(s.name))
          }))
          .filter((c: any) => c.subjects?.length > 0);

    setClasses(filteredClasses);
    const dataMap = filteredClasses.reduce((acc: any, curr: any) => {
      acc[curr.id || curr.title] = curr;
      return acc;
    }, {});
    
    setFullData(dataMap);
    setSelection(prev => ({ ...prev, board: boardKey }));
    setStep(1);
  };

  const currentSubjects = useMemo(() => {
    return selection.classId ? (fullData[selection.classId]?.subjects || []) : [];
  }, [selection.classId, fullData]);

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const toggleChapter = (chapterObj: any) => {
    const chName = chapterObj.name || chapterObj;
    setSelection(prev => {
      const isExist = prev.chapters.find(c => (c.name || c) === chName);
      if (isExist) {
        const chTopics = chapterObj.topics?.map((t: any) => typeof t === 'string' ? t : t.name) || [];
        return {
          ...prev,
          chapters: prev.chapters.filter(c => (c.name || c) !== chName),
          topics: prev.topics.filter(t => !chTopics.includes(t))
        };
      }
      return { ...prev, chapters: [...prev.chapters, chapterObj] };
    });
  };

  const toggleTopic = (topicName: string, chapter: any) => {
    setSelection(prev => {
      const isChapterSelected = prev.chapters.find(c => (c.name || c) === (chapter.name || chapter));
      const newChapters = isChapterSelected ? prev.chapters : [...prev.chapters, chapter];
      const newTopics = prev.topics.includes(topicName) 
        ? prev.topics.filter(t => t !== topicName) 
        : [...prev.topics, topicName];
      return { ...prev, chapters: newChapters, topics: newTopics };
    });
  };

  if (showPreview) {
    return (
      <PaperPreview 
        className={selection.className || ''}
        subject={selection.subject}
        chapters={selection.chapters.map(c => c.name || c)}
        topics={selection.topics} 
        onClose={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col md:flex-row overflow-hidden font-sans text-slate-900">
      <Toaster position="top-center"/>
      
      {/* Sidebar - Hidden on mobile by default */}
      <div className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-50 transition-transform duration-300`}>
        <Navbar />
      </div>
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Responsive Header */}
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-10 z-30 shadow-sm">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 md:hidden text-slate-600"
            >
              <FaBars />
            </button>
            {step > 0 && (
              <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-all">
                <FaArrowLeft size={14} />
              </button>
            )}
            <h1 className="text-sm md:text-xl font-black uppercase tracking-tight truncate max-w-[150px] md:max-w-none">
              {step === 0 ? 'Select Board' : step === 3 ? selection.subject?.name : step === 2 ? `${selection.className}` : 'Select Class'}
            </h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex gap-1">
              {[0, 1, 2, 3].map((s) => (
                <div key={s} className={`h-1.5 w-4 md:w-6 rounded-full transition-all ${step >= s ? 'bg-blue-600' : 'bg-slate-200'}`} />
              ))}
            </div>
            <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">Step {step}/3</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-12 pb-24 md:pb-12">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
               <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
               <p className="font-black text-slate-400 text-xs uppercase tracking-widest">Loading...</p>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* STEP 0: BOARD SELECTION */}
              {step === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
                  {fullRawData && Object.entries(fullRawData).map(([boardKey, boardData]: [string, any]) => (
                    <BoardCard 
                      key={boardKey}
                      title={boardData.name || boardKey}
                      sub={`${boardData.classes?.length || 0} Classes`}
                      logo={BOARD_LOGOS[boardKey]}
                      onClick={() => handleBoardSelect(boardKey)} 
                    />
                  ))}
                </div>
              )}

              {/* STEP 1: CLASS SELECTION */}
              {step === 1 && (
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {classes.map((item, idx) => (
                    <ClassCard 
                      key={item.id || idx} 
                      item={item} 
                      onClick={() => {
                        setSelection(prev => ({ ...prev, classId: item.id || item.title, className: item.title }));
                        setStep(2);
                      }} 
                    />
                  ))}
                </div>
              )}

              {/* STEP 2: SUBJECT SELECTION */}
              {step === 2 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {currentSubjects.map((sub: any, i: number) => (
                    <SubjectCard 
                      key={i} 
                      sub={sub} 
                      onClick={() => {
                        setSelection(prev => ({ ...prev, subject: sub }));
                        setStep(3);
                      }} 
                    />
                  ))}
                </div>
              )}

              {/* STEP 3: CONTENT SELECTION */}
              {step === 3 && (
                <div className="space-y-4 md:space-y-6">
                  <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur py-3 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b border-slate-200">
                    <div>
                      <h2 className="text-lg md:text-2xl font-black">Chapters & Topics</h2>
                      <div className="flex gap-2 mt-1">
                        <Badge color="blue">Ch: {selection.chapters.length}</Badge>
                        <Badge color="green">Top: {selection.topics.length}</Badge>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowPreview(true)} 
                      disabled={selection.chapters.length === 0}
                      className="w-full sm:w-auto px-6 md:px-10 py-3 rounded-xl font-black text-xs md:text-sm bg-blue-600 text-white shadow-xl hover:bg-blue-700 disabled:bg-slate-300 transition-all"
                    >
                      Generate Paper
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                    {selection.subject?.chapters?.map((chapter: any, idx: number) => (
                      <ChapterAccordion 
                        key={idx}
                        index={idx}
                        chapter={chapter}
                        isSelected={!!selection.chapters.find(c => (c.name || c) === (chapter.name || chapter))}
                        selectedTopics={selection.topics}
                        onToggleChapter={() => toggleChapter(chapter)}
                        onToggleTopic={(t: string) => toggleTopic(t, chapter)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// --- Responsive Internal Components ---

const BoardCard = ({ title, sub, logo, onClick }: any) => (
  <div 
    onClick={onClick} 
    className="group bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center"
  >
    <div className="w-16 h-16 md:w-24 md:h-24 rounded-xl md:rounded-2xl bg-white p-2 md:p-3 shadow-md mb-4 md:6 group-hover:scale-105 transition-transform flex items-center justify-center">
      {logo ? <img src={logo} alt={title} className="w-full h-full object-contain" /> : <FaUniversity className="text-blue-600 text-2xl md:text-4xl" />}
    </div>
    <h3 className="text-lg md:text-2xl font-black text-slate-800 mb-1">{title}</h3>
    <p className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">{sub}</p>
  </div>
);

const ClassCard = ({ item, onClick }: any) => (
  <div 
    onClick={onClick} 
    className="group relative bg-white rounded-xl md:rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer h-48 md:h-72"
  >
    <div className="relative p-5 md:p-8 h-full flex flex-col justify-between z-10">
      <div>
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br ${item.color || 'from-blue-600 to-blue-400'} flex items-center justify-center text-white shadow-lg mb-3 md:mb-4`}>
          <FaGraduationCap size={18} />
        </div>
        <h3 className="text-lg md:text-2xl font-black text-slate-800 leading-tight">{item.title}</h3>
        <p className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{item.sub || 'Class'}</p>
      </div>
      <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
        Explore <FaChevronRight size={8} />
      </div>
    </div>
  </div>
);

const SubjectCard = ({ sub, onClick }: any) => (
  <div onClick={onClick} className="group bg-white p-2 md:p-3 rounded-xl md:rounded-2xl border border-slate-200 hover:border-blue-500 cursor-pointer transition-all shadow-sm">
    <div className="aspect-video rounded-lg md:rounded-xl bg-slate-100 mb-2 md:mb-4 overflow-hidden">
      <img src={sub.image || 'https://via.placeholder.com/150'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={sub.name} />
    </div>
    <h3 className="text-sm md:text-lg font-black text-center truncate px-1">{sub.name}</h3>
  </div>
);

const ChapterAccordion = ({ chapter, index, isSelected, selectedTopics, onToggleChapter, onToggleTopic }: any) => {
  const chapterName = chapter.name || chapter;
  const topics = chapter.topics || [];
  return (
    <div className={`rounded-xl border transition-all ${isSelected ? 'border-blue-400 bg-white shadow-sm' : 'border-slate-200 bg-white/50'}`}>
      <div onClick={onToggleChapter} className={`p-3 md:p-4 cursor-pointer flex items-center justify-between ${isSelected ? 'bg-blue-50/30' : ''}`}>
        <div className="flex items-center gap-2 md:gap-3">
          <span className={`w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center font-black text-[10px] md:text-xs ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
            {index + 1}
          </span>
          <h3 className={`font-bold text-xs md:text-sm truncate max-w-[200px] md:max-w-xs ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{chapterName}</h3>
        </div>
        <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
          {isSelected && <FaCheckCircle className="text-white text-[8px] md:text-[10px]" />}
        </div>
      </div>
      {isSelected && (
        <div className="p-3 md:p-4 pt-0 flex flex-wrap gap-1.5 md:gap-2">
          {topics.map((topic: any, tIdx: number) => {
            const tName = typeof topic === 'string' ? topic : topic.name;
            const isTSelected = selectedTopics.includes(tName);
            return (
              <button
                key={tIdx}
                onClick={(e) => { e.stopPropagation(); onToggleTopic(tName); }}
                className={`px-2 md:px-3 py-1 rounded-md md:rounded-lg border text-[9px] md:text-[10px] font-bold transition-all ${isTSelected ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
              >
                {tName}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Badge = ({ children, color }: any) => (
  <span className={`px-1.5 py-0.5 rounded text-[8px] md:text-[10px] font-black uppercase whitespace-nowrap ${color === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
    {children}
  </span>
);