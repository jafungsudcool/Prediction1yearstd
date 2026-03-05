import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// จัดการ Prisma Client เพื่อป้องกัน Connection เต็มบน Development
const prismaGlobal = globalThis as unknown as { prisma: PrismaClient };
const prisma = prismaGlobal.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") prismaGlobal.prisma = prisma;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("--- Incoming POST Request ---", body.mode || "prediction");

    // 1. โหมดเพิ่มนักศึกษา (Admin)
    if (body.mode === "addUser") {
      const { student_id, email, user_name } = body;
      const newUser = await prisma.user.create({ 
        data: { student_id, email, user_name, role: "user" } 
      });
      return NextResponse.json(newUser, { status: 201 });
    }

    // 2. โหมดตั้งค่าโมเดล (Admin)
    if (body.mode === 'updateSettings') {
      const update = await prisma.modelSettings.upsert({
        where: { model_id: 'current_config' },
        update: { selected_factors: body.factors, training_file_name: body.fileName },
        create: { model_id: 'current_config', selected_factors: body.factors, training_file_name: body.fileName },
      });
      return NextResponse.json(update, { status: 201 });
    }

    // 3. ส่วนบันทึกผลการพยากรณ์
    if (!body.email || !body.result) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    const studentIdFromEmail = body.email.split('@')[0];

    try {
      // Step A: Upsert User (เพื่อให้แน่ใจว่ามี User อยู่ในระบบ)
      await prisma.user.upsert({
        where: { student_id: studentIdFromEmail },
        update: { user_name: body.name, email: body.email },
        create: { student_id: studentIdFromEmail, email: body.email, user_name: body.name, role: "user" }
      });

      // Step B: บันทึกลงตารางการพยากรณ์ (แก้ไขจุดที่ทำให้ Error)
      const newRecord = await prisma.curriculum_selection.create({
        data: {
          prediction_id: Math.random().toString(36).substring(2, 12),
          student_id: studentIdFromEmail, // ใส่ตรงๆ ตาม Schema
          user_name: body.name || "Unknown",
          recommended_course: body.result, 
          prediction_date: new Date(),
          answer: typeof body.answer === 'string' ? body.answer : "",       
         },
      });

      console.log("บันทึกสำเร็จ:", newRecord.prediction_id);
      return NextResponse.json(newRecord, { status: 201 });

    } catch (dbError: any) {
      console.error("Database Error:", dbError.message);
      return NextResponse.json({ error: "Database Save Failed", details: dbError.message }, { status: 500 });
    }

  } catch (error: any) {
    console.error("--- Global POST Error ---", error.message);
    return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const role = searchParams.get("role");
    const mode = searchParams.get("mode");

    console.log(`--- GET Request: mode=${mode} ---`);

    if (mode === "getStudents") {
      const students = await prisma.user.findMany({ 
        where: { role: "user" }, 
        orderBy: { student_id: 'asc' } 
      });
      return NextResponse.json(students);
    }

    if (mode === "getName" && email) {
      const user = await prisma.user.findFirst({ 
        where: { email }, 
        select: { user_name: true } 
      });
      return NextResponse.json(user);
    }

      if (mode === "getUserDashboard" && email) {
      const studentId = email.split('@')[0];
      const [myTotal, myRecent, totalUsers] = await Promise.all([
        prisma.curriculum_selection.count({ 
          where: { student_id: studentId } 
        }),
        prisma.curriculum_selection.findMany({ 
          where: { student_id: studentId }, 
          take: 3, 
          orderBy: { prediction_date: 'desc' } 
        }),
        prisma.user.count({ 
          where: { role: "user" } 
        })
      ]);

  return NextResponse.json({ myTotal, myRecent, totalUsers });
}

    if (mode === "getAdminDashboard") {
      const [totalUsers, totalPredictions, recentActivities, csCount, itCount] = await Promise.all([
        prisma.user.count({ where: { role: "user" } }), 
        prisma.curriculum_selection.count(),           
        prisma.curriculum_selection.findMany({         
          take: 4,
          orderBy: { prediction_date: 'desc' },
        }),
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
      history = await prisma.curriculum_selection.findMany({ 
        where: { student_id: studentId }, 
        orderBy: { prediction_date: 'desc' } 
      });
    }
    return NextResponse.json(history || []);

  } catch (error: any) {
    console.error("GET Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    
    await prisma.curriculum_selection.delete({ 
      where: { prediction_id: id } 
    });
    
    return NextResponse.json({ message: "ลบสำเร็จ" });
  } catch (error: any) {
    console.error("DELETE Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}