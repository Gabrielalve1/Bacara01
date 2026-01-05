const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const Jimp = require("jimp");
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 5000;

// -----------------------
// Funções do Motor Abacus
// -----------------------
function readHistory() {
  try {
    const data = fs.readFileSync("history.json", "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveHistory(color) {
  const history = readHistory();
  history.push(color);
  fs.writeFileSync("history.json", JSON.stringify(history, null, 2));
}

function analyzeHistory(history) {
  if (!history.length) return { recommendation: "Sem dados ainda", stats: {} };

  const total = history.length;
  const counts = { Azul: 0, Vermelho: 0, Empate: 0 };

  history.forEach(c => { if (counts[c] !== undefined) counts[c]++; });

  const last5 = history.slice(-5);
  const lastCounts = { Azul: 0, Vermelho: 0, Empate: 0 };
  last5.forEach(c => { if (lastCounts[c] !== undefined) lastCounts[c]++; });

  let recommendation = "Azul";
  if (lastCounts.Azul > lastCounts.Vermelho && lastCounts.Azul > lastCounts.Empate) {
    recommendation = "Vermelho";
  } else if (lastCounts.Vermelho > lastCounts.Azul && lastCounts.Vermelho > lastCounts.Empate) {
    recommendation = "Azul";
  } else if (lastCounts.Empate > lastCounts.Azul && lastCounts.Empate > lastCounts.Vermelho) {
    recommendation = "Empate";
  }

  const probability = {
    Azul: ((counts.Azul / total) * 100).toFixed(1),
    Vermelho: ((counts.Vermelho / total) * 100).toFixed(1),
    Empate: ((counts.Empate / total) * 100).toFixed(1)
  };

  return {
    recommendation,
    stats: {
      totalRounds: total,
      counts,
      last5,
      probability
    }
  };
}

// -----------------------
// Função de Visão Computacional (processar imagem)
async function processImage(filePath) {
  const image = await Jimp.read(filePath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const colorsDetected = [];

  // Aqui você pode ajustar os pixels que quer ler (ex: linha central)
  for (let x = 0; x < width; x += 10) {
    const y = Math.floor(height / 2);
    const pixelColor = image.getPixelColor(x, y); // retorna número hexadecimal
    const { r, g, b } = Jimp.intToRGBA(pixelColor);

    // Detecta a cor aproximada
    if (r > 200 && g < 100 && b < 100) colorsDetected.push("Vermelho");
    else if (b > 200 && r < 100 && g < 100) colorsDetected.push("Azul");
    else if (r > 200 && g > 200 && b > 200) colorsDetected.push("Empate");
  }

  return colorsDetected;
}

// -----------------------
// Endpoints
// -----------------------

// Upload de imagem
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const colorSequence = await processImage(filePath);

    // Salva cores detectadas no histórico
    colorSequence.forEach(c => saveHistory(c));

    const analysis = analyzeHistory(readHistory());
    res.json(analysis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao processar imagem" });
  }
});

// Adicionar cor manualmente
app.post("/add", (req, res) => {
  const { color } = req.body;
  if (!["Azul", "Vermelho", "Empate"].includes(color)) {
    return res.status(400).json({ error: "Cor inválida" });
  }
  saveHistory(color);
  res.json({ message: "Cor adicionada com sucesso!" });
});

// Analisar histórico
app.get("/analyze", (req, res) => {
  const history = readHistory();
  res.json(analyzeHistory(history));
});

// Servir frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// -----------------------
// Servidor
// -----------------------
app.listen(PORT, () => {
  console.log(`Servidor Abacus rodando na porta ${PORT}`);
});
