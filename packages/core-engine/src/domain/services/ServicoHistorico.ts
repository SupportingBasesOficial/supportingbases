import { DecisaoUsuario } from '../entities/DecisaoUsuario';

export class ServicoHistorico {
    private historico: DecisaoUsuario[] = [];

    registrar(decisao: DecisaoUsuario) {
        this.historico.push(decisao);
    }

    listarTodos(): DecisaoUsuario[] {
        return [...this.historico].sort((a, b) => b.data.getTime() - a.data.getTime());
    }

    listarPorTipo(tipo: 'Simulacao' | 'Avaliacao' | 'AcaoExecutada') {
        return this.historico.filter(h => h.tipo === tipo).sort((a, b) => b.data.getTime() - a.data.getTime());
    }

    // Método de aprendizado adaptativo: poderia retornar insights ou ajustar scores do MotorDeRecomendacao
    gerarInsightsAdaptativos() {
        // Exemplo simples: encontrar a estratégia com maior scoreFinal média
        const simulacoes = this.listarPorTipo('Simulacao');
        const resultados: Record<string, { total: number; count: number }> = {};
        simulacoes.forEach(s => {
            s.resultado?.impactoEstimado !== undefined &&
            (resultados[s.descricao] = resultados[s.descricao] || { total: 0, count: 0 },
            resultados[s.descricao].total += s.resultado.impactoEstimado,
            resultados[s.descricao].count++);
        });
        return Object.entries(resultados).map(([nome, r]) => ({ nome, scoreMedio: r.total / r.count }));
    }
}
