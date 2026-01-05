export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    mensagem: "API funcionando 🚀",
    recomendacao: "AZUL",
    confianca: "70%"
  });
}
