from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np

app = FastAPI()
try:
    model = joblib.load('knn_model.joblib')
    scaler = joblib.load('scaler.joblib')
    print("โหลด Model สำเร็จ!")
except:
    print("ไม่พบไฟล์ Model กรุณารัน train_model.py ก่อน")

# --- 2. กำหนดโครงสร้างข้อมูลที่รับมาจากหน้าเว็บ ---
class PredictRequest(BaseModel):
    q1: str  # เคยเรียนเขียนโปรแกรมไหม (yes/no)
    q2: str  # เกรด Probability
    q3: str  # เกรด Programming Method
    q4: str  # ความเข้าใจหลักสูตร
    q5: str  # ตำแหน่งงานที่สนใจ

# --- 3. ฟังก์ชันหลักสำหรับพยากรณ์ ---
@app.post("/predict")
def predict(data: PredictRequest):
    # --- Mapping ---
    
    grade_map = {"A": 4, "B+": 3.5, "B": 3, "C+": 2.5, "C": 2, "D+": 1.5, "D": 1}
    knowledge_map = { "Excellent": 4, "Good": 3, "Fair": 2, "Poor": 1, "None": 0 }
    job_map = { "unsure": 0, "Data Scientist": 1, "AI Innovator": 2, "Software Developer": 3, "Cyber Security Analyst": 4, "UX UI Designer": 5, "DevOps Engineer": 6, "Tester / QA": 7, "IT Support / Administrator": 8 }

    # รวมข้อมูลเป็น List เพื่อเตรียมทำเป็น DataFrame
    processed_row = [
        1 if data.q1 == "yes" else 0,    # แปลง q1 เป็น 0 หรือ 1
        grade_map.get(data.q2, 0),      # แปลงเกรด q2
        grade_map.get(data.q3, 0),      # แปลงเกรด q3
        knowledge_map.get(data.q4, 2), # แปลงความเข้าใจ q4 (default ปานกลาง)
        job_map.get(data.q5, 8)         # แปลงตำแหน่งงาน q5 (default ไม่แน่ใจ)
    ]

    # --- 4. นำข้อมูลเข้าสู่กระบวนการ AI ---
    processed_row = [q1_val, q2_val, q3_val, q4_val, q5_val]
    X_new = pd.DataFrame([processed_row], columns=['f1', 'f2', 'f3', 'f4', 'f5'])    
    # ทำ Scaling (ปรับสเกลตัวเลขให้เท่าเทียมกัน)
    X_scaled = scaler.transform(X_new)

    # ทำนายผล
    prediction = model.predict(X_scaled) # จะได้ผลลัพธ์เป็น ['CS'] หรือ ['IT']

    # ส่งผลลัพธ์กลับไปที่ Node.js/Next.js
    return {
        "success": True,
        "prediction": str(prediction[0])
    }