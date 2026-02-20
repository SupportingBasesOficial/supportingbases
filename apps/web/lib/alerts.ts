import { ContaFinanceira } from '@core-engine/domain/entities/ContaFinanceira';
import { AlertaFinanceiro } from '@core-engine/domain/entities/AlertaFinanceiro';
import { ServicoDeAlertas } from '@core-engine/domain/services/ServicoDeAlertas';
import { MotorDeRecomendacao } from '@core-engine/domain/services/MotorDeRecomendacao';
import { servicoHistorico } from './core';

export async function getAlertasUsuario(conta: ContaFinanceira): Promise<AlertaFinanceiro[]> {
    // A instanciação foi movida para cá para garantir que a 'conta' esteja disponível.
    const motor = new MotorDeRecomendacao(servicoHistorico, conta);
    const servicoAlertas = new ServicoDeAlertas(motor, servicoHistorico);
    
    const alertas = servicoAlertas.gerarAlertas(conta);
    return Promise.resolve(alertas);
}
