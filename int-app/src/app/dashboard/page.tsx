"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from "@/components/MainLayout";
import { Users, BarChart3, LayoutDashboard, BadgePercent,ChartNoAxesCombined,  } from "lucide-react";

export default function AdminDashboardPage() {
  const [dbData, setDbData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDashboardData = async () => {
      try {
        const res = await fetch(`/api/prediction?mode=getAdminDashboard`);        
        if (res.ok) {
          const result = await res.json();
          setDbData(result);
        }
      } catch (error) {
        console.error("Admin Dashboard Error:", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchAdminDashboardData();
  }, []);

  // คำนวณ Stats หลัก
  const stats = [
    { 
      title: "ผู้ใช้งานทั้งหมด", 
      value: dbData?.totalUsers?.toString() || "0",
      unit: "คน",
      icon: <Users size={24} />, 
      color: "bg-blue-600" 
    },
    { 
      title: "การพยากรณ์ทั้งหมด", 
      value: dbData?.totalPredictions?.toString() || "0",
      unit: "ครั้ง",
      icon: <BarChart3 size={24} />, 
      color: "bg-indigo-600" 
    },
    { 
      title: "ความแม่นยำของแบบจำลอง", 
      value: "87", // หรือใช้ (dbData?.accuracy || 87.5)
      unit: "%",
      icon: <BadgePercent size={24} />, 
      color: "bg-emerald-600" 
    },
  ];

  // --- ส่วน Skeleton Loading ---
  const SkeletonLoader = () => (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-100/50 p-6 rounded-[2rem] border border-slate-100 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-slate-200"></div>
            <div className="space-y-2">
              <div className="h-3 w-24 bg-slate-200 rounded"></div>
              <div className="h-8 w-16 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="h-[400px] bg-slate-100 rounded-[2.5rem]"></div>
        <div className="h-[400px] bg-slate-100 rounded-[2.5rem]"></div>
      </div>
    </div>
  );

  return (
    <MainLayout pageTitle="แดชบอร์ดผู้ดูแลระบบ">
      {loading ? (
        <SkeletonLoader />
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          
          {/* --- Stats Cards Section --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, idx) => (
              <div 
                key={idx} 
                className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6"
              >
                {/* ลบ hover effect และ transition ออก */}
                <div className={`${stat.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200/50`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-black text-slate-900">
                    {stat.value} <span className="text-sm font-medium text-slate-400">{stat.unit}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* กิจกรรมล่าสุด (ด้านซ้าย) */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">กิจกรรมล่าสุด</h3>
                <span className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full text-xs font-bold border border-slate-100">
                  Update ล่าสุด
                </span>
              </div>
              
              <div className="space-y-4 flex-1">
                {dbData?.recentActivities && dbData.recentActivities.length > 0 ? (
                  dbData.recentActivities.map((item: any) => (
                    <div key={item.prediction_id} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-100 text-slate-400 group-hover:text-indigo-600 transition-colors">
                          <Users size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                            {item.student_id || "ไม่ทราบรหัส"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                            {new Date(item.prediction_date).toLocaleDateString('th-TH', { 
                               day: 'numeric', month: 'short', year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-2xl font-black text-[10px] tracking-widest uppercase border ${
                        item.recommended_course === 'CS' 
                          ? 'bg-purple-50 text-purple-600 border-purple-100' 
                          : 'bg-green-50 text-green-600 border-green-100'
                      }`}>
                        {item.recommended_course}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-10 opacity-30">
                    <LayoutDashboard size={48} className="mb-2" />
                    <p className="text-sm font-bold">ยังไม่พบประวัติกิจกรรม</p>
                  </div>
                )}
              </div>
            </div>

            {/* สรุปภาพรวม (ด้านขวา) */}
            <div className="flex flex-col gap-6">
               <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl shadow-blue-200">
                  <div className="relative z-10">
                    <LayoutDashboard className="text-blue-200 mb-4" size={40} />
                    <h3 className="text-xl font-black mb-4 leading-tight tracking-tight">
                      สรุปสถิติภาพรวมของระบบพยากรณ์การเลือกหลักสูตรสําหรับนักศึกษาชั้นปีที่ 1
                      สาขาวิชาวิทยาการคอมพิวเตอร์</h3>
                    <p className="text-blue-100 leading-relaxed text-sm opacity-90 mb-8">
                      จำนวนนักศึกษาที่เข้ามาพยากรณ์หลักสูตร CS และ IT รวมถึงกิจกรรมล่าสุดที่เกิดขึ้นในระบบ ช่วยให้เห็นภาพรวมและแนวโน้มการเลือกหลักสูตรของนักศึกษาได้อย่างชัดเจน
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
               </div>
{/* 1. สัดส่วนผลการพยากรณ์รายหลักสูตร (เพิ่มต่อจากกล่องสรุป) */}
<div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
  <div className="flex items-center gap-3 mb-6">
    <div className="p-2 bg-slate-50 text-slate-600 rounded-xl">
      <ChartNoAxesCombined size={30} />
    </div>
    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">สัดส่วนความสนใจรายหลักสูตร</h4>
  </div>

  <div className="space-y-6">
    {/* แถบ CS */}
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold text-slate-500 uppercase">Computer Science (CS)</span>
        <span className="text-sm font-black text-indigo-600">{dbData?.stats?.cs || 0} รายการ</span>
      </div>
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
          style={{ width: `${(dbData?.stats?.cs / dbData?.totalPredictions) * 100 || 0}%` }}
        ></div>
      </div>
    </div>

    {/* แถบ IT */}
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold text-slate-500 uppercase">Information Technology (IT)</span>
        <span className="text-sm font-black text-emerald-600">{dbData?.stats?.it || 0} รายการ</span>
      </div>
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
          style={{ width: `${(dbData?.stats?.it / dbData?.totalPredictions) * 100 || 0}%` }}
        ></div>
      </div>
    </div>
  </div>
</div>
               </div>
            </div>
          </div>
      )}
    </MainLayout>
  );
}