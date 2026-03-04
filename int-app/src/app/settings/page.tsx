"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from "@/components/MainLayout";
import { 
  Settings, 
  Users,
  Save, 
  Upload, 
  Mail, 
  UserRoundPen, 
  UserPlus,
  User as UserIcon, 
  Loader2,
  Trash2,
  X
} from "lucide-react";

export default function ManageModelPage() {
  const [activeTab, setActiveTab] = useState<'model' | 'students'>('model');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  

  // ✅ 1. เพิ่ม State สำหรับ Modal และข้อมูลนักศึกษาใหม่
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ student_id: '', user_name: '', email: '' });

  const [selectedModel, setSelectedModel] = useState('Random Forest');
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const toggleFactor = (factor: string) => {
    setSelectedFactors(prev => 
      prev.includes(factor) ? prev.filter(f => f !== factor) : [...prev, factor]
    );
  };  const handleSaveSettings = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
      const res = await fetch('/api/prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'updateSettings', // นี่คือ "โหมด" ให้ใส่เครื่องหมาย ' ' ครอบไว้
          modelName: selectedModel,
          factors: selectedFactors,
          fileName: "training_data.csv"
          }),
        });

   if (res.ok) {
        alert("บันทึกการตั้งค่าโมเดลสำเร็จแล้ว!");
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (error) {
      console.error(error);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
};

  // ฟังก์ชันดึงข้อมูลนักศึกษาจาก DB
  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents();
    }
  }, [activeTab]);

  const fetchStudents = async () => {
  setLoading(true);
  try {
    // ต้องมี ?mode=getStudents เพื่อให้ตรงกับเงื่อนไขใน GET
    const res = await fetch('/api/prediction?mode=getStudents'); 
    if (res.ok) {
      const data = await res.json();
      setStudents(data); // ข้อมูลจะเด้งเข้าสู่ State และแสดงบน Card ทันที
    }
  } catch (error) {
    console.error("Failed to fetch:", error);
  } finally {
    setLoading(false);
  }
};

  // ✅ 2. ฟังก์ชันบันทึกนักศึกษาใหม่
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode: 'addUser', 
          ...newStudent 
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewStudent({ student_id: '', user_name: '', email: '' });
        fetchStudents(); // โหลดข้อมูลใหม่มาแสดงทันที
      } else {
        const err = await res.json();
        alert(err.error || "บันทึกไม่สำเร็จ");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  return (
    <MainLayout pageTitle="การจัดการระบบ (Admin)">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* --- Tab Navigation --- */}
        <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('model')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'model' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Settings size={20} />
            ปรับปรุงแบบจำลองพยากรณ์
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'students' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users size={20} />
            ข้อมูลนักศึกษา
          </button>
        </div>

        {/* --- Tab Content: Update Model --- */}
        {activeTab === 'model' && (
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <Settings className="text-indigo-500" /> ปรับปรุงข้อมูลพยากรณ์
            </h2>
            
            <form className="space-y-8" onSubmit={handleSaveSettings}>
              <div>
                <label className="block mb-3 font-bold text-slate-700">เลือกโมเดลที่ใช้</label>
              <select 
                value={selectedModel} // ✅ ผูกค่ากับ State
                onChange={(e) => setSelectedModel(e.target.value)} // ✅ อัปเดตเมื่อเปลี่ยน
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 transition-all"
              >
                <option value="Random Forest">Random Forest</option>
                <option value="Decision Tree">Decision Tree</option>
                <option value="KNN">KNN</option>
                <option value="SVM">SVM</option>
              </select>
            </div>

              <div>
                <label className="block mb-3 font-bold text-slate-700">เลือกปัจจัยที่ใช้พยากรณ์</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['เกรดเฉลี่ย', 'ความสนใจด้านเทคโนโลยี', 'ตำแหน่งงานที่สนใจ', 'ประสบการณ์โปรแกรมมิ่ง'].map((factor) => (
                    <label key={factor} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-indigo-100 cursor-pointer transition-all">
                      <input type="checkbox" 
                      className="w-5 h-5 accent-indigo-600" 
                      checked={selectedFactors.includes(factor)}                      
                      onChange={() => toggleFactor(factor)}
                      />
                      <span className="font-semibold text-slate-600">{factor}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-6 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
                <label className="block mb-2 font-bold text-slate-700">อัปโหลดข้อมูล Training ใหม่</label>
                <div className="flex items-center gap-4">
                  <input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
                </div>
              </div>

              <button
                type="submit"
                onClick={handleSaveSettings}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl shadow-lg shadow-indigo-200 text-lg font-bold transition-all transform hover:scale-[1.02]">
                <Save size={20} /> บันทึกการตั้งค่า
              </button>
            </form>
          </div>
        )}

        {/* --- Tab Content: Student Info --- */}
        {activeTab === 'students' && (
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* --- Header & Add Student Button --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <Users className="text-indigo-500" /> รายชื่อและโปรไฟล์นักศึกษา
                </h2>
                <p className="text-slate-400 text-sm font-bold mt-1 uppercase tracking-tight">Management & Student Profiles</p>
              </div>
              
              <button 
                onClick={() => setShowAddModal(true)} 
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all hover:scale-105 active:scale-95"
              >
                <UserPlus size={20} />
                เพิ่มนักศึกษาใหม่
              </button>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-slate-300" size={40} /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {students.map((student) => (
                  <div key={student.student_id} className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600 transition-colors">
                        <UserRoundPen size={16} />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-start gap-5">
                      <div className="relative">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors">
                          <UserIcon size={32} />
                        </div>
                        <span className="absolute -bottom-2 -left-2 bg-indigo-100 text-indigo-600 text-[10px] font-black px-2.5 py-1 rounded-lg border-2 border-white shadow-sm uppercase tracking-tighter">
                          Student
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-slate-800 text-lg truncate mb-1">
                          {student.user_name || "ไม่ระบุชื่อ"}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-500 mb-2">
                          <Mail size={14} className="shrink-0 text-slate-300" />
                          <span className="text-sm font-medium truncate ">{student.email}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">ID: {student.student_id}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && students.length === 0 && (
              <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                  <Users className="mx-auto text-slate-200 mb-4" size={48} />
                  <p className="text-slate-400 font-bold">ไม่พบรายชื่อนักศึกษาในระบบ</p>
              </div>
            )}
          </div>
        )}

        {/* --- ✅ 3. Modal เพิ่มนักศึกษาใหม่ (วางไว้ท้ายสุดของ Component) --- */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-200">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800">เพิ่มนักศึกษาใหม่</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddStudent} className="p-8 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">รหัสนักศึกษา</label>
                  <input required type="text" placeholder="เช่น 655021000..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500"
                    value={newStudent.student_id} onChange={(e) => setNewStudent({...newStudent, student_id: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">ชื่อนักศึกษา</label>
                  <input required type="text" placeholder="กรอกชื่อนักศึกษา" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500"
                    value={newStudent.user_name} onChange={(e) => setNewStudent({...newStudent, user_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">อีเมลนักศึกษา</label>
                  <input required type="email" placeholder="example@mail.rmutk.ac.th" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500"
                    value={newStudent.email} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} />
                </div>
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 flex items-center justify-center gap-2 mt-4">
                  <Save size={20} /> บันทึกข้อมูลนักศึกษา
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}