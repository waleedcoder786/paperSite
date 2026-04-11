"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  FaHome, FaFileAlt, FaSave, FaHistory, FaCog, FaUsers,
  FaChalkboardTeacher, FaTrashAlt, FaShieldAlt
} from "react-icons/fa";
import { PlusCircle, Crown, Calendar, Zap, LogOut, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const Sidebar = ({ onToggle }: { onToggle?: (isOpen: boolean) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    name: "User",
    expiryDate: "N/A",
    package: "Basic",
    profileImage: ""
  });

  const router = useRouter();
  const pathname = usePathname();

  // Handle Mounting
  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserRole(user.role);
        setUserData({
          name: user.name || "User",
          expiryDate: user.expiryDate || "2030-04-04",
          package: user.package || "Basic",
          profileImage: user.profileImage || ""
        });
      } catch (error) {
        console.error("Error parsing user data", error);
      }
    }
  }, []);

  // Sync Sidebar State with Parent
  useEffect(() => {
    if (onToggle) onToggle(isOpen);
  }, [isOpen, onToggle]);

  // Memoized Menu Items for Performance
  const menuItems = useMemo(() => {
    const allItems = [
      { name: "Dashboard", icon: <FaHome size={18} />, path: "/dashboard" },
      { name: "Generate Paper", icon: <FaFileAlt size={18} />, path: "/generate-paper" },
      { name: "Saved Paper", icon: <FaSave size={18} />, path: "/saved-papers" },
      { name: "Teachers", icon: <FaChalkboardTeacher size={18} />, path: "/teachers" },
      { name: "Past Papers", icon: <FaHistory size={18} />, path: "/past-papers" },
      { name: "Users", icon: <FaUsers size={18} />, path: "/users" },
      { name: "Add Data", icon: <PlusCircle size={18} />, path: "/add-data" },
      { name: "Remove Data", icon: <FaTrashAlt size={18} />, path: "/removeData" },
      { name: "Settings", icon: <FaCog size={18} />, path: "/settings" },
    ];

    return allItems.filter((item) => {
      if (!userRole) return true;
      if (userRole === "teacher") return !["Teachers", "Users", "Settings", "Add Data", "Remove Data"].includes(item.name);
      if (userRole === "superadmin") return !["Saved Paper", "Teachers", "Settings", "Generate Paper", "Past Papers"].includes(item.name);
      if (userRole === "admin") return !["Users", "Add Data", "Remove Data", "Settings"].includes(item.name);
      return true;
    });
  }, [userRole]);

   const handleLogout = () => {
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
    toast.success("Logged out successfully.");
    localStorage.removeItem("user");
    window.location.href = "/auth/login";
  };

  if (!mounted) return <div className="w-20 bg-[#020617] h-screen" />;

  return (
    <aside
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className={`inset-y-0 left-0 z-50 flex flex-col 
        bg-[#020617] text-slate-400 transition-all duration-300 ease-in-out
        border-r border-slate-800/40 shadow-2xl
        ${isOpen ? "w-72" : "w-20"}
      `}
    >
      {/* 1. Brand Section */}
      <div className="flex items-center h-20 px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <FaShieldAlt size={20} />
          </div>
          <div className={`transition-all duration-300 overflow-hidden ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>
            <h1 className="text-sm font-black text-white tracking-tight uppercase whitespace-nowrap">CTM Admin</h1>
          </div>
        </div>
      </div>

      {/* 2. Navigation Section */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto no-scrollbar border-t border-slate-800/50">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.path)}
              className={`
                w-full flex items-center gap-4 px-3.5 py-3 rounded-xl text-[13px] cursor-pointer font-semibold transition-all group
                ${isActive 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "hover:bg-slate-800/50 hover:text-slate-100"}
              `}
            >
              <span className={`transition-transform duration-300 flex-shrink-0 ${isActive ? "scale-110" : "group-hover:scale-110 text-slate-500"}`}>
                {item.icon}
              </span>
              <span className={`whitespace-nowrap transition-opacity duration-300 ${!isOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* 3. Account Status Card */}
      <div className={`mx-3 mb-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60 transition-all duration-300 ${!isOpen ? "opacity-0 invisible h-0" : "opacity-100 visible h-auto"}`}>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Crown size={14} className="text-amber-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plan</span>
            </div>
            <span className="text-[10px] font-black text-amber-400 uppercase bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              {userData.package}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-indigo-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expires</span>
            </div>
            <span className="text-[10px] font-medium text-slate-200">{userData.expiryDate}</span>
          </div>

          <div className="pt-2 border-t border-slate-800/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-cyan-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 size={10} className="text-cyan-400" />
              <span className="text-[10px] text-cyan-400 font-black uppercase">full</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Profile Section */}
      <div className="p-3 border-t border-slate-800/50 bg-[#01040a]/40 flex-shrink-0">
        <div className={`flex items-center justify-between p-2 rounded-2xl transition-all ${isOpen ? "bg-slate-800/30" : "justify-center"}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
              {userData.profileImage ? (
                <img src={userData.profileImage} alt="user" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-indigo-400 uppercase">{userData.name.charAt(0)}</span>
              )}
            </div>
            <div className={`transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 w-0"}`}>
              <p className="text-xs font-bold text-white truncate uppercase tracking-tight leading-none mb-1">{userData.name}</p>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">{userRole || "User"}</p>
            </div>
          </div>
          {isOpen && (
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { width: 0px; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </aside>
  );
};

export default Sidebar;