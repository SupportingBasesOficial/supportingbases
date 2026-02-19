
"use client";

import React, { useEffect, useState } from 'react';
import { ContaFinanceira } from '../../../../packages/core-engine/src/domain/entities/ContaFinanceira';
import { getContaUsuarioLogado } from '../../lib/integracao';

// Importando os componentes modulares
import { Alerts } from '../../components/Alerts';
import { Recommendations } from '../../components/Recommendations';
import { Simulator } from '../../components/Simulator';

const DashboardPage: React.FC = () => {
    const [conta, setConta] = useState<ContaFinanceira | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConta = async () => {
            setLoading(true);
            try {
                const c = await getContaUsuarioLogado();
                setConta(c);
                setError(null);
            } catch (e: any) {
                setError(e.message || 'Erro ao carregar dados financeiros do usuário.');
            } finally {
                setLoading(false);
            }
        };
        fetchConta();
    }, []);

    // Renderização condicional baseada no estado
    if (loading) {
        return <div className="status-placeholder">Carregando seu dashboard financeiro...</div>;
    }
    if (error) {
        return <div className="status-placeholder error">{error}</div>;
    }
    if (!conta) {
        return <div className="status-placeholder">Conta financeira não encontrada.</div>;
    }

    // Layout do Dashboard com os componentes integrados
    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <h1>Bem-vindo ao seu Dashboard, {conta.nome}!</h1>
                <p>Aqui está uma visão completa da sua saúde financeira.</p>
            </header>

            <main className="dashboard-grid">
                <section className="grid-item-double">
                    <Recommendations conta={conta} />
                </section>
                
                <section className="grid-item-single">
                    <Alerts conta={conta} />
                </section>
                
                <section className="grid-item-double">
                    <Simulator conta={conta} />
                </section>
            </main>

            <style jsx global>{`
                body {
                    background-color: #f4f7f6;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    color: #333;
                }
            `}</style>

            <style jsx>{`
                .dashboard-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 24px;
                }
                .dashboard-header {
                    margin-bottom: 32px;
                    border-bottom: 1px solid #e0e0e0;
                    padding-bottom: 16px;
                }
                .dashboard-header h1 {
                    font-size: 2rem;
                    color: #1a237e; /* Azul escuro */
                }
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                }
                .grid-item-single {
                    grid-column: span 1;
                }
                .grid-item-double {
                    grid-column: span 2;
                }
                .status-placeholder {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 80vh;
                    font-size: 1.2rem;
                    color: #888;
                }
                .status-placeholder.error {
                    color: #c62828; /* Vermelho escuro */
                }

                @media (max-width: 992px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr;
                    }
                    .grid-item-single, .grid-item-double {
                        grid-column: span 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default DashboardPage;
