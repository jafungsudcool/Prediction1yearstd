

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
        setLoading(false);
      }
    };
    fetchAdminDashboardData();
  }, []);

   const stats = [
    { 
      title: "ผู้ใช้งานทั้งหมด", 
      value: dbData?.totalUsers?.toString() || "0",
      unit: "คน",
      icon: <Users size={20} />, 
      color: "bg-blue-600" 
    },
    { 
      title: "การพยากรณ์ทั้งหมด", 
      value: dbData?.totalPredictions?.toString() || "0",
      unit: "ครั้ง",
      icon: <BarChart3 size={20} />, 
      color: "bg-indigo-600" 
    },
    { 
      title: "ความแม่นยำของแบบจำลอง", 
      value: "87",
      unit: "%",
      icon: <BadgePercent size={20} />, 
      color: "bg-emerald-600" 
    },
  ];


  const SkeletonLoader = () => (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-100/50 p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-200"></div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-200 rounded"></div>
              <div className="h-6 w-14 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="h-[300px] bg-slate-100 rounded-3xl"></div>
        <div className="h-[300px] bg-slate-100 rounded-3xl"></div>
      </div>
    </div>
  );

  return (
    <MainLayout pageTitle="แดชบอร์ดผู้ดูแลระบบ">
      {loading ? (
        <SkeletonLoader />
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
          
          {/* --- Stats Cards (Fixed Font to match User Page) --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-100`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-lg font-black text-slate-900 leading-none mt-1">
                    {stat.value} <span className="text-[10px] font-medium text-slate-400">{stat.unit}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-md font-black text-slate-800 tracking-tight">กิจกรรมล่าสุด</h3>
                <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[10px] font-bold border border-slate-100">Update ล่าสุด</span>
              </div>
              
              <div className="space-y-3 flex-1 scrollbar-thin scrollbar-thumb-slate-200 max-h-[350px] overflow-y-auto pr-1">
                {dbData?.recentActivities && dbData.recentActivities.length > 0 ? (
                  dbData.recentActivities.map((item: any) => (
                    <div key={item.prediction_id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center border border-slate-100 text-slate-400 group-hover:text-indigo-600 transition-colors hover:shadow">
                          <Users size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-700 text-xs group-hover:text-indigo-600 transition-colors">
                            {item.student_id || "ไม่ทราบรหัส"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">
                            {new Date(item.prediction_date).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-lg font-black text-[10px] border ${
                        item.recommended_course === 'CS' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {item.recommended_course}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-10 opacity-30">
                    <LayoutDashboard size={40} className="mb-2" />
                    <p className="text-xs font-bold">ยังไม่พบประวัติกิจกรรม</p>
                  </div>
                )}
              </div>
            </div>

             {/* สรุปภาพรวม (ด้านขวา) */}
            <div className="flex flex-col gap-6">
               <div className="bg-gradient-to-br from-indigo-500 to-blue-700 p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl shadow-blue-200">
                  <div className="relative z-10">
                    <LayoutDashboard className="text-blue-200 mb-4" size={30} />
                    <h3 className="text-lg font-black mb-4 leading-tight tracking-tight">
                      สรุปสถิติภาพรวมของระบบพยากรณ์การเลือกหลักสูตรสําหรับนักศึกษาชั้นปีที่ 1
                      สาขาวิชาวิทยาการคอมพิวเตอร์</h3>
                    <p className="text-blue-100 leading-relaxed text-sm opacity-90 mb-8">
                      จำนวนนักศึกษาที่เข้ามาพยากรณ์หลักสูตร CS และ IT รวมถึงกิจกรรมล่าสุดที่เกิดขึ้นในระบบ ช่วยให้เห็นภาพรวมและแนวโน้มการเลือกหลักสูตรของนักศึกษาได้อย่างชัดเจน
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
               </div>

      {/* 1. สัดส่วนผลการพยากรณ์รายหลักสูตร ) */}
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