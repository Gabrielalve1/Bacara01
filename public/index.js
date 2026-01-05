const express = require("express");
const fs = require("fs");
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000; // Replit normalmente usa porta 5000

// -----------------------
// Funções do Motor Abacus
// -----------------------

// Ler histórico do arquivo
function readHistory() {
  try {
    const data = fs.readFileSync("history.json", "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Salvar nova cor no histórico
function saveHistory(color) {
  const history = readHistory();
  history.push(color);
  fs.writeFileSync("history.json", JSON.stringify(history, null, 2));
}

// Análise Abacus
function analyzeHistory(history) {
  if (!history.length) return { recommendation: "Sem dados ainda", stats: {} };

  const total = history.length;
  const counts = { Azul: 0, Vermelho: 0, Empate: 0 };

  history.forEach(c => { if (counts[c] !== undefined) counts[c]++; });

  // Últimas 5 rodadas para detectar tendência
  const last5 = history.slice(-5);
  const lastCounts = { Azul: 0, Vermelho: 0, Empate: 0 };
  last5.forEach(c => { if (lastCounts[c] !== undefined) lastCounts[c]++; });

  // Recomendação baseada em "tendência de correção"
  let recommendation = "Azul"; // default
  if (lastCounts.Azul > lastCounts.Vermelho && lastCounts.Azul > lastCounts.Empate) {
    recommendation = "Vermelho";
  } else if (lastCounts.Vermelho > lastCounts.Azul && lastCounts.Vermelho > lastCounts.Empate) {
    recommendation = "Azul";
  } else if (lastCounts.Empate > lastCounts.Azul && lastCounts.Empate > lastCounts.Vermelho) {
    recommendation = "Empate";
  }

  // Probabilidade simples em %
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
// Endpoints do Backend
// -----------------------

// Adicionar nova cor
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
  const analysis = analyzeHistory(history);
  res.json(analysis);
});

// Servir frontend
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// -----------------------
// Iniciar servidor
// -----------------------
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
