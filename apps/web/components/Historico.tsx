import React, { useEffect, useState } from 'react';
import { DecisaoUsuario } from '@core-engine/src/domain/entities/DecisaoUsuario';
import { listarHistorico } from '../lib/historico';

export const Historico: React.FC = () => {
    const [historico, setHistorico] = useState<DecisaoUsuario[]>([]);

    useEffect(() => {
        setHistorico(listarHistorico());
    }, []);

    if (historico.length === 0) return <div>Nenhuma decisão registrada ainda.</div>;

    return (
        <div className="historico-container">
            <h2>Histórico de Decisões</h2>
            <ul>
                {historico.map(h => (
                    <li key={h.id} style={{ marginBottom: '8px', borderLeft: '4px solid gray', paddingLeft: '8px' }}>
                        <strong>{h.tipo}</strong> - {h.descricao} ({h.data.toLocaleString()})
                        {h.resultado?.scoreFinal && <div>Score Final: {h.resultado.scoreFinal}</div>}
                        {h.resultado?.impactoEstimado && <div>Impacto Estimado: {h.resultado.impactoEstimado}</div>}
                    </li>
                ))}
            </ul>
        </div>
    );
};
