import { NextRequest, NextResponse } from 'next/server';
import {
  classificarDocumentos,
  extrairDados,
  qualificar,
  ModeloGemini,
} from '@/lib/gemini';

export const maxDuration = 300; // 5 min para análise

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conteudos, modelo: modeloParam } = body as {
      conteudos: Array<{
        type: 'document' | 'image';
        data?: string;
        uri?: string;
        mime_type: string;
      }>;
      modelo?: string;
    };

    const modelo: ModeloGemini =
      modeloParam === 'gemini-3.8-flash' ? 'gemini-3.8-flash' : 'gemini-4-argon';

    if (!conteudos || conteudos.length === 0) {
      return NextResponse.json(
        { erro: 'Nenhum conteúdo enviado.' },
        { status: 400 }
      );
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
