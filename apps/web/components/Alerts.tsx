
"use client";

import React, { useEffect, useState } from 'react';
import { ContaFinanceira } from '../../../packages/core-engine/src/domain/entities/ContaFinanceira';
import { AlertaFinanceiro } from '../../../packages/core-engine/src/domain/entities/AlertaFinanceiro';
import { getAlertasUsuario } from '../lib/alerts';

interface AlertsProps {
    conta: ContaFinanceira | null;
}

export const Alerts: React.FC<AlertsProps> = ({ conta }) => {
    const [alertas, setAlertas] = useState<AlertaFinanceiro[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!conta) {
            setLoading(false);
            setError(null);
            setAlertas([]);
            return;
        }

        const fetchAlertas = async () => {
            setLoading(true);
            try {
                const dados = await getAlertasUsuario(conta);
                // A ordenação primária por tipo já é feita no core-engine.
                // O front-end pode reordenar por impacto se necessário, mas respeitaremos a ordem do serviço.
                setAlertas(dados);
                setError(null);
            } catch (e) {
                setError('Erro ao carregar alertas.');
                setAlertas([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAlertas();
    }, [conta]);

    if (loading) return <div className="loading-placeholder">Carregando alertas...</div>;
    if (error) return <div className="error-placeholder">{error}</div>;
    if (!alertas.length) return <div className="empty-placeholder">Nenhum alerta no momento.</div>;

    return (
        <div className="alerts-container">
            <h2>Alertas Proativos</h2>
            {alertas.map((alerta, idx) => {
                // O alerta de maior impacto (primeiro da lista) recebe destaque.
                const isTopImpact = idx === 0;
                const topImpactoClass = isTopImpact ? 'top-impacto' : '';

                let cor = '';
                switch (alerta.tipo) {
                    case 'risco': cor = '#ef5350'; break; // Red
                    case 'oportunidade': cor = '#66bb6a'; break; // Green
                    case 'informativo': cor = '#42a5f5'; break; // Blue
                    default: cor = '#bdbdbd'; // Gray
                }

                return (
                    <div key={alerta.id} className={`alert-item ${topImpactoClass}`} style={{ borderLeft: `4px solid ${cor}` }}>
                        <strong>{alerta.titulo}</strong>
                        <p>{alerta.descricao}</p>
                        <small>Impacto: {alerta.impactoEstimado.toFixed(2)}</small>
                    </div>
                );
            })}
            <style jsx>{`
                .alerts-container {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .alerts-container h2 {
                    font-size: 1.5rem;
                    margin-bottom: 8px;
                }
                .alert-item {
                    background-color: #f9f9f9;
                    border-radius: 4px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    padding: 12px 16px;
                    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                }
                .alert-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
                .alert-item.top-impacto {
                    background-color: #fff3e0; /* Um amarelo claro para destaque */
                }
                .alert-item strong {
                    display: block;
                    margin-bottom: 4px;
                }
                .alert-item p {
                    margin: 0 0 8px 0;
                    font-size: 0.9rem;
                }
                .alert-item small {
                    color: #555;
                    font-style: italic;
                }
                .loading-placeholder, .error-placeholder, .empty-placeholder {
                    padding: 20px;
                    text-align: center;
                    color: #888;
                    background-color: #fafafa;
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
};
