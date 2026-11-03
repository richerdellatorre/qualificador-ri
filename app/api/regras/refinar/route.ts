import { NextRequest, NextResponse } from 'next/server';
import { refinarRegraComIA } from '@/lib/gemini';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      codigo: string;
      descricaoRegra: string;
      intencaoUsuario: string;
      acaoDesejada: 'OBSERVACAO' | 'DESATIVAR';
    };

    if (!body.codigo || !body.intencaoUsuario) {
      return NextResponse.json(
        { erro: 'Código da regra e descrição da intenção são obrigatórios.' },
        { status: 400 }
      );
    }

    const resultado = await refinarRegraComIA({
      codigo: body.codigo,
      descricaoRegra: body.descricaoRegra || '',
      intencaoUsuario: body.intencaoUsuario,
      acaoDesejada: body.acaoDesejada || 'OBSERVACAO',
    });

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('[/api/regras/refinar] Erro:', error);
    const msg = error instanceof Error ? error.message : 'Erro ao refinar regra com IA.';
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
