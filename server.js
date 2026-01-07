import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

const DATA_DIR = "./data";
const FILE = path.join(DATA_DIR, "history.json");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]");

app.get("/api/history", (req, res) => {
  const data = JSON.parse(fs.readFileSync(FILE));
  res.json(data);
});

app.post("/api/add", (req, res) => {
  const data = JSON.parse(fs.readFileSync(FILE));
  data.push(req.body);
  fs.writeFileSync(FILE, JSON.stringify(data.slice(-200)));
  res.json({ ok: true });
});

const PORT = process.env.PORT || 5174;
app.listen(PORT, () => console.log("API rodando na porta", PORT));
