"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { 
  Home, FileText, Menu, X, LogOut, User, 
  History, ChevronRight, ChevronDown, 

} from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export default function MainLayout({ children, pageTitle }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const profileRef = useRef<HTMLDivElement>(null);

  const isAdmin = session?.user?.role === "admin";

  // ✨ Logic: Click Outside สำหรับทุกหน้า
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { title: "หน้าแรก", icon: <Home size={16} />, href: isAdmin ? "/dashboard" : "/user" },
    { title: "พยากรณ์", icon: <FileText size={16} />, href: "/predict" , userOnly: true},
    { title: "ประวัติการพยากรณ์", icon: <History size={16} />, href: isAdmin? "/historyadmin" : "/historyuser" },
    { title: "การจัดการระบบ", icon: <Menu size={16} />, href: "/settings" , adminOnly: true},
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* --- SIDEBAR --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full z-50 w-72 bg-white border-r border-slate-100 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-3 font-bold text-xl text-slate-800">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-blue-400 border border-slate-400 shadow-inner font-black">PD</div>
              Prediction
            </div>
            <button className="lg:hidden text-slate-400" onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
          </div>

          <nav className="flex-1 space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-4">Main Menu</p>
          
          {menuItems
            // 1. กรองออกก่อน (Filter)
            .filter(item => {
              if (item.adminOnly && !isAdmin) return false; // ถ้าเป็นเมนู Admin แต่เราไม่ใช่ Admin ไม่ต้องเอามา
              if (item.userOnly && isAdmin) return false; // ถ้าเป็นเมนู User แต่เราเป็น Admin ไม่ต้องเอามา
              return true; 
            })
            // 2. ค่อยเอาตัวที่ผ่านการกรองมาวาด (Map)
            .map((item, idx) => {
              const isActive = pathname === item.href;
              return (
                <Link key={idx} href={item.href} className={`flex items-center justify-between p-3.5 rounded-xl transition-all group ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`${isActive ? '' : 'group-hover:scale-110'} transition-transform`}>{item.icon}</span>
                    <span className="font-medium text-md">{item.title}</span>
                  </div>
                  <ChevronRight size={14} className={`${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all`} />
                </Link>
              );
            })}
        </nav>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="lg:ml-72">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-600" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
            <h2 className="text-xl lg:text-2xl font-extrabold text-slate-800">{pageTitle}</h2>
          </div>

          <div className="relative" ref={profileRef}>
            <div className="flex items-center zgap-3 p-1.5 pr-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all" onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                {session?.user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-slate-800 leading-tight">{session?.user?.email?.split('@')[0] || "User"}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{session?.user?.role || "user"}</p>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </div>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in duration-200">
                 <div className="px-4 py-3 border-b border-slate-50 mb-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">Account</p>
                    <p className="text-sm font-medium text-slate-700 truncate">{session?.user?.email}</p>
                 </div>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-3 p-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium text-sm">
                  <LogOut size={15} /> ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}