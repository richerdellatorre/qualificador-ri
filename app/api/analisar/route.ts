import { NextRequest, NextResponse } from 'next/server';
import {
  prepararArquivo,
  classificarDocumentos,
  extrairDados,
  qualificar,
  ModeloGemini,
} from '@/lib/gemini';

export const maxDuration = 300; // 5 min timeout

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const arquivos = formData.getAll('arquivos') as File[];
    const modeloParam = (formData.get('modelo') as string) || 'gemini-4-argon';
    const modelo: ModeloGemini =
      modeloParam === 'gemini-3.8-flash' ? 'gemini-3.8-flash' : 'gemini-4-argon';

    if (!arquivos || arquivos.length === 0) {
      return NextResponse.json(
        { erro: 'Nenhum arquivo enviado.' },
        { status: 400 }
      );
    }

    // ── Passo 0: Preparar arquivos (inline base64 ou File API) ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conteudos: any[] = [];

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

      const conteudo = await prepararArquivo(buffer, mimeType, arquivo.name);
      conteudos.push(conteudo);
    }

    // ── Passo 1: Classificação ────────────────────────────────
    const { interactionId: idClassif, classificacao } =
      await classificarDocumentos(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        conteudos as any,
        modelo
      );

    // ── Passo 2: Extração ─────────────────────────────────────
    const { interactionId: idExtrac } = await extrairDados(idClassif, modelo);

    // ── Passo 3: Qualificação ─────────────────────────────────
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

    return NextResponse.json(resultado);
  } catch (erro) {
    const msg =
      erro instanceof Error ? erro.message : 'Erro desconhecido na análise.';
    console.error('[Qualificador] Erro:', erro);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
