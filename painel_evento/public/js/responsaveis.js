document.addEventListener("DOMContentLoaded", () => {
    const formResponsavel = document.getElementById("formResponsavel");
    const listaResponsaveis = document.getElementById("listaResponsaveis");
    const filtroSetor = document.getElementById("filtroSetor");
    const filtroCoordenacao = document.getElementById("filtroCoordenacao");
    const filtroResponsavel = document.getElementById("filtroResponsavel");
    const filtroSituacao = document.getElementById("filtroSituacao");
    const modalEdicao = new bootstrap.Modal(document.getElementById("modalEdicaoResponsavel"));
    
    // Funções de acesso ao localStorage
    const getResponsaveis = () => JSON.parse(localStorage.getItem("responsaveis")) || [];
    const setResponsaveis = (responsaveis) => localStorage.setItem("responsaveis", JSON.stringify(responsaveis));

    // Renderizar lista de responsáveis com filtros
    function renderizarLista() {
        const termoSetor = filtroSetor.value.toLowerCase();
        const termoCoordenacao = filtroCoordenacao.value.toLowerCase();
        const termoResponsavel = filtroResponsavel.value.toLowerCase();
        const situacao = filtroSituacao.value;
        
        let responsaveis = getResponsaveis();
        
        // Aplicar filtros
        responsaveis = responsaveis.filter(resp => {
            // Filtro de setor
            if (termoSetor && !resp.setor.toLowerCase().includes(termoSetor)) return false;
            
            // Filtro de coordenação
            if (termoCoordenacao && !resp.coordenacao.toLowerCase().includes(termoCoordenacao)) return false;
            
            // Filtro de responsável
            if (termoResponsavel && !resp.responsavel.toLowerCase().includes(termoResponsavel)) return false;
            
            // Filtro de situação
            if (situacao === "Ativo" && 
                (resp.situacaoSetor !== "Ativo" || 
                 resp.situacaoCoordenacao !== "Ativo" || 
                 resp.situacaoResponsavel !== "Ativo")) return false;
                 
            if (situacao === "Inativo" && 
                (resp.situacaoSetor === "Ativo" && 
                 resp.situacaoCoordenacao === "Ativo" && 
                 resp.situacaoResponsavel === "Ativo")) return false;
            
            return true;
        });
        
        listaResponsaveis.innerHTML = "";
        
        if (responsaveis.length === 0) {
            listaResponsaveis.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">Nenhum responsável encontrado.</td>
                </tr>
            `;
            return;
        }
        
        responsaveis.forEach((resp, index) => {
            const tr = document.createElement("tr");
            
            // Definir classes de status
            const setorClass = resp.situacaoSetor === "Inativo" ? "text-danger" : "";
            const coordenacaoClass = resp.situacaoCoordenacao === "Inativo" ? "text-danger" : "";
            const responsavelClass = resp.situacaoResponsavel === "Inativo" ? "text-danger" : "";
            
            tr.innerHTML = `
                <td class="${setorClass}">${resp.setor}</td>
                <td>
                    <span class="badge ${resp.situacaoSetor === 'Ativo' ? 'bg-success' : 'bg-danger'}">
                        ${resp.situacaoSetor}
                    </span>
                </td>
                <td class="${coordenacaoClass}">${resp.coordenacao}</td>
                <td>
                    <span class="badge ${resp.situacaoCoordenacao === 'Ativo' ? 'bg-success' : 'bg-danger'}">
                        ${resp.situacaoCoordenacao}
                    </span>
                </td>
                <td class="${responsavelClass}">${resp.responsavel}</td>
                <td>
                    <span class="badge ${resp.situacaoResponsavel === 'Ativo' ? 'bg-success' : 'bg-danger'}">
                        ${resp.situacaoResponsavel}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary editar-responsavel" data-index="${index}">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                </td>
            `;
            listaResponsaveis.appendChild(tr);
        });
        
        // Adicionar eventos aos botões
        document.querySelectorAll(".editar-responsavel").forEach(btn => {
            btn.addEventListener("click", () => abrirEdicaoResponsavel(btn.dataset.index));
        });
    }
    
    // Função para abrir modal de edição
    function abrirEdicaoResponsavel(index) {
        const responsaveis = getResponsaveis();
        const resp = responsaveis[index];
        
        document.getElementById("editNomeSetor").value = resp.setor;
        document.getElementById("editNomeCoordenacao").value = resp.coordenacao;
        document.getElementById("editNomeResponsavel").value = resp.responsavel;
        document.getElementById("editSituacaoSetor").value = resp.situacaoSetor;
        document.getElementById("editSituacaoCoordenacao").value = resp.situacaoCoordenacao;
        document.getElementById("editSituacaoResponsavel").value = resp.situacaoResponsavel;
        document.getElementById("responsavelIndex").value = index;
        
        modalEdicao.show();
    }
    
    // Evento de submissão do formulário de cadastro
    formResponsavel.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const setor = document.getElementById("nomeSetor").value.trim().toUpperCase();
        const coordenacao = document.getElementById("nomeCoordenacao").value.trim().toUpperCase();
        const responsavel = document.getElementById("nomeResponsavel").value.trim().toUpperCase();
        const situacaoSetor = document.getElementById("situacaoSetor").value;
        const situacaoCoordenacao = document.getElementById("situacaoCoordenacao").value;
        const situacaoResponsavel = document.getElementById("situacaoResponsavel").value;
        
        if (!setor || !coordenacao || !responsavel) {
            alert("Todos os campos são obrigatórios.");
            return;
        }
        
        const responsaveis = getResponsaveis();
        
        // Verificar duplicidade
        if (responsaveis.some(r => 
            r.setor === setor && 
            r.coordenacao === coordenacao && 
            r.responsavel === responsavel)) {
            alert("Esta combinação de Setor, Coordenação e Responsável já está cadastrada.");
            return;
        }
        
        // Adicionar novo responsável
        responsaveis.push({
            setor,
            coordenacao,
            responsavel,
            situacaoSetor,
            situacaoCoordenacao,
            situacaoResponsavel
        });
        
        setResponsaveis(responsaveis);
        formResponsavel.reset();
        renderizarLista();
        
        alert("Responsável cadastrado com sucesso!");
    });
    
    // Evento de submissão do formulário de edição
    document.getElementById("formEdicaoResponsavel").addEventListener("submit", (e) => {
        e.preventDefault();
        
        const index = document.getElementById("responsavelIndex").value;
        const setor = document.getElementById("editNomeSetor").value.trim().toUpperCase();
        const coordenacao = document.getElementById("editNomeCoordenacao").value.trim().toUpperCase();
        const responsavel = document.getElementById("editNomeResponsavel").value.trim().toUpperCase();
        const situacaoSetor = document.getElementById("editSituacaoSetor").value;
        const situacaoCoordenacao = document.getElementById("editSituacaoCoordenacao").value;
        const situacaoResponsavel = document.getElementById("editSituacaoResponsavel").value;
        
        if (!setor || !coordenacao || !responsavel) {
            alert("Todos os campos são obrigatórios.");
            return;
        }
        
        const responsaveis = getResponsaveis();
        
        // Verificar duplicidade apenas se algum dos valores for diferente
        const respAtual = responsaveis[index];
        if (setor !== respAtual.setor || 
            coordenacao !== respAtual.coordenacao || 
            responsavel !== respAtual.responsavel) {
                
            if (responsaveis.some((r, i) => 
                i !== parseInt(index) && 
                r.setor === setor && 
                r.coordenacao === coordenacao && 
                r.responsavel === responsavel)) {
                alert("Esta combinação de Setor, Coordenação e Responsável já está cadastrada.");
                return;
            }
        }
        
        // Atualizar responsável
        responsaveis[index] = {
            setor,
            coordenacao,
            responsavel,
            situacaoSetor,
            situacaoCoordenacao,
            situacaoResponsavel
        };
        
        // Verificar se é necessário atualizar em cascata
        if (situacaoSetor === "Inativo") {
            // Se o setor for inativado, inativar coordenações e responsáveis relacionados
            responsaveis.forEach((r, i) => {
                if (r.setor === setor && i !== parseInt(index)) {
                    r.situacaoSetor = "Inativo";
                    r.situacaoCoordenacao = "Inativo";
                    r.situacaoResponsavel = "Inativo";
                }
            });
        } else if (situacaoCoordenacao === "Inativo") {
            // Se a coordenação for inativada, inativar responsáveis relacionados
            responsaveis.forEach((r, i) => {
                if (r.setor === setor && 
                    r.coordenacao === coordenacao && 
                    i !== parseInt(index)) {
                    r.situacaoCoordenacao = "Inativo";
                    r.situacaoResponsavel = "Inativo";
                }
            });
        }
        
        setResponsaveis(responsaveis);
        modalEdicao.hide();
        renderizarLista();
        
        alert("Responsável atualizado com sucesso!");
    });
    
    // Eventos de filtro
    filtroSetor.addEventListener("input", renderizarLista);
    filtroCoordenacao.addEventListener("input", renderizarLista);
    filtroResponsavel.addEventListener("input", renderizarLista);
    filtroSituacao.addEventListener("change", renderizarLista);
    
    // Inicialização
    renderizarLista();
});