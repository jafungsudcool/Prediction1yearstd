"use client";
import React, { useState, useEffect, useMemo } from 'react';
import MainLayout from "@/components/MainLayout";
import { Loader2, Trash2, X, Mail, Eye, Search, Filter, RotateCcw, Calendar,Users } from "lucide-react";

export default function HistoryAdminPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  
  // States สำหรับ Search และ Filter
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

  // ✅ ระบบค้นหาและกรองข้อมูล (ใช้ useMemo เพื่อประสิทธิภาพ)
  const filteredGroupedData = useMemo(() => {
    // กรองข้อมูลดิบก่อนจัดกลุ่ม
    const filteredRaw = data.filter(item => {
      const email = `${item.student_id}@mail.rmutk.ac.th`.toLowerCase();
      const matchesSearch = email.includes(searchTerm.toLowerCase());
      const matchesCourse = filterCourse === "" || item.recommended_course === filterCourse;
      return matchesSearch && matchesCourse;
    });

    // จัดกลุ่มข้อมูลที่กรองแล้ว
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
      
      {/* --- ส่วน Search & Filter ดีไซน์ใหม่ --- */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Filter size={20} />
          </div>
          <h3 className="text-md font-bold text-slate-800">ค้นหาและกรองข้อมูลนักศึกษา</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาด้วยอีเมลนักศึกษา..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 focus:bg-white transition-all font-medium text-slate-600"
            />
          </div>

          <div className="md:col-span-4">
            <select 
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 focus:bg-white transition-all font-medium text-slate-600 appearance-none"
            >
              <option value="">ทุกหลักสูตร (All Courses)</option>
              <option value="CS">วิทยาการคอมพิวเตอร์ (CS)</option>
              <option value="IT">เทคโนโลยีสารสนเทศ (IT)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button 
              onClick={handleReset}
              className="w-full h-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all active:scale-95 cursor-pointer shadow-sm shadow-slate-200"
            >
              <RotateCcw size={18} /> รีเซ็ต
            </button>
          </div>
        </div>
      </div>

      {/* --- ตารางข้อมูลหลัก --- */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-700 delay-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="border-b border-slate-50">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">นักศึกษา (อีเมล)</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">จำนวนครั้งที่พยากรณ์</th>
                <th className="px-17 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
            {loading ? (
              // ✅ 1. ส่วน Loading: ใช้ Icon แบบ Skeleton (สีเทาจางๆ)
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <Users size={20} className="text-slate-200" strokeWidth={2.5} />
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-slate-100 rounded-lg"></div>
                        <div className="h-3 w-24 bg-slate-50 rounded-md"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="h-6 w-16 bg-slate-50 rounded-xl mx-auto"></div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="h-10 w-28 bg-slate-100 rounded-xl ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : Object.values(filteredGroupedData).length > 0 ? (
              // ✅ 2. ข้อมูลจริง: เปลี่ยนจากตัวอักษรเป็น Icon User แบบทันสมัย
              Object.values(filteredGroupedData).map((user: any) => (
                <tr 
                  key={user.email} 
                  className="hover:bg-slate-50/50 transition-all group animate-in fade-in duration-500"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 shadow-sm transition-all duration-300">
                        <Users size={20} strokeWidth={2.5} />
                      </div>
                      <div>
                       
                        <p className="text-[13px] font-bold text-slate-400 uppercase tracking-tight">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      {user.count} ครั้ง
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => handleOpenUserHistory(user.email, user.items)} 
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <Eye size={13} /> รายละเอียด
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              // ✅ 3. กรณีไม่พบข้อมูล
              <tr>
                <td colSpan={3} className="py-24 text-center animate-in fade-in duration-300">
                  <div className="flex flex-col items-center gap-3 opacity-20">
                    <Users size={48} />
                    <p className="text-sm font-bold">ไม่พบข้อมูลรายชื่อนักศึกษา</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </div>

      {/* --- ✅ Modal แสดงประวัติพร้อมลำดับและผลลัพธ์ --- */}
      {selectedUserEmail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedUserEmail(null)}>
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-5xl w-full overflow-hidden animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Mail size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-800">ประวัติของนักศึกษา</h3>
                    <p className="text-sm text-slate-400 font-medium">{selectedUserEmail}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUserEmail(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={24} /></button>
            </div>

            <div className="p-8 max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
              <div className="space-y-6">
                {userHistory.map((item, idx) => (
                  <div key={item.prediction_id} className="bg-slate-50/50 rounded-[2rem] border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 bg-white border-b border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-black">
                          {idx + 1}
                        </span>
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold italic">
                          <Calendar size={14} />
                          {new Date(item.prediction_date).toLocaleDateString('th-TH', { 
                            day: '2-digit', month: 'long', year: 'numeric'
                          })}
                        </div>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full font-black text-[14px] tracking-widest uppercase border shadow-sm ${
                        item.recommended_course === 'CS' 
                          ? 'bg-purple-50 text-purple-600 border-purple-100' 
                          : 'bg-green-50 text-green-600 border-green-100'
                      }`}>
                        ผลลัพธ์: {item.recommended_course}
                      </span>
                    </div>
                    
  {/* --- ส่วนแสดงรายละเอียดคำถาม-คำตอบ (String Parsing Logic) --- */}
  <div className="p-8 bg-white">

    {/* --- ส่วนแสดงรายละเอียดคำถาม-คำตอบ (Compact Version) --- */}
  <div className="p-4 bg-white"> {/* ลด padding รอบนอกลง */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"> {/* ลดช่องว่างระหว่างกล่องจาก 6 เหลือ 4 */}
      {item.answer?.split('|').map((ans: string, aIdx: number) => {
        const parts = ans.split(':');
        const rawQuestion = parts.length > 1 ? parts[0].trim() : `คำถามที่ ${aIdx + 1}`;
        const answer = parts.length > 1 ? parts[1].trim() : parts[0].trim();
        const cleanQuestion = rawQuestion.replace(/^\d+[\.\s\d\.]*/, '').trim();

        return (
          <div 
            key={aIdx} 
            className="group bg-white p-4 rounded-[1.8rem] border border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-center cursor-default"
          >
            <div className="space-y-2">
              
              {/* หัวข้อคำถาม: แสดงเลขข้อจุดเดียวแบบ Clean */}
              <div className="flex items-start gap-2">
                <span className="text-indigo-600 font-black text-[10px] uppercase tracking-wider leading-none mt-0.5">
                  {aIdx + 1}.
                </span>
                <span className="text-slate-400 font-bold text-[13px] uppercase tracking-wide leading-tight">
                  {cleanQuestion}
                </span>
              </div>
              
                {/* กล่องคำตอบ: เน้น Hover ด้วยสี Indigo จางๆ ให้ดูคุมโทน */}
                <div className="bg-slate-50/80 group-hover:bg-indigo-50/50 border border-transparent group-hover:border-indigo-100 px-4 py-2.5 rounded-[1.2rem] transition-all duration-300 shadow-inner group-hover:shadow-none">
                  <p className="text-[14px] font-black text-slate-700 group-hover:text-indigo-700 leading-snug transition-colors">
                    {answer}
                  </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>

                    <div className="px-6 py-3 bg-slate-100/50 flex justify-end">
                       <button 
                        onClick={() => handleDelete(item.prediction_id)}
                        className="flex items-center gap-1.5 text-[12px] font-bold text-red-400 hover:text-red-600 transition-colors cursor-pointer active:scale-95"
                       >
                         <Trash2 size={12} /> ลบบันทึกนี้
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 text-right">
              <button 
                onClick={() => setSelectedUserEmail(null)} 
                className="px-8 py-3 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                ปิดหน้าต่างประวัติ
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}