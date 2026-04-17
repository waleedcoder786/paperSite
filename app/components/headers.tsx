import React, { useEffect, useState } from "react";

interface HeaderProps {
  type: string;
  info: any;
  styles: any;
  onChangeLogo: () => void;
}

export const PaperHeader = ({ type, info, styles, onChangeLogo }: HeaderProps) => {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data", error);
      }
    }
  }, []);

  // Priority: 1. Login User Data, 2. Paper Info, 3. Default
  // Note: Added .institute because your admin object uses 'institute' key
  const displaySchoolName = userData?.institute || userData?.schoolName || info?.schoolName || "INSTITUTION NAME";
  const displaySchoolLogo = userData?.logo || info?.logo || styles?.logoUrl || "";
  const displaySchoolAddress = userData?.address || info?.address || "";

  console.log("displaySchoolName:", info?.schoolName, userData?.schoolName, displaySchoolName);
  


  const Logo = () => {
    // Agar logo empty hai, to render hi na karein (ya fallback icon dikhayein)
    if (!displaySchoolLogo || displaySchoolLogo.trim() === "") {
      return (
        <div onClick={onChangeLogo} className="w-20 h-20 border-2 border-dashed border-slate-300 rounded flex items-center justify-center cursor-pointer hover:bg-slate-50 print:hidden shrink-0">
          <span className="text-[10px] text-slate-400 font-bold">ADD LOGO</span>
        </div>
      );
    }

    return (
      <div onClick={onChangeLogo} className="cursor-pointer group relative print:opacity-100 shrink-0">
        <img 
          src={displaySchoolLogo} 
          alt="logo" 
          className="w-20 h-20 object-contain" 
          // Agar image load na ho to blank dikhaye bajaye poora page reload karne ke
          onError={(e) => { e.currentTarget.style.display = 'none'; }} 
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded text-[8px] text-white transition-opacity font-bold print:hidden">
          CHANGE
        </div>
      </div>
    );
  };

  const fieldLabel = "font-bold text-[12px] uppercase";
  const displayDate = info?.paperDate || info?.date || "___/___/202__";
  const displayClass = info?.className || info?.class || "________";
  const displaySubject = info?.subject || "________";
  const displayTime = info?.paperTime || info?.timeAllowed || "_______";

  switch (type) {
    case 'academy-pro':
      return (
        <div className="w-full mb-6">
          <div className="flex items-center gap-4 mb-2">
            <Logo />
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-black uppercase tracking-tight leading-none">{displaySchoolName}</h1>
              <p className="text-[10px] font-bold mt-1">{displaySchoolAddress}</p>
            </div>
          </div>
          <table className="w-full border-collapse border-2 border-black text-[11px]">
            <tbody>
              <tr>
                <td className="border border-black bg-black text-white p-1 font-bold w-20">Name:</td>
                <td className="border border-black p-1 min-w-37.5"></td>
                <td className="border border-black bg-black text-white p-1 font-bold w-20">Roll No.</td>
                <td className="border border-black p-1 w-32"></td>
                <td className="border border-black bg-black text-white p-1 font-bold w-20">Class:</td>
                <td className="border border-black p-1 w-24 font-bold">{displayClass}</td>
              </tr>
              <tr>
                <td className="border border-black bg-black text-white p-1 font-bold">Subject:</td>
                <td className="border border-black p-1 font-bold italic">{info?.subject}</td>
                <td className="border border-black bg-black text-white p-1 font-bold">T.Marks:</td>
                <td className="border border-black p-1 font-bold">{info?.totalMarks}</td>
                <td className="border border-black bg-black text-white p-1 font-bold">P.Time:</td>
                <td className="border border-black p-1 font-bold">{displayTime}</td>
              </tr>
              <tr>
                <td className="border border-black bg-black text-white p-1 font-bold">Syllabus:</td>
                <td colSpan={3} className="border border-black p-1 italic text-slate-600">{info?.syllabus || "Complete Syllabus"}</td>
                <td className="border border-black bg-black text-white p-1 font-bold">Date:</td>
                <td className="border border-black p-1 font-bold">{displayDate}</td>
              </tr>
            </tbody>
          </table>
        </div>
      );

    case 'modern-bar':
      return (
        <div className="w-full mb-6">
          <div className="flex justify-between items-center mb-4">
            <Logo />
            <div className="text-center flex-1">
              <h1 className="text-3xl font-black uppercase tracking-tight">{displaySchoolName}</h1>
              <p className="text-[11px] font-medium tracking-widest uppercase">{displaySchoolAddress}</p>
            </div>
            <div className="text-right text-[10px] font-bold space-y-1">
                <p>Date: {displayDate}</p>
                <p>Time: {displayTime}</p>
            </div>
          </div>
          <div className="bg-black text-white flex justify-between px-4 py-2 font-bold uppercase text-[11px]">
            <span>Subject: {info?.subject}</span>
            <span>Class: {displayClass}</span>
            <span>Total Marks: {info?.totalMarks}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 text-[12px]">
            <div><span className={fieldLabel}>Name:</span> <span className="border-b border-black flex-1 inline-block w-60"></span></div>
            <div className="text-right"><span className={fieldLabel}>Roll No:</span> <span className="border-b border-black flex-1 inline-block w-24"></span></div>
          </div>
        </div>
      );

    case 'grid-table':
      return (
        <div className="w-full mb-8 border-b-2 border-black pb-4 text-center">
          <div className="mb-6">
            <div className="flex justify-center mb-2"><Logo /></div>
            <h1 className="text-4xl font-black uppercase tracking-widest leading-none mb-1">{displaySchoolName}</h1>
            <p className="text-[10px] font-bold mb-4 uppercase">{displaySchoolAddress}</p>
            <div className="flex justify-center gap-10 text-xs font-bold">
                <span>DATE: {displayDate}</span>
                <span>TIME: {displayTime}</span>
            </div>
          </div>
          <div className="flex justify-between items-end font-bold text-sm uppercase px-2">
            <div className="flex gap-2"><span>CLASS:</span><span className="border-b border-black min-w-[80px] text-center">{displayClass}</span></div>
            <div className="flex gap-2 underline decoration-double underline-offset-4 decoration-2"><span>SUBJECT:</span><span>{info?.subject}</span></div>
            <div className="flex gap-2"><span>TOTAL MARKS:</span><span className="border-b border-black min-w-[50px] text-center">{info?.totalMarks}</span></div>
          </div>
        </div>
      );

    case 'formal-double':
      return (
        <div className="w-full mb-6 border-4 border-double border-black p-4">
          <div className="flex justify-between items-center mb-4">
             <div className="space-y-3 text-[11px]">
                <p><b>NAME:</b> ____________________</p>
                <p><b>ROLL:</b> ____________________</p>
             </div>
             <div className="text-center">
                <Logo />
                <h1 className="text-xl font-black uppercase mt-1">{displaySchoolName}</h1>
                <p className="text-[10px] font-bold">{displaySchoolAddress}</p>
                <p className="text-[10px] font-bold mt-1">Time: {displayTime}</p>
             </div>
             <div className="text-right space-y-3 text-[11px]">
                <p><b>CLASS:</b> {displayClass}</p>
                <p><b>SUBJECT:</b> {info?.subject}</p>
             </div>
          </div>
          <div className="border-t border-black pt-2 flex justify-between text-xs font-bold">
             <span>Date: {displayDate}</span>
             <span>Total Marks: {info?.totalMarks}</span>
          </div>
        </div>
      );

    case 'marking-panel':
      return (
        <div className="w-full mb-6">
          <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-4">
             <Logo />
             <div className="text-center">
                <h1 className="text-2xl font-black uppercase">{displaySchoolName}</h1>
                <p className="text-[10px] font-bold">{displaySchoolAddress}</p>
                <p className="text-sm italic underline mt-1">Class: {displayClass} | Subject: {info?.subject}</p>
             </div>
             <div className="text-right text-[10px] font-bold leading-relaxed">
                <p>Date: {displayDate}</p>
                <p>Time: {displayTime}</p>
             </div>
          </div>
          <div className="flex justify-between items-center mb-6">
             <div className="space-y-2 text-xs">
                <p>Student: ____________________________</p>
                <p>Roll No: ____________________________</p>
             </div>
             <div className="border border-black">
                <div className="bg-black text-white text-[10px] px-4 font-bold">OFFICE USE ONLY</div>
                <div className="flex text-center text-[10px]">
                   <div className="border-r border-black p-1 w-12 font-bold">Total<br/>{info?.totalMarks}</div>
                   <div className="p-1 w-12 font-bold">Obt.<br/>___</div>
                </div>
             </div>
          </div>
        </div>
      );

    case 'minimalist-top':
        return (
          <div className="w-full mb-8 border-b-2 border-slate-800 pb-2">
            <div className="flex justify-between items-end mb-4">
              <div className="flex items-center gap-4">
                <Logo />
                <div>
                   <h1 className="text-2xl font-black uppercase leading-none">{displaySchoolName}</h1>
                   <p className="text-xs font-bold text-slate-500">{displaySchoolAddress}</p>
                </div>
              </div>
              <div className="text-right text-xs font-bold">
                 <p>Max Marks: {info?.totalMarks}</p>
                 <p>Time Allowed: {displayTime}</p>
                 <p>Date: {displayDate}</p>
              </div>
            </div>
            <div className="flex justify-between text-[11px] font-bold uppercase">
                <span>Name: _________________</span>
                <span>Roll #: _________</span>
                <span>Class: {displayClass}</span>
                <span>Subject: {info?.subject}</span>
            </div>
          </div>
        );

    case 'university-elegant':
        return (
          <div className="w-full mb-10 text-center font-serif">
            <div className="flex justify-center mb-2"><Logo /></div>
            <h1 className="text-3xl font-medium tracking-tight mb-1">{displaySchoolName}</h1>
            <p className="text-xs uppercase tracking-[0.2em] mb-1">{displaySchoolAddress}</p>
            <p className="text-sm uppercase tracking-[0.2em] mb-4">Session 2024 - 2026</p>
            <div className="h-0.5 bg-black w-full mb-4"></div>
            <div className="flex justify-between text-xs font-bold px-4">
                <span>Date: {displayDate}</span>
                <span>Subject: {info?.subject}</span>
                <span>Time: {displayTime}</span>
                <span>Marks: {info?.totalMarks}</span>
            </div>
          </div>
        );

    case 'split-sidebar':
        return (
          <div className="w-full mb-8 flex border-b border-black pb-4">
             <div className="w-1/3 border-r border-black pr-4 space-y-2 text-[11px]">
                <Logo />
                <p className="font-bold text-[10px]">{displaySchoolAddress}</p>
                <p className="pt-2"><b>STUDENT:</b> ________________</p>
                <p><b>ROLL NO:</b> ________________</p>
                <p><b>DATE:</b> {displayDate}</p>
                <p><b>TIME:</b> {displayTime}</p>
             </div>
             <div className="w-2/3 pl-4 flex flex-col justify-center">
                <h1 className="text-3xl font-black text-right uppercase">{displaySchoolName}</h1>
                <div className="mt-4 flex justify-end gap-6 text-sm font-bold">
                   <p className="bg-black text-white px-2">CLASS: {displayClass}</p>
                   <p className="border-2 border-black px-2">SUBJECT: {info?.subject}</p>
                   <p className="border-2 border-black px-2">MARKS: {info?.totalMarks}</p>
                </div>
             </div>
          </div>
        );

    case 'classic-school':
        return (
          <div className="w-full mb-6">
             <div className="border-2 border-black p-1">
                <div className="border border-black p-4 flex flex-col items-center">
                   <h1 className="text-2xl font-bold uppercase underline decoration-double underline-offset-4">{displaySchoolName}</h1>
                   <p className="text-[10px] font-bold mt-1 uppercase">{displaySchoolAddress}</p>
                   <div className="flex gap-10 mt-4 text-[12px] font-bold">
                      <p>CLASS: {displayClass}</p>
                      <p>SUBJECT: {info?.subject}</p>
                      <p>DATE: {displayDate}</p>
                      <p>TIME: {displayTime}</p>
                      <p>TOTAL MARKS: {info?.totalMarks}</p>
                   </div>
                   <div className="w-full mt-6 grid grid-cols-2 gap-10 text-[12px]">
                      <p className="border-b border-black pb-1"><b>NAME:</b> </p>
                      <p className="border-b border-black pb-1"><b>ROLL NO:</b> </p>
                   </div>
                </div>
             </div>
          </div>
        );

    default:
      return (
        

        <div className="w-full mb-6">
          <div className="text-center mb-4">
            <div className="flex justify-center mb-2"><Logo /></div>
            <h1 className="text-2xl font-bold uppercase">{displaySchoolName}</h1>
            <p className="text-[10px] font-bold">{displaySchoolAddress}</p>
          </div>
          <table className="w-full border-collapse border border-black text-[12px]">
            <tbody>
              <tr>
                <td className="border border-black p-2 bg-gray-50 w-24 font-bold">Name</td>
                <td className="border border-black p-2 w-1/2"></td>
                <td className="border border-black p-2 bg-gray-50 w-24 font-bold">Roll No.</td>
                <td className="border border-black p-2"></td>
              </tr>
              <tr>
                <td className="border border-black p-2 bg-gray-50 font-bold">Subject</td>
                <td className="border border-black p-2">{info?.subject}</td>
                <td className="border border-black p-2 bg-gray-50 font-bold">Class / Date</td>
                <td className="border border-black p-2">{displayClass} / {displayDate}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 bg-gray-50 font-bold">Total Marks</td>
                <td className="border border-black p-2">{info?.totalMarks}</td>
                <td className="border border-black p-2 bg-gray-50 font-bold">Duration</td>
                <td className="border border-black p-2 font-bold">{displayTime}</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
  }
};
