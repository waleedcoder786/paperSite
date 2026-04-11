"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import bcrypt from "bcryptjs";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";

function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({
    name: "",
    email: "",
    profilePic: "",
    password: "",
    role: "",
  });

  const API_BASE = "/api";
  // const API_BASE = "https://testbackend-production-69cb.up.railway.app/api";
  // const API_BASE = "http://localhost:5000";

  const pathname = usePathname().split("/").pop()?.replace(/-/g, " ");

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isMatch = bcrypt.compareSync(passwords.oldPassword, user.password);
      if (!isMatch) {
        toast.error("Incorrect current password!");
        setIsLoading(false);
        return;
      }

      if (passwords.newPassword) {
        if (passwords.newPassword !== passwords.confirmPassword) {
          toast.error("New passwords do not match!");
          setIsLoading(false);
          return;
        }
      }
        const searchRes = await axios.get(
          `${API_BASE}/users?email=${user.email}`
        );

      if (searchRes.data.length > 0) {
        const dbUser = searchRes.data[0];
        const userId = dbUser.id;

        let finalPassword = user.password;
        if (passwords.newPassword) {
          const salt = bcrypt.genSaltSync(10);
          finalPassword = bcrypt.hashSync(passwords.newPassword, salt);
        }

        const updatedData = {
          ...user,
          password: finalPassword,
          name: user.name,
          profilePic: user.profilePic,
        };

        const response = await axios.put(
          `${API_BASE}/users/${userId}`,
          updatedData
        );

        if (response.status === 200) {
          localStorage.setItem("user", JSON.stringify(updatedData));
          setUser(updatedData);
          setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
          setIsModalOpen(false);
          toast.success("Profile updated successfully!");
        }
      }
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-slate-50">
      {/* --- RESPONSIVE HEADER --- */}
      <header className="h-20 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-10 sticky top-0 z-40">
        <div className="flex flex-col">
          <h1 className="text-lg md:text-xl font-black text-slate-800 tracking-tight capitalize truncate max-w-[150px] md:max-w-none">
            {pathname} Overview
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-2 h-2 rounded-sm bg-emerald-500 animate-pulse"></div>
            <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Live System Update • 2026
            </p>
          </div>
        </div>

        {/* <div className="flex items-center gap-3 md:gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-800 leading-none capitalize">
              {user.name || "User"}
            </p>
            <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase tracking-wider">
              {user.role === "teacher" ? "Plan: Standard" : "Plan: Premium Member"}
            </p>
          </div>

          {/* Avatar / Trigger */}
          {/* <div
            onClick={() => setIsModalOpen(true)}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-100 border-2 border-white shadow-lg overflow-hidden ring-2 md:ring-4 ring-slate-50 transition-transform hover:scale-105 cursor-pointer flex-shrink-0"
          >
            {user.profilePic ? (
              <img className="w-full h-full object-cover" src={user.profilePic} alt="User" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold text-lg uppercase">
                {user.name ? user.name.charAt(0) : "U"}
              </div>
            )}
          </div> */}
        {/* </div> */} 
      </header>

      {/* --- RESPONSIVE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !isLoading && setIsModalOpen(false)}
          ></div>

          {/* Modal Card */}
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 md:p-8 animate-in fade-in zoom-in duration-300 max-h-[95vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-black text-slate-800">Edit Profile</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Profile Image Input */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-slate-100 overflow-hidden border-4 border-slate-50 shadow-inner mb-3">
                  {user.profilePic ? (
                    <img src={user.profilePic} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-slate-300 font-bold">
                      {user.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Paste Profile Image URL"
                  className="text-[11px] w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400"
                  value={user.profilePic}
                  onChange={(e) => setUser({ ...user, profilePic: e.target.value })}
                />
              </div>

              {/* Name Field */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Full Name</label>
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="w-full p-2.5 border text-sm border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-50 outline-none focus:border-blue-500 transition-all mt-1"
                  required
                />
              </div>

              {/* Email (Disabled) */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Email Address</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full p-2.5 bg-slate-50 text-sm border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed mt-1"
                />
              </div>

              <div className="border-t border-slate-100 pt-4">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Verify Old Password</label>
                <input
                  type="password"
                  placeholder="Current password"
                  value={passwords.oldPassword}
                  onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 text-sm rounded-lg outline-none focus:border-blue-500 mt-1"
                  required
                />
              </div>

              {/* New Passwords Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Optional"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="w-full p-2.5 border text-sm border-slate-200 rounded-lg outline-none focus:border-blue-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Confirm New</label>
                  <input
                    type="password"
                    placeholder="Optional"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className="w-full p-2.5 border text-sm border-slate-200 rounded-lg outline-none focus:border-blue-500 mt-1"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-xl text-white font-bold shadow-lg transition-all active:scale-[0.98] flex justify-center items-center mt-2 ${
                  isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Update Profile"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Internal Style for hidden scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
      `}</style>
    </div>
  );
}

export default Page;