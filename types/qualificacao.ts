// ============================================================
// Types — Sistema de Qualificação Registral · CRI Rondônia
// ============================================================

export type GravidadePendencia =
  | 'IMPERATIVA'    // 🔴 impede o registro
  | 'EXIGENCIA'     // 🟡 pode ser sanada antes do registro
  | 'ALERTA';       // 🔵 observação ao conferente

export type CategoriaPendencia =
  | 'SANEAMENTO_OBJETIVO'    // SO-xx
  | 'SANEAMENTO_SUBJETIVO'   // SS-xx
  | 'AVERBACAO'              // AV-xx
  | 'NOVA_MATRICULA'         // NM-xx
  | 'CONTINUIDADE'
  | 'ESPECIALIDADE'
  | 'QUALIFICACAO_PARTE'
  | 'IMPOSTO'
  | 'IMOVEL_RURAL'
  | 'ESCRITURA_DIGITAL'
  | 'PROCURACAO'
  | 'PESSOA_JURIDICA'
  | 'ALERTA_GERAL';

export type ParecerGeral =
  | 'APTO'
  | 'COM_PENDENCIAS'
  | 'INAPTO';

export type NaturezaImovel = 'URBANO' | 'RURAL' | 'INDEFINIDO';

export interface Pendencia {
  codigo: string;
  categoria: CategoriaPendencia;
  gravidade: GravidadePendencia;
  descricao: string;        // O que está errado/faltando
  fundamento?: string;      // Base legal
  como_sanar: string;       // Instrução prática
}

export interface DocumentoIdentificado {
  id: string;
  tipo: TipoDocumento;
  descricao: string;         // Identificação resumida (ex: "Matrícula nº 12.345 — 1º RI Porto Velho")
}

export type TipoDocumento =
  | 'MATRICULA'
  | 'ESCRITURA_COMPRA_VENDA'
  | 'ESCRITURA_DOACAO'
  | 'ESCRITURA_INVENTARIO_PARTILHA'
  | 'FORMAL_DE_PARTILHA'
  | 'USUCAPIAO_EXTRAJUDICIAL'
  | 'USUCAPIAO_JUDICIAL'
  | 'ADJUDICACAO_COMPULSORIA'
  | 'ESCRITURA_PERMUTA'
  | 'ESCRITURA_CESSAO_DIREITOS'
  | 'CARTA_SENTENCA'
  | 'CARTA_ARREMATACAO'
  | 'CONTRATO_ALIENACAO_FIDUCIARIA'
  | 'CCIR'
  | 'ITR'
  | 'CAR'
  | 'OUTRO'
  | 'NAO_IDENTIFICADO';

export interface ResultadoQualificacao {
  parecer_geral: ParecerGeral;
  natureza_imovel: NaturezaImovel;
  tipo_titulo: string;
  documentos_identificados: DocumentoIdentificado[];

  // Classificação das pendências
  pendencias_imperativas: Pendencia[];   // 🔴
  exigencias: Pendencia[];               // 🟡
  alertas: Pendencia[];                  // 🔵
  itens_ok: string[];                    // ✅

  // Síntese
  resumo_ia: string;

  // Metadados
  timestamp: string;
  modelo_usado: string;
}

// Estado da análise no frontend
export type StatusAnalise =
  | 'idle'
  | 'uploading'
  | 'classificando'
  | 'extraindo'
  | 'qualificando'
  | 'concluido'
  | 'erro';

// ── Saneamento de pendências ──────────────────────────────────

export type StatusSaneamento =
  | 'idle'           // Aguardando arquivos
  | 'analisando'     // IA verificando
  | 'sanado'         // ✅ IA confirmou que a pendência foi sanada
  | 'pendente'       // ❌ Docs insuficientes / incorretos
  | 'parcial'        // ⚠ Parcialmente sanado
  | 'erro';          // Falha técnica

export interface ResultadoSaneamento {
  status: 'SANADO' | 'PENDENTE' | 'PARCIAL';
  explicacao: string;           // Explicação da IA
  o_que_falta?: string;         // Se PENDENTE ou PARCIAL: o que ainda falta
  documentos_verificados: string[];  // Quais docs foram reconhecidos
  novas_divergencias?: string[];     // ⚠️ Divergências detectadas no novo documento (Lote, Quadra, Área, etc.)
  alerta_base_calculo?: string;      // 💰 Impacto na base de cálculo de emolumentos / avaliação fiscal
}

// ── Refinamento de regras com IA ──────────────────────────────

export type StatusLegalRegra = 'CONFORME' | 'ALERTA_RISCO' | 'IRREGULAR';

export interface ResultadoRefinamentoRegra {
  status_legal: StatusLegalRegra;
  parecer_juridico: string;
  diretriz_refinada: string;
  sugestao_acao: 'OBSERVACAO' | 'DESATIVAR';
}


export interface ArquivoUpload {
  id: string;
  nome: string;
  tamanho: number;
  tipo: string;  // MIME type
  file: File;
  geminiFileUri?: string;  // URI retornada pela File API
}
