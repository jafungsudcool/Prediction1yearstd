import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prismaGlobal = globalThis as unknown as { prisma: PrismaClient };
const prisma = prismaGlobal.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") prismaGlobal.prisma = prisma;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. โหมดเพิ่มนักศึกษา (Admin)
    if (body.mode === "addUser") {
      const { student_id, email, user_name } = body;
      if (!student_id || !email || !user_name) return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
      const newUser = await prisma.user.create({ data: { student_id, email, user_name, role: "user" } });
      return NextResponse.json(newUser, { status: 201 });
    }

    // 2. โหมดตั้งค่าโมเดล (Admin)
    if (body.mode === 'updateSettings') {
      const update = await prisma.modelSettings.upsert({
        where: { id: 'current_config' },
        update: { activeModel: body.modelName, selectedFactors: body.factors, trainingFileName: body.fileName },
        create: { id: 'current_config', activeModel: body.modelName, selectedFactors: body.factors, trainingFileName: body.fileName },
      });
      return NextResponse.json(update, { status: 201 });
    }

    // 3. ส่วนบันทึกผลการพยากรณ์ (User) - แก้ไขจุดนี้
    if (!body.email || !body.result) return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    
    const studentIdFromEmail = body.email.split('@')[0];

    // ตรวจสอบ/สร้าง User ก่อนเพื่อให้ Relation ไม่พัง
    await prisma.user.upsert({
      where: { student_id: studentIdFromEmail },
      update: { user_name: body.name, email: body.email },
      create: { student_id: studentIdFromEmail, email: body.email, user_name: body.name, role: "user" }
    });

    const newRecord = await prisma.curriculum_selection.create({
      data: {
        prediction_id: Math.random().toString(36).substring(2, 12),
        user_name: body.name || "Unknown",
        recommended_course: body.result, // รับค่า 'CS' หรือ 'IT'
        prediction_date: new Date(),
        answer: body.answer,
        user: {
          connect: { student_id: studentIdFromEmail } // เชื่อมโยงผ่าน Student ID
        }
      },
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error: any) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "ล้มเหลว", details: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const role = searchParams.get("role");
    const mode = searchParams.get("mode");

    if (mode === "getStudents") {
      return NextResponse.json(await prisma.user.findMany({ where: { role: "user" }, orderBy: { student_id: 'asc' } }));
    }
    if (mode === "getName" && email) {
      return NextResponse.json(await prisma.user.findFirst({ where: { email }, select: { user_name: true } }));
    }
    // 1. สำหรับผู้ใช้งานทั่วไป (สิ่งที่คุณมีอยู่แล้ว)
if (mode === "getUserDashboard" && email) {
  const studentId = email.split('@')[0];
  const [myTotal, myRecent, totalUsers] = await Promise.all([
    prisma.curriculum_selection.count({ where: { student_id: studentId } }),
    prisma.curriculum_selection.findMany({ where: { student_id: studentId }, take: 3, orderBy: { prediction_date: 'desc' } }),
    prisma.user.count()
  ]);
  return NextResponse.json({ myTotal, myRecent, totalUsers });
}

// 2. เพิ่มส่วนนี้: สำหรับแอดมิน (ดูภาพรวมทั้งหมด)
if (mode === "getAdminDashboard") {
  const [totalUsers, totalPredictions, recentActivities, csCount, itCount] = await Promise.all([
    // นับจำนวนนักศึกษาทั้งหมด (ไม่รวม admin)
    prisma.user.count({ where: { role: "user" } }), 
    
    // นับจำนวนการพยากรณ์ทั้งหมดที่เกิดขึ้นในระบบ
    prisma.curriculum_selection.count(),           
    
    // ดึง 5 กิจกรรมล่าสุดจากทุกคนมาโชว์
    prisma.curriculum_selection.findMany({         
      take: 4,
      orderBy: { prediction_date: 'desc' },
    }),

    // (แถม) นับแยกสายเพื่อไปทำกราฟ
    prisma.curriculum_selection.count({ where: { recommended_course: "CS" } }),
    prisma.curriculum_selection.count({ where: { recommended_course: "IT" } }),
  ]);

  return NextResponse.json({ 
    totalUsers, 
    totalPredictions, 
    recentActivities,
    stats: { cs: csCount, it: itCount } 
  });
}
    
    // โหมดดึงประวัติ (History)
    let history;
    if (role === "admin") {
      history = await prisma.curriculum_selection.findMany({ orderBy: { prediction_date: 'desc' } });
    } else if (email) {
      const studentId = email.split('@')[0];
      history = await prisma.curriculum_selection.findMany({ where: { student_id: studentId }, orderBy: { prediction_date: 'desc' } });
    }
    return NextResponse.json(history || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await prisma.curriculum_selection.delete({ where: { prediction_id: id } });
    return NextResponse.json({ message: "สำเร็จ" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}