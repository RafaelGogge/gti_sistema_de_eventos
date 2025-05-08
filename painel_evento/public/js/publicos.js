document.addEventListener("DOMContentLoaded", () => {
    const lista = document.getElementById("listaPublicos");
    const formulario = document.getElementById("formPublico");
    const filtroNome = document.getElementById("filtroNome");
    const filtroSituacao = document.getElementById("filtroSituacao");
    const modalEdicao = new bootstrap.Modal(document.getElementById("modalEdicaoPublico"));

    let publicos = JSON.parse(localStorage.getItem("publicos")) || [];

    function salvarPublicos() {
        localStorage.setItem("publicos", JSON.stringify(publicos));
    }

    function renderizarLista() {
        const termo = filtroNome.value.toLowerCase();
        const situacao = filtroSituacao.value;
        
        // Aplicar filtros
        const publicosFiltrados = publicos.filter(publico => {
            // Filtro de nome
            if (termo && !publico.nome.toLowerCase().includes(termo)) return false;
            
            // Filtro de situação
            if (situacao !== "Todos" && publico.situacao !== situacao) return false;
            
            return true;
        });
        
        lista.innerHTML = "";
        
        if (publicosFiltrados.length === 0) {
            lista.innerHTML = "<div class='col-12'><p class='text-center'>Nenhum público-alvo encontrado.</p></div>";
            return;
        }

        publicosFiltrados.forEach((publico, index) => {
            const originalIndex = publicos.findIndex(p => p.nome === publico.nome);
            const div = document.createElement("div");
            div.className = "col-md-6 col-lg-4";
            div.innerHTML = `
                <div class="card mb-3 ${publico.situacao === 'Inativo' ? 'border-warning' : ''}">
                    <div class="card-body">
                        <h5 class="card-title">${publico.nome}</h5>
                        <p class="card-text">
                            <span class="badge ${publico.situacao === 'Ativo' ? 'bg-success' : 'bg-warning text-dark'}">
                                ${publico.situacao}
                            </span>
                        </p>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-primary editar-publico" data-index="${originalIndex}">
                                <i class="bi bi-pencil"></i> Editar
                            </button>
                            <button class="btn btn-sm ${publico.situacao === 'Ativo' ? 'btn-warning' : 'btn-success'} alterar-situacao" 
                                    data-index="${originalIndex}" data-situacao="${publico.situacao}">
                                ${publico.situacao === 'Ativo' ? 'Inativar' : 'Ativar'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            lista.appendChild(div);
        });
        
        // Adicionar eventos aos botões
        document.querySelectorAll(".editar-publico").forEach(btn => {
            btn.addEventListener("click", () => abrirEdicaoPublico(btn.dataset.index));
        });
        
        document.querySelectorAll(".alterar-situacao").forEach(btn => {
            btn.addEventListener("click", () => alterarSituacaoPublico(btn.dataset.index, btn.dataset.situacao));
        });
    }
    
    // Função para abrir modal de edição
    function abrirEdicaoPublico(index) {
        const publico = publicos[index];
        
        document.getElementById("editNomePublico").value = publico.nome;
        document.getElementById("editSituacaoPublico").value = publico.situacao;
        document.getElementById("publicoIndex").value = index;
        
        modalEdicao.show();
    }
    
    // Função para alterar situação do público-alvo
    function alterarSituacaoPublico(index, situacaoAtual) {
        const novaSituacao = situacaoAtual === "Ativo" ? "Inativo" : "Ativo";
        const confirmacao = confirm(`Deseja realmente ${novaSituacao === "Ativo" ? "ativar" : "inativar"} este público-alvo?`);
        
        if (confirmacao) {
            publicos[index].situacao = novaSituacao;
            salvarPublicos();
            renderizarLista();
            
            alert(`Público-alvo ${novaSituacao === "Ativo" ? "ativado" : "inativado"} com sucesso!`);
        }
    }

    // Evento de submissão do formulário de cadastro
    formulario.addEventListener("submit", (e) => {
        e.preventDefault();
        const nome = document.getElementById("nomePublico").value.trim().toUpperCase();
        const situacao = document.getElementById("situacaoPublico").value;
        
        if (!nome) {
            alert("O nome do público-alvo é obrigatório.");
            return;
        }
        
        // Verificar duplicidade
        if (publicos.some(p => p.nome === nome)) {
            alert("Este público-alvo já está cadastrado.");
            return;
        }
        
        publicos.push({ nome, situacao });
        salvarPublicos();
        renderizarLista();
        formulario.reset();
        
        alert("Público-alvo cadastrado com sucesso!");
    });
    
    // Evento de submissão do formulário de edição
    document.getElementById("formEdicaoPublico").addEventListener("submit", (e) => {
        e.preventDefault();
        
        const index = document.getElementById("publicoIndex").value;
        const novoNome = document.getElementById("editNomePublico").value.trim().toUpperCase();
        const novaSituacao = document.getElementById("editSituacaoPublico").value;
        
        if (!novoNome) {
            alert("O nome do público-alvo é obrigatório.");
            return;
        }
        
        // Verificar duplicidade apenas se o nome for diferente
        if (novoNome !== publicos[index].nome && 
            publicos.some(p => p.nome === novoNome)) {
            alert("Já existe um público-alvo com este nome.");
            return;
        }
        
        // Atualizar público-alvo
        publicos[index].nome = novoNome;
        publicos[index].situacao = novaSituacao;
        salvarPublicos();
        
        modalEdicao.hide();
        renderizarLista();
        
        alert("Público-alvo atualizado com sucesso!");
    });
    
    // Eventos de filtro
    filtroNome.addEventListener("input", renderizarLista);
    filtroSituacao.addEventListener("change", renderizarLista);

    // Inicialização
    renderizarLista();
});