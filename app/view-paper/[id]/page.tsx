"use client";
import React, { useState, useEffect, use } from "react";
import { HiOutlineChevronLeft, HiOutlinePrinter, HiOutlineExclamationCircle } from "react-icons/hi";
import Link from "next/link";
import axios from "axios";
import { PaperHeader } from "../../components/headers";

// const API_BASE = "https://backendrepoo-production.up.railway.app/api";
const API_BASE = "http://localhost:5000/api"; 

// --- Types for better DX ---
interface Question {
  question: string;
  options?: Record<string, string>;
}

interface Batch {
  type: "mcqs" | "shorts" | "longs";
  questions: Question[];
  config: {
    marks: number;
    total: number;
    attempt?: number;
  };
}

export default function ViewPaperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [paperData, setPaperData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [styles, setStyles] = useState({
    fontFamily: "font-sans",
    lineHeight: "1.6",
    headingSize: "18",
    textSize: "14",
    textColor: "#1a1a1a",
    watermark: "CONFIDENTIAL",
    showWatermark: true,
    showNote: false,
    noteText: "",
    layoutType: "default",
    logoUrl: "",
    showBubbleSheet: false
  });

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const res = await axios.get(`${API_BASE}/papers/${id}`);
        if (res.data) {
          const data = res.data;
          const processedData = {
            ...data,
            mcqBatches: data.batches?.filter((b: Batch) => b.type === "mcqs") || [],
            shortBatches: data.batches?.filter((b: Batch) => b.type === "shorts") || [],
            longBatches: data.batches?.filter((b: Batch) => b.type === "longs") || [],
            legacyMCQs: data.MCQs || [],
            legacyShort: data.Short || [],
            legacyLong: data.Long || [],
            headerInfo: { ...data.info, ...data }
          };

          setPaperData(processedData);
          if (data.style) setStyles((prev) => ({ ...prev, ...data.style }));
        }
      } catch (err) {
        console.error("Error fetching paper:", err);
        setError("Failed to load the paper. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPaper();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="font-bold text-slate-600">Preparing Paper...</p>
    </div>
  );

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 text-red-600">
      <HiOutlineExclamationCircle size={48} />
      <p className="font-bold">{error}</p>
      <Link href="/saved-papers" className="text-blue-600 underline">Go Back</Link>
    </div>
  );

  return (
    <div className={`relative flex h-screen w-screen bg-slate-200 overflow-hidden text-black print:bg-white ${styles.fontFamily}`}>
      
      {/* TOP ACTION BAR */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-300 z-[100] flex items-center justify-between px-10 print:hidden shadow-sm">
        <Link href="/saved-papers">
          <button className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition-all">
            <HiOutlineChevronLeft size={20} /> Back to Dashboard
          </button>
        </Link>
        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95"
        >
          <HiOutlinePrinter size={18} /> Print Paper
        </button>
      </div>

      <main className="flex-1 overflow-y-auto pt-24 pb-20 flex justify-center custom-scrollbar print:p-0 print:pt-0 print:overflow-visible">
        <div 
          className="bg-white w-[850px] h-fit min-h-[1100px] shadow-2xl relative p-16 print:p-0 print:shadow-none print:w-full"
          style={{ color: styles.textColor, lineHeight: styles.lineHeight }}
        >
          {/* WATERMARK */}
          {styles.showWatermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
              <h1 style={{ transform: 'rotate(-45deg)', fontSize: '10vw', color: styles.textColor }} className="font-black opacity-[0.05] whitespace-nowrap uppercase select-none">
                {styles.watermark}
              </h1>
            </div>
          )}

          {paperData && (
            <div className="relative z-10 h-auto">
              <PaperHeader type={styles.layoutType} info={paperData.headerInfo} styles={styles} onChangeLogo={() => {}} />

              <div style={{ fontSize: styles.textSize + "px" }} className="mt-8">
                
                {/* --- SECTION A: MCQs --- */}
                {(paperData.mcqBatches.length > 0 ? paperData.mcqBatches : [{questions: paperData.legacyMCQs, config: {marks: 1, total: paperData.legacyMCQs.length}}]).map((batch: any, bIdx: number) => (
                  batch.questions?.length > 0 && (
                    <div key={`mcq-${bIdx}`} className="mb-10 break-inside-avoid">
                      <div className="flex justify-between items-end border-b-2 pb-1 mb-6" style={{ borderColor: styles.textColor }}>
                          <h3 className="font-black uppercase italic text-sm">Section-A: Objective Type</h3>
                          <span className="font-bold text-xs">Marks: {(batch.config?.total || batch.questions.length) * (batch.config?.marks || 1)}</span>
                      </div>
                      <div className="space-y-6">
                        {batch.questions.map((q: any, i: number) => (
                          <div key={i} className="break-inside-avoid">
                            <div className="flex gap-3">
                               <span className="font-bold shrink-0">{i + 1}.</span>
                               <p className="font-bold" style={{ fontSize: styles.headingSize + "px" }}>{q.question}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 ml-8 mt-3">
                              {q.options && Object.entries(q.options).map(([k, v]: any) => (
                                <div key={k} className="flex items-center gap-2">
                                    <span className="w-5 h-5 border rounded-full text-[10px] flex items-center justify-center font-black uppercase shrink-0" style={{ borderColor: styles.textColor }}>{k}</span>
                                    <span>{v as string}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}

                {/* --- SECTION B: SHORT QUESTIONS --- */}
                {(paperData.shortBatches.length > 0 ? paperData.shortBatches : [{questions: paperData.legacyShort, config: {attempt: paperData.legacyShort.length, total: paperData.legacyShort.length, marks: 2}}]).map((batch: any, bIdx: number) => (
                  batch.questions?.length > 0 && (
                    <div key={`short-${bIdx}`} className="mb-10 break-inside-avoid">
                      {bIdx === 0 && <h3 className="font-black uppercase italic text-sm border-b-2 pb-1 mb-4" style={{ borderColor: styles.textColor }}>Section-B: Short Questions</h3>}
                      <div className="flex justify-between items-center bg-slate-50 p-2 mb-4 border-l-4 print:bg-transparent print:border-slate-200" style={{ borderLeftColor: styles.textColor }}>
                        <span className="text-[11px] font-black uppercase">
                           Q. No {bIdx + 2}: Attempt any {batch.config?.attempt} out of {batch.config?.total} questions.
                        </span>
                        <span className="text-[11px] font-bold">({batch.config?.attempt} x {batch.config?.marks} = {batch.config?.attempt * batch.config?.marks})</span>
                      </div>
                      <div className="space-y-5 ml-4">
                        {batch.questions.map((q: any, i: number) => (
                          <div key={i} className="flex gap-3 break-inside-avoid">
                            <span className="font-bold shrink-0">({i + 1})</span>
                            <p className="font-bold" style={{ fontSize: styles.headingSize + "px" }}>{q.question}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}

                {/* --- SECTION C: LONG QUESTIONS --- */}
                {(paperData.longBatches.length > 0 ? paperData.longBatches : [{questions: paperData.legacyLong, config: {attempt: paperData.legacyLong.length, total: paperData.legacyLong.length, marks: 5}}]).map((batch: any, bIdx: number) => (
                  batch.questions?.length > 0 && (
                    <div key={`long-${bIdx}`} className="mb-10 break-inside-avoid">
                      {bIdx === 0 && <h3 className="font-black uppercase italic text-sm border-b-2 pb-1 mb-4" style={{ borderColor: styles.textColor }}>Section-C: Long Questions</h3>}
                      <div className="flex justify-between items-center bg-slate-50 p-2 mb-4 border-l-4 print:bg-transparent print:border-slate-200" style={{ borderLeftColor: styles.textColor }}>
                        <span className="text-[11px] font-black uppercase">
                           Attempt any {batch.config?.attempt} out of {batch.config?.total} questions.
                        </span>
                        <span className="text-[11px] font-bold">({batch.config?.attempt} x {batch.config?.marks} = {batch.config?.attempt * batch.config?.marks})</span>
                      </div>
                      <div className="space-y-8 ml-4">
                        {batch.questions.map((q: any, i: number) => (
                          <div key={i} className="flex gap-3 break-inside-avoid">
                            <span className="font-bold shrink-0">Q.{i + 1}</span>
                            <p className="font-bold" style={{ fontSize: styles.headingSize + "px" }}>{q.question}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        @media print {
          .custom-scrollbar { overflow: visible !important; }
          body { background: white !important; }
          @page { 
            size: A4; 
            margin: 10mm 15mm; 
          }
          /* Prevent header/footer cutting */
          .break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}