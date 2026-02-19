
import { ContaFinanceira } from '../../../packages/core-engine/src/domain/entities/ContaFinanceira';
import { AlertaFinanceiro } from '../../../packages/core-engine/src/domain/entities/AlertaFinanceiro';
import { ServicoDeAlertas } from '../../../packages/core-engine/src/domain/services/ServicoDeAlertas';
import { MotorDeRecomendacao } from '../../../packages/core-engine/src/domain/services/MotorDeRecomendacao';

/**
 * Consome o ServicoDeAlertas para obter os alertas financeiros do usuário.
 * Esta é a única interface entre o front-end e o core-engine para alertas.
 * 
 * @param conta A conta financeira do usuário.
 * @returns Uma Promessa que resolve para uma lista de AlertaFinanceiro.
 */
export async function getAlertasUsuario(conta: ContaFinanceira): Promise<AlertaFinanceiro[]> {
    // A instanciação ocorre aqui, garantindo que a lógica de negócio
    // permaneça encapsulada e desacoplada da UI.
    const motor = new MotorDeRecomendacao();
    const servicoAlertas = new ServicoDeAlertas(motor);

    const alertas = servicoAlertas.gerarAlertas(conta);
    
    // A chamada é encapsulada em uma promessa para simular uma operação assíncrona,
    // como uma chamada de API real.
    return Promise.resolve(alertas);
}
