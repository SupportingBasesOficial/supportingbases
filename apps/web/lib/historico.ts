import { servicoHistorico } from "./core";
import { DecisaoUsuario } from "@core-engine/domain/entities/DecisaoUsuario";

// O nome do tipo e do método foram corrigidos para alinhar com a API do Core.
export function registrarDecisao(decisao: DecisaoUsuario) {
    servicoHistorico.registrar(decisao);
}

export function gerarInsights() {
    return servicoHistorico.gerarInsightsAdaptativos();
}
