// ============================================================
// Prompt de Análise v2 — Conferidor de Minuta
// Entrada: matrícula como arquivo + texto da minuta + docs de referência
// ============================================================

export function buildPromptConferencia(possuiDocsReferencia: boolean): string {
  return `Analise a minuta de ato registral apresentada e identifique APENAS divergências
de dados relevantes: números errados, nomes divergentes, CPFs incorretos, datas
conflitantes, continuidade de atos quebrada e sequência de selos invertida.

${possuiDocsReferencia
    ? `Documentos de referência foram enviados (matrícula, RG, certidões, etc.).
Extraia da matrícula: (a) número do último ato lançado (R-x ou AV-x) e
(b) todos os selos digitais já emitidos (parte numérica sequencial).
Cruze os dados das partes na minuta com os documentos enviados.
Quando os dados BATEREM → marque como OK. Apenas divergências reais → ERRO ou ATENCAO.`
    : `Nenhum documento de referência adicional foi enviado. Analise a consistência
interna do texto da minuta e gere ATENCAO (não ERRO) para pontos que dependem
de confirmação por documento.`
  }

O TEXTO DA MINUTA está precedido pela tag [MINUTA].

=== PASSOS DA ANÁLISE ===

PASSO 1 — SE HOUVER MATRÍCULA ENVIADA:
- Listar atos: R-1, AV-2, R-3... → identificar o último número sequencial
- Extrair selos completos de cada ato (ex: C4ABB30234, C4AAC15001)
  O formato do selo é: [PREFIXO_BLOCO][NUMERO_SEQUENCIAL]
  Ex: C4ABB30234 → prefixo = C4ABB, sequencial = 30234
  Ex: C4AAC15001 → prefixo = C4AAC, sequencial = 15001
- Identificar o selo do ato IMEDIATAMENTE anterior ao que se pretende lançar

PASSO 2 — EXTRAIR DA MINUTA:
- Tipo do ato
- Número do ato (R-x ou AV-x) se constar
- Número da matrícula
- Selos digitais da minuta (texto completo, ex: C4ABB30299)
- Partes e seus dados (nome, RG, CPF, estado civil, regime)
- Dados do imóvel (área, matrícula, confrontações)

PASSO 3 — VERIFICAÇÕES (apenas o que importa):

A. CONTINUIDADE: número do ato na minuta = último número da matrícula + 1?
   Se não → ERRO CONTINUIDADE_NUMERACAO

B. SELOS — REGRA CRÍTICA (leia com atenção antes de qualquer verificação):

   PASSO B1 — EXTRAIA O PREFIXO de cada selo presente na matrícula e na minuta.
   O prefixo é a parte ALFABÉTICA antes dos dígitos numéricos.
   Exemplos:
     C4ABB30234 → prefixo C4ABB, sequencial 30234
     C4AAC15001 → prefixo C4AAC, sequencial 15001
     C4ABB38258 → prefixo C4ABB, sequencial 38258

   PASSO B2 — COMPARE APENAS SELOS DO MESMO PREFIXO (mesmo bloco).
   BLOCOS DIFERENTES = numerações completamente independentes. É ESPERADO e CORRETO
   que um novo bloco comece com números menores do que selos de blocos anteriores.

   EXEMPLO DE NÃO-ERRO (não gere ERRO neste cenário):
     Matrícula tem selos C4ABB35321, C4ABB38258 (bloco C4ABB)
     Minuta usa selos C4AAC30014, C4AAC30015, C4AAC30016 (bloco C4AAC — bloco DIFERENTE)
     → CORRETO. Prefixos diferentes = blocos independentes. NÃO é erro de sequência.

   EXEMPLO DE ERRO REAL:
     Matrícula tem C4ABB30100 (bloco C4ABB, sequencial 30100)
     Minuta usa C4ABB29999 (mesmo bloco C4ABB, sequencial 29999 < 30100)
     → ERRO SEQUENCIA_SELOS — mesmo bloco, número menor.

   REGRA FINAL:
   - Prefixos DIFERENTES → NÃO é erro (nunca gere ERRO SEQUENCIA_SELOS por isso)
   - Mesmo prefixo → o sequencial da minuta deve ser MAIOR que o do ato anterior do mesmo bloco
   - Em caso de DÚVIDA sobre o prefixo → gere ATENCAO (nunca ERRO)
   - Minuta sem selo → ATENCAO (normal)

C. DOCUMENTO ÚNICO: há mais de um doc de identidade por pessoa?
   Se sim → ERRO DOCUMENTO_IDENTIFICACAO
   NÃO apontar diferença de órgão expedidor (SESDC, SSDC, SESP = equivalentes)

D. DADOS CRUZADOS (apenas se documento de referência foi enviado):
   Nome, CPF, RG batem com o documento? Se não → ERRO DADOS_CRUZADOS
   Se BATEM → item OK — não gere apontamento

E. DECLARAÇÃO SOLTEIRO SEM U.E.: falta declaração negativa de convivência?
   → ATENCAO SOLTEIRO_SEM_UE

F. DECLARAÇÃO U.E.: fórmula completa do art. 1.723?
   → ATENCAO UNIAO_ESTAVEL se incompleta

G. REGIME DE BENS: casado sem regime explícito?
   → ATENCAO QUALIFICACAO_PARTE

H. DADOS DO IMÓVEL: números divergentes (área, nº matrícula) com a matrícula enviada?
   → ERRO DESCRICAO_IMOVEL. Diferença de nome de bairro/logradouro → ignorar.

I. PESSOA JURÍDICA (Art. 655 – DGE/RO):
   Há pessoa jurídica qualificada no texto?
   → Verificar se "(Art. 655 – DGE/RO)" aparece IMEDIATAMENTE APÓS o município da sede
     de CADA pessoa jurídica mencionada.
   → Se ausente em qualquer PJ → ERRO categoria PESSOA_JURIDICA
   Exemplo correto: "...município de Cacoal-RO (Art. 655 – DGE/RO)"

J. MÚLTIPLAS AVALIAÇÕES:
   Há mais de um valor monetário diferente para o mesmo imóvel no texto?
   (ex: valor de transação, valor fiscal, valor de avaliação bancária, valor venal)
   → Listar todos os valores encontrados
   → Indicar qual é o MAIOR valor e onde consta no texto
   → Se a base de cálculo declarada (emolumentos/custas) não for o maior valor,
     verificar se há justificativa explícita no texto
   → Se inexplicado → ATENCAO categoria AVALIACAO

NÃO gere apontamentos para:
- Estilo textual, ortografia, concordância
- Endereço/bairro do proprietário
- Maiúsculas/minúsculas em nomes de atos existentes
- Órgão expedidor de RG
- Documentos técnicos não citados nominalmente

=== RETORNO ===

Retorne EXCLUSIVAMENTE um JSON válido:

{
  "tipo_ato": "string",
  "numero_ato_minuta": "string ou null",
  "numero_ato_esperado": "string ou null",
  "selo_minuta": "string ou null",
  "ultimo_selo_matricula": "string ou null",
  "erros": [
    {
      "codigo": "string (ex: 'CONT-01', 'SELO-01', 'DADOS-01')",
      "categoria": "CONTINUIDADE_NUMERACAO|SEQUENCIA_SELOS|QUALIFICACAO_PARTE|DOCUMENTO_IDENTIFICACAO|UNIAO_ESTAVEL|ESTADO_CIVIL|SOLTEIRO_SEM_UE|DESCRICAO_IMOVEL|DADOS_CRUZADOS|EMOLUMENTOS|PESSOA_JURIDICA|AVALIACAO|NORMATIVA",
      "gravidade": "ERRO",
      "descricao": "Descrição objetiva em 1-2 frases",
      "trecho_minuta": "Trecho EXATO do texto (máx 150 chars) — deve existir literalmente no texto",
      "valor_encontrado": "O que consta na minuta",
      "valor_esperado": "O que deveria constar",
      "sugestao_correcao": "Instrução clara de correção (1-2 frases)"
    }
  ],
  "atencoes": [ /* mesmo schema, gravidade: "ATENCAO" */ ],
  "sugestoes": [ /* mesmo schema, gravidade: "SUGESTAO" — apenas para questões de forma com relevância mínima */ ],
  "itens_ok": [
    "string curta descrevendo o que foi verificado e está correto"
  ],
  "documentos_ausentes": [],
  "resumo_ia": "Parágrafo de 2-3 frases: resultado geral, pontos críticos e orientação"
}

IMPORTANTE: o campo trecho_minuta deve ser uma substring EXATA do texto da minuta
(copiado literalmente), para permitir localização no texto. Não invente ou parafraseie.`;
}
