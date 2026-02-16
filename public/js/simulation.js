/**
 * =====================================================================================
 *
 *       Filename:  simulation.js
 *
 *    Description:  MÓDULO 1: ENGINE CORE (Motor de Engenharia Anticolapso).
 *                  Este módulo é o núcleo matemático do SupportingBases.
 *
 *      Version:   4.0.0 (Feature - Complete Recommendations)
 *      Changes:   - Adicionadas recomendações estratégicas para todos os perfis em todas as fases.
 *
 * =====================================================================================
 */

class EngineCore {

    runStructuralDiagnosis(userData) {
        if (!this.validateUserData(userData)) {
            return { structuralPhase: "Erro de Dados", icf: null, iia: null, msd: null, recommendation: "Dados insuficientes para análise."};
        }

        const { adjustedRevenue, fixedObligations, totalObligations } = this.calculateCoreInputs(userData);

        const icf = this.calculateICF(fixedObligations, adjustedRevenue);
        const msd = this.calculateMSD(userData.reservas, totalObligations, userData.receitas);
        const iia = this.calculateIIA(totalObligations, adjustedRevenue);

        const structuralPhase = this.determineStructuralPhase(icf, msd, userData.userGoals);
        
        const recommendation = this.generateStrategicRecommendations(structuralPhase, icf, msd, userData.userGoals, userData.userProfile);

        return {
            structuralPhase,
            icf, 
            iia, 
            msd, 
            recommendation
        };
    }

    validateUserData(userData) {
        const hasRequiredKeys = userData && 'despesas' in userData && 'receitas' in userData && 'userGoals' in userData && 'userProfile' in userData;
        if (!hasRequiredKeys) return false;
        return userData.receitas.length > 0 || userData.despesas.length > 0;
    }

    calculateCoreInputs(userData) {
        let safetyFactor;
        switch(userData.userGoals.riskProfile) {
            case 'conservador': safetyFactor = 2.0; break;
            case 'agressivo': safetyFactor = 1.0; break;
            default: safetyFactor = 1.5;
        }

        const averageRevenue = userData.receitas.length > 0 ? userData.receitas.reduce((acc, r) => acc + r.valor, 0) / userData.receitas.length : 0;
        const volatilityAdjustment = (userData.receitaDesvioPadrao || 0) * safetyFactor;
        const adjustedRevenue = Math.max(1, averageRevenue - volatilityAdjustment);
        const fixedObligations = userData.despesas.filter(d => d.tipoCusto === 'fixo').reduce((acc, d) => acc + d.valor, 0);
        const totalObligations = userData.despesas.reduce((acc, d) => acc + d.valor, 0);
        return { adjustedRevenue, fixedObligations, totalObligations };
    }

    calculateICF(fixedObligations, adjustedRevenue) {
        if (adjustedRevenue === 0) return Infinity;
        return (fixedObligations / adjustedRevenue).toFixed(2);
    }

    calculateMSD(reservas, totalObligations) {
        if (totalObligations === 0) return Infinity;
        return (reservas / totalObligations).toFixed(2);
    }

    calculateIIA(totalObligations, adjustedRevenue) {
        const netFlow = adjustedRevenue - totalObligations;
        if (netFlow >= 0) return "0.00";
        return Math.abs(netFlow / adjustedRevenue).toFixed(2);
    }

    determineStructuralPhase(icf, msd, userGoals) {
        const reserveTarget = userGoals.reserveGoal || 6;
        if (icf > 0.95) return "Fase 1 - Sobrevivência";
        if (icf > 0.75) return "Fase 2 - Neutralização";
        if (msd < reserveTarget) return "Fase 3 - Consolidação";
        return "Fase 4 - Expansão";
    }

