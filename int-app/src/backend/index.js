const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
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
