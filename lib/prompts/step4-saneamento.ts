// ─── Prompt para verificação de saneamento de pendência ──────
// Recebe: contexto da análise + pendência específica + documentos novos
// Retorna: JSON com status SANADO | PENDENTE | PARCIAL

export function buildPromptSaneamento(
  pendencia: {
    codigo: string;
    descricao: string;
    como_sanar: string;
    fundamento?: string;
  },
  contextoDaAnalise: {
    tipo_titulo: string;
    natureza_imovel: string;
    resumo_ia: string;
  }
): string {
  return `
Você é um Oficial de Registro de Imóveis de Rondônia verificando se os documentos apresentados a seguir sanaram uma pendência específica identificada em análise anterior.

## CONTEXTO DA ANÁLISE ORIGINAL
- **Título:** ${contextoDaAnalise.tipo_titulo}
- **Natureza do imóvel:** ${contextoDaAnalise.natureza_imovel}
- **Resumo da análise:** ${contextoDaAnalise.resumo_ia}

## PENDÊNCIA A VERIFICAR
- **Código:** ${pendencia.codigo}
- **Descrição:** ${pendencia.descricao}
- **Como sanar:** ${pendencia.como_sanar}
${pendencia.fundamento ? `- **Fundamento legal:** ${pendencia.fundamento}` : ''}

## TAREFA
Analise SOMENTE os documentos apresentados agora e verifique se eles são suficientes para sanar a pendência acima.

Avalie:
1. Os documentos apresentados são compatíveis com o título/imóvel da análise original? (verifica referências como número de matrícula, nomes das partes, valores)
2. Os documentos apresentados atendem ao que foi exigido para sanar a pendência?
3. Os documentos estão válidos (dentro da validade, sem rasuras suspeitas, com as assinaturas necessárias)?

## RESPOSTA (JSON OBRIGATÓRIO)
Responda APENAS com JSON válido, sem markdown:
{
  "status": "SANADO" | "PENDENTE" | "PARCIAL",
  "explicacao": "Explicação clara e objetiva do seu julgamento (2-4 frases)",
  "o_que_falta": "Somente se PENDENTE ou PARCIAL: descreva exatamente o que ainda falta ou está incorreto",
  "documentos_verificados": ["Lista dos documentos que você reconheceu nos arquivos enviados"]
}

Seja objetivo e preciso. Se houver qualquer dúvida séria sobre a correspondência dos documentos com o processo, julgue como PENDENTE e explique.
`.trim();
}
