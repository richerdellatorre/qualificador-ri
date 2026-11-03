import { NextRequest, NextResponse } from 'next/server';
import { atualizarRegraIndividual } from '@/lib/github';
import type { RegraCustomizacao } from '@/lib/github';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      codigo: string;
      regra: RegraCustomizacao;
      mensagemCommit?: string;
    };

    if (!body.codigo || !body.regra) {
      return NextResponse.json(
        { erro: 'Código e regra são obrigatórios.' },
        { status: 400 }
      );
    }

    const { sha, config } = await atualizarRegraIndividual(
      body.codigo,
      body.regra,
      body.mensagemCommit
    );

    return NextResponse.json({ ok: true, sha, config });
  } catch (error) {
    console.error('[/api/regras/aplicar] Erro:', error);
    const msg = error instanceof Error ? error.message : 'Erro ao aplicar regra no GitHub.';
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
