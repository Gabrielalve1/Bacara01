const fs = require("fs");

const HISTORY_FILE = "history.json";

// Ler histórico
function readHistory() {
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8"));
  } catch {
    return [];
  }
}

// Adicionar cor
function addColor(color) {
  const history = readHistory();
  history.push(color);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

// Analisar histórico
function getAnalysis() {
  const history = readHistory();
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

// Simulação de leitura de imagem (vai processar cores do gráfico)
async function processImage(filePath) {
  // Aqui você pode usar Jimp para ler pixels
  // Por enquanto, vamos simular cores detectadas
  return ["Azul", "Vermelho"];
}

module.exports = { readHistory, addColor, getAnalysis, processImage };
