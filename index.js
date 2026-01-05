const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("🔥 Bacara AI online");
});

app.get("/analyze", (req, res) => {
  res.json({
    status: "ok",
    recomendacao: "AZUL",
    confianca: "71%",
    engine: "Abacus-like v1"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
