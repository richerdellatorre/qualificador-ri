import { NextRequest, NextResponse } from 'next/server';
import { lerCustomizacoes, salvarCustomizacoes } from '@/lib/github';
import type { CustomizacoesConfig } from '@/lib/github';

// GET — Lê as customizações atuais
export async function GET() {
  try {
    const { config, sha } = await lerCustomizacoes();
    return NextResponse.json({ config, sha });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro ao ler customizações.';
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}

// POST — Salva customizações atualizadas
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { config: CustomizacoesConfig; sha: string };

    if (!body.config) {
      return NextResponse.json({ erro: 'Configuração não informada.' }, { status: 400 });
    }

    const { sha } = await salvarCustomizacoes(body.config, body.sha ?? '');
    return NextResponse.json({ ok: true, sha });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro ao salvar customizações.';
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
