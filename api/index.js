const express = require("express");
const path = require("path");
const analyse = require("./analyse"); // funções do Motor Abacus
const multer = require("multer");
const upload = multer({ dest: "../uploads/" }); // pasta para imagens

const app = express();
app.use(express.json());

// Serve arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, "../public")));

// Página principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Endpoint para análise
app.get("/analyze", (req, res) => {
  const result = analyse.getAnalysis();
  res.json(result);
});

// Endpoint para adicionar cor manual
app.post("/add", (req, res) => {
  const { color } = req.body;
  analyse.addColor(color);
  res.json({ message: "Cor adicionada com sucesso!" });
});

// Endpoint para upload de imagem
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const colorSequence = await analyse.processImage(filePath); 
    colorSequence.forEach(c => analyse.addColor(c));
    const result = analyse.getAnalysis();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao processar imagem" });
  }
});

// Porta
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor Abacus rodando na porta ${PORT}`));
