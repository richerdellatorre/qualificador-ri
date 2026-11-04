import { NextRequest, NextResponse } from 'next/server';
import { uploadArquivoGemini, arquivoParaConteudo } from '@/lib/gemini';

export const maxDuration = 120; // 2 min para upload individual

// Threshold: acima de 4MB usa File API (conservador para o Render)
const UPLOAD_THRESHOLD = 4 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const arquivo = formData.get('arquivo') as File | null;

    if (!arquivo) {
      return NextResponse.json(
        { erro: 'Nenhum arquivo enviado.' },
        { status: 400 }
      );
    }

    let mimeType = arquivo.type;
    if (!mimeType || mimeType === 'application/octet-stream') {
      const nome = arquivo.name.toLowerCase();
      if (nome.endsWith('.pdf')) mimeType = 'application/pdf';
      else if (nome.match(/\.(jpg|jpeg)$/)) mimeType = 'image/jpeg';
      else if (nome.endsWith('.png')) mimeType = 'image/png';
      else if (nome.match(/\.tiff?$/)) mimeType = 'image/tiff';
      else mimeType = 'application/pdf';
    }

    const buffer = Buffer.from(await arquivo.arrayBuffer());

    if (buffer.length > UPLOAD_THRESHOLD) {
      // Arquivo grande: upload via File API do Gemini e retorna URI
      const resultado = await uploadArquivoGemini(buffer, mimeType, arquivo.name);
      return NextResponse.json({
        modo: 'uri',
        type: resultado.type,
        uri: resultado.uri,
        mime_type: resultado.mime_type,
        nome: arquivo.name,
        tamanho: buffer.length,
      });
    } else {
      // Arquivo pequeno: retorna base64 inline
      const resultado = arquivoParaConteudo(buffer, mimeType);
      return NextResponse.json({
        modo: 'inline',
        type: resultado.type,
        data: resultado.data,
        mime_type: resultado.mime_type,
        nome: arquivo.name,
        tamanho: buffer.length,
      });
    }
  } catch (erro) {
    const msg = erro instanceof Error ? erro.message : 'Erro no upload.';
    console.error('[Upload] Erro:', erro);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
