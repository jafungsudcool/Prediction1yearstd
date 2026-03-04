"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { User, LogOut, ChevronDown } from "lucide-react";

export function Header() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 relative">
      <h2 className="text-xl font-bold text-slate-800">สถิติการวิเคราะห์ภาพรวม</h2>

      {/* PROFILE SECTION WITH DROPDOWN */}
      <div className="relative">
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <User size={20} />
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-bold text-slate-800 leading-none">{session?.user?.email?.split('@')[0] || "655021000014"}</p>
            <p className="text-xs text-slate-500 capitalize">{session?.user?.role || "Guest"}</p>
          </div>
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* DROPDOWN MENU */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}