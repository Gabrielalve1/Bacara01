async function addColor(color) {
  await fetch("/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ color })
  });
  analyze();
}

async function sendImage() {
  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("Escolha uma imagem!");

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("/upload", { method: "POST", body: formData });
  const data = await res.json();
  document.getElementById("result").textContent = JSON.stringify(data, null, 2);
}

async function analyze() {
  const res = await fetch("/analyze");
  const data = await res.json();
  document.getElementById("result").textContent = JSON.stringify(data, null, 2);
}

// Atualiza a cada 5 segundos
setInterval(analyze, 5000);
analyze();
