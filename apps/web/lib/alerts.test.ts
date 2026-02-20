
import { getAlertasUsuario } from './alerts';
import { ContaFinanceira } from '../../../packages/core-engine/src/domain/entities/ContaFinanceira';
import { Despesa, TipoDespesa } from '../../../packages/core-engine/src/domain/entities/Despesa';
import { v4 as uuidv4 } from 'uuid';

describe('Integração da Camada de Alertas', () => {
    test('getAlertasUsuario deve retornar uma lista de alertas válida e ordenada', async () => {
        // Cenário 1: Conta com potencial de risco (despesas > receita)
        const despesasRisco = [new Despesa(uuidv4(), 'Despesa Alta', 2900, TipoDespesa.ESTRUTURAL_FIXA, 'Moradia')];
        const contaRisco = new ContaFinanceira(1000, despesasRisco, 3000);
        const alertasRisco = await getAlertasUsuario(contaRisco);
        
        expect(alertasRisco.length).toBeGreaterThan(0);
        expect(alertasRisco[0].tipo).toBe('risco');

        // Cenário 2: Conta com potencial de oportunidade (receita > despesas)
        const despesasOportunidade = [new Despesa(uuidv4(), 'Despesa Baixa', 2000, TipoDespesa.ESTRUTURAL_FIXA, 'Moradia')];
        const contaOportunidade = new ContaFinanceira(20000, despesasOportunidade, 8000);
        const alertasOportunidade = await getAlertasUsuario(contaOportunidade);
        
        expect(alertasOportunidade.length).toBeGreaterThan(0);
        expect(['risco', 'oportunidade', 'informativo']).toContain(alertasOportunidade[0].tipo);

        // Verifica se a ordenação por impacto dentro do mesmo tipo está correta
        const oportunidades = alertasOportunidade.filter(a => a.tipo === 'oportunidade');
        if (oportunidades.length > 1) {
            for (let i = 0; i < oportunidades.length - 1; i++) {
                expect(oportunidades[i].impactoEstimado).toBeGreaterThanOrEqual(oportunidades[i + 1].impactoEstimado);
            }
        }
    });
});
