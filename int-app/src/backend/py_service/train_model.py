import pandas as pd
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib

# 1. โหลดข้อมูล
df = pd.read_csv('train_knn.csv') 
print("Columns found:", df.columns.tolist())

# 2. แปลงข้อมูล
grade_map = {"A": 4, "B+": 3.5, "B": 3, "C+": 2.5, "C": 2, "D+": 1.5, "D": 1}
knowledge_map = { "Excellent": 4, "Good": 3, "Fair": 2, "Poor": 1, "None": 0 }
job_map = { "unsure": 0, "Data Scientist": 1, "AI Innovator": 2, "Software Developer": 3, "Cyber Security Analyst": 4, "UX UI Designer": 5, "DevOps Engineer": 6, "Tester / QA": 7, "IT Support / Administrator": 8 }

df['f1'] = df['Experience'].map({'Yes': 1, 'No': 0})
df['f2'] = df['Prog.Methods'].map(grade_map)
df['f3'] = df['Probability'].map(grade_map)
df['f4'] = df['Knowledge'].map(knowledge_map)
df['f5'] = df['Career_Interest'].map(job_map)

# 3. เลือกคอลัมน์และจัดการค่าว่าง (CRITICAL FIX)
X = df[['f1', 'f2', 'f3', 'f4', 'f5']]
y = df['Program']

# เช็คว่ามีค่าไหน Map ไม่ติดบ้าง (ถ้ามีเลขขึ้นที่ไม่ใช่ 0 แสดงว่าสะกดคำใน Map ไม่ตรงกับ CSV)
print("จำนวนค่าว่างที่ตรวจพบ:")
print(X.isnull().sum())

# 2. กรองเฉพาะแถวที่ข้อมูล "ครบทุกคอลัมน์" (ทั้ง X และ y)
mask = X.notnull().all(axis=1) & y.notnull()
X_clean = X[mask].reset_index(drop=True)
y_clean = y[mask].reset_index(drop=True)

print(f"จำนวนข้อมูลที่สะอาดสมบูรณ์: {len(X_clean)} แถว")

# 3. แบ่งข้อมูล (ใช้ random_state เพื่อให้ผลคงที่)
X_train, X_test, y_train, y_test = train_test_split(X_clean, y_clean, test_size=0.2, random_state=42)

# 4. Scaling (ตรวจสอบอีกรอบว่าไม่มี NaN หลุดมา)
scaler = StandardScaler()

# ใช้ fit_transform และเช็คว่าไม่มี NaN โผล่มาในขั้นตอนนี้
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 5. เทรน KNN (คราวนี้น่าจะผ่านฉลุย)
knn = KNeighborsClassifier(n_neighbors=5)
knn.fit(X_train_scaled, y_train)

# 6. วัดผล
y_pred = knn.predict(X_test_scaled)
score = accuracy_score(y_test, y_pred)

print(f"--- รายงานผล ---")
print(f"ความแม่นยำ (Accuracy): {score * 100:.2f}%")

# เช็คว่าคำไหนใน Career_Interest ที่ทำให้เกิด NaN
# missing_jobs = df[df['f5'].isnull()]['Career_Interest'].unique()
# print("คำใน Career_Interest ที่ Mapping ไม่ติด (กลายเป็น NaN):")
# rint(missing_jobs)

# 7. เซฟไฟล์
joblib.dump(knn, 'knn_model.joblib')
joblib.dump(scaler, 'scaler.joblib')

print("---")
print("รันสำเร็จ! คุณได้ไฟล์ knn_model.joblib และ scaler.joblib มาแล้ว")