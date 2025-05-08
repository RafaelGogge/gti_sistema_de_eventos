document.addEventListener("DOMContentLoaded", () => {
    const formParametrizacao = document.getElementById("formParametrizacao");
    const previaPainel = document.getElementById("previaPainel");
    const previaRelogio = document.getElementById("previaRelogio");
    
    // Elementos de configuração
    const periodoExibicao = document.getElementById("periodoExibicao");
    const tempoAtualizacao = document.getElementById("tempoAtualizacao");
    const corFundoPainel = document.getElementById("corFundoPainel");
    const corTextoPainel = document.getElementById("corTextoPainel");
    const corDestaque = document.getElementById("corDestaque");
    const tamanhoFonte = document.getElementById("tamanhoFonte");
    const exibirLogo = document.getElementById("exibirLogo");
    const exibirRelogio = document.getElementById("exibirRelogio");
    
    // Funções de acesso ao localStorage
    const getParametros = () => JSON.parse(localStorage.getItem("parametrosPainel")) || getParametrosPadrao();
    const setParametros = (parametros) => localStorage.setItem("parametrosPainel", JSON.stringify(parametros));
    
    // Parâmetros padrão
    function getParametrosPadrao() {
        return {
            periodoExibicao: "Diario",
            tempoAtualizacao: 60,
            corFundoPainel: "#ffffff",
            corTextoPainel: "#000000",
            corDestaque: "#007bff",
            tamanhoFonte: 16,
            exibirLogo: true,
            exibirRelogio: true
        };
    }
    
    // Carregar parâmetros salvos
    function carregarParametros() {
        const parametros = getParametros();
        
        periodoExibicao.value = parametros.periodoExibicao;
        tempoAtualizacao.value = parametros.tempoAtualizacao;
        corFundoPainel.value = parametros.corFundoPainel;
        corTextoPainel.value = parametros.corTextoPainel;
        corDestaque.value = parametros.corDestaque;
        tamanhoFonte.value = parametros.tamanhoFonte;
        exibirLogo.checked = parametros.exibirLogo;
        exibirRelogio.checked = parametros.exibirRelogio;
        
        atualizarPrevia();
    }
    
    // Atualizar prévia do painel
    function atualizarPrevia() {
        // Aplicar cores e estilos
        previaPainel.style.backgroundColor = corFundoPainel.value;
        previaPainel.style.color = corTextoPainel.value;
        previaPainel.style.fontSize = `${tamanhoFonte.value}px`;
        
        // Atualizar texto do período
        let textoPeriodo = "do dia";
        if (periodoExibicao.value === "Semanal") {
            textoPeriodo = "da semana";
        } else if (periodoExibicao.value === "Mensal") {
            textoPeriodo = "do mês";
        }
        
        document.querySelector("#previaPainel p").textContent = `Exibindo eventos ${textoPeriodo}`;
        
        // Exibir/ocultar relógio
        previaRelogio.style.display = exibirRelogio.checked ? "block" : "none";
        
        // Atualizar cores de destaque
        const cardDestacado = document.querySelector(".card-header.bg-primary");
        const borderDestacado = document.querySelector(".border-primary");
        
        if (cardDestacado && borderDestacado) {
            cardDestacado.style.backgroundColor = corDestaque.value;
            borderDestacado.style.borderColor = corDestaque.value + " !important";
        }
    }
    
    // Eventos para atualização da prévia em tempo real
    periodoExibicao.addEventListener("change", atualizarPrevia);
    corFundoPainel.addEventListener("input", atualizarPrevia);
    corTextoPainel.addEventListener("input", atualizarPrevia);
    corDestaque.addEventListener("input", atualizarPrevia);
    tamanhoFonte.addEventListener("input", atualizarPrevia);
    exibirLogo.addEventListener("change", atualizarPrevia);
    exibirRelogio.addEventListener("change", atualizarPrevia);
    
    // Submissão do formulário
    formParametrizacao.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Validar tempo de atualização
        const tempo = parseInt(tempoAtualizacao.value);
        if (tempo < 10 || tempo > 300) {
            alert("O tempo de atualização deve estar entre 10 e 300 segundos.");
            return;
        }
        
        // Salvar parâmetros
        const parametros = {
            periodoExibicao: periodoExibicao.value,
            tempoAtualizacao: tempo,
            corFundoPainel: corFundoPainel.value,
            corTextoPainel: corTextoPainel.value,
            corDestaque: corDestaque.value,
            tamanhoFonte: parseInt(tamanhoFonte.value),
            exibirLogo: exibirLogo.checked,
            exibirRelogio: exibirRelogio.checked
        };
        
        setParametros(parametros);
        alert("Configurações salvas com sucesso!");
    });
    
    // Atualizar relógio da prévia
    function atualizarRelogio() {
        const agora = new Date();
        const horas = agora.getHours().toString().padStart(2, '0');
        const minutos = agora.getMinutes().toString().padStart(2, '0');
        previaRelogio.textContent = `${horas}:${minutos}`;
    }
    
    // Inicialização
    carregarParametros();
    atualizarRelogio();
    setInterval(atualizarRelogio, 1000);
});