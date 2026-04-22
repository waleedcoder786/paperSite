'use client';
import React, { useState, useRef, useEffect } from 'react';
import { 
    FaBars, FaPrint, FaTrash, FaEdit, FaCheck, 
    FaCloudUploadAlt, FaTimes, FaSave
} from "react-icons/fa";
import axios from 'axios';
import Navbar from '../components/navbar/page';
import QuestionMenuModal from '../components/QuestionMenuModal/page';
import toast from 'react-hot-toast';

const BACKEND_URL = "api/papers";

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
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
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
        return num.toString().replace(/\d/g, (d: string) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
    };

    const isUrdu = (text: string) => /[\u0600-\u06FF]/.test(text || "");
    const paperIsUrdu = isUrdu(subject?.name || "") || questionBatches.some(b => isUrdu(b.customTitle));

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const handleAddQuestions = (newQs: any[], config: any) => {
        if (newQs.length === 0) return;
        const newQsAreUrdu = newQs.some(q => isUrdu(q.question || q.text)) || isUrdu(subject?.name || "");
        
        const isMcq = config.type.toLowerCase() === 'mcqs' || config.typeName === 'mcqs';
        const isShort = config.type.toLowerCase().includes('shorts');
        const isLong = config.type.toLowerCase().includes('longs');

        let autoTitle = "";
        if (newQsAreUrdu) {
            if (isMcq) autoTitle = "درست آپشن کا انتخاب کریں۔";
            else if (isShort) autoTitle = `کوئی سے ${toUrduDigits(config.attempt)} مختصر سوالات حل کریں۔`;
            else if (isLong) autoTitle = `کوئی سے ${toUrduDigits(config.attempt)} تفصیلی سوالات حل کریں۔`;
            else autoTitle = `سوالات حل کریں۔`;
        } else {
            if (isMcq) autoTitle = "Choose the correct option.";
            else if (isShort) autoTitle = `Attempt any ${config.attempt} short questions.`;
            else if (isLong) autoTitle = `Attempt any ${config.attempt} long questions.`;
            else autoTitle = `Attempt questions.`;
        }

        const newBatch = {
            id: editingBatch ? editingBatch.id : Date.now(),
            type: config.type.toLowerCase(),
            customTitle: editingBatch?.customTitle || autoTitle,
            questions: newQs.map(q => ({ ...q, tempId: q.tempId || `${Date.now()}-${Math.random()}` })),
            config: { ...config, layoutCols: config.layoutCols || 1 }
        };

        if (editingBatch) setQuestionBatches(prev => prev.map(b => b.id === editingBatch.id ? newBatch : b));
        else setQuestionBatches(prev => [...prev, newBatch]);

        setIsMenuOpen(false);
        setEditingBatch(null);
        toast.success("Section Updated");
    };

    const grandTotalMarks = questionBatches.reduce((sum, b) => sum + (Number(b.config.attempt) * Number(b.config.marks)), 0);

    const handleSavePaper = async () => {
        if (!paperName.trim()) return toast.error("Enter paper name");
        setIsLoading(true);
        try {
            await axios.post(BACKEND_URL, {
                userId: user?.id || user?._id, 
                paperName, paperType, paperDate, paperTime,
                className, subject: subject?.name,
                totalMarks: grandTotalMarks,
                batches: questionBatches,
                headerInfo: { schoolName: user?.schoolName, address: user?.address }
            });
            toast.success("Saved!");
            setIsSaveModalOpen(false);
        } catch (e) { toast.error("Error saving"); } finally { setIsLoading(false); }
    };

    return (
        <div className="flex h-screen w-screen bg-slate-200 overflow-hidden font-sans text-black">
            {/* Sidebar with Mobile Support */}
            <div className={`fixed inset-y-0 left-0 z-[110] transition-transform duration-300 md:relative md:translate-x-0 ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Navbar />
                <button onClick={() => setIsMobileNavOpen(false)} className="absolute top-4 right-[-40px] bg-white p-2 rounded-r-md shadow-md md:hidden">
                    <FaTimes />
                </button>
            </div>

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
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-5 border-b flex items-center gap-3">
                            <FaCloudUploadAlt className="text-blue-600" />
                            <h2 className="text-lg font-bold">SAVE PAPER</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <input type="text" placeholder="Paper Name" value={paperName} onChange={(e) => setPaperName(e.target.value)} className="w-full border rounded-lg px-4 py-2" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="date" value={paperDate} onChange={(e) => setPaperDate(e.target.value)} className="w-full border rounded-lg px-4 py-2" />
                                <input type="text" placeholder="Time" value={paperTime} onChange={(e) => setPaperTime(e.target.value)} className="w-full border rounded-lg px-4 py-2" />
                            </div>
                        </div>
                        <div className="p-4 flex gap-3 justify-end bg-slate-50 rounded-b-xl">
                            <button onClick={() => setIsSaveModalOpen(false)} className="px-4 py-2 text-slate-500 font-bold">CANCEL</button>
                            <button onClick={handleSavePaper} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">
                                {isLoading ? "..." : "SAVE"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* TOOLBAR: Responsive buttons */}
                <div className="bg-[#0f172a] text-white min-h-[64px] flex items-center justify-between px-4 md:px-6 z-50 shrink-0 print:hidden overflow-x-auto gap-4">
                    <div className="flex items-center gap-2 md:gap-3">
                        <button onClick={() => setIsMobileNavOpen(true)} className="md:hidden p-2 text-xl"><FaBars /></button>
                        <button onClick={() => { setEditingBatch(null); setIsMenuOpen(true); }} className="bg-blue-600 hover:bg-blue-700 p-2 md:px-4 md:py-2 rounded-lg font-bold text-[11px] flex items-center gap-2 shrink-0">
                            <FaBars className="hidden sm:block"/> <span className="sm:inline">ADD</span>
                        </button>
                        <button onClick={() => setIsEditMode(!isEditMode)} className={`${isEditMode ? 'bg-green-600' : 'bg-amber-600'} p-2 md:px-4 md:py-2 rounded-lg font-bold text-[11px] flex items-center gap-2 shrink-0`}>
                            {isEditMode ? <><FaCheck /> DONE</> : <><FaEdit /> EDIT</>}
                        </button>
                        <button onClick={() => window.print()} className="bg-slate-800 p-2 md:px-4 md:py-2 rounded-lg font-bold text-[11px] text-yellow-400 border border-slate-700 shrink-0">
                            <FaPrint /> <span className="hidden sm:inline">PRINT</span>
                        </button>
                        <button onClick={() => setIsSaveModalOpen(true)} className="bg-slate-800 p-2 md:px-4 md:py-2 rounded-lg font-bold text-[11px] text-green-400 border border-slate-700 shrink-0">
                            <FaSave /> <span className="hidden sm:inline">SAVE</span>
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="hidden lg:block bg-slate-900 border border-white/10 rounded-full px-4 py-1.5 font-bold text-slate-400 text-[11px]">
                            TOTAL: {paperIsUrdu ? toUrduDigits(grandTotalMarks) : grandTotalMarks}
                        </div>
                        <button onClick={onClose} className="text-red-400 border border-red-500/50 px-3 py-1.5 md:px-5 md:py-2 rounded-lg text-[11px] font-bold shrink-0">
                            EXIT
                        </button>
                    </div>
                </div>

                {/* PAPER AREA: Handles A4 scaling on mobile */}
                <div className="flex-1 overflow-auto p-4 md:p-10 bg-slate-300 print:p-0 print:bg-white custom-scrollbar">
                    <div className="w-full flex justify-center">
                        <div 
                            ref={paperRef} 
                            id="printablePaper" 
                            className={`bg-white shadow-2xl relative p-6 md:p-16 print:shadow-none print:w-full print:p-12 text-black transition-all origin-top
                                w-full max-w-[850px] min-h-[1100px]
                                ${isEditMode ? 'ring-4 ring-amber-400' : ''}`}
                            dir={paperIsUrdu ? 'rtl' : 'ltr'}
                        >
                            {/* Header: Responsive flex */}
                            <div className="border-b-4 border-black pb-4 text-center mb-6 md:mb-10">
                                <h1 className="text-xl md:text-3xl font-black uppercase" contentEditable={isEditMode} suppressContentEditableWarning>
                                    {user?.schoolName || "SCHOOL NAME"}
                                </h1>
                                <p className="text-[12px] md:text-[14px]" contentEditable={isEditMode} suppressContentEditableWarning>
                                    {user?.address || "Address, Location"}
                                </p>
                                <h2 className="text-sm md:text-lg font-bold uppercase mt-2 border-y-2 border-black inline-block px-4 md:px-6">
                                    {paperType}
                                </h2>
                                
                                <div className="flex flex-col sm:flex-row justify-between mt-6 text-sm md:text-[16px] font-bold gap-2">
                                    <div className="text-center sm:text-inherit">
                                        <p>{className}</p>
                                        <p className="text-[11px] font-normal">Date: {paperIsUrdu ? toUrduDigits(paperDate) : paperDate}</p>
                                    </div>
                                    <span className="text-lg underline decoration-double order-first sm:order-none">
                                        Subject: {subject?.name}
                                    </span>
                                    <div className="text-center sm:text-inherit">
                                        <p>Marks: {paperIsUrdu ? toUrduDigits(grandTotalMarks) : grandTotalMarks}</p>
                                        <p className="text-[11px] font-normal">Time: {paperIsUrdu ? toUrduDigits(paperTime) : paperTime}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sections */}
                            <div className="space-y-8 md:space-y-12">
                                {questionBatches.map((batch, bIdx) => {
                                    const isTwoCol = batch.config.layoutCols === 2;
                                    const isBatchUrdu = isUrdu(batch.customTitle) || paperIsUrdu;

                                    return (
                                        <div key={batch.id} className="group relative">
                                            {!isEditMode && (
                                                <div className={`absolute ${isBatchUrdu ? '-left-8' : '-right-8'} top-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all print:hidden`}>
                                                    <button onClick={() => { setEditingBatch(batch); setIsMenuOpen(true); }} className="text-blue-500"><FaEdit size={14}/></button>
                                                    <button onClick={() => setQuestionBatches(prev => prev.filter(b => b.id !== batch.id))} className="text-red-500"><FaTrash size={12}/></button>
                                                </div>
                                            )}

                                            <div className="flex justify-between border-b-2 border-black mb-4 font-black italic items-center">
                                                <span className="uppercase text-sm md:text-lg">
                                                    {isBatchUrdu ? `سوال نمبر ${toUrduDigits(bIdx + 1)}` : `Q.${bIdx + 1}`}: {batch.customTitle}
                                                </span>
                                                <span className="text-[12px] md:text-[15px]">
                                                    ({isBatchUrdu ? `${toUrduDigits(batch.config.marks)}x${toUrduDigits(batch.config.attempt)}` : `${batch.config.attempt}x${batch.config.marks}`})
                                                </span>
                                            </div>

                                            {/* Questions Grid: Stacks on mobile */}
                                            <div className={`grid gap-4 md:gap-6 ${isTwoCol ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                                                {batch.questions.map((q: any, qIdx: number) => {
                                                    const isQUrdu = isUrdu(q.question || q.text) || isBatchUrdu;
                                                    return (
                                                        <div key={q.tempId} className="relative group/item">
                                                            <div className="flex gap-2 md:gap-3 text-sm md:text-[16px] items-start">
                                                                <span className="font-bold min-w-[25px] md:min-w-[35px]">
                                                                    ({isQUrdu ? toUrduDigits(qIdx + 1) : qIdx + 1})
                                                                </span>
                                                                <span className="font-bold flex-1 leading-relaxed">
                                                                    {q.question || q.text}
                                                                </span>
                                                            </div>

                                                            {batch.type === 'mcqs' && q.options && (
                                                                <div className={`grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 mt-2 text-[13px] md:text-[14px] ${isQUrdu ? 'mr-6 md:mr-10' : 'ml-6 md:ml-10'}`}>
                                                                    {Object.entries(q.options).map(([key, val]: any) => (
                                                                        <div key={key} className="flex gap-2">
                                                                            <span className="font-bold">({isQUrdu ? (urduOptionLabels[key] || key) : key})</span>
                                                                            <span className="flex-1">{val}</span>
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
            </div>

            <style jsx global>{`
                @media print {
                    @page { size: A4; margin: 0; }
                    body { visibility: hidden; }
                    #printablePaper, #printablePaper * { visibility: visible; }
                    #printablePaper {
                        position: absolute; left: 0; top: 0;
                        width: 100% !important; height: auto !important;
                        padding: 15mm !important;
                    }
                    .print\\:hidden { display: none !important; }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 10px; }
            `}</style>
        </div>
    );
}