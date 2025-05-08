document.addEventListener("DOMContentLoaded", () => {
    const listaEventos = document.getElementById("listaEventos");
    const modal = new bootstrap.Modal(document.getElementById("modalEdicao"));
    const form = document.getElementById("formEdicao");
    const justificativaInput = document.getElementById("justificativaEdicao");
    let eventos = JSON.parse(localStorage.getItem("eventos")) || [];
    let eventoEditando = null;

    function renderizarLista() {
        listaEventos.innerHTML = "";
        
        if (eventos.length === 0) {
            listaEventos.innerHTML = "<p class='text-muted'>Nenhum evento cadastrado.</p>";
            return;
        }
        
        eventos.forEach((evento, index) => {
            const div = document.createElement("div");
            div.className = "card mb-3";
            
            // Definir classe de status
            let statusClass = "";
            let statusBadge = "";
            if (evento.excluido) {
                statusClass = "border-danger bg-danger bg-opacity-10";
                statusBadge = '<span class="badge bg-danger">Excluído</span>';
            }
            
            // Obter primeiro período para exibição
            const primeiroPeriodo = evento.periodos && evento.periodos.length > 0 ? evento.periodos[0] : {};
            
            div.innerHTML = `
                <div class="card-body ${statusClass}">
                    <div class="d-flex justify-content-between align-items-start">
                        <h5 class="card-title">${evento.nome} ${statusBadge}</h5>
                        <div>
                            ${!evento.excluido ? `
                                <button class="btn btn-warning btn-sm me-2" data-index="${index}">
                                    <i class="bi bi-pencil"></i> Editar
                                </button>
                                <button class="btn btn-danger btn-sm" data-excluir="${index}">
                                    <i class="bi bi-trash"></i> Excluir
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    <p class="card-text">
                        <strong>Data:</strong> ${primeiroPeriodo.data || 'N/D'} | 
                        <strong>Horário:</strong> ${primeiroPeriodo.horaInicio || 'N/D'} - ${primeiroPeriodo.horaFim || 'N/D'}<br>
                        <strong>Local:</strong> ${evento.local} | 
                        <strong>Modo:</strong> ${evento.modo}<br>
                        <strong>Setor:</strong> ${evento.setor} | 
                        <strong>Responsável:</strong> ${evento.responsavel}
                    </p>
                </div>
            `;
            listaEventos.appendChild(div);
        });

        // Adicionar eventos aos botões
        document.querySelectorAll("button[data-index]").forEach(btn => {
            btn.addEventListener("click", () => abrirEdicao(eventos[btn.dataset.index], btn.dataset.index));
        });

        document.querySelectorAll("button[data-excluir]").forEach(btn => {
            btn.addEventListener("click", () => excluirEvento(btn.dataset.excluir));
        });
    }

    function abrirEdicao(evento, index) {
        eventoEditando = index;
        
        // Preencher campos básicos
        document.getElementById("editNome").value = evento.nome || "";
        document.getElementById("editDescricao").value = evento.descricao || "";
        document.getElementById("editLocal").value = evento.local || "";
        document.getElementById("editModo").value = evento.modo || "";
        document.getElementById("editNumParticipantes").value = evento.numParticipantes || "";
        document.getElementById("editOrgaoExterno").value = evento.orgaoExterno || "";
        document.getElementById("editExibirPainel").value = evento.exibirPainel ? "Sim" : "Não";
        document.getElementById("editDestacarEvento").value = evento.destacarEvento ? "Sim" : "Não";
        document.getElementById("editParticipacaoEspecial").value = evento.participacaoEspecial || "";
        
        // Controlar visibilidade do campo de participação especial
        const participacaoEspecialContainer = document.getElementById("editParticipacaoEspecialContainer");
        participacaoEspecialContainer.style.display = evento.destacarEvento ? "block" : "none";
        
        // Preencher responsáveis
        document.getElementById("editSetor").value = evento.setor || "";
        document.getElementById("editCoordenacao").value = evento.coordenacao || "";
        document.getElementById("editResponsavel").value = evento.responsavel || "";
        
        // Preencher público-alvo
        const publicoAlvoSelect = document.getElementById("editPublicoAlvo");
        const publicos = JSON.parse(localStorage.getItem("publicos")) || [];
        publicoAlvoSelect.innerHTML = "";
        
        publicos.forEach(publico => {
            const opt = document.createElement("option");
            opt.value = publico.nome;
            opt.text = publico.nome;
            opt.selected = evento.publicoAlvo && evento.publicoAlvo.includes(publico.nome);
            publicoAlvoSelect.appendChild(opt);
        });
        
        // Limpar períodos existentes
        const periodosContainer = document.getElementById("editPeriodosContainer");
        periodosContainer.innerHTML = "";
        
        // Adicionar períodos do evento
        if (evento.periodos && evento.periodos.length > 0) {
            evento.periodos.forEach(periodo => {
                adicionarPeriodoEdicao(periodo);
            });
        } else {
            // Adicionar um período vazio se não houver
            adicionarPeriodoEdicao();
        }
        
        // Exibir modal
        modal.show();
    }
    
    // Função para adicionar um período no formulário de edição
    function adicionarPeriodoEdicao(periodo = {}) {
        const periodosContainer = document.getElementById("editPeriodosContainer");
        const div = document.createElement("div");
        div.className = "row align-items-end mb-2 periodo";
        div.innerHTML = `
            <div class="col-md-4">
                <label class="form-label">Data</label>
                <input type="date" class="form-control" name="editDataPeriodo[]" value="${periodo.data || ''}">
            </div>
            <div class="col-md-3">
                <label class="form-label">Horário Início</label>
                <input type="time" class="form-control" name="editHoraInicioPeriodo[]" value="${periodo.horaInicio || ''}">
            </div>
            <div class="col-md-3">
                <label class="form-label">Horário Fim</label>
                <input type="time" class="form-control" name="editHoraFimPeriodo[]" value="${periodo.horaFim || ''}">
            </div>
            <div class="col-md-2">
                <button type="button" class="btn btn-danger w-100 removerPeriodo">Remover</button>
            </div>
        `;
        periodosContainer.appendChild(div);
    }
    
    // Evento para adicionar período
    document.getElementById("adicionarPeriodoEdicao").addEventListener("click", () => {
        adicionarPeriodoEdicao();
    });
    
    // Evento para remover período
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("removerPeriodo")) {
            const periodos = document.querySelectorAll("#editPeriodosContainer .periodo");
            if (periodos.length > 1) {
                e.target.closest(".periodo").remove();
            } else {
                alert("É necessário manter pelo menos um período.");
            }
        }
    });
    
    // Controlar exibição do campo de participação especial
    document.getElementById("editDestacarEvento").addEventListener("change", function() {
        const container = document.getElementById("editParticipacaoEspecialContainer");
        container.style.display = this.value === "Sim" ? "block" : "none";
    });

    // Submissão do formulário de edição
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Validar justificativa
        const justificativa = justificativaInput.value.trim();
        if (!justificativa) {
            alert("É necessário informar uma justificativa para a alteração.");
            justificativaInput.focus();
            return;
        }
        
        // Coletar períodos
        const datas = document.querySelectorAll('input[name="editDataPeriodo[]"]');
        const horasInicio = document.querySelectorAll('input[name="editHoraInicioPeriodo[]"]');
        const horasFim = document.querySelectorAll('input[name="editHoraFimPeriodo[]"]');
        
        const periodos = [];
        for (let i = 0; i < datas.length; i++) {
            if (datas[i].value && horasInicio[i].value && horasFim[i].value) {
                periodos.push({
                    data: datas[i].value,
                    horaInicio: horasInicio[i].value,
                    horaFim: horasFim[i].value
                });
            }
        }
        
        if (periodos.length === 0) {
            alert("É necessário informar pelo menos um período válido (data e horários).");
            return;
        }
        
        // Coletar público-alvo
        const publicoAlvoSelect = document.getElementById("editPublicoAlvo");
        const publicoAlvo = Array.from(publicoAlvoSelect.selectedOptions).map(opt => opt.value);
        
        // Atualizar evento
        const evento = eventos[eventoEditando];
        const dadosAnteriores = JSON.parse(JSON.stringify(evento)); // Cópia para histórico
        
        evento.nome = document.getElementById("editNome").value.trim();
        evento.descricao = document.getElementById("editDescricao").value.trim();
        evento.local = document.getElementById("editLocal").value.trim();
        evento.modo = document.getElementById("editModo").value;
        evento.numParticipantes = document.getElementById("editNumParticipantes").value.trim();
        evento.orgaoExterno = document.getElementById("editOrgaoExterno").value.trim();
        evento.setor = document.getElementById("editSetor").value.trim();
        evento.coordenacao = document.getElementById("editCoordenacao").value.trim();
        evento.responsavel = document.getElementById("editResponsavel").value.trim();
        evento.publicoAlvo = publicoAlvo;
        evento.periodos = periodos;
        evento.exibirPainel = document.getElementById("editExibirPainel").value === "Sim";
        evento.destacarEvento = document.getElementById("editDestacarEvento").value === "Sim";
        evento.participacaoEspecial = document.getElementById("editParticipacaoEspecial").value.trim();
        
        // Registrar histórico
        if (!evento.historico) evento.historico = [];
        evento.historico.push({
            data: new Date().toISOString(),
            responsavel: document.getElementById("usuarioLogado").value,
            acao: "Alteração",
            justificativa: justificativa
        });

        // Salvar alterações
        localStorage.setItem("eventos", JSON.stringify(eventos));
        modal.hide();
        justificativaInput.value = "";
        renderizarLista();
        
        alert("Evento alterado com sucesso!");
    });

    // Função para excluir evento
    function excluirEvento(index) {
        const justificativa = prompt("Informe a justificativa para exclusão:");
        if (!justificativa || justificativa.trim() === "") {
            alert("É necessário informar uma justificativa para excluir o evento.");
            return;
        }
        
        // Marcar como excluído e registrar histórico
        const evento = eventos[index];
        evento.excluido = true;
        
        if (!evento.historico) evento.historico = [];
        evento.historico.push({
            data: new Date().toISOString(),
            responsavel: document.getElementById("usuarioLogado").value,
            acao: "Exclusão",
            justificativa: justificativa
        });
        
        localStorage.setItem("eventos", JSON.stringify(eventos));
        renderizarLista();
        
        alert("Evento excluído com sucesso!");
    }

    // Inicialização
    renderizarLista();
});