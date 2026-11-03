import { NextRequest, NextResponse } from 'next/server';
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
  try {
    const formData = await request.formData();

    const texto_minuta = (formData.get('texto_minuta') as string) ?? '';
    const modeloParam  = (formData.get('modelo') as string) ?? 'gemini-4-argon';
    const modelo: ModeloGemini =
      modeloParam === 'gemini-3.8-flash' ? 'gemini-3.8-flash' : 'gemini-4-argon';

    const arquivosRef = formData.getAll('arquivos_ref') as File[];

    if (!texto_minuta.trim()) {
      return NextResponse.json({ tipo: 'erro', mensagem: 'Texto da minuta nao pode estar vazio.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY nao configurada');
    const client = new GoogleGenAI({ apiKey });

    // Monta input multimodal
    const partes: Array<{ type: string; text?: string; data?: string; mime_type?: string }> = [];

    partes.push({
      type: 'text',
      text: `[MINUTA]\n${texto_minuta.trim()}\n[/MINUTA]\n\n`,
    });

    for (const arquivo of arquivosRef) {
      const buffer = Buffer.from(await arquivo.arrayBuffer());
      let mimeType = arquivo.type;
      if (!mimeType || mimeType === 'application/octet-stream') {
        const nome = arquivo.name.toLowerCase();
        if (nome.endsWith('.pdf'))          mimeType = 'application/pdf';
        else if (nome.match(/\.(jpg|jpeg)$/)) mimeType = 'image/jpeg';
        else if (nome.endsWith('.png'))     mimeType = 'image/png';
        else if (nome.match(/\.tiff?$/))    mimeType = 'image/tiff';
        else                               mimeType = 'application/pdf';
      }
      partes.push(arquivoParaConteudo(buffer, mimeType));
    }

    partes.push({ type: 'text', text: buildPromptConferencia(arquivosRef.length > 0) });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const interaction = await client.interactions.create({
      model: modelo,
      system_instruction: CONFERENCIA_SYSTEM_INSTRUCTION,
      store: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      input: partes as any,
      generation_config: { temperature: 0.05, max_output_tokens: 8192 },
    });

    const resultado = parseJSON(interaction.output_text ?? '{}');

    // Resposta JSON simples — sem streaming para evitar timeout QUIC
    return NextResponse.json({ tipo: 'resultado', dados: resultado });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ tipo: 'erro', mensagem }, { status: 500 });
  }
}