    generateStrategicRecommendations(phase, icf, msd, userGoals, userProfile) {
        const reserveTarget = userGoals.reserveGoal || 6;
        const profile = userProfile.profile || 'pessoa_fisica';

        const recommendations = {
            "Fase 1 - Sobrevivência": {
                pessoa_fisica: `<h2>Objetivo: Aliviar Pressão Crítica</h2><p>Seu Índice de Compressão (ICF) de <strong>${icf}</strong> é perigosamente alto. Suas contas fixas (custo de vida) estão consumindo quase todo o seu salário. <strong>Ação Imediata:</strong> Revise e corte despesas não essenciais agressivamente. O objetivo é baixar seu ICF para menos de 0.95 para poder respirar.</p>`,
                autonomo: `<h2>Objetivo: Aliviar Pressão Crítica</h2><p>Seu ICF de <strong>${icf}</strong> está perigosamente alto. Seus custos fixos (operacionais e pessoais) estão muito altos para sua receita, especialmente considerando a volatilidade. O risco de um mês fraco te quebrar é altíssimo. <strong>Ação Imediata:</strong> Reduza custos fixos drasticamente (aluguel de espaço, assinaturas) ou foque em estabilizar a entrada de clientes.</p>`,
                empresa: `<h2>Objetivo: Sobrevivência Operacional</h2><p>O ICF da sua empresa (<strong>${icf}</strong>) está em um nível crítico. Os custos fixos estão sufocando o faturamento, deixando-a sem margem para respirar. <strong>Ação Imediata:</strong> Renegocie contratos, reduza despesas operacionais fixas e analise a precificação. A meta é baixar o ICF abaixo de 0.95 para garantir a continuidade do negócio.</p>`
            },
            "Fase 2 - Neutralização": {
                pessoa_fisica: `<h2>Objetivo: Construir Reserva Inicial</h2><p>Você saiu da zona de perigo imediato (ICF: <strong>${icf}</strong>), mas quase todo seu dinheiro já tem destino. <strong>Ação Prioritária:</strong> Canalize todo e qualquer excedente para começar sua reserva de emergência, mirando sua meta de <strong>${reserveTarget} meses</strong>.</p>`,
                autonomo: `<h2>Objetivo: Criar Caixa de Guerra</h2><p>Você paga as contas (ICF: <strong>${icf}</strong>), mas a instabilidade da sua receita ainda é um risco. <strong>Ação Prioritária:</strong> Todo lucro que não for para seu custo de vida deve ir para a reserva de segurança. Este é seu "caixa de guerra" contra meses de baixa.</p>`,
                empresa: `<h2>Objetivo: Formar Capital de Giro</h2><p>A operação se paga (ICF: <strong>${icf}</strong>), mas sem folga. A empresa está vulnerável a qualquer imprevisto. <strong>Ação Prioritária:</strong> Foco total em reter lucro para criar capital de giro e uma reserva operacional antes de pensar em expansão.</p>`
            },
            "Fase 3 - Consolidação": {
                pessoa_fisica: `<h2>Objetivo: Atingir Meta de Segurança</h2><p>Sua base é estável (ICF: <strong>${icf}</strong>), mas sua reserva (MSD: <strong>${msd}</strong>) ainda não atingiu sua meta de <strong>${reserveTarget} meses</strong>. <strong>Ação Prioritária:</strong> Automatize transferências mensais para sua reserva. A disciplina agora é o que te levará à segurança financeira completa.</p>`,
                autonomo: `<h2>Objetivo: Atingir Meta de Segurança</h2><p>Sua estrutura é saudável (ICF: <strong>${icf}</strong>), mas sua reserva de segurança (MSD: <strong>${msd}</strong>) ainda não é robusta o suficiente para a sua realidade instável. <strong>Ação Prioritária:</strong> Continue aportando na reserva. Não se distraia com "oportunidades" até atingir sua meta de <strong>${reserveTarget} meses</strong>.</p>`,
                empresa: `<h2>Objetivo: Fortalecer o Caixa</h2><p>A empresa é lucrativa e estável (ICF: <strong>${icf}</strong>), mas o caixa (MSD: <strong>${msd}</strong>) ainda não é forte o suficiente para garantir a operação por <strong>${reserveTarget} meses</strong> sem faturamento. <strong>Ação Prioritária:</strong> Fortaleça o capital de giro. Isso é o que permite tomar decisões estratégicas, e não reativas.</p>`
            },
            "Fase 4 - Expansão": {
                pessoa_fisica: `<h2>Fase de Expansão: Alavancar para Crescer</h2><p>Parabéns! Com uma estrutura segura (ICF: <strong>${icf}</strong>) e reservas acima da sua meta (MSD: <strong>${msd}</strong>), você tem a base sólida para usar seu excedente para investir em seus objetivos de longo prazo: aposentadoria, educação, viagens, etc.</p>`,
                autonomo: `<h2>Fase de Expansão: Alavancar para Crescer</h2><p>Excelente! Com uma reserva sólida (MSD: <strong>${msd}</strong>), você pode agora assumir riscos calculados: investir em marketing, estudar uma nova habilidade ou começar a diversificar suas fontes de renda para reduzir a instabilidade.</p>`,
                empresa: `<h2>Fase de Expansão: Alavancar para Crescer</h2><p>Sua empresa é uma fortaleza (ICF: <strong>${icf}</strong>, MSD: <strong>${msd}</strong>). Com operação estável e capital de giro saudável, é hora de expandir: contratar, investir em P&D, explorar novos mercados ou aumentar a retirada de lucros.</p>`
            },
            "Erro de Dados": {
                pessoa_fisica: "<p>Dados insuficientes para análise. Por favor, adicione suas receitas e despesas para obter um diagnóstico.</p>",
                autonomo: "<p>Dados insuficientes para análise. Por favor, adicione suas receitas e despesas para obter um diagnóstico.</p>",
                empresa: "<p>Dados insuficientes para análise. Por favor, adicione o faturamento e os custos da sua empresa para obter um diagnóstico.</p>"
            }
        };

        return recommendations[phase] ? recommendations[phase][profile] : "<p>Analisando sua estrutura para gerar recomendações...</p>";
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = EngineCore;
}