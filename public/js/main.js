// Enumerações para estados e modos
const EstadoFinanceiro = {
    SOBREVIVENCIA_ATIVA: 'Sobrevivência Ativa',
    RECUPERACAO_INICIAL: 'Recuperação Inicial',
    ESTABILIDADE_BASICA: 'Estabilidade Básica',
    EXPANSAO: 'Expansão',
};

const ModoUsuario = {
    CONSCIENCIA: 'Consciência',
    NORMAL: 'Normal',
};

// Estruturas de Dados
class Usuario {
    constructor(id, saldoInicial) {
        this.id = id;
        this.estadoFinanceiro = EstadoFinanceiro.SOBREVIVENCIA_ATIVA;
        this.modo = ModoUsuario.CONSCIENCIA;
        this.saldoAtual = saldoInicial;
        this.scoreEstabilidade = 0;
    }
}

// Módulos do Sistema (versões simplificadas em JS)
const Motor = {
    atualizarEstado: (usuario) => {
        if (usuario.saldoAtual < 2000) {
            usuario.estadoFinanceiro = EstadoFinanceiro.SOBREVIVENCIA_ATIVA;
        } else if (usuario.saldoAtual >= 2000 && usuario.saldoAtual < 10000) {
            usuario.estadoFinanceiro = EstadoFinanceiro.RECUPERACAO_INICIAL;
        } else if (usuario.saldoAtual >= 10000 && usuario.saldoAtual < 30000) {
            usuario.estadoFinanceiro = EstadoFinanceiro.ESTABILIDADE_BASICA;
        } else {
            usuario.estadoFinanceiro = EstadoFinanceiro.EXPANSAO;
        }
    }
};

const GestorFinanceiro = {
    calcularScore: (usuario) => {
        // Lógica simplificada para o score
        return Math.min(100, Math.floor(usuario.saldoAtual / 300)); 
    }
};

const DirecionadorEstrategico = {
    gerarRecomendacoes: (estado) => {
        switch (estado) {
            case EstadoFinanceiro.SOBREVIVENCIA_ATIVA:
                return [
                    { tipo: 'Evitar Risco', justificativa: 'Foco total em garantir a continuidade.' },
                    { tipo: 'Aumentar Renda', justificativa: 'Busque ativamente novas fontes de renda.' }
                ];
            case EstadoFinanceiro.RECUPERACAO_INICIAL:
                 return [
                    { tipo: 'Manter Conservador', justificativa: 'Continue priorizando a criação de uma reserva.' },
                ];
            case EstadoFinanceiro.ESTABILIDADE_BASICA:
                return [
                    { tipo: 'Otimizar Gastos', justificativa: 'Analise e otimize suas despesas mensais.' },
                    { tipo: 'Aprender a Investir', justificativa: 'Comece a estudar investimentos de baixo risco.' }
                ];
            case EstadoFinanceiro.EXPANSAO:
                return [
                    { tipo: 'Explorar Investimentos', justificativa: 'Diversifique seu portfólio com ativos de maior potencial.' },
                    { tipo: 'Planejar Longo Prazo', justificativa: 'Defina metas financeiras de longo prazo.' }
                ];
            default:
                return [];
        }
    }
};

const Marketplace = {
    oportunidades: [
        { id: 'op-01', nome: 'Curso de Finanças Pessoais', requisitoEstado: EstadoFinanceiro.RECUPERACAO_INICIAL, requisitoScore: 30 },
        { id: 'op-02', nome: 'Plano de Investimento Conservador', requisitoEstado: EstadoFinanceiro.ESTABILIDADE_BASICA, requisitoScore: 60 },
        { id: 'op-03', nome: 'Linha de Crédito para Negócios', requisitoEstado: EstadoFinanceiro.EXPANSAO, requisitoScore: 90 },
    ],

    filtrarOportunidades: (estado, score) => {
        return Marketplace.oportunidades.filter(op => {
            // Lógica para verificar se o estado do usuário é igual ou superior ao requisito
            const estados = Object.values(EstadoFinanceiro);
            const indiceUsuario = estados.indexOf(estado);
            const indiceRequisito = estados.indexOf(op.requisitoEstado);
            
            return indiceUsuario >= indiceRequisito && score >= op.requisitoScore;
        });
    }
};

const GestorDeExpansao = {
    criarPlanoDeExpansao: (usuario, objetivo) => {
        if (usuario.estadoFinanceiro !== EstadoFinanceiro.EXPANSAO) {
            return { erro: 'Operações de expansão só são permitidas no estado \'Expansão\'.' };
        }
        return { id: `plano-${Date.now()}`, objetivo, ativos: [] };
    }
};


