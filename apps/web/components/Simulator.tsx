
"use client";

import React, { useState, useMemo } from 'react';
import { ContaFinanceira, Despesa, Receita } from '../../../packages/core-engine/src/domain/entities/ContaFinanceira';
import { AvaliadorCenarios } from '../../../packages/core-engine/src/domain/services/AvaliadorCenarios';

interface SimulatorProps {
    conta: ContaFinanceira | null;
}

interface Simulacao {
    nome: string;
    scoreFinal: number;
    descricao?: string;
}

export const Simulator: React.FC<SimulatorProps> = ({ conta }) => {
    const [simulacoes, setSimulacoes] = useState<Simulacao[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [receitaExtra, setReceitaExtra] = useState<number>(0);
    const [despesaExtra, setDespesaExtra] = useState<number>(0);

    // Usamos useMemo para garantir que o avaliador não seja recriado a cada renderização
    const avaliador = useMemo(() => new AvaliadorCenarios(), []);

    const rodarSimulacao = async () => {
        if (!conta) {
            setError('Conta financeira não disponível para simulação.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Cria uma nova instância de ContaFinanceira para a simulação
            const contaSimulada = new ContaFinanceira(
                `${conta.nome} (Simulação)`,
                conta.saldo,
                conta.receitaMensal + receitaExtra,
                conta.despesaMensal + despesaExtra
            );
            
            // Define os cenários que queremos comparar
            const cenariosParaSimular = ['Padrão', 'Conservador', 'Agressivo', 'Contenção de Despesas'];

            // O método é síncrono, mas envolvemos em um Promise para simular um fluxo assíncrono
            const resultados = await Promise.resolve(
                avaliador.compararCenarios(contaSimulada, cenariosParaSimular, 24)
            );

            // Ordenar por scoreFinal decrescente
            resultados.sort((a, b) => b.scoreFinal - a.scoreFinal);

            setSimulacoes(resultados);
        } catch (e: any) {
            setError(e.message || 'Erro ao executar simulação.');
            setSimulacoes([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="simulator-container">
            <h2>Simulador “What-if”</h2>
            <p>Adicione receitas ou despesas extras mensais e veja o impacto em diferentes cenários.</p>

            <div className="inputs">
                <label>
                    Receita Mensal Extra (R$):
                    <input type="number" value={receitaExtra} onChange={e => setReceitaExtra(Number(e.target.value))} placeholder="Ex: 300" />
                </label>
                <label>
                    Despesa Mensal Extra (R$):
                    <input type="number" value={despesaExtra} onChange={e => setDespesaExtra(Number(e.target.value))} placeholder="Ex: 150" />
                </label>
                <button onClick={rodarSimulacao} disabled={loading}>
                    {loading ? 'Calculando...' : 'Rodar Simulação'}
                </button>
            </div>

            {error && <div className="error-placeholder">{error}</div>}
            
            {!loading && !error && simulacoes.length === 0 && (
                <div className="empty-placeholder">Ajuste os valores e rode uma simulação para ver os resultados.</div>
            )}

            {!loading && simulacoes.length > 0 && (
                <div className="simulacoes-list">
                    {simulacoes.map((sim, idx) => {
                        const isTopImpact = idx === 0;
                        const cor = isTopImpact ? '#ffb300' : '#757575'; // Dourado para o melhor, cinza para os outros

                        return (
                            <div key={idx} className={`sim-item ${isTopImpact ? 'top-impacto' : ''}`} style={{ borderLeft: `4px solid ${cor}` }}>
                                <strong>{sim.nome}</strong>
                                <p>{sim.descricao}</p>
                                <small>Score Final (em 24 meses): {sim.scoreFinal.toFixed(2)}</small>
                            </div>
                        );
                    })}
                </div>
            )}

            <style jsx>{`
                .simulator-container {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin: 16px 0;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                }
                .inputs {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    align-items: end;
                }
                .inputs label {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .inputs input {
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                .simulacoes-list {
                    margin-top: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .sim-item {
                    background-color: #f9f9f9;
                    border-radius: 4px;
                    padding: 12px 16px;
                }
                .sim-item.top-impacto {
                    background-color: #fffde7;
                }
                .sim-item strong {
                    font-size: 1.1rem;
                }
            `}</style>
        </div>
    );
};
