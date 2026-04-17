"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Navbar from "../components/navbar/page";
import Header from "../components/topbar/page";
import { UploadCloud, Loader2, DatabaseZap } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const WhiteAdminPanel = () => {
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [type, setType] = useState("mcq");
  const [inputMode, setInputMode] = useState<"manual" | "excel">("manual");

  // DB Data Management
  const [rawDbData, setRawDbData] = useState<any>(null);

  const [isNewBoard, setIsNewBoard] = useState(false);
  const [isNewClass, setIsNewClass] = useState(false);
  const [isNewSubject, setIsNewSubject] = useState(false);
  const [isNewChapter, setIsNewChapter] = useState(false);
  const [isNewTopic, setIsNewTopic] = useState(false);

  const [formData, setFormData] = useState({
    board: "", 
    topic: "",
    answer: "",
    classId: "",
    question: "",
    chapterName: "",
    subjectName: "",
    category: "Exercise Questions",
    options: { A: "", B: "", C: "", D: "" }
  });

  const API_URL = "api/classes";

  useEffect(() => {
    fetchDB();
  }, []);

  const fetchDB = async () => {
    try {
      const res = await axios.get(API_URL);
      if (res.data && res.data[0]?.data) {
        setRawDbData(res.data[0].data);
      }
    } catch (err) {
      toast.error("Database Connection Error");
    }
  };

  // ✅ SAFE DATA EXTRACTION
  const availableBoards = rawDbData ? Object.keys(rawDbData) : [];

  const classesList = (formData.board && rawDbData?.[formData.board]?.classes) 
    ? rawDbData[formData.board].classes 
    : [];

  const selectedClassObj = classesList.find((c: any) => c.id === formData.classId) || null;
  const availableSubjects = selectedClassObj?.subjects || [];

  const selectedSubjectObj = availableSubjects.find((s: any) => s.name === formData.subjectName) || null;
  
  const availableChapters = (selectedSubjectObj?.chapters && Array.isArray(selectedSubjectObj.chapters))
    ? selectedSubjectObj.chapters.map((ch: any) => typeof ch === 'string' ? { name: ch } : ch)
    : [];

  const selectedChapterObj = availableChapters.find((ch: any) => ch.name === formData.chapterName) || null;
  
  const availableTopics = (selectedChapterObj?.topics && Array.isArray(selectedChapterObj.topics))
    ? selectedChapterObj.topics.map((t: any) => t.name) 
    : [];

  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Validations
    if (!formData.board) return toast.error("Please select or enter a Board!");
    if (!formData.classId) return toast.error("Please select or enter a Class!");
    if (!formData.subjectName) return toast.error("Please select or enter a Subject!");
    if (!formData.chapterName) return toast.error("Please select or enter a Chapter!");
    if (!formData.topic) return toast.error("Please select or enter a Topic!");
    if (!formData.question.trim()) return toast.error("Question cannot be empty!");
    if (type === 'mcq' && !formData.answer) return toast.error("Select the correct answer!");

    // ✅ DUPLICATION CHECK LOGIC
    if (rawDbData && formData.board) {
      const boardData = rawDbData[formData.board.toLowerCase().trim()];
      
      if (boardData) {
        // 1. Check Class Duplicate
        const existingClass = boardData.classes?.find((c: any) => c.id === formData.classId.trim());
        if (isNewClass && existingClass) {
          return toast.error(`Class "${formData.classId}" already availiable`);
        }

        if (existingClass) {
          // 2. Check Subject Duplicate
          const existingSubject = existingClass.subjects?.find((s: any) => s.name.toLowerCase() === formData.subjectName.toLowerCase().trim());
          if (isNewSubject && existingSubject) {
            return toast.error(`Subject "${formData.subjectName}" in class mein pehle se hai!`);
          }

          if (existingSubject) {
            // 3. Check Chapter Duplicate
            const existingChapter = existingSubject.chapters?.find((ch: any) => 
              (typeof ch === 'string' ? ch.toLowerCase() : ch.name.toLowerCase()) === formData.chapterName.toLowerCase().trim()
            );
            if (isNewChapter && existingChapter) {
              return toast.error(`Chapter "${formData.chapterName}" pehle se add hai!`);
            }

            if (existingChapter) {
              // 4. Check Topic Duplicate
              const existingTopic = existingChapter.topics?.find((t: any) => t.name.toLowerCase() === formData.topic.toLowerCase().trim());
              if (isNewTopic && existingTopic) {
                return toast.error(`Topic "${formData.topic}" is chapter mein pehle se hai!`);
              }
            }
          }
        }
      }
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}`, {
        board: formData.board.toLowerCase().trim(),
        classId: formData.classId,
        subjectName: formData.subjectName,
        chapterName: formData.chapterName,
        topic: formData.topic,
        category: formData.category,
        type,
        newQuestion: {
          question: formData.question,
          options: type === 'mcq' ? formData.options : undefined,
          answer: formData.answer,
        }
      });
      toast.success("Saved Successfully!");
      setFormData(prev => ({
        ...prev,
        question: "",
        answer: "",
        options: { A: "", B: "", C: "", D: "" }
      }));
      fetchDB();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Save failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!formData.board) return toast.error("Select Board first!");
    
    setBulkLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      if (rows.length === 0) return toast.error("Excel file is empty!");

      const promises = rows.map((row: any) => {
        const questionObj: any = {
          question: row['question'] || row['Question'] || '',
          answer: row['answer'] || row['Answer'] || '',
        };
        if (type === 'mcq') {
          questionObj.options = {
            A: row['A'] || row['option_a'] || '',
            B: row['B'] || row['option_b'] || '',
            C: row['C'] || row['option_c'] || '',
            D: row['D'] || row['option_d'] || '',
          };
        }
        return axios.post(`${API_URL}`, {
          board: formData.board.toLowerCase().trim(),
          classId: formData.classId,
          subjectName: formData.subjectName,
          chapterName: formData.chapterName,
          topic: formData.topic,
          category: formData.category,
          type,
          newQuestion: questionObj,
        });
      });

      await Promise.all(promises);
      toast.success(`${rows.length} questions uploaded!`);
      fetchDB();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Excel upload failed.");
    } finally {
      setBulkLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="flex h-screen bg-[#FCFCFD] text-slate-800 overflow-hidden font-sans">
      <Toaster position="top-center" />
      <Navbar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]/60 p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* HIERARCHY SELECTOR */}
            <div className="bg-white rounded-md p-8 shadow-xl border border-slate-100 grid grid-cols-1 md:grid-cols-6 gap-6">

              {/* 1. Board Selector */}
              <div className="space-y-2">
                <div className="flex justify-between px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Board</label>
                  <button type="button" onClick={() => { setIsNewBoard(!isNewBoard); setFormData({ ...formData, board: "" }); }}
                    className="text-[9px] font-black text-blue-600 uppercase">{isNewBoard ? 'Select' : 'New+'}</button>
                </div>
                {isNewBoard ? (
                  <input type="text" placeholder="e.g. punjab" value={formData.board}
                    onChange={(e) => setFormData({ ...formData, board: e.target.value.toLowerCase() })}
                    className="w-full bg-blue-50/50 p-4 rounded-md border border-blue-200 outline-none text-sm font-bold text-blue-700" />
                ) : (
                  <select value={formData.board}
                    onChange={(e) => setFormData({ ...formData, board: e.target.value, classId: "", subjectName: "", chapterName: "", topic: "" })}
                    className="w-full bg-orange-50 p-4 rounded-md border border-orange-200 text-sm font-bold text-orange-700">
                    <option value="">Select Board</option>
                    {availableBoards.map(b => (
                      <option key={b} value={b}>{b.toUpperCase()} Board</option>
                    ))}
                  </select>
                )}
              </div>

              {/* 2. Class */}
              <div className="space-y-2">
                <div className="flex justify-between px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Class</label>
                  <button type="button" onClick={() => { setIsNewClass(!isNewClass); setFormData({ ...formData, classId: "" }); }}
                    className="text-[9px] font-black text-blue-600 uppercase">{isNewClass ? 'Select' : 'New+'}</button>
                </div>
                {isNewClass ? (
                  <input type="text" placeholder="e.g. 10" value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full bg-blue-50/50 p-4 rounded-md border border-blue-200 outline-none text-sm font-bold text-blue-700" />
                ) : (
                  <select disabled={!formData.board} value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value, subjectName: "", chapterName: "", topic: "" })}
                    className="w-full bg-slate-50 p-4 rounded-md border border-slate-200 text-sm font-bold disabled:opacity-50">
                    <option value="">Select Class</option>
                    {classesList.map((c: any) => <option key={c.id} value={c.id}>{c.title || c.id}</option>)}
                  </select>
                )}
              </div>

              {/* 3. Subject */}
              <div className="space-y-2">
                <div className="flex justify-between px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Subject</label>
                  <button type="button" onClick={() => { setIsNewSubject(!isNewSubject); setFormData({ ...formData, subjectName: "" }); }}
                    className="text-[9px] font-black text-blue-600 uppercase">{isNewSubject ? 'Select' : 'New+'}</button>
                </div>
                {isNewSubject ? (
                  <input type="text" placeholder="e.g. Physics" value={formData.subjectName}
                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                    className="w-full bg-blue-50/50 p-4 rounded-md border border-blue-200 outline-none text-sm font-bold text-blue-700" />
                ) : (
                  <select disabled={!formData.classId} value={formData.subjectName}
                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value, chapterName: "", topic: "" })}
                    className="w-full bg-slate-50 p-4 rounded-md border border-slate-200 text-sm font-bold disabled:opacity-50">
                    <option value="">Select Subject</option>
                    {availableSubjects.map((s: any) => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                )}
              </div>

              {/* 4. Chapter */}
              <div className="space-y-2">
                <div className="flex justify-between px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Chapter</label>
                  <button type="button" onClick={() => { setIsNewChapter(!isNewChapter); setFormData({ ...formData, chapterName: "" }); }}
                    className="text-[9px] font-black text-blue-600 uppercase">{isNewChapter ? 'Select' : 'New+'}</button>
                </div>
                {isNewChapter ? (
                  <input type="text" placeholder="Chapter name" value={formData.chapterName}
                    onChange={(e) => setFormData({ ...formData, chapterName: e.target.value })}
                    className="w-full bg-blue-50/50 p-4 rounded-md border border-blue-200 outline-none text-sm font-bold text-blue-700" />
                ) : (
                  <select disabled={!formData.subjectName} value={formData.chapterName}
                    onChange={(e) => setFormData({ ...formData, chapterName: e.target.value, topic: "" })}
                    className="w-full bg-slate-50 p-4 rounded-md border border-slate-200 text-sm font-bold disabled:opacity-50">
                    <option value="">Select Chapter</option>
                    {availableChapters.map((ch: any, i: number) => <option key={i} value={ch.name}>{ch.name}</option>)}
                  </select>
                )}
              </div>

              {/* 5. Topic */}
              <div className="space-y-2">
                <div className="flex justify-between px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Topic</label>
                  <button type="button" onClick={() => { setIsNewTopic(!isNewTopic); setFormData({ ...formData, topic: "" }); }}
                    className="text-[9px] font-black text-blue-600 uppercase">{isNewTopic ? 'Select' : 'New+'}</button>
                </div>
                {isNewTopic ? (
                  <input type="text" placeholder="Topic name" value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full bg-blue-50/50 p-4 rounded-md border border-blue-200 outline-none text-sm font-bold text-blue-700" />
                ) : (
                  <select disabled={!formData.chapterName} value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full bg-slate-50 p-4 rounded-md border border-slate-200 text-sm font-bold disabled:opacity-50">
                    <option value="">Select Topic</option>
                    {availableTopics.map((t: any, i: number) => <option key={i} value={t}>{t}</option>)}
                  </select>
                )}
              </div>

              {/* 6. Section */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">Section</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-indigo-50 text-indigo-700 p-4 rounded-md border border-indigo-100 text-sm font-black">
                  <option value="Exercise Questions">Exercise</option>
                  <option value="Additional Questions">Additional</option>
                  <option value="Pastpapers Questions">Pastpapers</option>
                </select>
              </div>

              <div className="col-span-full">
                <div className="flex bg-white w-fit p-1 rounded-xl border border-slate-200 shadow-sm">
                  {['mcq', 'short', 'long'].map(t => (
                    <button key={t} type="button" onClick={() => setType(t)}
                      className={`px-10 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${type === t ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* INPUT MODE */}
            <div className="w-full space-y-6">
              <div className="flex gap-4 p-1.5 bg-slate-200/50 rounded-md w-fit">
                <button type="button" onClick={() => setInputMode("manual")}
                  className={`px-10 py-3 rounded-md text-[10px] font-black uppercase transition-all ${inputMode === "manual" ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500'}`}>
                  Manual
                </button>
                <button type="button" onClick={() => setInputMode("excel")}
                  className={`px-10 py-3 rounded-md text-[10px] font-black uppercase transition-all ${inputMode === "excel" ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500'}`}>
                  Excel
                </button>
              </div>

              {inputMode === "manual" ? (
                <form onSubmit={handleSaveManual} className="bg-white rounded-md p-10 shadow-2xl border border-slate-300 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Question</label>
                    <textarea required rows={3} value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      className="w-full bg-slate-50 p-6 rounded-md border border-slate-300 focus:border-blue-500 outline-none font-bold text-slate-700"
                      placeholder="Enter question..." />
                  </div>

                  {type === 'mcq' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {['A', 'B', 'C', 'D'].map(o => (
                        <div key={o} className="flex items-center gap-4 bg-slate-50 p-3 rounded-md border border-slate-300">
                          <span className="w-10 h-10 flex items-center justify-center bg-white rounded-md font-black text-slate-400">{o}</span>
                          <input required type="text" placeholder={`Option ${o}`}
                            value={(formData.options as any)[o]}
                            onChange={(e) => setFormData({ ...formData, options: { ...formData.options, [o]: e.target.value } })}
                            className="bg-transparent flex-1 outline-none text-sm font-bold text-slate-600" />
                        </div>
                      ))}
                      <div className="col-span-full pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 mb-4 uppercase">Correct Answer</p>
                        <div className="flex gap-4">
                          {['A', 'B', 'C', 'D'].map(a => (
                            <button key={a} type="button" onClick={() => setFormData({ ...formData, answer: a })}
                              className={`flex-1 py-4 rounded-md font-black transition-all border ${formData.answer === a ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-slate-50 border-slate-300 text-slate-400 hover:bg-slate-100'}`}>
                              {a}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {type !== 'mcq' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400">Answer / Solution</label>
                      <textarea required rows={5} value={formData.answer}
                        onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                        className="w-full bg-slate-50 p-6 rounded-md border border-slate-300 focus:border-blue-500 outline-none font-bold text-slate-600"
                        placeholder="Enter solution..." />
                    </div>
                  )}

                  <button disabled={loading} type="submit"
                    className="w-full bg-slate-900 text-white py-5 rounded-md font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 shadow-xl disabled:opacity-50 transition-all active:scale-[0.98]">
                    {loading ? <Loader2 className="animate-spin" /> : <><DatabaseZap size={20} /> Store in Database</>}
                  </button>
                </form>
              ) : (
                <div className="bg-white rounded-md p-20 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center space-y-8">
                  <div className="w-24 h-24 bg-blue-50 rounded-md flex items-center justify-center text-blue-600 shadow-inner">
                    <UploadCloud size={40} />
                  </div>
                  <div className="text-center text-slate-800 font-black">
                    <p className="text-lg uppercase">Excel Import</p>
                    <p className="text-sm font-bold text-slate-400 mt-1">Board: {formData.board || "Not Selected"}</p>
                    <p className="text-xs font-bold text-slate-300 mt-1">
                      Required columns: question, answer{type === 'mcq' ? ', A, B, C, D' : ''}
                    </p>
                  </div>
                  <input type="file" id="xl-input" className="hidden" accept=".xlsx, .xls" onChange={handleExcelUpload} />
                  <label htmlFor="xl-input"
                    className="bg-blue-600 text-white px-12 py-4 rounded-xl font-black uppercase tracking-widest cursor-pointer hover:bg-blue-700 shadow-xl transition-all">
                    {bulkLoading ? "Uploading..." : "Select Spreadsheet"}
                  </label>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WhiteAdminPanel;