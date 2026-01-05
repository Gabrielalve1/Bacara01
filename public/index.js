const express = require("express");
const fs = require("fs");
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Ler histórico
function readHistory() {
  try {
    const data = fs.readFileSync("history.json", "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Salvar cor nova
function saveHistory(color) {
  const history = readHistory();
  history.push(color);
  fs.writeFileSync("history.json", JSON.stringify(history, null, 2));
}

// Análise Abacus básica
function analyzeHistory(history) {
  if (!history.length) return { recommendation: "Sem dados", stats: {} };

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
  } else {
    recommendation = "Empate";
  }

  return {
    recommendation,
    stats: { totalRounds: total, counts, last5 }
  };
}

// Endpoints
app.post("/add", (req, res) => {
  const { color } = req.body;
  if (!["Azul", "Vermelho", "Empate"].includes(color)) {
    return res.status(400).json({ error: "Cor inválida" });
  }
  saveHistory(color);
  res.json({ message: "Cor adicionada!" });
});

app.get("/analyze", (req, res) => {
  const history = readHistory();
  res.json(analyzeHistory(history));
});

app.get("/", (req, res) => {
  res.send("Servidor Abacus rodando!");
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
