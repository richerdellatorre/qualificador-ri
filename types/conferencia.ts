// ============================================================
// Types — Módulo Conferidor de Minuta · CRI Rondônia
// ============================================================

export type GravidadeApontamento = 'ERRO' | 'ATENCAO' | 'SUGESTAO';

export type CategoriaApontamento =
  | 'CONTINUIDADE_NUMERACAO'   // Número do ato não segue a sequência da matrícula
  | 'SEQUENCIA_SELOS'          // Selo digital anterior ao último da matrícula
  | 'QUALIFICACAO_PARTE'       // Erro de dados na qualificação de parte
  | 'DOCUMENTO_IDENTIFICACAO'  // Mais de um doc de identidade ou prioridade errada
  | 'UNIAO_ESTAVEL'            // Fórmula de declaração de U.E. incorreta ou ausente
  | 'ESTADO_CIVIL'             // Declaração de estado civil ausente ou incorreta
  | 'SOLTEIRO_SEM_UE'          // Falta a declaração negativa de U.E. para solteiro/divorciado
  | 'DESCRICAO_IMOVEL'         // Área, lote, quadra, matrícula divergente
  | 'DADOS_CRUZADOS'           // Divergência com documento de referência enviado
  | 'EMOLUMENTOS'              // Valores, cálculo ou lançamento de emolumentos
  | 'NORMATIVA'                // Violação de lei ou provimento registral
  | 'ESTRUTURA'                // Ordem/estrutura do ato
  | 'DOCUMENTO_AUSENTE';       // Referência a documento não enviado pelo usuário

export interface Apontamento {
  codigo: string;                    // ex: "CONT-01", "SELO-01", "PARTE-02"
  categoria: CategoriaApontamento;
  gravidade: GravidadeApontamento;
  descricao: string;                 // Descrição objetiva do problema
  trecho_minuta?: string;           // Trecho exato do texto onde foi encontrado
  valor_encontrado?: string;         // O que consta na minuta
  valor_esperado?: string;           // O que deveria constar
  sugestao_correcao?: string;        // Texto sugerido para correção
}

export interface ResultadoConferencia {
  tipo_ato: string;                  // ex: "Escritura de Compra e Venda", "Averbação"
  numero_ato_minuta?: string;        // ex: "R-4" ou "AV-5/47.734"
  numero_ato_esperado?: string;      // ex: "R-4 ou AV-4 (após AV-3)"
  selo_minuta?: string;              // Selo da minuta, ex: "C4ABB30236-..."
  ultimo_selo_matricula?: string;    // Último selo registrado na matrícula
  erros: Apontamento[];
  atencoes: Apontamento[];
  sugestoes: Apontamento[];
  itens_ok: string[];
  documentos_ausentes: string[];     // Documentos referenciados mas não enviados
  resumo_ia: string;
}

export type StatusConferencia = 'idle' | 'processando' | 'concluido' | 'erro';
