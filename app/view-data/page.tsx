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
    <div className="h-screen w-screen bg-slate-50 flex overflow-hidden font-sans text-slate-900 font-urdu-right">
      <Navbar />
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER SECTION */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            {step > 0 && (
              <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-all"><FaArrowLeft /></button>
            )}
            <h1 className="text-xl font-black uppercase tracking-tight">
              {step === 0 ? 'Select Board' : step === 1 ? selection.boardName : step === 2 ? `Class ${selection.class?.title}` : selection.subject?.name}
            </h1>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 w-6 rounded-xl transition-all ${step >= s ? 'bg-blue-600' : 'bg-slate-200'}`} />
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-12 pb-32">
          {loading ? (
             <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-xl animate-spin" />
                <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Accessing Core Database</p>
             </div>
          ) : (
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* STEP 0, 1, 2 (Cards logic same as before) */}
              {step === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {Object.entries(fullRawData || {}).map(([key, data]: any) => (
                    <ExplorerCard key={key} title={data.name || key} sub={`${data.classes?.length || 0} Classes`} icon={BOARD_LOGOS[key] ? <img src={BOARD_LOGOS[key]} className="w-12 h-12 object-contain" /> : <FaUniversity size={30}/>} onClick={() => { setSelection({...selection, board: key, boardName: data.name}); setStep(1); }} />
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {fullRawData[selection.board!]?.classes?.map((cls: any, idx: number) => (
                    <ExplorerCard key={idx} title={`Class ${cls.title}`} sub={`${cls.subjects?.length || 0} Subjects`} icon={<FaGraduationCap size={30}/>} color="bg-purple-600" onClick={() => { setSelection({...selection, class: cls}); setStep(2); }} />
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {selection.class?.subjects?.map((sub: any, idx: number) => (
                    <ExplorerCard key={idx} title={sub.name} sub={`${sub.chapters?.length || 0} Chapters`} icon={<FaBook size={24}/>} color="bg-teal-600" onClick={() => { setSelection({...selection, subject: sub}); setStep(3); }} />
                  ))}
                </div>
              )}

              {/* STEP 3: DETAILED QUESTIONS VIEW */}
              {step === 3 && (
                <div className="space-y-8">
                  <div className="flex justify-between items-end border-b-2 border-slate-200 pb-6">
                    <div>
                       <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em]">Curriculum Database</span>
                       <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{selection.subject?.name}</h2>
                    </div>
                    <Badge>{selection.subject?.chapters?.length} Chapters Total</Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {selection.subject?.chapters?.map((chap: any, idx: number) => (
                      <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-3 bg-slate-50/50 flex items-center justify-between border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="px-2 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-blue-600 border border-slate-100">Chapter No: {idx + 1}</span>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{chap.name || chap}</h3>
                          </div>
                        </div>

                        <div className="p-3 space-y-4">
                          {chap.topics?.map((top: any, tIdx: number) => {
                            const tName = top.name || top;
                            const isVisible = activeTopic === `${idx}-${tIdx}`;
                            
                            return (
                              <div key={tIdx} className={`rounded-xl border transition-all duration-300 ${isVisible ? 'border-blue-400 ring-4 ring-blue-50/30' : 'border-slate-100 bg-white'}`}>
                                <button 
                                  onClick={() => setActiveTopic(isVisible ? null : `${idx}-${tIdx}`)}
                                  className="w-full p-2 flex items-center justify-between group"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${isVisible ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'}`}></div>
                                    <span className={`font-bold text-sm ${isVisible ? 'text-blue-600' : 'text-slate-600 group-hover:text-slate-900'}`}>{tName}</span>
                                  </div>
                                  <div className="flex items-center gap-6">
                                    <div className="hidden md:flex gap-2">
                                       <Counter type="MCQ" count={top.questionTypes?.mcqs?.categories?.[0]?.questions?.length || 0} />
                                       <Counter type="SHORT" count={top.questionTypes?.shorts?.categories?.[0]?.questions?.length || 0} />
                                       <Counter type="LONG" count={top.questionTypes?.longs?.categories?.[0]?.questions?.length || 0} />
                                    </div>
                                    <FaChevronDown className={`text-slate-300 transition-transform duration-300 ${isVisible ? 'rotate-180 text-blue-500' : ''}`} size={14} />
                                  </div>
                                </button>

                                {isVisible && (
                                  <div className="p-6 pt-0 animate-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-1 gap-6 mt-4">
                                      {/* MCQs Section */}
                                      <QuestionGroup 
                                        icon={<FaListUl className="text-blue-500"/>} 
                                        title="Multiple Choice Questions" 
                                        questions={top.questionTypes?.mcqs?.categories?.[0]?.questions || []} 
                                        isMcq
                                      />
                                      {/* Shorts Section */}
                                      <QuestionGroup 
                                        icon={<FaRegFileAlt className="text-purple-500"/>} 
                                        title="Short Questions" 
                                        questions={top.questionTypes?.shorts?.categories?.[0]?.questions || []} 
                                      />
                                      {/* Longs Section */}
                                      <QuestionGroup 
                                        icon={<FaAlignLeft className="text-rose-500"/>} 
                                        title="Long Questions / Structured" 
                                        questions={top.questionTypes?.longs?.categories?.[0]?.questions || []} 
                                      />
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
    <div className="bg-slate-50/50 rounded-[3px] p-6 border border-slate-100">
      <div className="flex items-center gap-3 mb-4 opacity-70">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          {title} ({questions.length})
        </span>
      </div>
      <div className="space-y-3">
        {questions.map((q: any, i: number) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
            <p className="text-sm font-bold text-slate-800 leading-relaxed  dir-rtl">
              {q.question}
            </p>
            
            
            {/* FIXED SECTION: Added Array.isArray check */}
            {/* UNIVERSAL OPTIONS HANDLER */}
{isMcq && (
  <div className="grid grid-cols-4 gap-2 mt-3">
    {(() => {
      // 1. اگر options ایک Array ہے
      if (Array.isArray(q.options)) {
        return q.options.map((opt: any, oi: number) => (
          <div key={oi} className="text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100 text-slate-500 text-right">
            {typeof opt === 'string' ? opt : (opt.text || opt.value || JSON.stringify(opt))}
          </div>
        ));
      }
      
      if (q.options && typeof q.options === 'object') {
        return Object.entries(q.options).map(([key, value]: any, oi: number) => (
          <div key={oi} className="text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100 text-slate-500 ">
            <span className="font-bold text-blue-500 ml-1">{key}:</span> {value}
          </div>
        ));
      }
    })()}
  </div>
)}
          </div>
        ))}
      </div>
    </div>
  );
};

const ExplorerCard = ({ title, sub, icon, onClick, color = "bg-blue-600" }: any) => (
  <div onClick={onClick} className="group bg-white rounded-2xl p-10 border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col items-center text-center">
    <div className={`w-20 h-20 rounded-3xl ${color} text-white shadow-lg mb-6 group-hover:scale-110 transition-transform flex items-center justify-center`}>{icon}</div>
    <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">{title}</h3>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{sub}</p>
    <div className="flex items-center gap-2 text-blue-600 font-bold text-xs opacity-0 group-hover:opacity-100 transition-all">Explore Hierarchy <FaChevronRight size={10} /></div>
  </div>
);

const Counter = ({ type, count }: any) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-100 shadow-sm">
    <span className={`text-[9px] font-black ${type === 'MCQ' ? 'text-blue-500' : type === 'SHORT' ? 'text-purple-500' : 'text-rose-500'}`}>{type}</span>
    <span className="text-xs font-black text-slate-700">{count}</span>
  </div>
);

const Badge = ({ children }: any) => (
  <span className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200">{children}</span>
);