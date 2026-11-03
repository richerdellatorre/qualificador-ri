// ============================================================
// Prompt de Análise — Conferidor de Minuta
// Entrada: texto da matrícula (atos existentes) + texto da minuta + docs de referência
// ============================================================

export function buildPromptConferencia(possuiMatricula: boolean, possuiDocsReferencia: boolean): string {
  return `Analise a minuta de ato registral apresentada e confira todos os elementos conforme
as instruções do sistema.

${possuiMatricula
    ? `O TEXTO DA MATRÍCULA com os atos já lançados foi fornecido (precedido pela tag [MATRICULA]).
Extraia dele: (a) o número do último ato lançado (R-x ou AV-x), (b) todos os selos digitais já emitidos.`
    : `Nenhum texto de matrícula foi fornecido. Não é possível verificar continuidade de numeração
nem sequência de selos — gere ATENCAO CONTINUIDADE_NUMERACAO e SEQUENCIA_SELOS informando isso.`
  }

${possuiDocsReferencia
    ? `Documentos de referência foram enviados (RG, certidão, matrícula em imagem, etc.).
Cruze os dados das partes na minuta com esses documentos.`
    : `Nenhum documento de referência adicional foi enviado. Não é possível cruzar dados — mencione
no resumo que a conferência foi feita apenas com base no texto.`
  }

O TEXTO DA MINUTA a ser conferida está precedido pela tag [MINUTA].

=== PASSOS DA ANÁLISE ===

PASSO 1 — EXTRAÇÃO DA MATRÍCULA (se disponível):
- Listar todos os atos no formato: [tipo]-[número] (ex: R-1, AV-2, R-3...)
- Identificar o último número sequencial
- Listar todos os selos: extrair a parte numérica de cada "Selo Digital: XXXXNNNNN-HHHHH"
- Identificar o maior número de selo da matrícula

PASSO 2 — EXTRAÇÃO DA MINUTA:
- Identificar tipo do ato
- Identificar número do ato (R-x ou AV-x) se constar
- Identificar número/matrícula do imóvel
- Identificar selo digital se constar
- Identificar todas as partes e seus elementos de qualificação
- Identificar descrição do imóvel (área, confrontações, localização)

PASSO 3 — VERIFICAÇÕES:
Execute cada verificação em ordem de prioridade:

A. CONTINUIDADE DE NUMERAÇÃO
   - Número do ato na minuta = (último número da matrícula + 1)?
   - Se não → ERRO CONTINUIDADE_NUMERACAO

B. SEQUÊNCIA DE SELOS
   - Número sequencial do selo da minuta > maior número de selo da matrícula?
   - Se não → ERRO SEQUENCIA_SELOS
   - Se minuta não tem selo → ATENCAO (normal em minuta em branco)

C. QUALIFICAÇÃO DAS PARTES (para cada parte identificada):
   C1. Documento único: há mais de um documento de identidade para a mesma pessoa?
       → ERRO DOCUMENTO_IDENTIFICACAO
   C2. Solteiro/divorciado/viúvo sem convivência: tem a declaração negativa de U.E.?
       → ERRO SOLTEIRO_SEM_UE se ausente
   C3. União estável: a fórmula de declaração está completa e correta?
       → ERRO UNIAO_ESTAVEL se incorreta
   C4. Estado civil em U.E.: se estado civil diferente entre conviventes, aparece após cada nome?
       Se mesmo estado civil, aparece no final em plural?
       → ERRO ESTADO_CIVIL se errado
   C5. Regime de bens (se casado): está explícito com lei aplicável?
       → ATENCAO QUALIFICACAO_PARTE se ausente
   C6. Dados cruzados com documentos de referência (se enviados):
       Nome, CPF, RG, estado civil batem?
       → ERRO DADOS_CRUZADOS se divergir

D. DESCRIÇÃO DO IMÓVEL (se matrícula disponível):
   - Área, confrontações, número da matrícula batem?
   → ERRO DESCRICAO_IMOVEL se divergir

E. EMOLUMENTOS (se constarem na minuta):
   - Valores parecem consistentes com o tipo de ato?
   - Há lançamento de FUJU, FUNDEP, FUNDIMPER, FUMORPGE, Selo Digital?
   → ATENCAO EMOLUMENTOS se faltarem itens obrigatórios

=== RETORNO ===

Retorne EXCLUSIVAMENTE um JSON válido com o seguinte schema:

{
  "tipo_ato": "string (ex: 'Escritura Pública de Compra e Venda', 'Averbação de Alteração de Estado Civil')",
  "numero_ato_minuta": "string ou null (ex: 'R-4', 'AV-5', null se não identificado)",
  "numero_ato_esperado": "string ou null (ex: 'R-4 ou AV-4 (sequência após AV-3)')",
  "selo_minuta": "string ou null",
  "ultimo_selo_matricula": "string ou null",
  "erros": [
    {
      "codigo": "string (ex: 'CONT-01', 'SELO-01', 'PARTE-01')",
      "categoria": "CONTINUIDADE_NUMERACAO|SEQUENCIA_SELOS|QUALIFICACAO_PARTE|DOCUMENTO_IDENTIFICACAO|UNIAO_ESTAVEL|ESTADO_CIVIL|SOLTEIRO_SEM_UE|DESCRICAO_IMOVEL|DADOS_CRUZADOS|EMOLUMENTOS|NORMATIVA|ESTRUTURA|DOCUMENTO_AUSENTE",
      "gravidade": "ERRO",
      "descricao": "Descrição objetiva do problema",
      "trecho_minuta": "Trecho exato do texto da minuta onde ocorre o problema (máx. 200 chars)",
      "valor_encontrado": "O que consta na minuta",
      "valor_esperado": "O que deveria constar",
      "sugestao_correcao": "Texto sugerido para substituição ou instrução de correção"
    }
  ],
  "atencoes": [ /* mesmo schema, gravidade: "ATENCAO" */ ],
  "sugestoes": [ /* mesmo schema, gravidade: "SUGESTAO" */ ],
  "itens_ok": [
    "string (descrição de elemento verificado e correto, ex: 'Continuidade de atos: AV-4 segue corretamente após AV-3')"
  ],
  "documentos_ausentes": [
    "string (documento mencionado na minuta mas não enviado como referência)"
  ],
  "resumo_ia": "Parágrafo descrevendo o resultado geral da conferência, pontos críticos e orientação ao conferente"
}`;
}
