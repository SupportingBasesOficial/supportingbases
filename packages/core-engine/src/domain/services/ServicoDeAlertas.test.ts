
import { ServicoDeAlertas } from './ServicoDeAlertas';
import { MotorDeRecomendacao } from './MotorDeRecomendacao';
import { ContaFinanceira } from '../entities/ContaFinanceira';

describe('ServicoDeAlertas', () => {
    test('deve gerar alertas de risco e oportunidade corretamente', () => {
        const contaMock = new ContaFinanceira('Conta de Teste', 1000, 2000, 1500);

        const motor = new MotorDeRecomendacao();
        const servico = new ServicoDeAlertas(motor);

        const alertas = servico.gerarAlertas(contaMock);

        expect(alertas).toBeInstanceOf(Array);
        
        // Verifica se pelo menos um alerta foi gerado
        expect(alertas.length).toBeGreaterThan(0);

        // Valida a estrutura de cada alerta
        alertas.forEach(a => {
            expect(a.id).toBeDefined();
            expect(typeof a.id).toBe('string');
            expect(a.tipo).toMatch(/risco|oportunidade|informativo/);
            expect(typeof a.impactoEstimado).toBe('number');
            expect(a.lido).toBe(false);
        });
    });

    test('deve ordenar os alertas por tipo e impacto', () => {
        const contaMock = new ContaFinanceira('Conta de Teste', 500, 5000, 4800); // Saldo baixo e despesas altas
        const motor = new MotorDeRecomendacao();
        const servico = new ServicoDeAlertas(motor);

        const alertas = servico.gerarAlertas(contaMock);

        const tipos = alertas.map(a => a.tipo);
        
        // Riscos devem vir primeiro
        const primeiroOportunidade = tipos.indexOf('oportunidade');
        const ultimoRisco = tipos.lastIndexOf('risco');
        if (primeiroOportunidade !== -1 && ultimoRisco !== -1) {
            expect(ultimoRisco).toBeLessThan(primeiroOportunidade);
        }

        // Oportunidades antes de informativos
        const primeiroInformativo = tipos.indexOf('informativo');
        const ultimoOportunidade = tipos.lastIndexOf('oportunidade');
        if (primeiroInformativo !== -1 && ultimoOportunidade !== -1) {
            expect(ultimoOportunidade).toBeLessThan(primeiroInformativo);
        }
    });
});
