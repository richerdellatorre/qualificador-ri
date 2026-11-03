// ============================================================
// Passo 1 — Classificação dos documentos enviados
// ============================================================

export const PROMPT_CLASSIFICACAO = `Analise os documentos enviados e classifique cada um deles.

Retorne um JSON com o seguinte schema:
{
  "documentos": [
    {
      "id": "doc_1",
      "tipo": "MATRICULA" | "ESCRITURA_COMPRA_VENDA" | "ESCRITURA_DOACAO" | "ESCRITURA_INVENTARIO_PARTILHA" | "FORMAL_DE_PARTILHA" | "USUCAPIAO_EXTRAJUDICIAL" | "USUCAPIAO_JUDICIAL" | "ADJUDICACAO_COMPULSORIA" | "ESCRITURA_PERMUTA" | "ESCRITURA_CESSAO_DIREITOS" | "CARTA_SENTENCA" | "CARTA_ARREMATACAO" | "CONTRATO_ALIENACAO_FIDUCIARIA" | "CCIR" | "ITR" | "CAR" | "OUTRO" | "NAO_IDENTIFICADO",
      "descricao": "Descrição curta identificando o documento (ex: 'Matrícula nº 12.345 — 1º RI Porto Velho/RO')",
      "paginas_estimadas": número
    }
  ],
  "resumo": "Breve descrição do conjunto de documentos recebidos"
}

Seja preciso na identificação. Leia os elementos visuais, cabeçalhos, selos e conteúdo textual para classificar corretamente.`;
