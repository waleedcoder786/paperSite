"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUniversity, FaGraduationCap, FaBook, FaLayerGroup, 
  FaChevronRight, FaArrowLeft, FaCheckCircle, FaChevronDown,
  FaRegFileAlt, FaListUl, FaAlignLeft
} from "react-icons/fa";
import Header from "../components/topbar/page";
import Navbar from "../components/navbar/page";

export default function SuperAdminExplorer() {
  const [step, setStep] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [fullRawData, setFullRawData] = useState<any>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>(null); 
  
  const [selection, setSelection] = useState({
    board: null as string | null,
    boardName: "" as string,
    class: null as any | null,
    subject: null as any | null,
  });

  const BOARD_LOGOS: Record<string, string> = {
    punjab: "https://www.biselahore.com/images/logos/biselogo.png",
    Federal: "https://upload.wikimedia.org/wikipedia/en/2/25/FBISE_Islamabad_%28logo%29.png"
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: response } = await axios.get("/api/classes");
        const actualData = Array.isArray(response) ? response[0]?.data : response?.data;
        setFullRawData(actualData || {});
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    loadData();
  }, []);

  const handleBack = () => { if (step > 0) setStep(step - 1); };

  return (
    <div className="h-screen w-full bg-slate-50 flex overflow-hidden font-sans text-slate-900">
      <Navbar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER SECTION */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-10 z-10 shadow-sm shrink-0">
          <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
            {step > 0 && (
              <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-all shrink-0">
                <FaArrowLeft size={16} />
              </button>
            )}
            <h1 className="text-sm md:text-xl font-black uppercase tracking-tight truncate">
              {step === 0 ? 'Select Board' : step === 1 ? selection.boardName : step === 2 ? `Class ${selection.class?.title}` : selection.subject?.name}
            </h1>
          </div>
          <div className="flex gap-1 shrink-0">
            {[0, 1, 2, 3].map((s) => (
              <div key={s} className={`h-1 md:h-1.5 w-4 md:w-6 rounded-xl transition-all ${step >= s ? 'bg-blue-600' : 'bg-slate-200'}`} />
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 pb-32">
          {loading ? (
             <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-xl animate-spin" />
                <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Accessing Database</p>
             </div>
          ) : (
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* STEP 0: Boards */}
              {step === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                  {Object.entries(fullRawData || {}).map(([key, data]: any) => (
                    <ExplorerCard 
                        key={key} 
                        title={data.name || key} 
                        sub={`${data.classes?.length || 0} Classes`} 
                        icon={BOARD_LOGOS[key] ? <img src={BOARD_LOGOS[key]} className="w-10 h-10 md:w-12 md:h-12 object-contain" /> : <FaUniversity size={24}/>} 
                        onClick={() => { setSelection({...selection, board: key, boardName: data.name}); setStep(1); }} 
                    />
                  ))}
                </div>
              )}

              {/* STEP 1: Classes */}
              {step === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {fullRawData[selection.board!]?.classes?.map((cls: any, idx: number) => (
                    <ExplorerCard key={idx} title={`Class ${cls.title}`} sub={`${cls.subjects?.length || 0} Subjects`} icon={<FaGraduationCap size={24}/>} color="bg-purple-600" onClick={() => { setSelection({...selection, class: cls}); setStep(2); }} />
                  ))}
                </div>
              )}

              {/* STEP 2: Subjects */}
              {step === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {selection.class?.subjects?.map((sub: any, idx: number) => (
                    <ExplorerCard key={idx} title={sub.name} sub={`${sub.chapters?.length || 0} Chapters`} icon={<FaBook size={20}/>} color="bg-teal-600" onClick={() => { setSelection({...selection, subject: sub}); setStep(3); }} />
                  ))}
                </div>
              )}

              {/* STEP 3: Detailed Content View */}
              {step === 3 && (
                <div className="space-y-6 md:space-y-8">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b-2 border-slate-200 pb-6 gap-4">
                    <div>
                       <span className="text-blue-600 font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em]">Curriculum Database</span>
                       <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter">{selection.subject?.name}</h2>
                    </div>
                    <Badge>{selection.subject?.chapters?.length} Chapters</Badge>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    {selection.subject?.chapters?.map((chap: any, idx: number) => (
                      <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-3 md:p-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 gap-3">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 md:h-12 rounded-lg md:rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-blue-600 border border-slate-100 text-xs md:text-sm">
                                Ch {idx + 1}
                            </span>
                            <h3 className="text-base md:text-xl font-black text-slate-800 uppercase tracking-tight truncate">{chap.name || chap}</h3>
                          </div>
                        </div>

                        <div className="p-2 md:p-4 space-y-3">
                          {chap.topics?.map((top: any, tIdx: number) => {
                            const isVisible = activeTopic === `${idx}-${tIdx}`;
                            return (
                              <div key={tIdx} className={`rounded-xl border transition-all duration-300 ${isVisible ? 'border-blue-400 ring-2 md:ring-4 ring-blue-50/30' : 'border-slate-100 bg-white'}`}>
                                <button 
                                  onClick={() => setActiveTopic(isVisible ? null : `${idx}-${tIdx}`)}
                                  className="w-full p-3 flex items-center justify-between group gap-2"
                                >
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isVisible ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'}`}></div>
                                    <span className={`font-bold text-xs md:text-sm truncate ${isVisible ? 'text-blue-600' : 'text-slate-600 group-hover:text-slate-900'}`}>{top.name || top}</span>
                                  </div>
                                  <div className="flex items-center gap-2 md:gap-4 shrink-0">
                                    <div className="hidden lg:flex gap-2">
                                       <Counter type="MCQ" count={top.questionTypes?.mcqs?.categories?.[0]?.questions?.length || 0} />
                                       <Counter type="SHORT" count={top.questionTypes?.shorts?.categories?.[0]?.questions?.length || 0} />
                                    </div>
                                    <FaChevronDown className={`text-slate-300 transition-transform duration-300 ${isVisible ? 'rotate-180 text-blue-500' : ''}`} size={12} />
                                  </div>
                                </button>

                                {isVisible && (
                                  <div className="p-3 md:p-6 pt-0 animate-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-1 gap-4 md:gap-6 mt-4">
                                      <QuestionGroup icon={<FaListUl className="text-blue-500"/>} title="MCQs" questions={top.questionTypes?.mcqs?.categories?.[0]?.questions || []} isMcq />
                                      <QuestionGroup icon={<FaRegFileAlt className="text-purple-500"/>} title="Shorts" questions={top.questionTypes?.shorts?.categories?.[0]?.questions || []} />
                                      <QuestionGroup icon={<FaAlignLeft className="text-rose-500"/>} title="Longs" questions={top.questionTypes?.longs?.categories?.[0]?.questions || []} />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
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

// --- SUPPORTING COMPONENTS ---

const QuestionGroup = ({ icon, title, questions, isMcq }: any) => {
  if (!questions || questions.length === 0) return null;
  return (
    <div className="bg-slate-50/50 rounded-lg p-3 md:p-6 border border-slate-100">
      <div className="flex items-center gap-3 mb-4 opacity-70">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
          {title} ({questions.length})
        </span>
      </div>
      <div className="space-y-3">
        {questions.map((q: any, i: number) => (
          <div key={i} className="bg-white p-3 md:p-4 rounded-xl border border-slate-200/60 shadow-sm">
            <p className="text-xs md:text-sm font-bold text-slate-800 leading-relaxed text-right dir-rtl">
              {q.question}
            </p>
            {isMcq && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                {Array.isArray(q.options) ? 
                  q.options.map((opt: any, oi: number) => (
                    <div key={oi} className="text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-100 text-slate-500 text-center">
                      {typeof opt === 'string' ? opt : opt.text}
                    </div>
                  )) : 
                  Object.entries(q.options || {}).map(([key, value]: any, oi: number) => (
                    <div key={oi} className="text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-100 text-slate-500">
                      <span className="font-bold text-blue-500 mr-1">{key}</span> {value}
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ExplorerCard = ({ title, sub, icon, onClick, color = "bg-blue-600" }: any) => (
  <div onClick={onClick} className="group bg-white rounded-2xl p-6 md:p-10 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col items-center text-center">
    <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl ${color} text-white shadow-lg mb-4 md:mb-6 group-hover:scale-105 transition-transform flex items-center justify-center shrink-0`}>
        {icon}
    </div>
    <h3 className="text-lg md:text-2xl font-black text-slate-800 mb-1 tracking-tighter line-clamp-1">{title}</h3>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{sub}</p>
    <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] sm:opacity-0 group-hover:opacity-100 transition-all">
        Explore <FaChevronRight size={8} />
    </div>
  </div>
);

const Counter = ({ type, count }: any) => (
  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-slate-100 shadow-sm shrink-0">
    <span className={`text-[8px] font-black ${type === 'MCQ' ? 'text-blue-500' : type === 'SHORT' ? 'text-purple-500' : 'text-rose-500'}`}>{type}</span>
    <span className="text-[10px] font-black text-slate-700">{count}</span>
  </div>
);

const Badge = ({ children }: any) => (
  <span className="w-fit px-4 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl bg-slate-900 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 shrink-0">
      {children}
  </span>
);