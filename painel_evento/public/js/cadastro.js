document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formEvento");
    const publicoAlvoSelect = document.getElementById("publicoAlvoEvento");
    const exibirPainel = document.getElementById("exibirPainel");
    const destacarEvento = document.getElementById("destacarEvento");
    const participacaoEspecialContainer = document.getElementById("participacaoEspecialContainer");

    // Verificar se os elementos existem para evitar erros
    if (!form) {
        console.error("Elemento formEvento não encontrado");
        return;
    }

    // Carregar dados de apoio
    function carregarLocais() {
        const localSelect = document.getElementById("localEvento");
        if (!localSelect) {
            console.error("Elemento localEvento não encontrado");
            return;
        }

        try {
            const locais = JSON.parse(localStorage.getItem("locais")) || [];
            console.log("Locais carregados:", locais);
            
            localSelect.innerHTML = "<option value=''>Selecione um local</option>";
            
            locais
                .filter(loc => loc.situacao === "Ativo")
                .forEach(loc => {
                    const opt = document.createElement("option");
                    opt.text = loc.nome;
                    opt.value = loc.nome;
                    localSelect.add(opt);
                });
                
            console.log(`Carregados ${locais.length} locais, ${localSelect.options.length - 1} ativos`);
        } catch (error) {
            console.error("Erro ao carregar locais:", error);
            localSelect.innerHTML = "<option value=''>Erro ao carregar locais</option>";
        }
    }

    function carregarPublicos() {
        if (!publicoAlvoSelect) {
            console.error("Elemento publicoAlvoEvento não encontrado");
            return;
        }

        try {
            const publicos = JSON.parse(localStorage.getItem("publicos")) || [];
            console.log("Públicos carregados:", publicos);
            
            publicoAlvoSelect.innerHTML = "";
            
            publicos
                .filter(p => p.situacao === "Ativo")
                .forEach(p => {
                    const opt = document.createElement("option");
                    opt.text = p.nome;
                    opt.value = p.nome;
                    publicoAlvoSelect.add(opt);
                });
                
            console.log(`Carregados ${publicos.length} públicos, ${publicoAlvoSelect.options.length} ativos`);
        } catch (error) {
            console.error("Erro ao carregar públicos:", error);
            publicoAlvoSelect.innerHTML = "<option value=''>Erro ao carregar públicos</option>";
        }
    }

    function carregarResponsaveis() {
        const setorSelect = document.getElementById("setorEvento");
        const coordenacaoSelect = document.getElementById("coordenacaoEvento");
        const responsavelSelect = document.getElementById("responsavelEvento");
        
        if (!setorSelect || !coordenacaoSelect || !responsavelSelect) {
            console.error("Elementos da hierarquia de responsáveis não encontrados");
            return;
        }
        
        try {
            const responsaveis = JSON.parse(localStorage.getItem("responsaveis")) || [];
            console.log("Responsáveis carregados:", responsaveis);
            
            // Limpar selects
            setorSelect.innerHTML = "<option value=''>Selecione um setor</option>";
            coordenacaoSelect.innerHTML = "<option value=''>Selecione uma coordenação</option>";
            responsavelSelect.innerHTML = "<option value=''>Selecione um responsável</option>";
            
            // Carregar setores ativos
            const setores = [...new Set(responsaveis
                .filter(r => r.situacaoSetor === "Ativo")
                .map(r => r.setor))];
                
            setores.forEach(setor => {
                const opt = document.createElement("option");
                opt.text = setor;
                opt.value = setor;
                setorSelect.add(opt);
            });
            
            // Desabilitar coordenação e responsável até que setor seja selecionado
            coordenacaoSelect.disabled = true;
            responsavelSelect.disabled = true;
            
            console.log(`Carregados ${setores.length} setores ativos`);
        } catch (error) {
            console.error("Erro ao carregar responsáveis:", error);
            setorSelect.innerHTML = "<option value=''>Erro ao carregar setores</option>";
        }
    }

    // Eventos de controle de interface
    if (exibirPainel && destacarEvento && participacaoEspecialContainer) {
        exibirPainel.addEventListener("change", () => {
            destacarEvento.disabled = exibirPainel.value !== "Sim";
            if (exibirPainel.value !== "Sim") {
                destacarEvento.value = "Não";
                participacaoEspecialContainer.style.display = "none";
            }
        });
        
        destacarEvento.addEventListener("change", () => {
            participacaoEspecialContainer.style.display = 
                destacarEvento.value === "Sim" ? "block" : "none";
        });
    }
    
    // Carregar dados iniciais
    carregarPublicos();
    carregarLocais();
    carregarResponsaveis();
    
    // Controle de hierarquia de responsáveis
    const setorEvento = document.getElementById("setorEvento");
    if (setorEvento) {
        setorEvento.addEventListener("change", function() {
            const setor = this.value;
            const coordenacaoSelect = document.getElementById("coordenacaoEvento");
            const responsavelSelect = document.getElementById("responsavelEvento");
            
            if (!coordenacaoSelect || !responsavelSelect) return;
            
            coordenacaoSelect.innerHTML = "<option value=''>Selecione uma coordenação</option>";
            responsavelSelect.innerHTML = "<option value=''>Selecione um responsável</option>";
            
            if (!setor) {
                coordenacaoSelect.disabled = true;
                responsavelSelect.disabled = true;
                return;
            }
            
            try {
                const responsaveis = JSON.parse(localStorage.getItem("responsaveis")) || [];
                const coordenacoes = [...new Set(responsaveis
                    .filter(r => r.setor === setor && r.situacaoCoordenacao === "Ativo")
                    .map(r => r.coordenacao))];
                    
                coordenacoes.forEach(coord => {
                    const opt = document.createElement("option");
                    opt.text = coord;
                    opt.value = coord;
                    coordenacaoSelect.add(opt);
                });
                
                coordenacaoSelect.disabled = false;
                responsavelSelect.disabled = true;
                
                console.log(`Carregadas ${coordenacoes.length} coordenações para o setor ${setor}`);
            } catch (error) {
                console.error("Erro ao carregar coordenações:", error);
                coordenacaoSelect.innerHTML = "<option value=''>Erro ao carregar coordenações</option>";
            }
        });
    }
    
    const coordenacaoEvento = document.getElementById("coordenacaoEvento");
    if (coordenacaoEvento) {
        coordenacaoEvento.addEventListener("change", function() {
            const setor = document.getElementById("setorEvento")?.value;
            const coordenacao = this.value;
            const responsavelSelect = document.getElementById("responsavelEvento");
            
            if (!responsavelSelect || !setor) return;
            
            responsavelSelect.innerHTML = "<option value=''>Selecione um responsável</option>";
            
            if (!coordenacao) {
                responsavelSelect.disabled = true;
                return;
            }
            
            try {
                const responsaveis = JSON.parse(localStorage.getItem("responsaveis")) || [];
                const responsaveisLista = responsaveis
                    .filter(r => r.setor === setor && 
                                r.coordenacao === coordenacao && 
                                r.situacaoResponsavel === "Ativo")
                    .map(r => r.responsavel);
                    
                responsaveisLista.forEach(resp => {
                    const opt = document.createElement("option");
                    opt.text = resp;
                    opt.value = resp;
                    responsavelSelect.add(opt);
                });
                
                responsavelSelect.disabled = false;
                
                console.log(`Carregados ${responsaveisLista.length} responsáveis para a coordenação ${coordenacao}`);
            } catch (error) {
                console.error("Erro ao carregar responsáveis:", error);
                responsavelSelect.innerHTML = "<option value=''>Erro ao carregar responsáveis</option>";
            }
        });
    }

    // Submissão do formulário
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Validar campos obrigatórios
        const camposObrigatorios = [
            "nomeEvento", "localEvento", "modoEvento", "setorEvento", 
            "coordenacaoEvento", "responsavelEvento", "responsavelInformacao"
        ];
        
        let camposFaltando = [];
        camposObrigatorios.forEach(campo => {
            const elemento = document.getElementById(campo);
            if (!elemento || !elemento.value) {
                camposFaltando.push(campo);
            }
        });
        
        // Validar pelo menos um período
        const datas = document.querySelectorAll('input[name="dataPeriodo[]"]');
        const horasInicio = document.querySelectorAll('input[name="horaInicioPeriodo[]"]');
        const horasFim = document.querySelectorAll('input[name="horaFimPeriodo[]"]');
        
        let periodoValido = false;
        for (let i = 0; i < datas.length; i++) {
            if (datas[i].value && horasInicio[i].value && horasFim[i].value) {
                periodoValido = true;
                break;
            }
        }
        
        if (!periodoValido) {
            camposFaltando.push("período (data e horários)");
        }
        
        if (camposFaltando.length > 0) {
            alert(`Preencha todos os campos obrigatórios: ${camposFaltando.join(", ")}`);
            return;
        }
        
        // Coletar períodos
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

        // Criar objeto do evento
        const evento = {
            nome: document.getElementById("nomeEvento").value.trim(),
            descricao: document.getElementById("descricaoEvento").value.trim(),
            setor: document.getElementById("setorEvento").value.trim(),
            coordenacao: document.getElementById("coordenacaoEvento").value.trim(),
            responsavel: document.getElementById("responsavelEvento").value.trim(),
            local: document.getElementById("localEvento").value.trim(),
            modo: document.getElementById("modoEvento").value,
            periodos: periodos,
            publicoAlvo: Array.from(publicoAlvoSelect.selectedOptions).map(opt => opt.value),
            orgaoExterno: document.getElementById("orgaoExternoParticipa").value === "Sim" ? 
                document.getElementById("orgaoExternoEvento").value.trim() : "Não",
            numParticipantes: document.getElementById("numParticipantes").value.trim(),
            participacaoEspecial: destacarEvento && destacarEvento.value === "Sim" ? 
                document.getElementById("participacaoEspecial").value.trim() : "",
            exibirPainel: exibirPainel && exibirPainel.value === "Sim",
            destacarEvento: destacarEvento && destacarEvento.value === "Sim",
            responsavelCadastro: document.getElementById("responsavelInformacao").value.trim(),
            dataCadastro: new Date().toISOString(),
            excluido: false,
            historico: [{
                data: new Date().toISOString(),
                responsavel: document.getElementById("responsavelInformacao").value.trim(),
                acao: "Cadastro",
                justificativa: "Cadastro inicial"
            }]
        };

        try {
            // Salvar evento
            const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
            eventos.push(evento);
            localStorage.setItem("eventos", JSON.stringify(eventos));
            
            console.log("Evento salvo com sucesso:", evento);
            alert("Evento salvo com sucesso!");
            
            form.reset();
            carregarPublicos();
            carregarLocais();
            carregarResponsaveis();
            
            if (destacarEvento) destacarEvento.disabled = true;
            if (participacaoEspecialContainer) participacaoEspecialContainer.style.display = "none";
        } catch (error) {
            console.error("Erro ao salvar evento:", error);
            alert("Erro ao salvar evento. Verifique o console para mais detalhes.");
        }
    });
    
    // Log para debug
    console.log("Script de cadastro carregado com sucesso");
});