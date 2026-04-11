"use client";
import React, { useState, useEffect, use, useRef } from "react";
import { 
  HiOutlineSave, 
  HiOutlineChevronLeft, 
  HiOutlineCheckCircle, 
  HiOutlineTemplate, 
  HiOutlineColorSwatch,
  HiOutlinePrinter,
  HiOutlineChevronDown,
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlinePencil,
} from "react-icons/hi";

import Link from "next/link";
import axios from "axios";
import { PaperHeader } from "../../components/headers"; 

// const API_BASE = "https://testbackend-production-69cb.up.railway.app/api";
const API_BASE = "/api";
// const API_BASE = "http://localhost:5000/api"; 

// --- HELPER COMPONENT: Auto-Resizing Textarea ---
const AutoResizeTextarea = ({ value, onChange, className, style, placeholder }: any) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
console.log(style);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [value, style]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={1}
      className={`bg-transparent resize-none overflow-hidden outline-none w-full focus:bg-yellow-50/50 transition-colors ${className}`}
      style={style}
    />
  );
};

export default function EditPaperPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [paperData, setPaperData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [openSection, setOpenSection] = useState<string>("info");

  // --- STYLING STATES ---
  const [styles, setStyles] = useState({
    fontFamily: "font-sans",
    lineHeight: "1.5",
    headingSize: "18", 
    textSize: "14",    
    textColor: "#000000",
    watermark: "CONFIDENTIAL", 
    showWatermark: true,
    showBubbleSheet: false,
    showNote: false, 
    noteText: "Note: Use black/blue ballpoint only. Lead pencil is not allowed.", 
    logoUrl: "https://media.licdn.com/dms/image/v2/D4D0BAQGA4E56lsNThw/company-logo_200_200/company-logo_200_200/0/1695224355465?e=2147483647&v=beta&t=XDgZWCwvNAcrgv3Tfg2T64YBDnjbsyEV_jkbD5g8UxI",
    layoutType: "default",
    shortCols: 1, 
    longCols: 1,  
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.watermark) {
          setStyles(prev => ({ ...prev, watermark: userData.watermark }));
        }
      } catch (e) {
        console.error("Error loading user data", e);
      }
    }

    const fetchPaper = async () => {
      try {
        const res = await axios.get(`${API_BASE}/papers/${id}`);
        if (res.data) {
          const data = res.data;
          const processedData = {
            ...data,
            db_id: data._id || data.id, 
            mcqBatches: data.batches?.filter((b: any) => b.type === "mcqs") || [],
            shortBatches: data.batches?.filter((b: any) => b.type === "shorts") || [],
            longBatches: data.batches?.filter((b: any) => b.type === "longs") || [],
          };

          setPaperData(processedData);
          if (data.style) {
            setStyles((prev) => ({ 
                ...prev, 
                ...data.style,
                logoUrl: data.style.logoUrl || prev.logoUrl,
                watermark: prev.watermark !== "CONFIDENTIAL" ? prev.watermark : (data.style.watermark || prev.watermark)
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching paper:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPaper();
  }, [id]);

  const updateQuestion = (batchType: 'mcqs' | 'shorts' | 'longs', batchIndex: number, qIndex: number, newVal: string) => {
    const updatedData = { ...paperData };
    const targetBatches = batchType === 'mcqs' ? 'mcqBatches' : batchType === 'shorts' ? 'shortBatches' : 'longBatches';
    updatedData[targetBatches][batchIndex].questions[qIndex].question = newVal;
    setPaperData(updatedData);
  };

  const updateOption = (batchIndex: number, qIndex: number, optKey: string, newVal: string) => {
    const updatedData = { ...paperData };
    updatedData.mcqBatches[batchIndex].questions[qIndex].options[optKey] = newVal;
    setPaperData(updatedData);
  };

  const handleSave = async () => {
    if (!paperData || (!paperData._id && !paperData.id)) {
      alert("Error: Paper ID not found.");
      return;
    }
    const targetId = paperData._id || paperData.id;
    setIsSaving(true);
    try {
      const combinedBatches = [
        ...paperData.mcqBatches,
        ...paperData.shortBatches,
        ...paperData.longBatches
      ];
      const payload = { ...paperData, batches: combinedBatches, style: styles };
      delete payload.mcqBatches;
      delete payload.shortBatches;
      delete payload.longBatches;

      await axios.put(`${API_BASE}/papers/${targetId}`, payload);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error: any) {
      console.error("Save error:", error);
      alert("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? "" : section);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-bold text-slate-600 animate-pulse">Loading Editor...</div>
  );

  const layouts = [
    { id: 'default', name: 'Layout 01' },
    { id: 'minimalist-top', name: 'Layout 02' },
    { id: 'classic-school', name: 'Layout 03' },
    { id: 'grid-table', name: 'Layout 04' },
    { id: 'formal-double', name: 'Layout 05' },
    { id: 'marking-panel', name: 'Layout 06' },
    { id: 'academy-pro ', name: 'Layout 07' },
    { id: 'university-elegant', name: 'Layout 08' },
    { id: 'split-sidebar', name: 'Layout 09' },
    { id: 'modern-bar ', name: 'Layout 10' },
  ];

  // console.log(paperData.className);
  
  return (
    <div className="relative flex h-screen w-screen bg-slate-100 overflow-hidden font-sans text-black">
      {showToast && (
        <div className="fixed top-6 right-6 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-bounce">
          <HiOutlineCheckCircle size={22} /> <span className="font-bold">Paper Updated & Saved!</span>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r flex flex-col shadow-xl z-20 print:hidden text-black">
        <div className="p-5 border-b bg-slate-50">
          <Link href="/saved-papers" className="flex items-center gap-1 text-slate-400 hover:text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-2 transition-all">
            <HiOutlineChevronLeft size={14} /> Back
          </Link>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <HiOutlineColorSwatch className="text-blue-600" /> Designer
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* 1. Paper Info */}
          <div className="border-b">
            <button onClick={() => toggleSection("info")} className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-700 tracking-wider">
                  <HiOutlineCalendar size={16} className="text-blue-600"/> Paper Info
                </div>
                <HiOutlineChevronDown className={`text-slate-400 transition-transform duration-300 ${openSection === "info" ? "rotate-180" : ""}`} />
            </button>
            {openSection === "info" && (
              <div className="px-5 pb-5 pt-1 bg-slate-50/50 space-y-4 animate-in slide-in-from-top-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Examination Date</label>
                  <input type="date" value={paperData?.paperDate || ""} onChange={(e) => setPaperData({...paperData, paperDate: e.target.value})} className="w-full p-2 border rounded text-xs text-gray-600 outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Time Allowed</label>
                  <div className="flex items-center gap-2 bg-white border rounded px-2">
                    <HiOutlineClock className="text-slate-400" />
                    <input type="text" placeholder="e.g. 2 Hours" value={paperData?.paperTime || ""} onChange={(e) => setPaperData({...paperData, paperTime: e.target.value})} className="w-full p-2 text-xs text-gray-600 outline-none" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Layouts */}
          <div className="border-b">
            <button onClick={() => toggleSection("layouts")} className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-700 tracking-wider">
                  <HiOutlineTemplate size={16} className="text-blue-600"/> Layouts
                </div>
                <HiOutlineChevronDown className={`text-slate-400 transition-transform duration-300 ${openSection === "layouts" ? "rotate-180" : ""}`} />
            </button>
            {openSection === "layouts" && (
              <div className="px-5 pb-5 pt-1 bg-slate-50/50 grid grid-cols-2 gap-2 animate-in slide-in-from-top-2">
                {layouts.map((layout) => (
                  <button key={layout.id} onClick={() => setStyles({...styles, layoutType: layout.id})} className={`py-2 px-3 text-[10px] font-bold uppercase border rounded-lg transition-all ${styles.layoutType === layout.id ? 'border-blue-600 bg-blue-600 text-white shadow-md transform scale-105' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300'}`}>
                    {layout.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Text Formatting */}
          <div className="border-b">
            <button onClick={() => toggleSection("formatting")} className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-700 tracking-wider">
                  <HiOutlinePencil size={16} className="text-blue-600"/> Text Formatting
                </div>
                <HiOutlineChevronDown className={`text-slate-400 transition-transform duration-300 ${openSection === "formatting" ? "rotate-180" : ""}`} />
            </button>
            {openSection === "formatting" && (
              <div className="px-5 pb-5 pt-1 bg-slate-50/50 space-y-4 animate-in slide-in-from-top-2">
                 <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Font Style</label>
                    <div className="flex rounded-md shadow-sm">
                      <button onClick={()=>setStyles({...styles, fontFamily: "font-sans"})} className={`flex-1 py-1 text-[10px] text-gray-600 border rounded-md ${styles.fontFamily==='font-sans' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Sans</button>
                      <button onClick={()=>setStyles({...styles, fontFamily: "font-serif"})} className={`flex-1 py-1 text-[10px] text-gray-600 border rounded-md ${styles.fontFamily==='font-serif' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Serif</button>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-slate-400 uppercase">Ques Size</label>
                       <input type="number" value={styles.headingSize} onChange={(e)=>setStyles({...styles, headingSize: e.target.value})} className="w-full p-1.5 border rounded text-gray-600 text-xs outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-slate-400 uppercase">Text Size</label>
                       <input type="number" value={styles.textSize} onChange={(e)=>setStyles({...styles, textSize: e.target.value})} className="w-full p-1.5 border rounded text-xs text-gray-600 outline-none focus:border-blue-500" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-slate-400 uppercase">Text Color</label>
                       <div className="flex items-center gap-2 border rounded p-1 bg-white">
                          <input type="color" value={styles.textColor} onChange={(e)=>setStyles({...styles, textColor: e.target.value})} className="w-6 h-6 border-none bg-transparent cursor-pointer" />
                          <span className="text-[9px] font-mono uppercase">{styles.textColor}</span>
                       </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-slate-400 uppercase">Line Height</label>
                       <input type="number" step="0.1" value={styles.lineHeight} onChange={(e)=>setStyles({...styles, lineHeight: e.target.value})} className="w-full p-1.5 border rounded text-xs text-gray-600 outline-none focus:border-blue-500" />
                    </div>
                 </div>
              </div>
            )}
          </div>

          {/* 4. Page Elements & Grid Settings */}
          <div className="border-b">
            <button onClick={() => toggleSection("elements")} className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-700 tracking-wider">
                  <HiOutlineDocumentText size={16} className="text-blue-600"/> Page Elements
                </div>
                <HiOutlineChevronDown className={`text-slate-400 transition-transform duration-300 ${openSection === "elements" ? "rotate-180" : ""}`} />
            </button>
            {openSection === "elements" && (
              <div className="px-5 pb-5 pt-1 bg-slate-50/50 space-y-4 animate-in slide-in-from-top-2">
                 
                 {/* COLUMN CONTROLS */}
                 <div className="space-y-2 bg-white p-2.5 rounded-lg border shadow-sm">
                    <span className="text-[10px] font-black text-slate-700 uppercase flex items-center gap-2"> Question Layout</span>
                    <div className="space-y-3 mt-2">
                        <div className="flex flex-col gap-1">
                           <label className="text-[9px] font-bold text-slate-400 uppercase">Short Questions</label>
                           <div className="flex gap-1">
                              {[1, 2].map(n => (
                                <button key={n} onClick={()=>setStyles({...styles, shortCols: n})} className={`flex-1 py-1 text-[9px] font-bold border rounded ${styles.shortCols === n ? 'bg-blue-600 text-white' : 'bg-white text-slate-500'}`}>{n} Col</button>
                              ))}
                           </div>
                        </div>
                        <div className="flex flex-col gap-1">
                           <label className="text-[9px] font-bold text-slate-400 uppercase">Long Questions</label>
                           <div className="flex gap-1">
                              {[1, 2].map(n => (
                                <button key={n} onClick={()=>setStyles({...styles, longCols: n})} className={`flex-1 py-1 text-[9px] font-bold border rounded ${styles.longCols === n ? 'bg-blue-600 text-white' : 'bg-white text-slate-500'}`}>{n} Col</button>
                              ))}
                           </div>
                        </div>
                    </div>
                 </div>

                 <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border shadow-sm">
                    <span className="text-[10px] font-bold text-slate-700">Add Bubble Sheet</span>
                    <input type="checkbox" checked={styles.showBubbleSheet} onChange={(e)=>setStyles({...styles, showBubbleSheet: e.target.checked})} className="w-4 h-4 accent-blue-600" />
                 </div>
                 
                 <div className="flex flex-col gap-2 bg-white p-2.5 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold text-slate-700">Watermark</span>
                       <input type="checkbox" checked={styles.showWatermark} onChange={(e)=>setStyles({...styles, showWatermark: e.target.checked})} className="w-4 h-4 accent-blue-600" />
                    </div>
                    <p className="text-[8px] text-blue-600 font-bold uppercase truncate">Current: {styles.watermark}</p>
                 </div>

                 <div className="space-y-2 bg-white p-2 rounded border">
                    <div className="flex items-center justify-between">                        
                      <span className="text-[10px] font-bold text-gray-400">Exam Note</span>                        
                      <input type="checkbox" checked={styles.showNote} onChange={(e)=>setStyles({...styles, showNote: e.target.checked})} className="accent-blue-600" />
                    </div>
                    {styles.showNote && (
                        <textarea value={styles.noteText} onChange={(e)=>setStyles({...styles, noteText: e.target.value})} className="w-full text-[10px] p-1 text-gray-400 border rounded h-12 outline-none" />
                    )}
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Logo URL</label>
                    <input type="text" value={styles.logoUrl} onChange={(e)=>setStyles({...styles, logoUrl: e.target.value})} className="w-full p-2 border rounded text-[10px] text-blue-600" />
                 </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-white border-t space-y-2">
          <button onClick={() => window.print()} className="w-full py-2.5 bg-slate-800 hover:bg-black text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all">
            <HiOutlinePrinter size={16} /> PRINT PAPER
          </button>
          <button onClick={handleSave} disabled={isSaving} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all">
            <HiOutlineSave size={16} /> {isSaving ? "SAVING..." : "SAVE & UPDATE"}
          </button>
        </div>
      </aside>

      {/* --- MAIN PAPER AREA --- */}
      <main className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar bg-slate-200 print:p-0 print:bg-white print:overflow-visible">
        <div 
          className={`bg-white w-[850px] min-h-[1100px] h-fit shadow-2xl relative p-12 print:shadow-none print:w-full print:p-4 ${styles.fontFamily}`}
          style={{ color: styles.textColor, lineHeight: styles.lineHeight }}
        >
          {/* Watermark */}
          {styles.showWatermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
              <h1 style={{ transform: 'rotate(-45deg)', fontSize: '120px', color: styles.textColor }} className="font-black opacity-[0.15] whitespace-nowrap uppercase select-none">
                {styles.watermark}
              </h1>
            </div>
          )}

          {paperData && (
            <div className="relative z-10">
              <PaperHeader 
                type={styles.layoutType} 
                info={{ ...paperData.info, class:paperData.className, subject: paperData.subject, paperDate: paperData.paperDate, paperTime: paperData.paperTime }} 
                styles={styles} 
                onChangeLogo={()=>{}} 
              />

              {styles.showBubbleSheet && paperData.mcqBatches?.length > 0 && (
                <div className="break-inside-avoid border border-slate-300 p-2 rounded-xl bg-slate-50/50 print:bg-transparent print:border-black mt-4">
                    <div className="grid grid-cols-4 gap-4">
                      {paperData.mcqBatches[0].questions.map((_:any, i:number) => (
                          <div key={i} className="flex items-center gap-2 justify-center">
                             <span className="text-[10px] font-bold w-4 text-right" style={{ color: styles.textColor }}>{i+1}.</span>
                             <div className="flex gap-1">
                               {['A','B','C','D'].map((opt) => (
                                   <div key={opt} className="w-4 h-4 rounded-full border flex items-center justify-center text-[8px]" style={{ borderColor: styles.textColor, color: styles.textColor }}>{opt}</div>
                               ))}
                             </div>
                          </div>
                      ))}
                    </div>
                </div>
              )}

              <div style={{ fontSize: styles.textSize + "px" }} className="mt-6 outline-none p-2">
                {styles.showNote && (
                  <div className="rounded-lg flex items-start gap-3 mb-3">
                      <p className="text-[11px] font-bold italic opacity-80">{styles.noteText}</p>
                  </div>
                )}
                
                {/* Section-A: MCQs */}
                {paperData.mcqBatches?.map((batch: any, bIdx: number) => (
                  <div key={bIdx} className="mb-8 mt-4">
                    <div className="flex justify-between items-end border-b-2 pb-1 mb-6" style={{ borderColor: styles.textColor }}>
                        <h3 className="font-bold uppercase italic text-sm">Section-A: Objective Type</h3>
                        <span className="font-bold text-xs">Marks: {batch.config.total * batch.config.marks}</span>
                    </div>
                    <div className="space-y-4">
                      {batch.questions.map((q: any, i: number) => (
                        <div key={i} className="break-inside-avoid">
                          <div className="flex gap-2">
                             <span className="font-bold shrink-0">{i+1}.</span>
                             <AutoResizeTextarea 
                                 value={q.question} 
                                 onChange={(e: any) => updateQuestion('mcqs', bIdx, i, e.target.value)}
                                 className="font-bold"
                                 style={{ fontSize: styles.headingSize + "px", color: styles.textColor }}
                             />
                          </div>
                          <div className="grid grid-cols-4 gap-4 mt-2 ml-6">
                            {q.options && Object.entries(q.options).map(([k, v]: any) => (
                              <div key={k} className="flex items-center gap-2">
                                <span className="w-5 h-5 border rounded-full text-[10px] flex items-center justify-center font-bold uppercase shrink-0" style={{ borderColor: styles.textColor }}>{k}</span>
                                <input 
                                    type="text" 
                                    value={v as string} 
                                    onChange={(e) => updateOption(bIdx, i, k, e.target.value)}
                                    className="bg-transparent outline-none w-full"
                                    style={{ color: styles.textColor }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Section-B: Shorts */}
                {paperData.shortBatches?.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-bold uppercase italic text-sm border-b-2 pb-1 mb-4" style={{ borderColor: styles.textColor }}>Section-B: Short Questions</h3>
                    {paperData.shortBatches.map((batch: any, bIdx: number) => (
                      <div key={bIdx} className="mb-6">
                        <div className="flex justify-between items-center bg-slate-50 p-1 mb-3 px-3 border-l-4 print:bg-transparent" style={{ borderLeftColor: styles.textColor }}>
                          <span className="text-[11px] font-black uppercase">
                             Q. No {bIdx + 2}: Attempt any {batch.config.attempt} out of {batch.config.total}.
                          </span>
                          <span className="text-[11px] font-bold">({batch.config.attempt} x {batch.config.marks} = {batch.config.attempt * batch.config.marks})</span>
                        </div>
                        {/* Dynamic Grid for Shorts */}
                        <div className={`grid ${styles.shortCols === 2 ? 'grid-cols-2 gap-x-8 gap-y-4' : 'grid-cols-1 gap-y-4'} ml-4`}>
                           {batch.questions.map((q: any, i: number) => (
                              <div key={i} className="break-inside-avoid flex gap-2">
                                 <span className="font-bold shrink-0">({i+1})</span>
                                 <AutoResizeTextarea 
                                    value={q.question} 
                                    onChange={(e: any) => updateQuestion('shorts', bIdx, i, e.target.value)}
                                    className="font-bold"
                                    style={{ fontSize: styles.headingSize + "px", color: styles.textColor }}
                                 />
                              </div>
                           ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Section-C: Longs */}
                {paperData.longBatches?.length > 0 && (
                  <div className="mt-10">
                    <h3 className="font-bold uppercase italic text-sm border-b-2 pb-1 mb-4" style={{ borderColor: styles.textColor }}>Section-C: Detailed Questions</h3>
                    {paperData.longBatches.map((batch: any, bIdx: number) => (
                      <div key={bIdx} className="mb-6">
                        <div className="flex justify-between items-center bg-slate-50 p-1 mb-3 px-3 border-l-4 print:bg-transparent" style={{ borderLeftColor: styles.textColor }}>
                          <span className="text-[11px] font-black uppercase">
                             Attempt any {batch.config.attempt} out of {batch.config.total}.
                          </span>
                          <span className="text-[11px] font-bold">({batch.config.attempt} x {batch.config.marks} = {batch.config.attempt * batch.config.marks})</span>
                        </div>
                        {/* Dynamic Grid for Longs */}
                        <div className={`grid ${styles.longCols === 2 ? 'grid-cols-2 gap-x-8 gap-y-6' : 'grid-cols-1 gap-y-6'} ml-4`}>
                           {batch.questions.map((q: any, i: number) => (
                              <div key={i} className="break-inside-avoid flex gap-2">
                                 <span className="font-bold shrink-0">Q.{i+1}</span>
                                 <AutoResizeTextarea 
                                    value={q.question} 
                                    onChange={(e: any) => updateQuestion('longs', bIdx, i, e.target.value)}
                                    className="font-bold"
                                    style={{ fontSize: styles.headingSize + "px", color: styles.textColor }}
                                 />
                              </div>
                           ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
