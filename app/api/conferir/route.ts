import { NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { CONFERENCIA_SYSTEM_INSTRUCTION } from '@/lib/prompts/conferencia-system';
import { buildPromptConferencia } from '@/lib/prompts/conf-analisar';
import { arquivoParaConteudo, ModeloGemini } from '@/lib/gemini';

export const maxDuration = 300;

function parseJSON(texto: string): Record<string, unknown> {
  const match = texto.match(/```(?:json)?\s*([\s\S]*?)```/) ?? texto.match(/(\{[\s\S]*\})/);
  const raw = match ? match[1] : texto;
  try {
    return JSON.parse(raw.trim());
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function enviar(tipo: string, payload: Record<string, unknown>) {
        const linha = JSON.stringify({ tipo, ...payload }) + '\n';
        controller.enqueue(encoder.encode(linha));
      }

      try {
        const formData = await request.formData();

        const texto_minuta = (formData.get('texto_minuta') as string) ?? '';
        const modeloParam = (formData.get('modelo') as string) ?? 'gemini-4-argon';
        const modelo: ModeloGemini =
          modeloParam === 'gemini-3.8-flash' ? 'gemini-3.8-flash' : 'gemini-4-argon';

        // Documentos de referência: matrícula + RG + certidões (todos como arquivo)
        const arquivosRef = formData.getAll('arquivos_ref') as File[];

        if (!texto_minuta.trim()) {
          enviar('erro', { mensagem: 'Texto da minuta não pode estar vazio.' });
          controller.close();
          return;
        }

        enviar('status', { etapa: 'processando', mensagem: 'Preparando análise...' });

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY não configurada');
        const client = new GoogleGenAI({ apiKey });

        // Monta o input multimodal
        const partes: Array<{ type: string; text?: string; data?: string; mime_type?: string }> = [];

        // Texto da minuta a ser conferida
        partes.push({
          type: 'text',
          text: `[MINUTA]\n${texto_minuta.trim()}\n[/MINUTA]\n\n`,
        });

        // Documentos de referência (matrícula, RG, certidões — todos como arquivos)
        for (const arquivo of arquivosRef) {
          const buffer = Buffer.from(await arquivo.arrayBuffer());
          let mimeType = arquivo.type;
          if (!mimeType || mimeType === 'application/octet-stream') {
            const nome = arquivo.name.toLowerCase();
            if (nome.endsWith('.pdf')) mimeType = 'application/pdf';
            else if (nome.match(/\.(jpg|jpeg)$/)) mimeType = 'image/jpeg';
            else if (nome.endsWith('.png')) mimeType = 'image/png';
            else if (nome.match(/\.tiff?$/)) mimeType = 'image/tiff';
            else mimeType = 'application/pdf';
          }
          const conteudo = arquivoParaConteudo(buffer, mimeType);
          partes.push(conteudo);
        }

        // Prompt de análise
        const promptConferencia = buildPromptConferencia(arquivosRef.length > 0);
        partes.push({ type: 'text', text: promptConferencia });

        enviar('status', {
          etapa: 'processando',
          mensagem: 'Conferindo a minuta com IA...',
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const interaction = await client.interactions.create({
          model: modelo,
          system_instruction: CONFERENCIA_SYSTEM_INSTRUCTION,
          store: false,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          input: partes as any,
          generation_config: {
            temperature: 0.05,
            max_output_tokens: 8192,
          },
        });

        const textoResposta = interaction.output_text ?? '{}';
        const resultado = parseJSON(textoResposta);

        enviar('resultado', { dados: resultado });
        controller.close();
      } catch (err) {
        const mensagem = err instanceof Error ? err.message : 'Erro desconhecido';
        const enviarErro = (tipo: string, payload: Record<string, unknown>) => {
          const linha = JSON.stringify({ tipo, ...payload }) + '\n';
          controller.enqueue(encoder.encode(linha));
        };
        enviarErro('erro', { mensagem });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      'Transfer-Encoding': 'chunked',
    },
  });
}
