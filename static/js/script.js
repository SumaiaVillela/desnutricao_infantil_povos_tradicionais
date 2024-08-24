// Função para carregar os dados do arquivo JSON
async function carregarDados() {
    try {
        const resposta = await fetch('dados_nutri_comunidades_grafico.json');
        return await resposta.json();
    } catch (erro) {
        console.error('Erro ao carregar os dados:', erro);
        return {};
    }
}

// Função para obter a cor baseada no valor e tipo de peso
function obterCor(valor, ehMuitoBaixoPeso) {
    if (valor === undefined) return "#E0E0E0"; // Cinza claro para dados não registrados
    const intensidade = Math.min(valor / 10, 1);
    if (ehMuitoBaixoPeso) {
        // Escala de laranja para muito baixo peso
        const r = 255;
        const g = Math.round(255 - (255 - 165) * intensidade);
        const b = Math.round(255 - 255 * intensidade);
        return `rgb(${r}, ${g}, ${b})`;
    } else {
        // Escala de amarelo para baixo peso
        const r = 255;
        const g = Math.round(255 - (255 - 255) * intensidade);
        const b = Math.round(255 - 255 * intensidade);
        return `rgb(${r}, ${g}, ${b})`;
    }
}

// Função para calcular a largura dos quadrados
function calcularLarguraQuadrado() {
    const totalMeses = 16 * 12; // 16 anos * 12 meses
    return 5; // Largura fixa de 5px
}

// Função principal para criar o gráfico
function criarGrafico(dados) {
    const conteinerGrafico = document.getElementById("grafico");
    const todosMeses = obterTodosMeses();
    const larguraQuadrado = calcularLarguraQuadrado();

    for (const [comunidade, dadosComunidade] of Object.entries(dados)) {
        const linha = document.createElement("div");
        linha.className = "linha";

        const elementoNomeComunidade = document.createElement("div");
        elementoNomeComunidade.className = "nome-comunidade";
        elementoNomeComunidade.textContent = comunidade;
        linha.appendChild(elementoNomeComunidade);

        const conteinerQuadrados = document.createElement("div");
        conteinerQuadrados.className = "conteiner-quadrados";

        todosMeses.forEach((chaveData, indice) => {
            const quadrado = document.createElement("div");
            quadrado.className = "quadrado";
            quadrado.style.width = `${larguraQuadrado}px`;

            const baixoPeso = dadosComunidade[0]?.[chaveData];
            const muitoBaixoPeso = dadosComunidade[1]?.[chaveData];

            let valor, ehMuitoBaixoPeso;
            if (muitoBaixoPeso > baixoPeso) {
                valor = muitoBaixoPeso;
                ehMuitoBaixoPeso = true;
            } else {
                valor = baixoPeso;
                ehMuitoBaixoPeso = false;
            }

            quadrado.style.backgroundColor = obterCor(valor, ehMuitoBaixoPeso);

            conteinerQuadrados.appendChild(quadrado);
        });

        linha.appendChild(conteinerQuadrados);
        conteinerGrafico.appendChild(linha);
    }

    criarEixoX(todosMeses);
}

// Função para criar o eixo X do gráfico
function criarEixoX(todosMeses) {
    const eixoX = document.getElementById("eixoX");
    eixoX.innerHTML = ''; // Limpa o eixo X existente
    const larguraQuadrado = calcularLarguraQuadrado();

    todosMeses.forEach((chaveData, indice) => {
        const [ano, mes] = chaveData.slice(1, -1).split(", ").map(Number);
        if (mes === 1) {
            const rotulo = document.createElement("div");
            rotulo.className = "rotulo-eixo-x";
            rotulo.textContent = ano;
            rotulo.style.left = `${indice * larguraQuadrado}px`;
            eixoX.appendChild(rotulo);
        }
    });
}

// Função para criar a escala de cores na legenda
function criarEscalaCor(idElemento, ehMuitoBaixoPeso) {
    const escala = document.getElementById(idElemento);
    const gradiente = [];
    for (let i = 0; i <= 10; i++) {
        const cor = obterCor(i, ehMuitoBaixoPeso);
        gradiente.push(`${cor} ${i * 10}%`);
    }
    escala.style.background = `linear-gradient(to right, ${gradiente.join(', ')})`;
}

// Função para obter todos os meses do período
function obterTodosMeses() {
    const meses = [];
    for (let ano = 2008; ano <= 2023; ano++) {
        for (let mes = 1; mes <= 12; mes++) {
            meses.push(`(${ano}, ${mes})`);
        }
    }
    return meses;
}

// Carrega os dados e cria o gráfico
carregarDados().then(dados => {
    if (Object.keys(dados).length > 0) {
        criarGrafico(dados);
        criarEscalaCor("escalaBaixoPeso", false);
        criarEscalaCor("escalaMuitoBaixoPeso", true);
    } else {
        console.error('Nenhum dado foi carregado.');
        document.getElementById("grafico").textContent = 'Erro: Nenhum dado disponível.';
    }
}).catch(erro => {
    console.error('Erro ao criar o gráfico:', erro);
    document.getElementById("grafico").textContent = 'Erro ao carregar os dados.';
});