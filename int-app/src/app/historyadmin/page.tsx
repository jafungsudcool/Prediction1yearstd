"use client";
import React, { useState, useEffect, useMemo } from 'react';
import MainLayout from "@/components/MainLayout";
import { Loader2, Trash2, X, Mail, Eye, Search, Filter, RotateCcw, Calendar, Users, ChevronDown } from "lucide-react";

export default function HistoryAdminPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("");

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const res = await fetch(`/api/prediction?role=admin`);
      if (res.ok) setData(await res.json());
    } finally { setLoading(false); }
  };

  const filteredGroupedData = useMemo(() => {
    const filteredRaw = data.filter(item => {
      const email = `${item.student_id}@mail.rmutk.ac.th`.toLowerCase();
      const matchesSearch = email.includes(searchTerm.toLowerCase());
      const matchesCourse = filterCourse === "" || item.recommended_course === filterCourse;
      return matchesSearch && matchesCourse;
    });

    return filteredRaw.reduce((acc: any, current: any) => {
      const email = `${current.student_id}@mail.rmutk.ac.th`;
      if (!acc[email]) {
        acc[email] = { email, count: 0, lastDate: current.prediction_date, items: [] };
      }
      acc[email].items.push(current);
      acc[email].count += 1;
      return acc;
    }, {});
  }, [data, searchTerm, filterCourse]);

  const handleOpenUserHistory = (email: string, items: any[]) => {
    setSelectedUserEmail(email);
    setUserHistory(items);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณต้องการลบประวัตินี้ใช่หรือไม่?")) return;
    try {
      const res = await fetch(`/api/prediction?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setData(data.filter(item => item.prediction_id !== id));
        setUserHistory(userHistory.filter(item => item.prediction_id !== id));
      }
    } catch (error) {
      alert("ลบไม่สำเร็จ");
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilterCourse("");
  };

  return (
    <MainLayout pageTitle="จัดการประวัติพยากรณ์ (Admin)">
      
      {/* --- ส่วน Search & Filter (Compact Version) --- */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Filter size={16} />
          </div>
          <h3 className="text-sm font-bold text-slate-700">ค้นหาและกรองข้อมูล</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="ค้นหาด้วยอีเมลนักศึกษา..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all text-sm font-medium text-slate-600"
            />
          </div>

          <div className="md:col-span-4 relative group">
            <select 
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-all text-sm font-medium text-slate-600 appearance-none cursor-pointer"
            >
              <option value="">ทุกหลักสูตร (All Courses)</option>
              <option value="CS">วิทยาการคอมพิวเตอร์ (CS)</option>
              <option value="IT">เทคโนโลยีสารสนเทศ (IT)</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-indigo-500">
              <ChevronDown size={16} />
            </div>
          </div>

          <div className="md:col-span-2">
            <button 
              onClick={handleReset}
              className="w-full h-full py-2.5 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all text-sm"
            >
              <RotateCcw size={14} /> รีเซ็ต
            </button>
          </div>
        </div>
      </div>

      {/* --- ตารางข้อมูลหลัก (Slim Version) --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">นักศึกษา (อีเมล)</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">พยากรณ์</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-10 w-48 bg-slate-100 rounded-lg"></div></td>
                  <td className="px-6 py-4"><div className="h-6 w-12 bg-slate-50 rounded-lg mx-auto"></div></td>
                  <td className="px-6 py-4"><div className="h-8 w-24 bg-slate-100 rounded-lg ml-auto"></div></td>
                </tr>
              ))
            ) : Object.values(filteredGroupedData).length > 0 ? (
              Object.values(filteredGroupedData).map((user: any) => (
                <tr key={user.email} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                        <Users size={16} strokeWidth={2.5} />
                      </div>
                      <p className="text-xs font-bold text-slate-500 truncate max-w-[200px]">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-black">
                      {user.count} ครั้ง
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleOpenUserHistory(user.email, user.items)} 
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-[11px] font-bold hover:bg-indigo-600 transition-all active:scale-95"
                    >
                      <Eye size={12} /> รายละเอียด
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-20 text-center opacity-20">
                  <Users size={40} className="mx-auto mb-2" />
                  <p className="text-xs font-bold">ไม่พบข้อมูลรายชื่อนักศึกษา</p>
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ✅ Modal (Compact & Better Scroll) --- */}
      {selectedUserEmail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedUserEmail(null)}>
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-4xl w-full overflow-hidden animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Mail size={20} /></div>
                <div>
                    <h3 className="text-md font-black text-slate-800 leading-none mb-1">ประวัติของนักศึกษา</h3>
                    <p className="text-xs text-slate-400 font-medium">{selectedUserEmail}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUserEmail(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 bg-slate-50/30">
              {userHistory.map((item, idx) => (
                <div key={item.prediction_id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 bg-white border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
                        <Calendar size={12} />
                        {new Date(item.prediction_date).toLocaleDateString('th-TH')}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg font-black text-[11px] border ${
                      item.recommended_course === 'CS' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-green-50 text-green-600 border-green-100'
                    }`}>
                      {item.recommended_course}
                    </span>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {item.answer?.split('|').map((ans: string, aIdx: number) => {
                        const parts = ans.split(':');
                        const question = parts.length > 1 ? parts[0].trim().replace(/^\d+[\.\s\d\.]*/, '') : `ข้อที่ ${aIdx + 1}`;
                        const answer = parts.length > 1 ? parts[1].trim() : parts[0].trim();
                        return (
                          <div key={aIdx} className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 transition-hover hover:border-indigo-200">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 truncate">{aIdx+1}. {question}</p>
                            <p className="text-[12px] font-black text-slate-700 leading-tight">{answer}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="px-5 py-2 bg-slate-50/50 flex justify-end">
                     <button onClick={() => handleDelete(item.prediction_id)} className="flex items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-600">
                       <Trash2 size={10} /> ลบประวัตินี้
                     </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-slate-100 text-right">
              <button onClick={() => setSelectedUserEmail(null)} className="px-6 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 active:scale-95 shadow-md">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}