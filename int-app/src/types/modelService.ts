import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function createModelWithId(modelType: string, name: string) {
  // หาตัวล่าสุดที่ขึ้นต้นด้วยชื่อโมเดลนั้น เช่น 'knn'
  const lastModel = await prisma.prediction_model.findFirst({
    where: {
      model_id: { startsWith: modelType.toLowerCase() }
    },
    orderBy: { model_id: 'desc' } // เรียงจากมากไปน้อยเพื่อเอาเลขล่าสุด
  });

  let newNumber = 1;
  if (lastModel) {
    // ดึงตัวเลข 2 หลักท้ายออกมาแล้วบวก 1
    const lastId = lastModel.model_id;
    const lastNum = parseInt(lastId.replace(modelType.toLowerCase(), ""));
    newNumber = lastNum + 1;
  }

  // จัดรูปแบบเป็น knn01, knn02
  const newId = `${modelType.toLowerCase()}${String(newNumber).padStart(2, '0')}`;

  return await prisma.prediction_model.create({
    data: {
      model_id: newId,
      model_name: name,
      train_date: new Date(),
    }
  });
}