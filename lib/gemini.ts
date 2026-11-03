import { GoogleGenAI } from '@google/genai';
import { SYSTEM_INSTRUCTION } from './prompts/system';
import { PROMPT_CLASSIFICACAO } from './prompts/step1-classificacao';
import { PROMPT_EXTRACAO } from './prompts/step2-extracao';
import { PROMPT_QUALIFICACAO } from './prompts/step3-qualificacao';
import { buildPromptSaneamento } from './prompts/step4-saneamento';
import { buildPromptRefinarRegra } from './prompts/step5-refinar-regra';
import { lerCustomizacoes, customizacoesParaPrompt } from './github';
import type { ResultadoSaneamento, ResultadoRefinamentoRegra } from '@/types/qualificacao';

export type ModeloGemini = 'gemini-4-argon' | 'gemini-3.8-flash';
export const DEFAULT_MODEL: ModeloGemini = 'gemini-4-argon';

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY não configurada no .env.local');
  return new GoogleGenAI({ apiKey });
}

// ─── Converte arquivos para base64 para inline no input ──────
export function arquivoParaConteudo(
  buffer: Buffer,
  mimeType: string
): { type: 'document'; data: string; mime_type: string } | { type: 'image'; data: string; mime_type: string } {
  const base64 = buffer.toString('base64');
  
  if (mimeType === 'application/pdf') {
    return { type: 'document', data: base64, mime_type: 'application/pdf' };
  }
  // Imagens (jpg, png, tiff)
  return { type: 'image', data: base64, mime_type: mimeType };
}

// ─── Passo 1: Classificação ──────────────────────────────────
export async function classificarDocumentos(
  conteudos: Array<{ type: 'document' | 'image'; data: string; mime_type: string }>,
  modelo: ModeloGemini = DEFAULT_MODEL
): Promise<{
  interactionId: string;
  classificacao: Record<string, unknown>;
}> {
  const client = getClient();

  // Monta o input: todos os docs + prompt de classificação
  const input = [
    ...conteudos,
    { type: 'text' as const, text: PROMPT_CLASSIFICACAO },
  ];

  const interaction = await client.interactions.create({
    model: modelo,
    system_instruction: SYSTEM_INSTRUCTION,
    store: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input: input as any,
    generation_config: {
      temperature: 0.1,
      max_output_tokens: 4096,
    },
  });

  const texto = interaction.output_text ?? '{}';
  const json = parseJSON(texto);

  return {
    interactionId: interaction.id,
    classificacao: json,
  };
}

// ─── Passo 2: Extração ───────────────────────────────────────
export async function extrairDados(
  previousInteractionId: string,
  modelo: ModeloGemini = DEFAULT_MODEL
): Promise<{
  interactionId: string;
  dados: Record<string, unknown>;
}> {
  const client = getClient();

  const interaction = await client.interactions.create({
    model: modelo,
    system_instruction: SYSTEM_INSTRUCTION,
    store: true,
    previous_interaction_id: previousInteractionId,
    input: PROMPT_EXTRACAO,
    generation_config: {
      temperature: 0.1,
      max_output_tokens: 8192,
    },
  });

  const texto = interaction.output_text ?? '{}';
  const json = parseJSON(texto);

  return {
    interactionId: interaction.id,
    dados: json,
  };
}

// ─── Passo 3: Qualificação — com customizações do cartório ──
export async function qualificar(
  previousInteractionId: string,
  modelo: ModeloGemini = DEFAULT_MODEL
): Promise<Record<string, unknown>> {
  const client = getClient();

  // Busca customizações do GitHub (com cache de 5min, não bloqueia se falhar)
  let promptFinal = PROMPT_QUALIFICACAO;
  try {
    const { config } = await lerCustomizacoes();
    const customizacaoTexto = customizacoesParaPrompt(config);
    if (customizacaoTexto) {
      promptFinal = PROMPT_QUALIFICACAO + customizacaoTexto;
    }
  } catch {
    // Falha silenciosa — análise continua sem customizações
  }

  const interaction = await client.interactions.create({
    model: modelo,
    system_instruction: SYSTEM_INSTRUCTION,
    store: true,
    previous_interaction_id: previousInteractionId,
    input: promptFinal,
    generation_config: {
      temperature: 0.2,
      max_output_tokens: 8192,
    },
  });

  const texto = interaction.output_text ?? '{}';
  return parseJSON(texto);
}

// ─── Utilitário: parse JSON com limpeza de markdown ─────────
function parseJSON(texto: string): Record<string, unknown> {
  const limpo = texto
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(limpo);
  } catch {
    // Tenta encontrar o JSON dentro do texto
    const match = limpo.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // fall through
      }
    }
    return {
      parecer_geral: 'COM_PENDENCIAS',
      resumo_ia: 'Não foi possível parsear o resultado da IA. Tente novamente.',
      pendencias_imperativas: [],
      exigencias: [],
      alertas: [],
      itens_ok: [],
    };
  }
}

// ─── Passo 4: Verificação de Saneamento ──────────────────────
export async function verificarSaneamento(
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
  },
  documentosNovos: Array<{ type: 'document' | 'image'; data: string; mime_type: string }>,
  modelo: ModeloGemini = DEFAULT_MODEL
): Promise<ResultadoSaneamento> {
  const client = getClient();

  const prompt = buildPromptSaneamento(pendencia, contextoDaAnalise);

  const input = [
    ...documentosNovos,
    { type: 'text' as const, text: prompt },
  ];

  const interaction = await client.interactions.create({
    model: modelo,
    system_instruction: SYSTEM_INSTRUCTION,
    store: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input: input as any,
    generation_config: {
      temperature: 0.1,
      max_output_tokens: 2048,
    },
  });

  const texto = interaction.output_text ?? '{}';
  const json = parseJSON(texto) as unknown as ResultadoSaneamento;

  // Garante estrutura mínima
  return {
    status: (json.status as ResultadoSaneamento['status']) ?? 'PENDENTE',
    explicacao: (json.explicacao as string) ?? 'Não foi possível analisar os documentos.',
    o_que_falta: json.o_que_falta as string | undefined,
    documentos_verificados: (json.documentos_verificados as string[]) ?? [],
  };
}

// ─── Passo 5: Refinamento e Validação de Regra com IA ────────
export async function refinarRegraComIA(
  dados: {
    codigo: string;
    descricaoRegra: string;
    intencaoUsuario: string;
    acaoDesejada: 'OBSERVACAO' | 'DESATIVAR';
  },
  modelo: ModeloGemini = DEFAULT_MODEL
): Promise<ResultadoRefinamentoRegra> {
  const client = getClient();
  const prompt = buildPromptRefinarRegra(dados);

  const interaction = await client.interactions.create({
    model: modelo,
    system_instruction: SYSTEM_INSTRUCTION,
    store: false,
    input: prompt,
    generation_config: {
      temperature: 0.1,
      max_output_tokens: 2048,
    },
  });

  const texto = interaction.output_text ?? '{}';
  const json = parseJSON(texto) as unknown as ResultadoRefinamentoRegra;

  return {
    status_legal: (json.status_legal as ResultadoRefinamentoRegra['status_legal']) ?? 'CONFORME',
    parecer_juridico: json.parecer_juridico ?? 'Sem parecer jurídico disponível.',
    diretriz_refinada: json.diretriz_refinada ?? dados.intencaoUsuario,
    sugestao_acao: json.sugestao_acao ?? dados.acaoDesejada,
  };
}
