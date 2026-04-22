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
  FaUserLock,
  FaUsers,
  FaSignOutAlt,
  FaShieldAlt,
  FaEye, 
  FaTrashAlt,
  FaChalkboardTeacher,
  FaTimes, 
  FaLock
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

  // Handle Mounting - LocalStorage sy data lena
  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserRole(user.role);
        
        // Date format clean karna (YYYY-MM-DD)
        const cleanDate = user.expiryDate ? user.expiryDate.split('T')[0] : "N/A";

        setUserData({
          name: user.name || "User",
          expiryDate: cleanDate,
          package: user.planType || "Basic", // Mapping planType to package
          profileImage: user.profilePic || "" // Mapping profilePic to profileImage
        });
      } catch (error) {
        console.error("Error parsing user data", error);
      }
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
    { name: "Login History", icon: <FaLock />, path: "/login-history" }, 
    { name: "removeData", icon: <FaTrashAlt/>, path: "/removeData" }, 
    { name: "View Data", icon: <FaEye />, path: "/view-data" }, 
  ];

  const menuItems = allMenuItems.filter((item) => {
    if (userRole === "teacher") {
      const teacherRestricted = ["Teachers", "Users", "Settings", "AddData"];
      return !teacherRestricted.includes(item.name);
    }
    if (userRole === "admin") {
      return (
        item.name !== "Users" &&
        item.name !== "AddData" &&
        item.name !== "removeData" &&
        item.name !== "View Data" &&
        item.name !== "Settings"
      );
    }
    if (userRole === "superadmin") {
        // Superadmin logic as per your previous code
        const saRestricted = ["Saved Paper", "Teachers", "Settings", "Generate Paper", "Login History", "Past Papers"];
        return !saRestricted.includes(item.name);
    }
    return true;
  });

  const handleCardClick = (path: string) => {
    router.push(path);
  };

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
      <div className="flex items-center h-20 px-6 flex-shrink-0 border-b border-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <FaShieldAlt size={20} />
          </div>
          <div className={`transition-all duration-300 overflow-hidden ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>
            <h1 className="text-sm font-black text-white tracking-tight uppercase whitespace-nowrap">TestMind .  </h1>
          </div>
        </div>
      </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-2 overflow-y-auto no-scrollbar">
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
                <span className={`whitespace-nowrap ml-2 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 w-0"}`}>{item.name}</span>
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