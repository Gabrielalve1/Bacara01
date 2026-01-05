const express = require("express");
const path = require("path");
const multer = require("multer");
const analyse = require("./analyse");
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const upload = multer({ dest: "uploads/" });

// Página inicial
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Endpoint de análise
app.get("/analyze", (req, res) => {
  res.json(analyse.getAnalysis());
});

// Adicionar cor manual
app.post("/add", (req, res) => {
  const { color } = req.body;
  analyse.addColor(color);
  res.json({ message: "Cor adicionada!" });
});

// Upload de imagem
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const colorSequence = await analyse.processImage(req.file.path);
    colorSequence.forEach(c => analyse.addColor(c));
    res.json(analyse.getAnalysis());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao processar imagem" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor Abacus rodando na porta ${PORT}`));
