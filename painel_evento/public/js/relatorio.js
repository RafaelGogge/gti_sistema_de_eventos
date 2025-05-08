document.addEventListener("DOMContentLoaded", () => {
    const formRelatorio = document.getElementById("formRelatorio");
    const resultadoRelatorio = document.getElementById("resultadoRelatorio");
    const tabelaRelatorio = document.getElementById("tabelaRelatorio");
    const periodoRelatorio = document.getElementById("periodoRelatorio");
    const totalEventos = document.getElementById("totalEventos");
    const btnExportarPDF = document.getElementById("btnExportarPDF");
    const btnExportarExcel = document.getElementById("btnExportarExcel");

    // Elementos de filtro
    const filtroSituacao = document.getElementById("filtroSituacao");
    const filtroDataInicial = document.getElementById("filtroDataInicial");
    const filtroDataFinal = document.getElementById("filtroDataFinal");
    const filtroLocal = document.getElementById("filtroLocal");
    const filtroSetor = document.getElementById("filtroSetor");
    const filtroCoordenacao = document.getElementById("filtroCoordenacao");
    const filtroResponsavel = document.getElementById("filtroResponsavel");

    // Variável para armazenar os eventos filtrados (para exportação)
    let eventosFiltrados = [];

    // Funções de acesso ao localStorage
    const getEventos = () => JSON.parse(localStorage.getItem("eventos")) || [];
    const getLocais = () => JSON.parse(localStorage.getItem("locais")) || [];
    const getResponsaveis = () => JSON.parse(localStorage.getItem("responsaveis")) || [];

    // Carregar dados para os filtros
    function carregarDadosFiltros() {
        // Carregar locais
        const locais = getLocais();
        filtroLocal.innerHTML = "<option value=''>Todos os locais</option>";
        locais.forEach(local => {
            const opt = document.createElement("option");
            opt.value = local.nome;
            opt.textContent = local.nome;
            filtroLocal.appendChild(opt);
        });

        // Carregar setores
        const responsaveis = getResponsaveis();
        const setores = [...new Set(responsaveis.map(r => r.setor))];
        filtroSetor.innerHTML = "<option value=''>Todos os setores</option>";
        setores.forEach(setor => {
            const opt = document.createElement("option");
            opt.value = setor;
            opt.textContent = setor;
            filtroSetor.appendChild(opt);
        });
    }

    // Atualizar coordenações com base no setor selecionado
    function atualizarCoordenacoes() {
        const setor = filtroSetor.value;
        filtroCoordenacao.innerHTML = "<option value=''>Todas as coordenações</option>";
        filtroCoordenacao.disabled = !setor;

        if (setor) {
            const responsaveis = getResponsaveis();
            const coordenacoes = [...new Set(
                responsaveis
                    .filter(r => r.setor === setor)
                    .map(r => r.coordenacao)
            )];

            coordenacoes.forEach(coord => {
                const opt = document.createElement("option");
                opt.value = coord;
                opt.textContent = coord;
                filtroCoordenacao.appendChild(opt);
            });
        }

        // Resetar responsáveis
        filtroResponsavel.innerHTML = "<option value=''>Todos os responsáveis</option>";
        filtroResponsavel.disabled = true;
    }

    // Atualizar responsáveis com base na coordenação selecionada
    function atualizarResponsaveis() {
        const setor = filtroSetor.value;
        const coordenacao = filtroCoordenacao.value;
        filtroResponsavel.innerHTML = "<option value=''>Todos os responsáveis</option>";
        filtroResponsavel.disabled = !coordenacao;

        if (setor && coordenacao) {
            const responsaveis = getResponsaveis();
            const responsaveisFiltrados = responsaveis
                .filter(r => r.setor === setor && r.coordenacao === coordenacao)
                .map(r => r.responsavel);

            responsaveisFiltrados.forEach(resp => {
                const opt = document.createElement("option");
                opt.value = resp;
                opt.textContent = resp;
                filtroResponsavel.appendChild(opt);
            });
        }
    }

    // Determinar situação do evento
    function determinarSituacaoEvento(evento) {
        if (!evento.periodos || evento.periodos.length === 0) {
            return "Indefinido";
        }

        // Verificar todos os períodos do evento
        const agora = new Date();
        let situacao = "Agendado";

        for (const periodo of evento.periodos) {
            if (!periodo.data) continue;

            const dataEvento = new Date(periodo.data);
            const horaInicio = periodo.horaInicio ?
                periodo.horaInicio.split(":") : [0, 0];
            const horaFim = periodo.horaFim ?
                periodo.horaFim.split(":") : [23, 59];

            const inicioEvento = new Date(dataEvento);
            inicioEvento.setHours(parseInt(horaInicio[0]), parseInt(horaInicio[1]));

            const fimEvento = new Date(dataEvento);
            fimEvento.setHours(parseInt(horaFim[0]), parseInt(horaFim[1]));

            if (agora >= inicioEvento && agora <= fimEvento) {
                return "Acontecendo"; // Prioridade máxima
            } else if (agora > fimEvento) {
                situacao = "Concluído"; // Pode ser sobrescrito se outro período estiver acontecendo
            }
        }

        return situacao;
    }

    // Filtrar eventos conforme critérios
    function filtrarEventos() {
        const situacao = filtroSituacao.value;
        const dataInicial = filtroDataInicial.value;
        const dataFinal = filtroDataFinal.value;
        const local = filtroLocal.value;
        const setor = filtroSetor.value;
        const coordenacao = filtroCoordenacao.value;
        const responsavel = filtroResponsavel.value;

        let eventos = getEventos();

        // Filtrar apenas eventos ativos
        eventos = eventos.filter(evento => !evento.excluido);

        // Aplicar filtros
        if (situacao !== "Todos") {
            eventos = eventos.filter(evento => determinarSituacaoEvento(evento) === situacao);
        }

        if (local) {
            eventos = eventos.filter(evento => evento.local === local);
        }

        if (setor) {
            eventos = eventos.filter(evento => evento.setor === setor);
        }

        if (coordenacao) {
            eventos = eventos.filter(evento => evento.coordenacao === coordenacao);
        }

        if (responsavel) {
            eventos = eventos.filter(evento => evento.responsavel === responsavel);
        }

        // Filtrar por período
        if (dataInicial || dataFinal) {
            eventos = eventos.filter(evento => {
                if (!evento.periodos || evento.periodos.length === 0) return false;

                return evento.periodos.some(periodo => {
                    if (!periodo.data) return false;

                    return (!dataInicial || periodo.data >= dataInicial) &&
                        (!dataFinal || periodo.data <= dataFinal);
                });
            });
        }

        return eventos;
    }

    // Gerar relatório
    function gerarRelatorio() {
        eventosFiltrados = filtrarEventos();
        resultadoRelatorio.classList.remove("d-none");
        tabelaRelatorio.innerHTML = "";

        // Atualizar período do relatório
        let textoPeriodo = "Todos os períodos";
        if (filtroDataInicial.value && filtroDataFinal.value) {
            const dataInicial = new Date(filtroDataInicial.value);
            const dataFinal = new Date(filtroDataFinal.value);
            textoPeriodo = `Período: ${dataInicial.toLocaleDateString('pt-BR')} a ${dataFinal.toLocaleDateString('pt-BR')}`;
        } else if (filtroDataInicial.value) {
            const dataInicial = new Date(filtroDataInicial.value);
            textoPeriodo = `A partir de: ${dataInicial.toLocaleDateString('pt-BR')}`;
        } else if (filtroDataFinal.value) {
            const dataFinal = new Date(filtroDataFinal.value);
            textoPeriodo = `Até: ${dataFinal.toLocaleDateString('pt-BR')}`;
        }
        periodoRelatorio.textContent = textoPeriodo;

        // Atualizar total de eventos
        totalEventos.textContent = `Total de eventos: ${eventosFiltrados.length}`;

        if (eventosFiltrados.length === 0) {
            tabelaRelatorio.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">Nenhum evento encontrado com os filtros selecionados.</td>
                </tr>
            `;
            return;
        }

        // Ordenar eventos por data
        eventosFiltrados.sort((a, b) => {
            const dataA = a.periodos && a.periodos.length > 0 ? a.periodos[0].data : "";
            const dataB = b.periodos && b.periodos.length > 0 ? b.periodos[0].data : "";
            return dataA.localeCompare(dataB);
        });

        // Preencher tabela
        eventosFiltrados.forEach(evento => {
            const primeiroPeriodo = evento.periodos && evento.periodos.length > 0 ?
                evento.periodos[0] : {};

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${evento.nome}</td>
                <td>${primeiroPeriodo.data || 'N/D'}</td>
                <td>${primeiroPeriodo.horaInicio || 'N/D'} - ${primeiroPeriodo.horaFim || 'N/D'}</td>
                <td>${evento.local}</td>
                <td>${evento.modo}</td>
                <td>${evento.numParticipantes || 'N/D'}</td>
                <td>${evento.setor}</td>
                <td>${determinarSituacaoEvento(evento)}</td>
            `;
            tabelaRelatorio.appendChild(tr);
        });
    }

    // Exportar para PDF
    function exportarPDF() {
        const { jsPDF } = window.jspdf;

        // Criar instância do PDF
        const doc = new jsPDF('landscape', 'mm', 'a4');
        const conteudo = document.getElementById("conteudoRelatorio");

        // Adicionar título
        doc.setFontSize(18);
        doc.text("Relatório de Eventos SSVS", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

        // Adicionar período
        doc.setFontSize(12);
        doc.text(periodoRelatorio.textContent, doc.internal.pageSize.getWidth() / 2, 30, { align: "center" });

        // Capturar tabela como imagem
        html2canvas(conteudo).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = doc.internal.pageSize.getWidth() - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            doc.addImage(imgData, 'PNG', 10, 40, imgWidth, imgHeight);

            // Adicionar rodapé
            const dataGeracao = new Date().toLocaleString('pt-BR');
            doc.setFontSize(10);
            doc.text(`Relatório gerado em: ${dataGeracao}`, 10, doc.internal.pageSize.getHeight() - 10);

            // Salvar PDF
            doc.save("relatorio-eventos-ssvs.pdf");
        });
    }

    // Exportar para Excel
    function exportarExcel() {
        // Verificar se há eventos para exportar
        if (eventosFiltrados.length === 0) {
            alert("Não há dados para exportar.");
            return;
        }

        try {
            // Preparar dados para o Excel
            const dadosExcel = eventosFiltrados.map(evento => {
                const primeiroPeriodo = evento.periodos && evento.periodos.length > 0 ?
                    evento.periodos[0] : {};

                return {
                    "Nome do Evento": evento.nome,
                    "Data": primeiroPeriodo.data || 'N/D',
                    "Horário": `${primeiroPeriodo.horaInicio || 'N/D'} - ${primeiroPeriodo.horaFim || 'N/D'}`,
                    "Local": evento.local,
                    "Modo": evento.modo,
                    "Participantes": evento.numParticipantes || 'N/D',
                    "Setor": evento.setor,
                    "Coordenação": evento.coordenacao || 'N/D',
                    "Responsável": evento.responsavel || 'N/D',
                    "Situação": determinarSituacaoEvento(evento),
                    "Descrição": evento.descricao || 'N/D'
                };
            });

            // Criar uma planilha
            const ws = XLSX.utils.json_to_sheet(dadosExcel);

            // Ajustar largura das colunas
            const wscols = [
                { wch: 30 }, // Nome do Evento
                { wch: 12 }, // Data
                { wch: 15 }, // Horário
                { wch: 20 }, // Local
                { wch: 12 }, // Modo
                { wch: 15 }, // Participantes
                { wch: 20 }, // Setor
                { wch: 20 }, // Coordenação
                { wch: 20 }, // Responsável
                { wch: 12 }, // Situação
                { wch: 40 }  // Descrição
            ];
            ws['!cols'] = wscols;

            // Criar um livro
            const wb = XLSX.utils.book_new();

            // Adicionar informações de cabeçalho
            const dataGeracao = new Date().toLocaleString('pt-BR');
            const titulo = "Relatório de Eventos SSVS";
            const periodo = periodoRelatorio.textContent;
            const total = `Total de eventos: ${eventosFiltrados.length}`;
            const info = `Relatório gerado em: ${dataGeracao}`;

            // Adicionar a planilha ao livro
            XLSX.utils.book_append_sheet(wb, ws, "Eventos");

            // Adicionar informações de cabeçalho na planilha
            XLSX.utils.sheet_add_aoa(ws, [
                [titulo],
                [periodo],
                [total],
                [info],
                [""] // Linha em branco
            ], { origin: "A1" });

            // Mesclar células para o título
            if (!ws['!merges']) ws['!merges'] = [];
            ws['!merges'].push(
                { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }, // Título
                { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } }, // Período
                { s: { r: 2, c: 0 }, e: { r: 2, c: 10 } }, // Total
                { s: { r: 3, c: 0 }, e: { r: 3, c: 10 } }  // Info
            );

            // Exportar para arquivo Excel
            XLSX.writeFile(wb, "relatorio-eventos-ssvs.xlsx");

        } catch (error) {
            console.error("Erro ao exportar para Excel:", error);
            alert("Ocorreu um erro ao exportar para Excel. Verifique o console para mais detalhes.");
        }
    }

    // Eventos
    formRelatorio.addEventListener("submit", (e) => {
        e.preventDefault();
        gerarRelatorio();
    });

    formRelatorio.addEventListener("reset", () => {
        resultadoRelatorio.classList.add("d-none");
        filtroCoordenacao.disabled = true;
        filtroResponsavel.disabled = true;
    });

    filtroSetor.addEventListener("change", () => {
        atualizarCoordenacoes();
    });

    filtroCoordenacao.addEventListener("change", () => {
        atualizarResponsaveis();
    });

    btnExportarPDF.addEventListener("click", exportarPDF);
    btnExportarExcel.addEventListener("click", exportarExcel);

    // Inicialização
    carregarDadosFiltros();
});