'use client';
import React, { useState, useRef, useEffect } from 'react';
import { 
    FaBars, FaPrint, FaTrash, FaEdit, FaCheck, 
    FaCloudUploadAlt 
} from "react-icons/fa";
import axios from 'axios';
import Navbar from '../components/navbar/page';
import QuestionMenuModal from '../components/QuestionMenuModal/page';
import toast from 'react-hot-toast';

// const BACKEND_URL = "http://localhost:5000/api/papers";
const BACKEND_URL = "https://backendrepoo-production.up.railway.app/api/papers";


interface PaperPreviewProps {
    className: string;
    subject: any;
    chapters: string[];
    topics: string[]; 
    onClose: () => void;
}

export default function PaperPreview({ className, subject, chapters, topics, onClose }: PaperPreviewProps) {
    const paperRef = useRef<HTMLDivElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [questionBatches, setQuestionBatches] = useState<any[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [editingBatch, setEditingBatch] = useState<any>(null);

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [paperName, setPaperName] = useState("");
    const [paperType, setPaperType] = useState("Monthly Test");
    const [paperDate, setPaperDate] = useState(new Date().toISOString().split('T')[0]);
    const [paperTime, setPaperTime] = useState("1 Hour");

    const urduOptionLabels: { [key: string]: string } = {
        'A': 'الف', 'B': 'ب', 'C': 'ج', 'D': 'د',
        'a': 'الف', 'b': 'ب', 'c': 'ج', 'd': 'د'
    };

    const toUrduDigits = (num: any) => {
        if (num === undefined || num === null) return '۰';
        const urduDigits: any = {
            '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
            '5': '5', '6': '6', '7': '7', '8': '8', '9': '9'
        };
        return num.toString().split('').map((d: string) => urduDigits[d] || d).join('');
    };

    const isUrdu = (text: string) => {
        const urduPattern = /[\u0600-\u06FF]/;
        return urduPattern.test(text || "");
    };

    const paperIsUrdu = isUrdu(subject?.name || "") || questionBatches.some(b => isUrdu(b.customTitle));

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const handleAddQuestions = (newQs: any[], config: any) => {
        if (newQs.length === 0) return;

        // Check if incoming questions are Urdu
        const newQsAreUrdu = newQs.some(q => isUrdu(q.question || q.text)) || isUrdu(subject?.name || "");
        
        const isMcq = config.type.toLowerCase() === 'mcqs' || config.typeName === 'mcqs';
        const isShort = config.type.toLowerCase().includes('shorts');
        const isLong = config.type.toLowerCase().includes('longs');

        let autoTitle = "";


        // Generate headings based on language and question type
        if (newQsAreUrdu) {
            if (isMcq) {
                autoTitle = "درست آپشن کا انتخاب کریں۔";
            } else if (isShort) {
                autoTitle = `کوئی سے ${toUrduDigits(config.attempt)} مختصر سوالات حل کریں۔`;
            } else if (isLong) {
                autoTitle = `کوئی سے ${toUrduDigits(config.attempt)} تفصیلی سوالات حل کریں۔`;
            } else {
                autoTitle = `کوئی سے ${toUrduDigits(config.attempt)} سوالات حل کریں۔`;
            }
        } else {
            if (isMcq) {
                autoTitle = "Choose the correct option.";
            } else if (isShort) {
                autoTitle = `Attempt any ${config.attempt} short questions.`;
            } else if (isLong) {
                autoTitle = `Attempt any ${config.attempt} long questions.`;
            } else {
                autoTitle = `Attempt any ${config.attempt} questions.`;
            }
        }

        const newBatch = {
            id: editingBatch ? editingBatch.id : Date.now(),
            type: config.type.toLowerCase(),
            customTitle: editingBatch?.customTitle || autoTitle,
            questions: newQs.map(q => ({
                ...q,
                tempId: q.tempId || `${Date.now()}-${Math.random()}`
            })),
            config: {
                total: config.total,
                attempt: config.attempt,
                marks: config.marks,
                typeName: config.type,
                layoutCols: config.layoutCols || 1
            }
        };

        if (editingBatch) {
            setQuestionBatches(prev => prev.map(b => b.id === editingBatch.id ? newBatch : b));
        } else {
            setQuestionBatches(prev => [...prev, newBatch]);
        }

        setIsMenuOpen(false);
        setEditingBatch(null);
        toast.success("Section Added Successfully");
    };

    const handleSectionTitleChange = (batchId: number, newTitle: string) => {
        setQuestionBatches(prev => prev.map(b => b.id === batchId ? { ...b, customTitle: newTitle } : b));
    };

    const handleQuestionTextChange = (batchId: number, qTempId: string, newText: string) => {
        setQuestionBatches(prev => prev.map(batch => {
            if (batch.id === batchId) {
                return {
                    ...batch,
                    questions: batch.questions.map((q: any) => 
                        q.tempId === qTempId ? { ...q, question: newText, text: newText } : q
                    )
                };
            }
            return batch;
        }));
    };

    const removeBatch = (batchId: number) => {
        setQuestionBatches(prev => prev.filter(b => b.id !== batchId));
    };

    const removeQuestionFromBatch = (batchId: number, qTempId: string) => {
        setQuestionBatches(prev => prev.map(batch => {
            if (batch.id === batchId) {
                return {
                    ...batch,
                    questions: batch.questions.filter((q: any) => q.tempId !== qTempId)
                };
            }
            return batch;
        }).filter(batch => batch.questions.length > 0));
    };

    const grandTotalMarks = questionBatches.reduce((sum, batch) => 
        sum + (Number(batch.config.attempt) * Number(batch.config.marks)), 0
    );

    const handleSavePaper = async () => {
        if (!paperName.trim()) return toast.error("Please enter a paper name.");
        setIsLoading(true);
        try {
            const payload = {
                userId: user?.id || user?._id, 
                paperName, paperType, paperDate, paperTime,
                className, subject: subject?.name,
                totalMarks: grandTotalMarks,
                batches: questionBatches,
                headerInfo: {
                    schoolName: user?.schoolName || "My School",
                    address: user?.address || "",
                }
            };
            await axios.post(BACKEND_URL, payload);
            toast.success("Paper saved successfully!");
            setIsSaveModalOpen(false);
        } catch (error: any) {
            toast.error("Failed to save paper.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-screen bg-slate-200 overflow-hidden font-sans text-black">
            <Navbar />

            <QuestionMenuModal
                isOpen={isMenuOpen}
                onClose={() => { setIsMenuOpen(false); setEditingBatch(null); }}
                subjectName={subject?.name}
                chapters={chapters}
                topics={topics} 
                className={className}
                onAddQuestions={handleAddQuestions}
                editData={editingBatch}
            />

            {/* Save Modal */}
            {isSaveModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-slate-50 p-5 border-b flex items-center gap-3">
                            <FaCloudUploadAlt className="text-blue-600" />
                            <h2 className="text-lg font-bold text-slate-800">SAVE PAPER</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <input type="text" placeholder="Paper Name" value={paperName} onChange={(e) => setPaperName(e.target.value)} className="w-full border rounded-lg px-4 py-2 text-black" />
                            <input type="text" placeholder="Paper Type" value={paperType} onChange={(e) => setPaperType(e.target.value)} className="w-full border rounded-lg px-4 py-2 text-black" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="date" value={paperDate} onChange={(e) => setPaperDate(e.target.value)} className="w-full border rounded-lg px-4 py-2 text-black" />
                                <input type="text" placeholder="Time" value={paperTime} onChange={(e) => setPaperTime(e.target.value)} className="w-full border rounded-lg px-4 py-2 text-black" />
                            </div>
                        </div>
                        <div className="bg-slate-50 px-6 py-4 flex gap-3 justify-end">
                            <button onClick={() => setIsSaveModalOpen(false)} className="text-slate-500 font-bold text-xs">CANCEL</button>
                            <button onClick={handleSavePaper} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase">
                                {isLoading ? "Saving..." : "Confirm Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* TOOLBAR */}
                <div className="bg-[#0f172a] text-white h-16 flex items-center justify-between px-6 z-50 shrink-0 print:hidden">
                    <div className="flex items-center gap-3">
                        <button onClick={() => { setEditingBatch(null); setIsMenuOpen(true); }} className="bg-blue-600 px-5 py-2.5 rounded-lg font-bold text-[12px] flex items-center gap-2">
                            <FaBars /> ADD QUESTIONS
                        </button>
                        <button onClick={() => setIsEditMode(!isEditMode)} className={`${isEditMode ? 'bg-green-600' : 'bg-amber-600'} px-5 py-2.5 rounded-lg font-bold text-[12px] flex items-center gap-2`}>
                            {isEditMode ? <><FaCheck /> DONE</> : <><FaEdit /> EDIT MODE</>}
                        </button>
                        <button onClick={() => window.print()} className="bg-slate-800 px-5 py-2.5 rounded-lg font-bold text-[12px] flex items-center gap-2 border border-slate-700 text-yellow-400">
                            <FaPrint /> PRINT
                        </button>
                        <button onClick={() => setIsSaveModalOpen(true)} className="bg-slate-800 px-5 py-2.5 rounded-lg font-bold text-[12px] border border-slate-700 text-green-400">
                            SAVE PAPER
                        </button>
                    </div>
                    <div className="bg-slate-900 border border-white/10 rounded-full px-4 py-1.5 font-bold text-slate-400 text-[12px]">
                        TOTAL MARKS: {paperIsUrdu ? toUrduDigits(grandTotalMarks) : grandTotalMarks}
                    </div>
                    <button onClick={onClose} className="text-red-400 border border-red-500/50 px-5 py-2.5 rounded-lg text-[12px] font-bold hover:bg-red-500/10 transition-all">
                        EXIT
                    </button>
                </div>

                {/* PAPER AREA */}
                <div className="flex-1 overflow-y-auto p-10 bg-slate-300 print:p-0 print:bg-white custom-scrollbar">
                    <div 
                        ref={paperRef} 
                        id="printablePaper" 
                        className={`bg-white mx-auto w-[850px] min-h-[1100px] shadow-2xl relative p-16 print:shadow-none print:w-full print:p-12 text-black transition-all ${isEditMode ? 'ring-4 ring-amber-400' : ''}`}
                        dir={paperIsUrdu ? 'rtl' : 'ltr'}
                    >
                        {/* Header */}
                        <div className="border-b-4 border-black pb-4 text-center mb-10">
                            <h1 className="text-3xl font-black uppercase tracking-tighter" contentEditable={isEditMode} suppressContentEditableWarning>{user?.schoolName || "MY SCHOOL NAME"}</h1>
                            <p className="text-center text-[14px]" contentEditable={isEditMode} suppressContentEditableWarning>{user?.address || "Address, Location Name"}</p>
                            <h2 className="text-lg font-bold uppercase mt-1 border-y-2 border-black inline-block px-6">{paperType}</h2>
                            
                            <div className="flex justify-between mt-6 text-[16px] font-bold">
                                <div className={paperIsUrdu ? 'text-right' : 'text-left'}>
                                    <p>{className}</p>
                                    <p className="text-[13px] font-normal uppercase">Date: {paperIsUrdu ? toUrduDigits(paperDate) : paperDate}</p>
                                </div>
                                <span className="text-xl underline decoration-double underline-offset-4">
                                    Subject: {subject?.name}
                                </span>
                                <div className={paperIsUrdu ? 'text-left' : 'text-right'}>
                                    <p> Marks :{paperIsUrdu ? toUrduDigits(grandTotalMarks) : grandTotalMarks}</p>
                                    <p className="text-[13px] font-normal uppercase">Time: {paperIsUrdu ? toUrduDigits(paperTime) : paperTime}</p>
                                </div>
                            </div>
                        </div>

                        {/* Sections Rendering */}
                        <div className="space-y-12">
                            {questionBatches.map((batch, bIdx) => {
                                const isTwoCol = batch.config.layoutCols === 2;
                                const isBatchUrdu = isUrdu(batch.customTitle) || paperIsUrdu;

                                return (
                                    <div key={batch.id} className="group relative">
                                        {!isEditMode && (
                                            <div className={`absolute ${isBatchUrdu ? '-left-12' : '-right-12'} top-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all print:hidden`}>
                                                <button onClick={() => { setEditingBatch(batch); setIsMenuOpen(true); }} className="text-blue-500 hover:scale-110"><FaEdit size={16}/></button>
                                                <button onClick={() => removeBatch(batch.id)} className="text-red-500 hover:scale-110"><FaTrash size={14}/></button>
                                            </div>
                                        )}

                                        {/* Section Head */}
                                        <div className="flex justify-between border-b-2 border-black mb-4 font-black italic items-center">
                                            <span 
                                                contentEditable={isEditMode} 
                                                suppressContentEditableWarning 
                                                className="uppercase outline-none text-lg"
                                                onBlur={(e) => handleSectionTitleChange(batch.id, e.currentTarget.innerText)}
                                            >
                                                {isBatchUrdu ? `سوال نمبر ${toUrduDigits(bIdx + 1)}` : `Q.${bIdx + 1}`}: {batch.customTitle}
                                            </span>
                                            <span className="text-[15px]">
                                                ({isBatchUrdu ? `  ${toUrduDigits(batch.config.marks) +"x" } ${toUrduDigits(batch.config.attempt)}  = ${toUrduDigits(batch.config.attempt * batch.config.marks)}` 
                                                : `${batch.config.attempt} x ${batch.config.marks} = ${batch.config.attempt * batch.config.marks}`})
                                            </span>
                                        </div>

                                        {/* Questions Grid */}
                                        <div className={`grid ${isTwoCol ? 'grid-cols-2 gap-x-12 gap-y-6' : 'grid-cols-1 space-y-6'}`}>
                                            {batch.questions.map((q: any, qIdx: number) => {
                                                const questionText = q.question || q.text;
                                                const isQUrdu = isUrdu(questionText) || isBatchUrdu;
                                                
                                                return (
                                                    <div key={q.tempId} className="relative group/item">
                                                        {!isEditMode && (
                                                            <button onClick={() => removeQuestionFromBatch(batch.id, q.tempId)} className={`absolute ${isQUrdu ? '-left-8' : '-right-8'} top-1 text-red-500 opacity-0 group-hover/item:opacity-100 transition-all print:hidden`}>
                                                                <FaTrash size={10} />
                                                            </button>
                                                        )}
                                                        
                                                        {/* Question Text */}
                                                        <div className="flex gap-3 text-[16px] items-start">
                                                            <span className="font-bold min-w-[35px] text-center">
                                                                ({isQUrdu ? toUrduDigits(qIdx + 1) : qIdx + 1})
                                                            </span>
                                                            <span 
                                                                className="font-bold flex-1 outline-none leading-relaxed" 
                                                                contentEditable={isEditMode} 
                                                                suppressContentEditableWarning
                                                                onBlur={(e) => handleQuestionTextChange(batch.id, q.tempId, e.currentTarget.innerText)}
                                                            >
                                                                {questionText}
                                                            </span>
                                                        </div>

                                                        {/* MCQ Options */}
                                                        {batch.type === 'mcqs' && q.options && (
                                                            <div className={`grid grid-cols-2 lg:grid-cols-4 gap-2 mt-3 text-[14px] ${isQUrdu ? 'mr-10' : 'ml-10'}`}>
                                                                {Object.entries(q.options).map(([key, val]: any) => (
                                                                    <div key={key} className="flex gap-2 items-start">
                                                                        <span className="font-bold">
                                                                            ({isQUrdu ? (urduOptionLabels[key] || key) : key})
                                                                        </span>
                                                                        <span contentEditable={isEditMode} suppressContentEditableWarning className="outline-none flex-1">
                                                                            {val}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page { size: A4; margin: 0; }
                    body { visibility: hidden; background: white; }
                    #printablePaper, #printablePaper * { visibility: visible; }
                    #printablePaper {
                        position: absolute; left: 0; top: 0;
                        width: 100% !important; margin: 0 !important;
                        padding: 15mm !important; box-shadow: none !important;
                    }
                    .print\\:hidden { display: none !important; }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 10px; }
            `}</style>
        </div>
    );
}
