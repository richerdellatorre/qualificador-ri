import { NextRequest, NextResponse } from 'next/server';
import { lerCustomizacoes, salvarCustomizacoes, invalidarCache } from '@/lib/github';
import type { RegraConferidor, ConfigConferidor } from '@/lib/github';

export const maxDuration = 60;

// POST — adiciona ou atualiza uma exceção no bloco conferidor do customizacoes.json
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      excecao: Omit<RegraConferidor, 'tipo'>;
      mensagemCommit?: string;
    };

    if (!body.excecao?.codigo || !body.excecao?.descricao) {
      return NextResponse.json({ erro: 'Código e descrição da exceção são obrigatórios.' }, { status: 400 });
    }

    // Busca config atual (sem cache para garantir SHA fresco)
    invalidarCache();
    const { config, sha } = await lerCustomizacoes();

    // Monta o bloco conferidor
    const confAtual: ConfigConferidor = config.conferidor ?? { excecoes: [], instrucoes_adicionais: [] };

    const novaExcecao: RegraConferidor = {
      codigo: body.excecao.codigo,
      descricao: body.excecao.descricao,
      tipo: 'excecao',
      ativo: true,
    };

    // Substitui se já existe, ou adiciona
    const idx = confAtual.excecoes.findIndex((e) => e.codigo === novaExcecao.codigo);
    if (idx >= 0) {
      confAtual.excecoes[idx] = novaExcecao;
    } else {
      confAtual.excecoes.push(novaExcecao);
    }

    const configAtualizado = { ...config, conferidor: confAtual };
    const { sha: novoSha } = await salvarCustomizacoes(configAtualizado, sha);

    return NextResponse.json({ ok: true, sha: novoSha, excecao: novaExcecao });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro ao salvar exceção.';
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
