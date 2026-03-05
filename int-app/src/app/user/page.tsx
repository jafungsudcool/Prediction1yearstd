"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from "@/components/MainLayout";
import { 
  Users, 
  BarChart3, 
  Clock, 
  ArrowUpRight,
} from "lucide-react";

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
        // เพิ่มดีเลย์เล็กน้อยเพื่อให้ Transition ดูนุ่มนวลขึ้น (เลือกใส่หรือไม่ก็ได้)
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const stats = [
    { 
      title: "จำนวนเข้าใช้งานทั้งหมด", 
      value: dbData?.totalUsers?.toString() || "0",
      icon: <Users size={20} />, 
      color: "bg-blue-500" 
    },
    { 
      title: "แบบสอบถามที่ทำแล้ว", 
      value: dbData?.myTotal || "0",
      icon: <BarChart3 size={20} />, 
      color: "bg-indigo-500" 
    },
    { 
      title: "ค่าเฉลี่ยความแม่นยำ", 
      value: "87%", 
      icon: <ArrowUpRight size={20} />, 
      color: "bg-emerald-500" 
    },
  ];

  // --- ส่วน Skeleton Loading (แสดงตอนกำลังโหลด) ---
  const SkeletonLoader = () => (
    <div className="space-y-8 animate-pulse">
      {/* Stats Skeleton */}
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
        {/* Activity Skeleton */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100">
          <div className="h-6 w-40 bg-slate-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-full bg-slate-50 rounded-2xl"></div>
            ))}
          </div>
        </div>
        {/* Card Skeleton */}
        <div className="h-[300px] w-full bg-slate-200 rounded-[2.5rem]"></div>
      </div>
    </div>
  );

  return (
    <MainLayout pageTitle="แดชบอร์ดผู้ใช้งาน">
      {loading ? (
        <SkeletonLoader />
      ) : (
        <div className="space-y-8 animate-in fade-in duration-700">
          
          {/* --- Stats Grid --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                <div className={`${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">{stat.title}</p>
                  <p className="text-xl font-black text-slate-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* --- ข้อมูลส่วนกลาง --- */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            
            {/* ส่วนกิจกรรมล่าสุด */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-extrabold text-slate-800">การพยากรณ์ล่าสุด</h3>
                <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase">ประวัติการใช้งาน</span>
              </div>
              <div className="space-y-4">
                {dbData?.myRecent?.length > 0 ? (
                   dbData.myRecent.map((item: any) => (
                    <div key={item.prediction_id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-200 group-hover:border-indigo-200 transition-colors">
                          <Clock size={18} className="text-slate-400 group-hover:text-indigo-500" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{localStorage.getItem("email")?.split('@')[0]}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(item.prediction_date).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                      </div>
                      <span className={`px-4 py-1.5 rounded-xl font-bold text-xs shadow-sm ${
                        item.recommended_course === 'CS' ? 'bg-white text-indigo-600 border border-indigo-100' : 'bg-white text-emerald-600 border border-emerald-100'
                      }`}>
                        {item.recommended_course}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-400 text-sm">ยังไม่มีข้อมูลการพยากรณ์</div>
                )}
              </div>
            </div>
      
      {/* กล่องข้อความต้อนรับ/ประกาศ */}
               <div className="bg-gradient-to-br from-indigo-500 to-blue-700 p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl shadow-blue-200">
                  <div className="relative z-10">
                  <h3 className="text-xl font-black mb-4 leading-tight">
                   สรุปสถิติภาพรวมของระบบพยากรณ์การเลือกหลักสูตรสําหรับนักศึกษาชั้นปีที่ 1
                      สาขาวิชาวิทยาการคอมพิวเตอร์
                  </h3>
                  <p className="text-slate-300 leading-relaxed text-md opacity-80">
                    หลักสูตรวิทยาการคอมพิวเตอร์ (CS) มุ่งเน้นการพัฒนาทักษะการเขียนโปรแกรมและการวิเคราะห์เชิงลึก 
                    ในขณะที่เทคโนโลยีสารสนเทศ (IT) เน้นการประยุกต์ใช้เทคโนโลยีในการแก้ปัญหาทางธุรกิจและการจัดการข้อมูล
                  </p>
               </div>
               
               {/* กราฟิกตกแต่ง */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>
            </div>

          </div>
        </div>
      )}
    </MainLayout>
  );
}