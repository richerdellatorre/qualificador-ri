// ============================================================
// Passo 3 — Qualificação: confronto e identificação de pendências
// ============================================================

export const PROMPT_QUALIFICACAO = `Com base nos dados extraídos dos documentos, faça a qualificação registral completa.

Aplique todos os princípios registrais e as regras da sua instrução de sistema (DGE TJRO 21/2023, 
Provimento CNJ 149/2023, Lei 6.015/73, Provimento CNJ 61/2017).

Retorne um JSON com o seguinte schema:

{
  "parecer_geral": "APTO" | "COM_PENDENCIAS" | "INAPTO",
  "natureza_imovel": "URBANO" | "RURAL" | "INDEFINIDO",
  "tipo_titulo": "string (ex: Escritura Pública de Compra e Venda)",

  "pendencias_imperativas": [
    {
      "codigo": "string (ex: NM-01, P-001)",
      "categoria": "SANEAMENTO_OBJETIVO" | "SANEAMENTO_SUBJETIVO" | "AVERBACAO" | "NOVA_MATRICULA" | "CONTINUIDADE" | "ESPECIALIDADE" | "QUALIFICACAO_PARTE" | "IMPOSTO" | "IMOVEL_RURAL" | "ESCRITURA_DIGITAL" | "PROCURACAO" | "PESSOA_JURIDICA" | "ALERTA_GERAL",
      "gravidade": "IMPERATIVA",
      "descricao": "Descrição específica com nomes e dados reais dos documentos",
      "fundamento": "Base legal aplicável",
      "como_sanar": "Instrução prática para o cartorário sanar a pendência"
    }
  ],

  "exigencias": [
    {
      "codigo": "string",
      "categoria": "...",
      "gravidade": "EXIGENCIA",
      "descricao": "...",
      "fundamento": "...",
      "como_sanar": "..."
    }
  ],

  "alertas": [
    {
      "codigo": "string",
      "categoria": "...",
      "gravidade": "ALERTA",
      "descricao": "...",
      "fundamento": "...",
      "como_sanar": "..."
    }
  ],

  "itens_ok": [
    "string (ex: 'Continuidade verificada: João da Silva consta como proprietário na matrícula e como transmitente na escritura')"
  ],

  "resumo_ia": "Parágrafo descrevendo o contexto geral da análise, pontos críticos e orientação ao conferente"
}

## VERIFICAÇÕES OBRIGATÓRIAS:

### CONTINUIDADE:
- O transmitente no título é o mesmo da matrícula? (Nome + CPF quando disponível)
- Divorciados após aquisição: verificar mancomunhão e partilha na certidão de casamento
- Forma de aquisição do transmitente consta no título?

### QUALIFICAÇÃO DAS PARTES (para CADA parte — transmitente, adquirente, procurador):
- Nome completo sem abreviaturas? Diverge da matrícula?
- CPF consta? (Exigência SS-01 se falta na matrícula do vendedor)
- Documento de identidade (RG, CNH, carteira profissional)?
- Nacionalidade?
- Estado civil + se não casado: declaração expressa de união estável ou ausência dela?
- Se casado: regime de bens? Cônjuge deve assinar?
- Se estado civil diverge da matrícula → cobrar averbação (AV-01)
- Filiação?
- Profissão?
- Endereço completo?
- E-mail?

### SANEAMENTOS:
- Matrícula urbana: tem cadastro imobiliário? (SO-01)
- Matrícula rural: tem CCIR, ITR e CAR? (SO-02)
- Falta CPF/RG do vendedor na matrícula? (SS-01)

### DESMEMBRAMENTO:
- Tem desmembramento na matrícula? → SEMPRE alerta (AL-01)
- Área remanescente foi caracterizada? Se não → AV-02
- Título aliena totalidade restante? → NM-01 (nova matrícula)

### IMÓVEL RURAL (se rural):
- CCIR: área compatível? LOTE, GLEBA, SETOR constam?
- ITR: imóvel correspondente? (área pode ser arredondada, não penalizar)
- CAR: área aproximada? Tem vínculo com a matrícula?
- Empresa comprando imóvel rural: contrato social apresentado para verificar nacionalidade?

### ESCRITURA DIGITAL:
- Forma de assinatura consta expressamente?
- Matrícula notarial eletrônica consta quando há assinatura digital?
- Arquivo em PDF/A?
- Todos assinaram no fecho?

### IMPOSTO:
- ITBI: consta? Valor compatível? Município correto? Data anterior à lavratura?
- Inventário: ITCMD recolhido?

### ESPECIALIDADE:
- Descrição do imóvel no título é compatível com a matrícula?
- Área, confrontações e localização conferem?

Seja ESPECÍFICO — use os nomes, números e dados reais encontrados nos documentos.
Quando uma informação não puder ser verificada (ilegível, ausente), indique como ALERTA.
Separe claramente o que é IMPERATIVO (impede o registro) do que é EXIGÊNCIA (deve ser sanado) e ALERTA (observação).`;
