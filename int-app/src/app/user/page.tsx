"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from "@/components/MainLayout";
import { Users, BarChart3, Clock, ArrowUpRight } from "lucide-react";

export default function DashboardPage() {
  const [dbData, setDbData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const email = localStorage.getItem("email");
        const res = await fetch(`/api/prediction?mode=getUserDashboard&email=${email}`);
        if (res.ok) {
          const result = await res.json();
          setDbData(result);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const stats = [
    { title: "จำนวนเข้าใช้งานทั้งหมด", value: dbData?.totalUsers?.toString() || "0", icon: <Users size={18} />, color: "bg-blue-500" },
    { title: "แบบสอบถามที่ทำแล้ว", value: dbData?.myTotal || "0", icon: <BarChart3 size={18} />, color: "bg-indigo-500" },
    { title: "ค่าเฉลี่ยความแม่นยำ", value: "87%", icon: <ArrowUpRight size={18} />, color: "bg-emerald-500" },
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
        <div className="bg-white p-6 rounded-3xl border border-slate-100"><div className="h-6 w-32 bg-slate-200 rounded mb-4"></div><div className="space-y-3">{[1, 2, 3].map((i) => (<div key={i} className="h-14 w-full bg-slate-50 rounded-xl"></div>))}</div></div>
        <div className="h-[250px] w-full bg-slate-200 rounded-3xl"></div>
      </div>
    </div>
  );

  return (
    <MainLayout pageTitle="แดชบอร์ดผู้ใช้งาน">
      {loading ? (
        <SkeletonLoader />
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          
          {/* --- Stats Grid (Compact) --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-100`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-lg font-black text-slate-900 leading-none mt-1">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-md font-black text-slate-800">การพยากรณ์ล่าสุด</h3>
                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">ประวัติการใช้งาน</span>
              </div>
              <div className="space-y-3">
                {dbData?.myRecent?.length > 0 ? (
                   dbData.myRecent.map((item: any) => (
                    <div key={item.prediction_id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                          <Clock size={14} className="text-slate-400 group-hover:text-indigo-500" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-700 text-xs">{localStorage.getItem("email")?.split('@')[0]}</p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {new Date(item.prediction_date).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-lg font-black text-[10px] ${
                        item.recommended_course === 'CS' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {item.recommended_course}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs">ยังไม่มีข้อมูลการพยากรณ์</div>
                )}
              </div>
            </div>
      
               <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl text-white relative overflow-hidden shadow-xl shadow-blue-100">
                  <div className="relative z-10">
                  <h3 className="text-xl font-black mb-3 leading-tight">
                   สรุปสถิติภาพรวมของระบบพยากรณ์
                  </h3>
                  <p className="text-white leading-relaxed text-xs opacity-80">
                    หลักสูตรวิทยาการคอมพิวเตอร์ (CS) มุ่งเน้นการพัฒนาทักษะการเขียนโปรแกรมและการวิเคราะห์เชิงลึก 
                    ในขณะที่เทคโนโลยีสารสนเทศ (IT) เน้นการประยุกต์ใช้เทคโนโลยีในการแก้ปัญหาทางธุรกิจและการจัดการข้อมูล
                  </p>
               </div>
               <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] -mr-24 -mt-24"></div>
               <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px] -ml-24 -mb-24"></div>
            </div>

          </div>
        </div>
      )}
    </MainLayout>
  );
}