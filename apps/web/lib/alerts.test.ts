
import { getAlertasUsuario } from './alerts';
import { ContaFinanceira } from '../../../packages/core-engine/src/domain/entities/ContaFinanceira';

describe('Integração da Camada de Alertas', () => {
    test('getAlertasUsuario deve retornar uma lista de alertas válida e ordenada', async () => {
        // Cenário 1: Conta com potencial de risco
        const contaRisco = new ContaFinanceira('Usuário Risco', 1000, 3000, 2900);
        const alertasRisco = await getAlertasUsuario(contaRisco);
        
        expect(alertasRisco.length).toBeGreaterThan(0);
        expect(alertasRisco[0].tipo).toBe('risco');

        // Cenário 2: Conta com potencial de oportunidade
        const contaOportunidade = new ContaFinanceira('Usuário Oportunidade', 20000, 8000, 2000);
        const alertasOportunidade = await getAlertasUsuario(contaOportunidade);
        
        expect(alertasOportunidade.length).toBeGreaterThan(0);
        // O primeiro alerta pode ser de risco ou oportunidade, dependendo dos scores
        expect(['risco', 'oportunidade']).toContain(alertasOportunidade[0].tipo);
        expect(alertasOportunidade[0].impactoEstimado).toBeGreaterThanOrEqual(0);

        // Verifica se a ordenação por impacto dentro do mesmo tipo está correta
        const oportunidades = alertasOportunidade.filter(a => a.tipo === 'oportunidade');
        if (oportunidades.length > 1) {
            for (let i = 0; i < oportunidades.length - 1; i++) {
                expect(oportunidades[i].impactoEstimado).toBeGreaterThanOrEqual(oportunidades[i + 1].impactoEstimado);
            }
        }
    });
});