// --- LÓGICA DA SIMULAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    const outputDiv = document.getElementById('simulation-output');

    function log(html) {
        outputDiv.innerHTML += html;
    }

    function simular() {
        log('<h2>Iniciando a Simulação...</h2>');

        // 1. Onboarding do Usuário
        let usuario = new Usuario('user-js-01', 1500);
        log(`<div class="simulation-step"><h2>Passo 1: Onboarding</h2><p>Usuário criado em estado de <span class="highlight">${usuario.estadoFinanceiro}</span> com saldo de R$ ${usuario.saldoAtual}.</p></div>`);

        // 2. Primeira Análise
        let score = GestorFinanceiro.calcularScore(usuario);
        usuario.scoreEstabilidade = score;
        let recomendacoes = DirecionadorEstrategico.gerarRecomendacoes(usuario.estadoFinanceiro);
        let oportunidades = Marketplace.filtrarOportunidades(usuario.estadoFinanceiro, usuario.scoreEstabilidade);
        
        let recommendationsHtml = recomendacoes.map(r => `<li>[${r.tipo}] ${r.justificativa}</li>`).join('');
        let marketplaceHtml = oportunidades.length > 0 ? oportunidades.map(o => `<li>${o.nome}</li>`).join('') : '<li>Nenhuma oportunidade disponível.</li>';

        log(`<div class="simulation-step"><h2>Passo 2: Análise Inicial (Estado: ${usuario.estadoFinanceiro})</h2>
            <p>Score de Estabilidade: <span class="highlight">${usuario.scoreEstabilidade}</span></p>
            <div class="recommendations"><h3>Recomendações:</h3><ul>${recommendationsHtml}</ul></div>
            <div class="marketplace"><h3>Marketplace:</h3><ul>${marketplaceHtml}</ul></div>
        </div>`);
        
        // 3. Evolução do Usuário
        log('<h2>...Simulando melhoria na saúde financeira...</h2>');
        usuario.saldoAtual = 25000;
        Motor.atualizarEstado(usuario);
        score = GestorFinanceiro.calcularScore(usuario);
        usuario.scoreEstabilidade = score;

        recomendacoes = DirecionadorEstrategico.gerarRecomendacoes(usuario.estadoFinanceiro);
        oportunidades = Marketplace.filtrarOportunidades(usuario.estadoFinanceiro, usuario.scoreEstabilidade);
        
        recommendationsHtml = recomendacoes.map(r => `<li>[${r.tipo}] ${r.justificativa}</li>`).join('');
        marketplaceHtml = oportunidades.map(o => `<li>${o.nome}</li>`).join('');

        log(`<div class="simulation-step"><h2>Passo 3: Evolução (Novo Estado: ${usuario.estadoFinanceiro})</h2>
            <p>Novo Saldo: R$ ${usuario.saldoAtual}</p>
            <p>Novo Score de Estabilidade: <span class="highlight">${usuario.scoreEstabilidade}</span></p>
            <div class="recommendations"><h3>Recomendações:</h3><ul>${recommendationsHtml}</ul></div>
            <div class="marketplace"><h3>Marketplace:</h3><ul>${marketplaceHtml}</ul></div>
        </div>`);

        // 4. Camada de Expansão
        let plano = GestorDeExpansao.criarPlanoDeExpansao(usuario, 'Comprar um imóvel');
        let expansionHtml;
        if (plano.erro) {
            expansionHtml = `<p class="error">Tentativa de Expansão Falhou: ${plano.erro}</p>`;
        } else {
            expansionHtml = `<p>Plano de Expansão criado com o objetivo: <span class="highlight">'${plano.objetivo}'</span>.</p>`;
        }

        // Forçar a entrada no modo expansão para demonstrar
        usuario.saldoAtual = 50000; 
        Motor.atualizarEstado(usuario);
        plano = GestorDeExpansao.criarPlanoDeExpansão(usuario, 'Atingir a independência financeira');
        if (!plano.erro) {
             expansionHtml += `<br><p>Usuário agora no estado de <span class="highlight">${usuario.estadoFinanceiro}</span>.</p>
             <div class="expansion-plan"><h3>Plano de Expansão:</h3>
             <p>Plano criado com sucesso com o objetivo: <span class="highlight">'${plano.objetivo}'</span>.</p>
             </div>`;
        }

        log(`<div class="simulation-step"><h2>Passo 4: Camada de Expansão</h2>${expansionHtml}</div>`);

        log('<h2>Simulação Concluída!</h2>');
    }

    simular();
});
