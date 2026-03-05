"use client";
import React, { useState, useEffect } from 'react';
import MainLayout from "@/components/MainLayout";
import { Eye, X, Trash2, GraduationCap, Monitor, Calendar } from "lucide-react";

export default function HistoryUserPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const itCount = data.filter(item => item.recommended_course === 'IT').length;
  const csCount = data.filter(item => item.recommended_course === 'CS').length;

  const fetchHistory = async () => {
    const email = typeof window !== 'undefined' ? localStorage.getItem("email") : null;
    if (!email) { setLoading(false); return; }
    try {
      const res = await fetch(`/api/prediction?email=${email}&role=user`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      // หน่วงเวลาเล็กน้อยให้ Transition ดูนุ่มนวล
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณต้องการลบประวัตินี้ใช่หรือไม่?")) return;
    try {
      const res = await fetch(`/api/prediction?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setData(data.filter(item => item.prediction_id !== id));
      }
    } catch (error) {
      alert("ลบไม่สำเร็จ");
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  // --- ส่วนประกอบ Skeleton Loading ---
  const SkeletonHeader = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="bg-slate-100/50 p-6 rounded-[2rem] border border-slate-100 flex items-center gap-5">
          <div className="w-14 h-14 bg-slate-200 rounded-2xl"></div>
          <div className="space-y-2">
            <div className="h-3 w-32 bg-slate-200 rounded"></div>
            <div className="h-8 w-20 bg-slate-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const SkeletonTable = () => (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-16 bg-slate-50 border-b border-slate-100"></div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
          <div className="h-4 w-24 bg-slate-100 rounded"></div>
          <div className="h-4 w-32 bg-slate-100 rounded"></div>
          <div className="h-8 w-24 bg-slate-100 rounded-lg"></div>
          <div className="h-8 w-20 bg-slate-100 rounded-full"></div>
        </div>
      ))}
    </div>
  );

  return (
    <MainLayout pageTitle="ประวัติการพยากรณ์">
      {loading ? (
        <>
          <SkeletonHeader />
          <SkeletonTable />
        </>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          
          {/* --- Summary Cards --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-all group">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                <Monitor size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">เทคโนโลยีสารสนเทศ (IT)</p>
                <h3 className="text-2xl font-black text-slate-800">{itCount} <span className="text-sm font-medium text-slate-400">ครั้ง</span></h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-all group">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <GraduationCap size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">วิทยาการคอมพิวเตอร์ (CS)</p>
                <h3 className="text-2xl font-black text-slate-800">{csCount} <span className="text-sm font-medium text-slate-400">ครั้ง</span></h3>
              </div>
            </div>
          </div>

          {/* --- Table Section --- */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">วันที่</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">ชื่อผู้ใช้งาน</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">คำตอบ</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">ผลลัพธ์</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.length > 0 ? (
                    data.map((item: any) => (
                      <tr key={item.prediction_id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-slate-600 text-sm">
                            <Calendar size={14} className="text-slate-300" />
                            {item.prediction_date ? new Date(item.prediction_date).toLocaleDateString('th-TH') : "-"}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-slate-700 text-sm font-semibold">
                          {item.user_name || "ไม่ระบุชื่อ"}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button 
                            onClick={() => setSelectedItem(item)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all text-xs font-bold border border-slate-100 shadow-sm active:scale-95"
                          >
                            <Eye size={13} /> ดูคำตอบ
                          </button>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className={`px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase border ${
                              item.recommended_course === 'CS' 
                                ? 'bg-purple-50 text-purple-600 border-purple-100' 
                                : 'bg-green-50 text-green-600 border-green-100'
                            }`}>
                              {item.recommended_course}
                            </span>
                            <button 
                              onClick={() => handleDelete(item.prediction_id)} 
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-slate-400 font-medium">ไม่พบประวัติการพยากรณ์</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal (คงเดิมตาม Logic ล่าสุดที่ต้องการ) --- */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4" 
          onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300"
             onClick={(e) => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">รายละเอียดคำตอบ</h3>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="px-8 pt-6 pb-2">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-[1.5rem] p-5 text-center shadow-inner">
                <span className="text-[12px] font-bold text-indigo-400 uppercase tracking-[0.2em]">หลักสูตรที่แนะนำ</span>
                <h2 className="text-2xl font-black text-indigo-700 mt-1">{selectedItem.recommended_course}</h2>
              </div>
            </div>
            <div className="px-8 py-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">ข้อมูลการตอบ</span>
                <div className="h-[1px] flex-1 bg-slate-100"></div>
              </div>
              <div className="space-y-3 overflow-y-auto pr-2 max-h-[260px] scrollbar-thin scrollbar-thumb-slate-200">
                {selectedItem.answer.split('|').map((ans: string, idx: number) => {
                  const dotIndex = ans.indexOf('.');
                  const content = dotIndex !== -1 ? ans.substring(dotIndex + 1).trim() : ans;
                  return (
                    <div key={idx} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex flex-col gap-1 hover:bg-white transition-colors">
                      <span className="text-[12px] font-bold text-slate-400 uppercase">ข้อที่ {idx + 1}</span>
                      <p className="text-[14px] text-slate-700 leading-relaxed font-semibold">{content}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={() => setSelectedItem(null)}
                className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}