"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { 
  Home, 
  PieChart, 
  Menu, 
  X, 
  LogOut, 
  User, 
  Settings,
  ChevronRight,
  ChevronDown
} from "lucide-react";

export default function SidebarWithHeader() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const menuItems = [
    
    { 
    title: "หน้าแรก", 
    icon: <Home size={20} />, 
    href: isAdmin ? "/dashboard" : "/user" 
  },
  { 
    title: "แบบสอบถาม", 
    icon: <PieChart size={20} />, 
    href: "/questionnaire"
  },
  { 
    title: "ประวัติการพยากรณ์", 
    icon: <Settings size={20} />, 
    href: isAdmin ? "/historyadmin" : "/historyuser" 
  },
  ];

  return (
    <>
      {/* --- 1. HEADER (ฝั่งขวาบน) --- */}
      <header className="fixed top-0 right-0 left-0 lg:left-72 h-20 bg-white border-b border-gray-100 z-30 flex items-center justify-between px-6 lg:px-10">
        {/* Hamburger สำหรับ Mobile */}
        <button 
          className="lg:hidden p-2 text-gray-600"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>

        <div className="hidden lg:block">
        </div>

        {/* PROFILE DROPDOWN SECTION */}
        <div className="relative">
          <div 
            className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <User size={20} />
            </div>
            <div className="hidden sm:block overflow-hidden text-left">
              <p className="text-sm font-bold text-slate-800 truncate leading-tight">
                {session?.user?.email?.split('@')[0] || "655021000014"}
              </p>
              <p className="text-xs text-slate-500 capitalize leading-tight">
                {session?.user?.role || 'User'}
              </p>
            </div>
            <ChevronDown size={16} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* DROPDOWN MENU (ปุ่ม Logout) */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-45 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 animate-in fade-in zoom-in duration-200">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-3 p-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-all cursor-pointer"
              >
                <LogOut size={20} />
                <span className="font-medium text-sm">ออกจากระบบ</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* --- 2. SIDEBAR (ฝั่งซ้าย) --- */}
      {/* Overlay สำหรับ Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-50 w-72 bg-white border-r border-gray-100
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-3 font-bold text-xl text-slate-800">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-blue-400 border border-slate-400 shadow-inner font-black">  
            PD
          </div>              
                Prediction
            </div>
            <button className="lg:hidden text-grey-400" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 space-y-1">
            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-4">Main Menu</p>
            {menuItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="flex items-center justify-between p-3.5 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="font-medium text-lg">{item.title}</span>
                </div>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
            ))}
          </nav>

          <div className="px-2 py-4">
             <p className="text-[12px] text-slate-400">© 2024 Curriculum System</p>
          </div>
        </div>
      </aside>
    </>
  );
} 