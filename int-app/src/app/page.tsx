"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const allowedDomain = "mail.rmutk.ac.th";
    if (!email.endsWith(`@${allowedDomain}`)) {
      setErrorMsg("กรุณาใช้อีเมลมหาวิทยาลัย (@mail.rmutk.ac.th) เท่านั้น");
      return;
    }

    const result = await signIn("credentials", {
      email,
      redirect: false, // ปิดการ redirect อัตโนมัติของ NextAuth
    });

    if (result?.ok) {
      localStorage.setItem("email", email);
    //  localStorage.setItem("name", user_name || "Unknown");
      // ใช้ window.location.href แทน router.push ในจังหวะนี้ 
      window.location.href = "/"; 
    } else {
      // จัดการ Error เช่น แสดง Alert ว่าอีเมลหรือรหัสผ่านผิด
      console.error(result?.error);
      alert("เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมล");
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 lg:p-8">
      {/* Container Block -  Desktop */}
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[600px]">        
        {/* LEFT SECTION: Login Form */}

        <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">             
                 Welcome to Prediction Curriculum! </h1>
    
              <p className="text-gray-500"> กรุณาเข้าสู่ระบบด้วยอีเมลมหาวิทยาลัย</p>
            </div>

            {/* GOOGLE LOGIN */}
            <button
              onClick={() => signIn("google", { callbackUrl: "/user" })}
              className="w-full border border-gray-300 px-4 py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all duration-200 text-slate-700 font-medium cursor-pointer mb-6 shadow-sm"
            >
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>

            {/* OR */}
            <div className="flex items-center gap-4 my-8">
              <div className="h-[1px] bg-gray-200 flex-1"></div>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">OR</span>
              <div className="h-[1px] bg-gray-200 flex-1"></div>
            </div>

            {/* EMAIL LOGIN */}
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2"> Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@mail.rmutk.ac.th"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 placeholder-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errorMsg && <p className="text-red-500 text-xs mt-2 font-medium">⚠️ {errorMsg}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-[0.98] cursor-pointer"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      

  {/* RIGHT SECTION: Info & Branding */}
    <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-12 text-white flex-col justify-center relative overflow-hidden">
    {/* Background Decoration */}
    <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
    <div className="absolute bottom-[-5%] left-[-5%] w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>

    <div className="relative z-10">
      <h2 className="text-2xl font-extrabold mb-6 leading-tight">
            ระบบการพยากรณ์การเลือกหลักสูตรสำหรับนักศึกษาชั้นปีที่ 1
          </h2>

          <p className="opacity-90 font-bold mb-6">
            ระบบที่ช่วยวิเคราะห์ความถนัดและความสนใจของนักศึกษา เพื่อแนะนำหลักสูตรที่เหมาะสมสำหรับนักศึกษาชั้นปีที่ 1
          </p>
        </div>
      </div>
    </div>
  </div>
  );
}

