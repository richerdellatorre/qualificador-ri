import { NextRequest, NextResponse } from 'next/server';
import { arquivoParaConteudo, verificarSaneamento } from '@/lib/gemini';

export const maxDuration = 120; // 2 minutos

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // ── Dados da pendência ──────────────────────────────────
    const pendenciaRaw = formData.get('pendencia');
    const contextoRaw = formData.get('contexto');

    if (!pendenciaRaw || !contextoRaw) {
      return NextResponse.json(
        { erro: 'Dados da pendência ou contexto não informados.' },
        { status: 400 }
      );
    }

    const pendencia = JSON.parse(pendenciaRaw as string) as {
      codigo: string;
      descricao: string;
      como_sanar: string;
      fundamento?: string;
    };

    const contexto = JSON.parse(contextoRaw as string) as {
      tipo_titulo: string;
      natureza_imovel: string;
      resumo_ia: string;
    };

    // ── Documentos de saneamento ────────────────────────────
    const arquivos = formData.getAll('arquivos') as File[];

    if (arquivos.length === 0) {
      return NextResponse.json(
        { erro: 'Nenhum arquivo enviado para verificação.' },
        { status: 400 }
      );
    }

    const MIME_PERMITIDOS = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'image/webp',
    ];

    const conteudos = await Promise.all(
      arquivos.map(async (file) => {
        if (!MIME_PERMITIDOS.includes(file.type)) {
          throw new Error(`Tipo de arquivo não suportado: ${file.name} (${file.type})`);
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        return arquivoParaConteudo(buffer, file.type);
      })
    );

    // ── Chama a IA ──────────────────────────────────────────
    const resultado = await verificarSaneamento(pendencia, contexto, conteudos);

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('[/api/sanar] Erro:', error);
    const msg = error instanceof Error ? error.message : 'Erro interno.';
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
