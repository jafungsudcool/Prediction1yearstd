const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.post("/auth/login", (req, res) => {
  const { email } = req.body;

  const allowedDomain = "rmutk.ac.th";

  if (!email.endsWith(`@${allowedDomain}`)) {
    return res.status(400).json({ message: "Email ต้องเป็นของมหาลัยเท่านั้น" });
  }

  return res.json({
    user: { email },
  });
});

app.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});

const { spawn } = require('child_process');
// รับ req จาก predict
app.post('/predict', (req, res) => {
    const userData = req.body; // ข้อมูลที่ส่งมาจากหน้าเว็บ

    // สั่งรันไฟล์ Python และส่งข้อมูลเข้าไป
    const pythonProcess = spawn('python', ['predict.py', JSON.stringify(userData)]);

    pythonProcess.stdout.on('data', (data) => {
        res.json({ result: data.toString() }); // ส่งคำตอบกลับไปหน้าเว็บ
    });
});