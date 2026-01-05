const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve arquivos estáticos (CSS/JS/HTML)

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
// Endpoints
// -----------------------
app.post("/add", (req, res) => {
  const { color } = req.body;
  if (!["Azul", "Vermelho", "Empate"].includes(color)) {
    return res.status(400).json({ error: "Cor inválida" });
  }
  saveHistory(color);
  res.json({ message: "Cor adicionada com sucesso!" });
});

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
