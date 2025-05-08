document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("resultadoEventos");
  const formFiltros = document.getElementById("formFiltros");
  const filtroLocal = document.getElementById("filtroLocal");
  const filtroSetor = document.getElementById("filtroSetor");
  const modalDetalhes = new bootstrap.Modal(document.getElementById("modalDetalhes"));
  
  // Carregar dados para os filtros
  function carregarDadosFiltros() {
      // Carregar locais
      const locais = JSON.parse(localStorage.getItem("locais")) || [];
      filtroLocal.innerHTML = "<option value=''>Todos os locais</option>";
      locais.forEach(local => {
          const opt = document.createElement("option");
          opt.value = local.nome;
          opt.textContent = local.nome;
          filtroLocal.appendChild(opt);
      });
      
      // Carregar setores
      const responsaveis = JSON.parse(localStorage.getItem("responsaveis")) || [];
      const setores = [...new Set(responsaveis.map(r => r.setor))];
      filtroSetor.innerHTML = "<option value=''>Todos os setores</option>";
      setores.forEach(setor => {
          const opt = document.createElement("option");
          opt.value = setor;
          opt.textContent = setor;
          filtroSetor.appendChild(opt);
      });
  }
  
  // Formatar data para exibição
  function formatarData(dataISO) {
      if (!dataISO) return "";
      const data = new Date(dataISO);
      return data.toLocaleDateString('pt-BR') + ' ' + 
             data.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
  }
  
  // Filtrar eventos
  function filtrarEventos() {
      const nome = document.getElementById("filtroNome").value.toLowerCase();
      const dataInicial = document.getElementById("filtroDataInicial").value;
      const dataFinal = document.getElementById("filtroDataFinal").value;
      const local = filtroLocal.value;
      const setor = filtroSetor.value;
      const situacao = document.getElementById("filtroSituacao").value;
      
      let eventos = JSON.parse(localStorage.getItem("eventos")) || [];
      
      // Aplicar filtros
      eventos = eventos.filter(evento => {
          // Filtro de situação
          if (situacao === "Ativo" && evento.excluido) return false;
          if (situacao === "Excluido" && !evento.excluido) return false;
          
          // Filtro de nome
          if (nome && !evento.nome.toLowerCase().includes(nome)) return false;
          
          // Filtro de local
          if (local && evento.local !== local) return false;
          
          // Filtro de setor
          if (setor && evento.setor !== setor) return false;
          
          // Filtro de data
          if (dataInicial || dataFinal) {
              let dentroDoIntervalo = false;
              for (const periodo of evento.periodos || []) {
                  if ((!dataInicial || periodo.data >= dataInicial) && 
                      (!dataFinal || periodo.data <= dataFinal)) {
                      dentroDoIntervalo = true;
                      break;
                  }
              }
              if (!dentroDoIntervalo) return false;
          }
          
          return true;
      });
      
      exibirEventos(eventos);
  }
  
  // Exibir eventos filtrados
  function exibirEventos(eventos) {
      container.innerHTML = "";
      
      if (!eventos.length) {
          container.innerHTML = "<p class='text-muted'>Nenhum evento encontrado com os filtros selecionados.</p>";
          return;
      }
      
      eventos.forEach((evento, index) => {
          const div = document.createElement("div");
          div.className = "col-md-6 col-lg-4";
          
          // Definir classe de status
          let statusClass = "bg-light";
          if (evento.excluido) {
              statusClass = "bg-danger bg-opacity-10";
          }
          
          // Obter primeiro período para exibição
          const primeiroPeriodo = evento.periodos && evento.periodos.length > 0 ? evento.periodos[0] : {};
          
          div.innerHTML = `
              <div class="card mb-4 shadow-sm ${statusClass}">
                  <div class="card-body">
                      <h5 class="card-title text-primary">${evento.nome}</h5>
                      <p class="card-text small">
                          <strong>Data:</strong> ${primeiroPeriodo.data || 'N/D'}<br>
                          <strong>Hora:</strong> ${primeiroPeriodo.horaInicio || 'N/D'} - ${primeiroPeriodo.horaFim || 'N/D'}<br>
                          <strong>Local:</strong> ${evento.local}<br>
                          <strong>Modo:</strong> ${evento.modo}<br>
                          <strong>Setor:</strong> ${evento.setor}<br>
                          ${evento.excluido ? '<span class="badge bg-danger">Excluído</span>' : ''}
                      </p>
                      <button class="btn btn-outline-primary btn-sm" data-index="${index}">
                          <i class="bi bi-eye"></i> Visualizar Detalhes
                      </button>
                  </div>
              </div>
          `;
          container.appendChild(div);
      });
      
      // Adicionar eventos aos botões de detalhes
      document.querySelectorAll("button[data-index]").forEach(btn => {
          btn.addEventListener("click", () => {
              const index = btn.dataset.index;
              exibirDetalhesEvento(eventos[index]);
          });
      });
  }
  
  // Exibir detalhes do evento no modal
  function exibirDetalhesEvento(evento) {
      const detalhesDiv = document.getElementById("detalhesEvento");
      const historicoTable = document.getElementById("historicoEvento");
      
      // Montar períodos
      let periodosHTML = '';
      if (evento.periodos && evento.periodos.length > 0) {
          periodosHTML = '<ul class="list-group list-group-flush mb-3">';
          evento.periodos.forEach(periodo => {
              periodosHTML += `
                  <li class="list-group-item">
                      <strong>Data:</strong> ${periodo.data} | 
                      <strong>Horário:</strong> ${periodo.horaInicio} - ${periodo.horaFim}
                  </li>
              `;
          });
          periodosHTML += '</ul>';
      }
      
      // Montar público-alvo
      const publicoAlvo = Array.isArray(evento.publicoAlvo) ? 
          evento.publicoAlvo.join(", ") : evento.publicoAlvo || "Não especificado";
      
      // Preencher detalhes
      detalhesDiv.innerHTML = `
          <div class="row">
              <div class="col-md-6">
                  <p><strong>Nome:</strong> ${evento.nome}</p>
                  <p><strong>Descrição:</strong> ${evento.descricao || "Não especificada"}</p>
                  <p><strong>Local:</strong> ${evento.local}</p>
                  <p><strong>Modo:</strong> ${evento.modo}</p>
                  <p><strong>Número de Participantes:</strong> ${evento.numParticipantes || "Não especificado"}</p>
              </div>
              <div class="col-md-6">
                  <p><strong>Setor:</strong> ${evento.setor}</p>
                  <p><strong>Coordenação:</strong> ${evento.coordenacao}</p>
                  <p><strong>Responsável:</strong> ${evento.responsavel}</p>
                  <p><strong>Público-Alvo:</strong> ${publicoAlvo}</p>
                  <p><strong>Órgãos Externos:</strong> ${evento.orgaoExterno}</p>
              </div>
          </div>
          
          <div class="mt-3">
              <h6>Períodos do Evento</h6>
              ${periodosHTML}
          </div>
          
          <div class="mt-3">
              <p><strong>Exibir no Painel:</strong> ${evento.exibirPainel ? "Sim" : "Não"}</p>
              <p><strong>Destacar no Painel:</strong> ${evento.destacarEvento ? "Sim" : "Não"}</p>
              ${evento.destacarEvento ? `<p><strong>Participação Especial:</strong> ${evento.participacaoEspecial || "Não especificada"}</p>` : ''}
          </div>
          
          <div class="mt-3">
              <p><strong>Responsável pelo Cadastro:</strong> ${evento.responsavelCadastro}</p>
              <p><strong>Data do Cadastro:</strong> ${formatarData(evento.dataCadastro)}</p>
              <p><strong>Situação:</strong> ${evento.excluido ? '<span class="badge bg-danger">Excluído</span>' : '<span class="badge bg-success">Ativo</span>'}</p>
          </div>
      `;
      
      // Preencher histórico
      historicoTable.innerHTML = "";
      if (evento.historico && evento.historico.length > 0) {
          evento.historico.forEach(registro => {
              const tr = document.createElement("tr");
              tr.innerHTML = `
                  <td>${formatarData(registro.data)}</td>
                  <td>${registro.responsavel}</td>
                  <td>${registro.acao}</td>
                  <td>${registro.justificativa}</td>
              `;
              historicoTable.appendChild(tr);
          });
      } else {
          historicoTable.innerHTML = `
              <tr>
                  <td colspan="4" class="text-center">Nenhum registro de alteração encontrado.</td>
              </tr>
          `;
      }
      
      modalDetalhes.show();
  }
  
  // Eventos
  formFiltros.addEventListener("submit", (e) => {
      e.preventDefault();
      filtrarEventos();
  });
  
  formFiltros.addEventListener("reset", () => {
      setTimeout(() => {
          filtrarEventos();
      }, 0);
  });
  
  // Inicialização
  carregarDadosFiltros();
  filtrarEventos();
});