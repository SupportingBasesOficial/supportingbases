
import { PrismaClient } from '@prisma/client';
import { SimulationInput, SupportingBasesResponse } from '../contracts';
import { SimulationLog, ErrorLog, SimulationMetrics, FrequentRecommendation } from './types';

// Instancia única do Prisma Client para ser usada pelo módulo de logging.
const prisma = new PrismaClient();

/**
 * Registra de forma assíncrona uma simulação bem-sucedida no banco de dados.
 * Não bloqueia o ciclo de eventos da API.
 * @param input - O objeto de entrada da simulação.
 * @param response - O objeto de resposta da simulação.
 * @param userId - O ID do usuário que realizou a simulação.
 * @param durationMs - A duração da execução da simulação em milissegundos.
 */
export async function logSimulation(
  input: SimulationInput,
  response: SupportingBasesResponse,
  userId: string,
  durationMs: number
): Promise<void> {
  try {
    await prisma.simulationLog.create({
      data: {
        userId,
        timestamp: new Date(),
        durationMs,
        simulationInput: input,       // Prisma armazena JSON diretamente
        simulationResponse: response, // Prisma armazena JSON diretamente
      },
    });
  } catch (dbError) {
    console.error('Falha ao salvar log de simulação no banco de dados:', dbError);
    // Opcional: Enviar para um serviço de monitoramento de erros (Sentry, Datadog)
  }
}

/**
 * Registra um erro ocorrido durante o processo de simulação.
 * @param error - O objeto de erro capturado.
 * @param userId - O ID do usuário (se disponível).
 * @param input - O input da simulação que causou o erro (se disponível).
 */
export async function logError(
  error: Error,
  userId?: string,
  input?: SimulationInput
): Promise<void> {
  try {
    await prisma.errorLog.create({
      data: {
        timestamp: new Date(),
        userId,
        errorMessage: error.message,
        stackTrace: error.stack,
        inputPayload: input,
      },
    });
  } catch (dbError) {
    console.error('Falha ao salvar log de erro no banco de dados:', dbError);
  }
}

/**
 * Retorna métricas agregadas sobre as simulações, com um período de tempo opcional.
 * @param period - Um objeto com datas de início e fim para filtrar as métricas.
 */
export async function getSimulationMetrics(period?: { start: Date; end: Date }): Promise<SimulationMetrics> {
  const whereClause = period ? { timestamp: { gte: period.start, lte: period.end } } : {};

  const logs = await prisma.simulationLog.findMany({ where: whereClause });

  if (logs.length === 0) {
    return {
      totalSimulations: 0,
      averageDurationMs: 0,
      simulationsPerDay: [],
      frequentRecommendations: [],
    };
  }

  const totalSimulations = logs.length;
  const totalDuration = logs.reduce((sum, log) => sum + log.durationMs, 0);
  const averageDurationMs = totalDuration / totalSimulations;

  // Agrega recomendações
  const recommendationCounts: Record<string, number> = {};
  logs.forEach(log => {
    log.simulationResponse.recomendacoes.forEach(rec => {
      const category = rec.category;
      recommendationCounts[category] = (recommendationCounts[category] || 0) + 1;
    });
  });

  const frequentRecommendations: FrequentRecommendation[] = Object.entries(recommendationCounts)
    .map(([category, count]) => ({ category: category as any, count }))
    .sort((a, b) => b.count - a.count);
  
  // Agrega simulações por dia (exemplo simplificado)
  const simulationsPerDay = await prisma.simulationLog.groupBy({
    by: ['timestamp'],
    where: whereClause,
    _count: {
      timestamp: true,
    },
    orderBy: {
      timestamp: 'asc',
    },
  });

  return {
    totalSimulations,
    averageDurationMs,
    simulationsPerDay: simulationsPerDay.map(day => ({ date: day.timestamp.toISOString().split('T')[0], count: day._count.timestamp})),
    frequentRecommendations,
  };
}

