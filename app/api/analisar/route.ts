import { NextRequest } from 'next/server';
import {
  arquivoParaConteudo,
  classificarDocumentos,
  extrairDados,
  qualificar,
  ModeloGemini,
} from '@/lib/gemini';

export const maxDuration = 300; // 5 min timeout

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
        const arquivos = formData.getAll('arquivos') as File[];
        const modeloParam = (formData.get('modelo') as string) || 'gemini-4-argon';
        const modelo: ModeloGemini = modeloParam === 'gemini-3.8-flash' ? 'gemini-3.8-flash' : 'gemini-4-argon';

        if (!arquivos || arquivos.length === 0) {
          enviar('erro', { mensagem: 'Nenhum arquivo enviado.' });
          controller.close();
          return;
        }

        // ── Passo 0: Preparar arquivos em base64 ──────────────
        enviar('status', {
          etapa: 'uploading',
          mensagem: `Preparando ${arquivos.length} arquivo(s)...`,
        });

        const conteudos: Array<{ type: 'document' | 'image'; data: string; mime_type: string }> = [];

        for (const arquivo of arquivos) {
          const buffer = Buffer.from(await arquivo.arrayBuffer());
          let mimeType = arquivo.type;

          // Garante MIME type correto
          if (!mimeType || mimeType === 'application/octet-stream') {
            const nome = arquivo.name.toLowerCase();
            if (nome.endsWith('.pdf')) mimeType = 'application/pdf';
            else if (nome.match(/\.(jpg|jpeg)$/)) mimeType = 'image/jpeg';
            else if (nome.endsWith('.png')) mimeType = 'image/png';
            else if (nome.match(/\.tiff?$/)) mimeType = 'image/tiff';
            else mimeType = 'application/pdf';
          }

          conteudos.push(arquivoParaConteudo(buffer, mimeType));
        }

        // ── Passo 1: Classificação ────────────────────────────
        enviar('status', {
          etapa: 'classificando',
          mensagem: 'Identificando os documentos...',
        });

        const { interactionId: idClassif, classificacao } =
          await classificarDocumentos(conteudos, modelo);

        enviar('classificacao', { dados: classificacao });

        // ── Passo 2: Extração ─────────────────────────────────
        enviar('status', {
          etapa: 'extraindo',
          mensagem: 'Extraindo dados da matrícula e do título...',
        });

        const { interactionId: idExtrac } = await extrairDados(idClassif, modelo);

        // ── Passo 3: Qualificação ─────────────────────────────
        enviar('status', {
          etapa: 'qualificando',
          mensagem: 'Realizando a qualificação registral...',
        });

        const resultadoBruto = await qualificar(idExtrac, modelo);

        // Enriquece com metadados
        const resultado = {
          ...resultadoBruto,
          documentos_identificados:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (classificacao as any)?.documentos?.map((d: any, i: number) => ({
              id: `doc_${i + 1}`,
              tipo: d.tipo ?? 'OUTRO',
              descricao: d.descricao ?? d.tipo ?? 'Documento',
            })) ?? [],
          timestamp: new Date().toISOString(),
          modelo_usado: modelo,
        };

        enviar('resultado', { dados: resultado });
        enviar('status', { etapa: 'concluido', mensagem: 'Análise concluída.' });
      } catch (erro) {
        const msg =
          erro instanceof Error ? erro.message : 'Erro desconhecido na análise.';
        console.error('[Qualificador] Erro:', erro);
        enviar('erro', { mensagem: msg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
