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

const BACKEND_URL = "http://localhost:5000/api/papers";

interface PaperPreviewProps {
    className: string;
    subject: any;
    chapters: string[];
    topics: string[]; // <--- Added topics to props
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

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const handleAddQuestions = (newQs: any[], config: any) => {
        if (newQs.length === 0) return;

        const sectionTitle = config.type.toLowerCase().includes('short') ? 'Short Questions' 
                           : config.type.toLowerCase().includes('long') ? 'Long Questions' 
                           : 'Objective Type';

        const newBatch = {
            id: editingBatch ? editingBatch.id : Date.now(),
            type: config.type.toLowerCase(),
            customTitle: editingBatch?.customTitle || (config.type === 'mcqs' ? 'Choose the Correct Answer' : `Answer any ${config.attempt} ${sectionTitle}`),
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
            toast.success("Section updated!");
        } else {
            setQuestionBatches(prev => [...prev, newBatch]);
            toast.success(`Section Added!`);
        }

        setIsMenuOpen(false);
        setEditingBatch(null);
    };

    const handleSectionTitleChange = (batchId: number, newTitle: string) => {
        setQuestionBatches(prev => prev.map(b => 
            b.id === batchId ? { ...b, customTitle: newTitle } : b
        ));
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
                paperName,
                paperType,
                paperDate,
                paperTime,
                className,
                subject: subject?.name,
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
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-slate-50 p-5 border-b flex items-center gap-3">
                            <FaCloudUploadAlt className="text-blue-600" />
                            <h2 className="text-lg font-bold text-slate-800 uppercase">Save to Database</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <input type="text" placeholder="Paper Name" value={paperName} onChange={(e) => setPaperName(e.target.value)} className="w-full border rounded-lg px-4 py-2" />
                            <input type="text" placeholder="Type" value={paperType} onChange={(e) => setPaperType(e.target.value)} className="w-full border rounded-lg px-4 py-2" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="date" value={paperDate} onChange={(e) => setPaperDate(e.target.value)} className="w-full border rounded-lg px-4 py-2" />
                                <input type="text" value={paperTime} onChange={(e) => setPaperTime(e.target.value)} className="w-full border rounded-lg px-4 py-2" />
                            </div>
                        </div>
                        <div className="bg-slate-50 px-6 py-4 flex gap-3 justify-end">
                            <button onClick={() => setIsSaveModalOpen(false)} className="text-slate-500 font-bold text-xs uppercase">Cancel</button>
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
                        <button onClick={() => { setEditingBatch(null); setIsMenuOpen(true); }} className="bg-blue-600 hover:bg-blue-500 text-[12px] px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all">
                            <FaBars className="text-[10px]" /> ADD QUESTIONS
                        </button>
                        <button onClick={() => setIsEditMode(!isEditMode)} className={`${isEditMode ? 'bg-green-600' : 'bg-amber-600'} text-[12px] px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all`}>
                            {isEditMode ? <><FaCheck /> DONE EDITING</> : <><FaEdit /> EDIT MODE </>}
                        </button>
                        <button onClick={() => window.print()} className="bg-slate-800 text-yellow-400 border border-slate-700 text-[12px] px-5 py-2.5 rounded-lg font-bold flex items-center gap-2">
                            <FaPrint className="text-[10px]" /> PRINT
                        </button>
                        <button onClick={() => setIsSaveModalOpen(true)} disabled={questionBatches.length === 0} className="bg-slate-800 text-green-400 border border-slate-700 text-[12px] px-5 py-2.5 rounded-lg font-bold disabled:opacity-50">
                            <FaCloudUploadAlt /> SAVE PAPER
                        </button>
                    </div>
                    <div className="bg-slate-900 border border-white/10 rounded-full px-4 py-1.5 font-bold text-slate-400 text-[11px]">
                        TOTAL MARKS: {grandTotalMarks}
                    </div>
                    <button onClick={onClose} className="text-red-400 border border-red-500/50 px-5 py-2.5 rounded-lg text-[12px] font-bold">
                        EXIT
                    </button>
                </div>

                {/* PAPER AREA */}
                <div className="flex-1 overflow-y-auto p-10 bg-slate-400/20 print:p-0 print:bg-white custom-scrollbar">
                    <div ref={paperRef} id="printablePaper" className={`bg-white mx-auto w-[850px] min-h-[1100px] shadow-2xl relative p-16 print:shadow-none print:w-full print:p-12 text-black transition-all ${isEditMode ? 'ring-4 ring-amber-400' : ''}`}>
                        
                        {/* Header */}
                        <div className="border-b-4 border-black pb-4 text-center mb-10">
                            <h1 className="text-3xl font-black uppercase tracking-tighter" contentEditable={isEditMode} suppressContentEditableWarning>{user?.schoolName || "SCHOOL NAME"}</h1>
                            <p className="text-center text-[14px]" contentEditable={isEditMode} suppressContentEditableWarning>{user?.address || "Address goes here"}</p>
                            <h2 className="text-lg font-bold uppercase mt-1">{paperType}</h2>
                            <div className="flex justify-between mt-1 text-[15px] font-bold">
                                <div className="text-left">
                                    <p>Class: {className}</p>
                                    <p className="text-[12px] font-normal uppercase">Date: {paperDate}</p>
                                </div>
                                <span className="text-xl underline decoration-double underline-offset-4">Subject: {subject?.name}</span>
                                <div className="text-right">
                                    <p>Marks: {grandTotalMarks}</p>
                                    <p className="text-[12px] font-normal uppercase">Time: {paperTime}</p>
                                </div>
                            </div>
                        </div>

                        {/* Questions */}
                        <div className="space-y-10">
                            {questionBatches.map((batch, bIdx) => {
                                const isTwoCol = batch.config.layoutCols === 2;

                                return (
                                    <div key={batch.id} className="group relative">
                                        {!isEditMode && (
                                            <div className="absolute -left-12 top-2 flex flex-row gap-3 opacity-0 group-hover:opacity-100 transition-all print:hidden">
                                                <button onClick={() => { setEditingBatch(batch); setIsMenuOpen(true); }} className="text-blue-500"><FaEdit size={16}/></button>
                                                <button onClick={() => removeBatch(batch.id)} className="text-red-500"><FaTrash size={14}/></button>
                                            </div>
                                        )}

                                        <div className="flex justify-between border-b-2 border-black mb-3 font-black italic">
                                            <span 
                                                contentEditable={isEditMode} 
                                                suppressContentEditableWarning 
                                                className="uppercase outline-none min-w-[100px]"
                                                onBlur={(e) => handleSectionTitleChange(batch.id, e.currentTarget.innerText)}
                                            >
                                                Q.{bIdx + 1}: {batch.customTitle}
                                            </span>
                                            <span>({batch.config.attempt} x {batch.config.marks} = {batch.config.attempt * batch.config.marks})</span>
                                        </div>

                                        <div className={`grid ${isTwoCol ? 'grid-cols-2 gap-x-10 gap-y-4' : 'grid-cols-1 space-y-4'}`}>
                                            {batch.questions.map((q: any, qIdx: number) => (
                                                <div key={q.tempId} className="relative group/item">
                                                    {!isEditMode && (
                                                        <button onClick={() => removeQuestionFromBatch(batch.id, q.tempId)} className="absolute -left-8 top-1 text-red-500 opacity-0 group-hover/item:opacity-100 transition-all print:hidden">
                                                            <FaTrash size={10} />
                                                        </button>
                                                    )}
                                                    <div className="flex gap-2 text-[14px]">
                                                        <span className="font-bold min-w-[25px]">({qIdx + 1})</span>
                                                        <span 
                                                            className="font-bold flex-1 outline-none" 
                                                            contentEditable={isEditMode} 
                                                            suppressContentEditableWarning
                                                            onBlur={(e) => handleQuestionTextChange(batch.id, q.tempId, e.currentTarget.innerText)}
                                                        >
                                                            {q.question || q.text}
                                                        </span>
                                                    </div>

                                                    {batch.type === 'mcqs' && q.options && (
                                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2 ml-8 text-[13px]">
                                                            {Object.entries(q.options).map(([key, val]: any) => (
                                                                <div key={key} className="flex gap-1">
                                                                    <span className="font-bold">({key})</span>
                                                                    <span contentEditable={isEditMode} suppressContentEditableWarning className="outline-none">{val}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
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
                    body * { visibility: hidden; }
                    #printablePaper, #printablePaper * { visibility: visible; }
                    #printablePaper {
                        position: absolute; left: 0; top: 0;
                        width: 100% !important; margin: 0 !important;
                        padding: 10mm !important; box-shadow: none !important;
                    }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
}