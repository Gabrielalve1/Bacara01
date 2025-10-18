export default function handler(req, res){
  if(req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  const { sequence } = req.body;
  if(!sequence || !Array.isArray(sequence)) return res.status(400).json({ error: "Sequência inválida" });
  
  // Frequência
  const freqMap = {};
  sequence.forEach(n=> freqMap[n]=(freqMap[n]||0)+1);

  // Recência (últimos 5)
  const last5 = sequence.slice(-5);
  const recMap = {};
  last5.forEach(n=> recMap[n]=(recMap[n]||0)+1);

  // Transições
  const transMap = {};
  sequence.slice(0,-1).forEach((v,i)=>{
    const next = sequence[i+1];
    transMap[next] = (transMap[next]||0)+1;
  });

  // N-grams (3)
  const ngramMap = {};
  for(let i=0; i<=sequence.length-3; i++){
    const key = sequence.slice(i,i+3).join(',');
    ngramMap[key] = (ngramMap[key]||0)+1;
  }

  // Score combinado
  const weights = { freq:1.2, recency:1.5, transition:1.7, ngram:1.3 };
  const scores = {};
  for(let i=3; i<=18; i++){
    scores[i] = (freqMap[i]||0)*weights.freq + 
                (recMap[i]||0)*weights.recency + 
                (transMap[i]||0)*weights.transition + 
                Object.keys(ngramMap).filter(k=>k.endsWith(i)).length*weights.ngram;
  }

  // Softmax para confiança
  const expScores = Object.values(scores).map(v=>Math.exp(v));
  const sumExp = expScores.reduce((a,b)=>a+b,0);
  const probs = {};
  Object.keys(scores).forEach((k,i)=> probs[k] = Math.round(100*expScores[i]/sumExp));

  const sorted = Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  const top3 = sorted.slice(0,3).map(([n])=>n);

  res.status(200).json({ recommendation: top3, confidence: top3.map(n=>probs[n]), scores });
}