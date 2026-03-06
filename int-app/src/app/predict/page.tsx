"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from "@/components/MainLayout";
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react"; // ใช้งาน Session
import { BrainCircuit } from "lucide-react";

// ================= KNN CONFIG (คงเดิม) =================
const trainData = [
  { x: [4, 3.5, 1, 3, 1], label: "CS" },
  { x: [3, 2.5, 0, 1, 7], label: "IT" },
  { x: [3.5, 3, 1, 2, 2], label: "IT" },
  { x: [4, 4, 1, 4, 1], label: "CS" },
  { x: [2, 2, 0, 0, 8], label: "IT" },
  { x: [3.5, 3.5, 1, 3, 5], label: "CS" },
];

const gradeMap: Record<string, number> = { "A": 4, "B+": 3.5, "B": 3, "C+": 2.5, "C": 2, "D+": 1.5, "D": 1 };
const understandMap: Record<string, number> = { "มากที่สุด": 4, "มาก": 3, "ปานกลาง": 2, "น้อย": 1, "ไม่เข้าใจเลย": 0 };
const jobMap: Record<string, number> = { 
  "Data Scientist": 0, "AI Innovator": 1, "Software Developer": 2, 
  "Cyber Security Analyst": 3, "UX UI Designer": 4, "DevOps Engineer": 5, 
  "Tester / QA": 6, "IT Support / Administrator": 7, "ยังไม่แน่ใจ": 8 
};

const distance = (a: number[], b: number[]) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));

const PredictPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession(); // ดึงสถานะการ Login
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [predictionResult, setPredictionResult] = useState<{ type: string, message: string, code: 'CS' | 'IT' } | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [user, setUser] = useState({ email: "", name: "", role: "" });
  const [dbName, setDbName] = useState("");
  const [initialLoading, setInitialLoading] = useState(true); 
  
  useEffect(() => {
    const initPage = async () => {
      // 1. ตรวจสอบสถานะการโหลด Session
      if (status === "loading") return;

      // 2. ถ้าไม่ได้ Login ให้เด้งไปหน้าแรก
      if (status === "unauthenticated") {
        alert("กรุณาเข้าสู่ระบบก่อนใช้งาน");
        router.push("/");
        return;
      }

      // 3. ถ้า Login แล้ว ให้ใช้ข้อมูลจาก Session เป็นหลัก (เสถียรกว่า localStorage)
      if (status === "authenticated" && session?.user?.email) {
        const userEmail = session.user.email;
        const userName = session.user.name || "";

        setUser({
          email: userEmail,
          name: userName,
          role: "user"
        });

        // ดึงชื่อจริงจาก DB มาอัปเดต UI
        try {
          const res = await fetch(`/api/prediction?email=${encodeURIComponent(userEmail)}&mode=getName`);
          if (res.ok) {
            const userData = await res.json();
            if (userData?.user_name) {
              setDbName(userData.user_name);
            }
          }
        } catch (error) {
          console.error("Error fetching name:", error);
        } finally {
          setInitialLoading(false);
        }
      }
    };
    initPage();
  }, [status, session, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value, options, selectedIndex } = e.target;
    const selectedLabel = options[selectedIndex].text;
    setFormData(prev => ({ ...prev, [name]: value, [`${name}_label`]: selectedLabel }));
  };  

  const calculateResult = (e: React.FormEvent) => {
    e.preventDefault();
    
    const requiredKeys = ['q1', 'q2', 'q3', 'q4', 'q5'];
    const isComplete = requiredKeys.every(key => formData[key] && formData[key] !== "");
    
    if (!isComplete) {
      alert("กรุณาตอบคำถามให้ครบทุกข้อ");
      return;
    }

    const q1 = gradeMap[formData.q1] || 0;
    const q2 = gradeMap[formData.q2] || 0;
    const q3 = formData.q3 === "yes" ? 1 : 0;
    const q4 = understandMap[formData.q4] || 0;
    const q5 = jobMap[formData.q5] || 0;

    const inputVector = [q1, q2, q3, q4, q5];
    const k = 3; 
    const neighbors = trainData
      .map(d => ({ label: d.label, dist: distance(d.x, inputVector) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, k);

    const vote: Record<string, number> = { CS: 0, IT: 0 };
    neighbors.forEach(n => { vote[n.label]++; });
    
    const calculatedResult: 'CS' | 'IT' = vote.CS > vote.IT ? "CS" : "IT";

    setPredictionResult({
      type: dbName || user.name || "ผู้ใช้งาน",
      code: calculatedResult,
      message: calculatedResult === "CS" ? "คุณเหมาะกับหลักสูตร วิทยาการคอมพิวเตอร์ (CS)" : "คุณเหมาะกับหลักสูตร เทคโนโลยีสารสนเทศ (IT)",
    });
    setIsModalOpen(true);
  };

  const questionsData = [
    { id: 'q1', label: '1. ผลการเรียนในวิชาระเบียบวิธีการเขียนโปรแกรม (Programming Methodology)', options: [{ label: 'A', value: 'A' }, { label: 'B+', value: 'B+' }, { label: 'B', value: 'B' }, { label: 'C+', value: 'C+' }, { label: 'C', value: 'C' }, { label: 'D+', value: 'D+' }, { label: 'D', value: 'D' }] },
    { id: 'q2', label: '2. ผลการเรียนในวิชาความน่าจะเป็นสำหรับวิทยาการคอมพิตเตอร์ (Probability for Computer Science)', options: [{ label: 'A', value: 'A' }, { label: 'B+', value: 'B+' }, { label: 'B', value: 'B' }, { label: 'C+', value: 'C+' }, { label: 'C', value: 'C' }, { label: 'D+', value: 'D+' }, { label: 'D', value: 'D' }] },
    { id: 'q3', label: '3. เคยเรียนเขียนโปรแกรมมาก่อนหรือไม่', options: [{ label: 'ใช่ เคยเรียน', value: 'yes' }, { label: 'ไม่เคยเรียน', value: 'no' }] },
    { id: 'q4', label: '4. มีความรู้เกี่ยวกับความแตกต่างของหลักสูตร CS และ IT มากแค่ไหน', options: [{ label: 'มากที่สุด', value: 'มากที่สุด' }, { label: 'มาก', value: 'มาก' }, { label: 'ปานกลาง', value: 'ปานกลาง' }, { label: 'น้อย', value: 'น้อย' }, { label: 'ไม่เข้าใจเลย', value: 'ไม่เข้าใจเลย' }] },
    { id: 'q5', label: '5. คุณสนใจที่จะทำงานในตำแหน่งใด', options: [{ label: "Data Scientist", value: "Data Scientist" }, { label: "AI Innovator", value: "AI Innovator" }, { label: "Software Developer", value: "Software Developer" }, { label: "Cyber Security Analyst", value: "Cyber Security Analyst" }, { label: "UX UI Designer", value: "UX UI Designer" }, { label: "DevOps Engineer", value: "DevOps Engineer" }, { label: "Tester / QA", value: "Tester / QA" }, { label: "IT Support / Administrator", value: "IT Support / Administrator" }, { label: "ยังไม่แน่ใจ", value: "ยังไม่แน่ใจ" }] },
  ];

  const saveAndRedirect = async () => {
    // ดึง Email จาก Session เป็นที่ตั้ง
    const finalEmail = session?.user?.email || user.email;

    if (!finalEmail) {
      alert("ไม่พบข้อมูล Email ในระบบ กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
      router.push("/");
      return;
    }

    const studentIdOnly = finalEmail.split('@')[0];
    const finalName = dbName || user.name || studentIdOnly || "ผู้ใช้งาน";

    const summaryAnswer = questionsData.map((q, idx) => {
      const answerLabel = formData[`${q.id}_label`] || formData[q.id] || "ไม่ได้ตอบ";
      return `${idx + 1}. ${q.label}: ${answerLabel}`;
    }).join(" | ");

    const payload = {
      email: finalEmail,
      student_id: studentIdOnly,
      name: finalName,
      answer: summaryAnswer,
      result: predictionResult?.code,
      mode: "savePrediction"
    };

    try {
      const response = await fetch("/api/prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsModalOpen(false);
        router.push("/historyuser"); 
      } else {
        const err = await response.json();
        alert(`บันทึกไม่สำเร็จ: ${err.error || "Server Error"}`);
      }
    } catch (error) {
      alert("ไม่สามารถเชื่อมต่อฐานข้อมูลได้");
    }
  };

  const SkeletonForm = () => (
    <div className="space-y-8 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="space-y-3">
          <div className="h-6 w-3/4 bg-slate-200 rounded-lg"></div>
          <div className="h-14 w-full bg-slate-100 rounded-2xl"></div>
        </div>
      ))}
      <div className="h-16 w-full bg-blue-100 rounded-2xl"></div>
    </div>
  );

  return (
    <MainLayout pageTitle="พยากรณ์แนะนำหลักสูตร">
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 lg:p-8 transition-all">
        {initialLoading ? (
          <SkeletonForm />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <form onSubmit={calculateResult} className="space-y-8">
              <div className="space-y-6">
                {questionsData.map((q) => (
                  <Question 
                    key={q.id} 
                    id={q.id} 
                    label={q.label} 
                    options={q.options} 
                    onChange={handleInputChange} 
                  />
                ))}
              </div>
              <button 
                type="submit" 
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-md font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                วิเคราะห์ผลลัพธ์
              </button>
            </form>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all"
            onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}>
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <BrainCircuit size={35} />
            </div>
            <h2 className="text-md font-black text-slate-800 text-center mb-2">
               วิเคราะห์ผลสำเร็จ
            </h2>            
            <p className="text-slate-500 text-center text-md mb-8 px-4 leading-relaxed">
                คุณ <span className="text-blue-600 font-bold">{dbName || user.name || "ผู้ใช้งาน"}</span> {predictionResult?.message}
            </p>
            <div className="flex flex-col gap-3">
                <button 
                    onClick={saveAndRedirect} 
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200 cursor-pointer flex items-center justify-center gap-2"
                >
                    บันทึกข้อมูลและดูประวัติ
                </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

const Question = ({ id, label, options, onChange }: any) => (
  <div className="space-y-3 group">
    <label className="block text-md font-bold text-slate-700 group-focus-within:text-blue-600 transition-colors">
      {label}
    </label>
    <select 
      id={id} 
      name={id} 
      required 
      onChange={onChange} 
      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-400 focus:bg-white transition-all appearance-none cursor-pointer font-medium text-slate-600"
    >
  
      <option value="">เลือกคำตอบ...</option>
      {options.map((opt: any, i: number) => (
        <option key={i} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

export default PredictPage;