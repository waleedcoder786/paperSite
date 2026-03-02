"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  FaBars,
  FaChevronLeft,
  FaHome,
  FaFileAlt,
  FaSave,
  FaHistory,
  FaCog,
  FaUsers,
  FaSignOutAlt,
  FaChalkboardTeacher,
  FaTimes, // Close icon for mobile
} from "react-icons/fa";
import toast from "react-hot-toast";
import { PlusCircle } from "lucide-react";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserRole(user.role);
    }
  }, []);

  const allMenuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/dashboard" },
    { name: "Generate Paper", icon: <FaFileAlt />, path: "/generate-paper" },
    { name: "Saved Paper", icon: <FaSave />, path: "/saved-papers" },
    { name: "Teachers", icon: <FaChalkboardTeacher />, path: "/teachers" },
    { name: "Past Papers", icon: <FaHistory />, path: "/past-papers" },
    { name: "Users", icon: <FaUsers />, path: "/users" },
    { name: "Settings", icon: <FaCog />, path: "/settings" },
    { name: "AddData", icon: <PlusCircle />, path: "/add-data" },
  ];

  const menuItems = allMenuItems.filter((item) => {
    // 1. Agar Role 'teacher' hai
    if (userRole === "teacher") {
      const teacherRestricted = ["Teachers", "Users", "Settings", "AddData"];
      return !teacherRestricted.includes(item.name);
    }
    if (userRole === "superadmin") {
      const teacherRestricted = [
        "Saved Paper",
        "Teachers",
        "Settings",
        "Generate Paper",
        "Past Papers",
      ];
      return !teacherRestricted.includes(item.name);
    }
    // 2. Agar Role 'subadmin' hai (Admin table se aane wale users)
    if (userRole === "admin") {
      return (
        item.name !== "Users" &&
        item.name !== "AddData" &&
        item.name !== "Settings"
      );
    }
    // 3. Agar Role 'superadmin' hai
    if (userRole === "superadmin") {
      return true; // Super admin ko sab nazar aayega (including 'Users')
    }
    if (item.name === "Users") return false;
    return true;
  });

  const handleCardClick = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    document.cookie =
      "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
    toast.success("Logged out successfully.");
    localStorage.removeItem("user");
    localStorage.removeItem("userName");
    window.location.href = "/auth/login";
  };

  return (
    <>
      {/* -- MOBILE HAMBURGER BUTTON (OPENS SIDEBAR) --*/}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed top-4 left-4 z-[60] bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-700"
        >
          <FaBars size={18} />
        </button>
      )}

      {/* --- BACKDROP (MOBILE ONLY) --- */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-[90]
          bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out 
          border-r border-slate-800 shadow-2xl hover:w-64
          ${isOpen ? "w-64 translate-x-0" : "w-19 -translate-x-full md:translate-x-0"}
        `}
      >
        {/*  Desktop Toggle Button (Mobile par hide kar diya hai taaki overlap na kare) */}
        {/* <button 
          onClick={() => setIsOpen(!isOpen)}
          className="hidden md:flex absolute -right-3 top-10 bg-blue-600 w-7 h-7 rounded-full items-center justify-center border-2 border-slate-900 text-white shadow-lg hover:scale-110 transition-transform z-[100]">
          {isOpen ? <FaChevronLeft size={12} /> : <FaBars size={12} />}
        </button> */}

        {/*  Logo Section */}
        <div className={`flex items-center  p-4 mb-4 h-24 overflow-hidden `}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20">
              C
            </div>
            {/* {isOpen && ( */}
            <div className="flex flex-col overflow-hidden">
              <span className="font-black tracking-tight text-xl whitespace-nowrap">
                {userRole === "teacher" ? "CTM Teacher" : "CTM Admin"}
              </span>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-none mt-1">
                {userRole || "User"}
              </span>
            </div>
            {/* )} */}
          </div>

          {/*  Mobile Close Button (Aaram se logo ki right side par flex item ki tarah baitha hai) */}
          {isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-slate-400 hover:text-white transition-colors p-2 mt-30 -mr-2"
            >
              <FaTimes size={18} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => handleCardClick(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all group relative overflow-hidden ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                } ${!isOpen && "md:px-4"}`}
              >
                <span
                  className={`text-xl flex-shrink-0 ${isActive ? "text-white" : "group-hover:text-white"}`}
                >
                  {item.icon}
                </span>
                {/* Mobile par hamesha text dikhe agar open ho, desktop par collapse logic chale */}
                <span className="whitespace-nowrap">{item.name}</span>
                {/* Tooltip (Only for desktop when collapsed) */}
                {isOpen && (
                  <div className="hidden md:block absolute left-16 bg-slate-800 text-white text-[10px] px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-2xl whitespace-nowrap z-50 uppercase tracking-widest border border-slate-700">
                    {item.name}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-3 border-t border-slate-800 overflow-hidden">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all `}
          >
            <FaSignOutAlt className="text-xl flex-shrink-0" />
            <span className={` whitespace-nowrap px-3`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Custom CSS for hidden scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
      `}</style>
    </>
  );
}

export default Sidebar;
