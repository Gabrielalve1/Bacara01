const express = require("express");
const app = express();
const fs = require("fs");

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("🔥 Bacara AI – Abacus Engine online");
});

app.get("/analyze", (req, res) => {
  const history = JSON.parse(fs.readFileSync("history.json", "utf8"));

  // lógica inicial estilo Abacus (simples por enquanto)
  const last = history[history.length - 1] || "AZUL";

  const recomendacao =
    last === "AZUL" ? "VERMELHO" : "AZUL";

  res.json({
    status: "ok",
    recomendacao,
    confianca: "68%",
    engine: "Abacus v1"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
