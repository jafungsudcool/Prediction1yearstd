import joblib

model = joblib.load('knn_model.joblib')
scaler = joblib.load('scaler.joblib')

print("--- ข้อมูลใน Model ---")
print(f"ประเภท Model: {type(model)}")
print(f"ค่า K (n_neighbors) ที่ใช้: {model.n_neighbors}")
print(f"คลาสที่ Model รู้จัก (เฉลย): {model.classes_}")

print("\n--- ข้อมูลใน Scaler ---")
print(f"ค่าเฉลี่ยของแต่ละ Features (Mean): {scaler.mean_}")
print(f"ค่าการกระจายตัว (Scale): {scaler.scale_}")