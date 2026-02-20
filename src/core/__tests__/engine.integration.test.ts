
import { createSupportingBasesEngine, ISupportingBasesEngine } from "../engine/createSupportingBasesEngine";
import { SimulationInput, CenarioLabel } from "../contracts";

/**
 * @description
 * Teste de integração de ponta a ponta para a SupportingBases Engine.
 * Este teste valida o fluxo completo da simulação financeira, desde a criação da engine
 * até a geração do resultado final, garantindo que todas as implementações concretas
 * (serviços de projeção, cenário, recomendação e alerta) estejam funcionando em conjunto
 * conforme o esperado.
 *
 * O teste utiliza a factory oficial `createSupportingBasesEngine` para instanciar a engine real,
 * sem mocks, para simular um caso de uso real.
 */
describe("SupportingBases Engine - Integration Test", () => {
  let engine: ISupportingBasesEngine;

  // Instancia a engine uma vez antes de todos os testes
  beforeAll(() => {
    engine = createSupportingBasesEngine();
  });

  it("should process a realistic simulation input and return a complete, valid response", async () => {
    // 1. Definição de um input realista para a simulação
    const input: SimulationInput = {
      patrimonioAtual: 10000,
      aporteMensal: 1000,
      taxaRetornoAnual: 8, // Usando uma taxa mais realista que 0.10%
      horizonteMeses: 120, // 10 anos
      metaFinanceira: 300000,
      perfilRisco: "moderado",
    };

    // 2. Execução da simulação pela engine
    const result = await engine.simulate(input);

    // 3. Validações do resultado

    // Garante que a versão da engine está correta
    expect(engine.engineVersion).toBe("1.0.0");

    // Valida a presença dos metadados essenciais
    expect(result.metadata).toBeDefined();
    expect(result.metadata.contractVersion).toMatch(/\d+\.\d+\.\d+/); // Ex: "1.0.0"

    // Verifica se a data de geração é uma string ISO 8601 válida
    const generatedAtDate = new Date(result.metadata.generatedAt);
    expect(generatedAtDate).not.toBe(null);
    expect(!isNaN(generatedAtDate.getTime())).toBe(true);

    // Garante que a engine gerou os três cenários padrão
    expect(result.cenarios).toHaveLength(3);
    expect(result.cenarios.some((s) => s.label === CenarioLabel.PESSIMISTA)).toBe(true);
    expect(result.cenarios.some((s) => s.label === CenarioLabel.BASE)).toBe(true);
    expect(result.cenarios.some((s) => s.label === CenarioLabel.OTIMISTA)).toBe(true);

    // Valida a lógica de projeção, onde o patrimônio do cenário otimista deve ser o maior
    const pessimista = result.cenarios.find((s) => s.label === CenarioLabel.PESSIMISTA)!;
    const base = result.cenarios.find((s) => s.label === CenarioLabel.BASE)!;
    const otimista = result.cenarios.find((s) => s.label === CenarioLabel.OTIMISTA)!;

    expect(pessimista.patrimonioProjetado).toBeLessThan(base.patrimonioProjetado);
    expect(base.patrimonioProjetado).toBeLessThan(otimista.patrimonioProjetado);

    // Confirma que o motor de recomendação gerou insights estratégicos
    expect(result.recomendacoes).toBeDefined();
    expect(result.recomendacoes.length).toBeGreaterThan(0);
    expect(result.recomendacoes[0].title).toBeDefined();

    // Confirma que o serviço de alertas foi executado (pode ou não retornar alertas)
    expect(result.alertas).toBeDefined();
    // Para este input, não esperamos alertas, mas a chave deve existir
    expect(Array.isArray(result.alertas)).toBe(true);
  });
});
