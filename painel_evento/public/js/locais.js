document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formLocal");
    const listaLocais = document.getElementById("listaLocais");
    const filtroNome = document.getElementById("filtroNome");
    const filtroSituacao = document.getElementById("filtroSituacao");
    const modalEdicao = new bootstrap.Modal(document.getElementById("modalEdicaoLocal"));
    
    // Funções de acesso ao localStorage
    const getLocais = () => JSON.parse(localStorage.getItem("locais")) || [];
    const setLocais = (locais) => localStorage.setItem("locais", JSON.stringify(locais));

    // Renderizar lista de locais com filtros
    const renderLocais = () => {
        const termo = filtroNome.value.toLowerCase();
        const situacao = filtroSituacao.value;
        
        let locais = getLocais();
        
        // Aplicar filtros
        locais = locais.filter(local => {
            // Filtro de nome
            if (termo && !local.nome.toLowerCase().includes(termo)) return false;
            
            // Filtro de situação
            if (situacao !== "Todos" && local.situacao !== situacao) return false;
            
            return true;
        });
        
        listaLocais.innerHTML = "";

        if (locais.length === 0) {
            listaLocais.innerHTML = "<p class='text-center'>Nenhum local encontrado.</p>";
            return;
        }

        locais.forEach((local, index) => {
            const card = document.createElement("div");
            card.className = "col-md-6 col-lg-4";
            card.innerHTML = `
                <div class="card mb-3 ${local.situacao === 'Inativo' ? 'border-warning' : ''}">
                    <div class="card-body">
                        <h5 class="card-title">${local.nome}</h5>
                        <p class="card-text">
                            <span class="badge ${local.situacao === 'Ativo' ? 'bg-success' : 'bg-warning text-dark'}">
                                ${local.situacao}
                            </span>
                        </p>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-primary editar-local" data-index="${index}">
                                <i class="bi bi-pencil"></i> Editar
                            </button>
                            <button class="btn btn-sm ${local.situacao === 'Ativo' ? 'btn-warning' : 'btn-success'} alterar-situacao" 
                                    data-index="${index}" data-situacao="${local.situacao}">
                                ${local.situacao === 'Ativo' ? 'Inativar' : 'Ativar'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            listaLocais.appendChild(card);
        });
        
        // Adicionar eventos aos botões
        document.querySelectorAll(".editar-local").forEach(btn => {
            btn.addEventListener("click", () => abrirEdicaoLocal(btn.dataset.index));
        });
        
        document.querySelectorAll(".alterar-situacao").forEach(btn => {
            btn.addEventListener("click", () => alterarSituacaoLocal(btn.dataset.index, btn.dataset.situacao));
        });
    };

    // Função para abrir modal de edição
    function abrirEdicaoLocal(index) {
        const locais = getLocais();
        const local = locais[index];
        
        document.getElementById("editNomeLocal").value = local.nome;
        document.getElementById("editSituacaoLocal").value = local.situacao;
        document.getElementById("localIndex").value = index;
        
        modalEdicao.show();
    }
    
    // Função para alterar situação do local
    function alterarSituacaoLocal(index, situacaoAtual) {
        const novaSituacao = situacaoAtual === "Ativo" ? "Inativo" : "Ativo";
        const confirmacao = confirm(`Deseja realmente ${novaSituacao === "Ativo" ? "ativar" : "inativar"} este local?`);
        
        if (confirmacao) {
            const locais = getLocais();
            locais[index].situacao = novaSituacao;
            setLocais(locais);
            renderLocais();
            
            alert(`Local ${novaSituacao === "Ativo" ? "ativado" : "inativado"} com sucesso!`);
        }
    }
    
    // Evento de submissão do formulário de cadastro
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const nome = document.getElementById("nomeLocal").value.trim().toUpperCase();
        const situacao = document.getElementById("situacaoLocal").value;

        if (!nome) {
            alert("O nome do local é obrigatório.");
            return;
        }

        const locais = getLocais();
        if (locais.some(l => l.nome === nome)) {
            alert("Este local já está cadastrado.");
            return;
        }

        locais.push({ nome, situacao });
        setLocais(locais);
        form.reset();
        renderLocais();
        
        alert("Local cadastrado com sucesso!");
    });
    
    // Evento de submissão do formulário de edição
    document.getElementById("formEdicaoLocal").addEventListener("submit", (e) => {
        e.preventDefault();
        
        const index = document.getElementById("localIndex").value;
        const novoNome = document.getElementById("editNomeLocal").value.trim().toUpperCase();
        const novaSituacao = document.getElementById("editSituacaoLocal").value;
        
        if (!novoNome) {
            alert("O nome do local é obrigatório.");
            return;
        }
        
        const locais = getLocais();
        
        // Verificar duplicidade apenas se o nome for diferente
        if (novoNome !== locais[index].nome && 
            locais.some(l => l.nome === novoNome)) {
            alert("Já existe um local com este nome.");
            return;
        }
        
        // Atualizar local
        locais[index].nome = novoNome;
        locais[index].situacao = novaSituacao;
        setLocais(locais);
        
        modalEdicao.hide();
        renderLocais();
        
        alert("Local atualizado com sucesso!");
    });

    // Eventos de filtro
    filtroNome.addEventListener("input", renderLocais);
    filtroSituacao.addEventListener("change", renderLocais);

    // Inicialização
    renderLocais();
});