
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("listaEventos");
  const config = JSON.parse(localStorage.getItem("configPainel")) || {
    campos: ["nome", "data", "horaInicio", "horaFim", "local", "modo", "setor", "coordenacao", "responsavel", "publicoAlvo"]
  };

  try {
    const resposta = await fetch("http://localhost:5000/api/eventos");
    const eventos = await resposta.json();

    if (!eventos.length) {
      container.innerHTML = "<p class='text-muted'>Nenhum evento encontrado.</p>";
      return;
    }

    container.innerHTML = eventos.map(e => `
      <div class="col-md-6 col-lg-4">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            ${config.campos.includes("nome") ? `<h5 class="card-title">${e.nome}</h5>` : ""}
            ${config.campos.includes("data") ? `<p><strong>Data:</strong> ${e.data}</p>` : ""}
            ${config.campos.includes("horaInicio") ? `<p><strong>Horário:</strong> ${e.horaInicio} - ${e.horaFim}</p>` : ""}
            ${config.campos.includes("local") ? `<p><strong>Local:</strong> ${e.local}</p>` : ""}
            ${config.campos.includes("modo") ? `<p><strong>Modo:</strong> ${e.modo}</p>` : ""}
            ${config.campos.includes("setor") ? `<p><strong>Setor:</strong> ${e.setor}</p>` : ""}
            ${config.campos.includes("coordenacao") ? `<p><strong>Coordenação:</strong> ${e.coordenacao}</p>` : ""}
            ${config.campos.includes("responsavel") ? `<p><strong>Responsável:</strong> ${e.responsavel}</p>` : ""}
            ${config.campos.includes("publicoAlvo") ? `<p><strong>Público-Alvo:</strong> ${(e.publicoAlvo || []).join(", ")}</p>` : ""}
          </div>
        </div>
      </div>
    `).join("");
  } catch (erro) {
    console.error("Erro ao buscar eventos:", erro);
    container.innerHTML = "<p class='text-danger'>Erro ao carregar eventos.</p>";
  }
});
