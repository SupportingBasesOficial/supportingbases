
"use client"

import { useEffect, useState } from 'react';
import { getRecomendacoesUsuario } from '../lib/recommendations';
import { ContaFinanceira } from '../../../packages/core-engine/src/domain/entities/ContaFinanceira';

interface Recomendacao {
  titulo: string;
  descricao: string;
  impactoEstimado: number;
}

interface RecommendationsProps {
  conta: ContaFinanceira | null;
}

export default function Recommendations({ conta }: RecommendationsProps) {
  const [recomendacoes, setRecomendacoes] = useState<Recomendacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarRecomendacoes() {
      if (!conta) {
        setRecomendacoes([]);
        setCarregando(false);
        return;
      }

      setCarregando(true);
      try {
        // Simulando a chamada assíncrona que getRecomendacoesUsuario deveria ser
        const dados = await Promise.resolve(getRecomendacoesUsuario(conta));
        // Ordena por impacto estimado decrescente
        dados.sort((a, b) => b.impactoEstimado - a.impactoEstimado);
        setRecomendacoes(dados);
      } catch (error) {
        console.error('Erro ao carregar recomendações:', error);
        setRecomendacoes([]);
      } finally {
        setCarregando(false);
      }
    }

    carregarRecomendacoes();
  }, [conta]);

  if (carregando) {
    return (
      <div className="loading">
        <p>Carregando recomendações financeiras...</p>
      </div>
    );
  }

  if (recomendacoes.length === 0) {
    return (
      <div className="no-recommendations">
        <p>Nenhuma recomendação disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <h2>Recomendações Inteligentes</h2>
      {recomendacoes.map((r, idx) => (
        <div
          key={idx}
          className={`card-recomendacao ${
            idx === 0 ? 'top-impacto' : ''
          }`}
        >
          <h3>{r.titulo}</h3>
          <p>{r.descricao}</p>
          <span className="impacto">Impacto Estimado: {r.impactoEstimado.toFixed(2)}</span>
        </div>
      ))}
      <style jsx>{`
        .recommendations-container {
          margin-top: 2rem;
        }
        .loading, .no-recommendations {
          text-align: center;
          padding: 2rem;
          color: #888;
        }
        .card-recomendacao {
          background-color: #f9f9f9;
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          transition: all 0.2s ease-in-out;
        }
        .card-recomendacao.top-impacto {
          border-left: 5px solid #4CAF50; /* Destaque verde */
          transform: scale(1.02);
        }
        .card-recomendacao h3 {
          margin-top: 0;
          font-size: 1.2rem;
        }
        .impacto {
          font-weight: bold;
          color: #333;
        }
      `}</style>
    </div>
  );
}
