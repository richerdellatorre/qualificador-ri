'use client';

import { useRef, useState, useCallback } from 'react';
import { Paperclip, X, FileText, Upload } from 'lucide-react';

interface EditorMinutaProps {
  onConferir: (payload: {
    texto_minuta: string;
    texto_matricula: string;
    arquivos_ref: File[];
  }) => void;
  analisando: boolean;
  modelo: 'gemini-4-argon' | 'gemini-3.8-flash';
}

export default function EditorMinuta({ onConferir, analisando, modelo }: EditorMinutaProps) {
  const [textoMinuta, setTextoMinuta] = useState('');
  const [textoMatricula, setTextoMatricula] = useState('');
  const [arquivosRef, setArquivosRef] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const adicionarArquivos = useCallback((novos: File[]) => {
    setArquivosRef((prev) => {
      const nomes = new Set(prev.map((f) => f.name));
      return [...prev, ...novos.filter((f) => !nomes.has(f.name))];
    });
  }, []);

  const removerArquivo = (idx: number) => {
    setArquivosRef((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      adicionarArquivos(files);
    },
    [adicionarArquivos],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      adicionarArquivos(Array.from(e.target.files));
    }
    e.target.value = '';
  };

  const handleConferir = () => {
    if (!textoMinuta.trim()) return;
    onConferir({ texto_minuta: textoMinuta, texto_matricula: textoMatricula, arquivos_ref: arquivosRef });
  };

  const podeConferir = textoMinuta.trim().length > 0 && !analisando;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Texto da Matrícula */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '6px',
          }}
        >
          Atos já lançados na matrícula
          <span style={{ fontWeight: 400, textTransform: 'none', marginLeft: '6px', color: '#94a3b8' }}>
            (cole os registros e averbações existentes para verificar continuidade e selos)
          </span>
        </label>
        <textarea
          value={textoMatricula}
          onChange={(e) => setTextoMatricula(e.target.value)}
          placeholder={`Cole aqui o texto dos atos já lançados na matrícula...\n\nExemplo:\nR-1/12.345 de 15/01/2020. Protocolo: 50.000 de 10/01/2020. ABERTURA DE MATRÍCULA...\nAV-2/12.345 de 03/03/2022. ...\nAV-3/12.345 de 01/10/2026. ... Selo Digital: C4ABB30234-81AFF ...`}
          rows={5}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--surface-2)',
            fontSize: '13px',
            color: 'var(--text-primary)',
            lineHeight: 1.6,
            resize: 'vertical',
            fontFamily: 'ui-monospace, monospace',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Texto da Minuta */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '6px',
          }}
        >
          Texto da minuta a conferir
          <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
        </label>
        <textarea
          value={textoMinuta}
          onChange={(e) => setTextoMinuta(e.target.value)}
          placeholder={`Cole aqui o texto da minuta que será impressa...\n\nExemplo:\nR-4/12.345 de 03/11/2026. Protocolo: 100.745 de 30/10/2026. COMPRA E VENDA. Nos termos da ESCRITURA PÚBLICA...\nJOÃO SILVA, advogado, portador da CI.RG nº 1234567-SESDC-RO e inscrito no CPF/MF nº 000.000.000-00...`}
          rows={10}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            backgroundColor: '#fff',
            fontSize: '13px',
            color: 'var(--text-primary)',
            lineHeight: 1.6,
            resize: 'vertical',
            fontFamily: 'ui-monospace, monospace',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Documentos de Referência */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '6px',
          }}
        >
          Documentos de referência
          <span style={{ fontWeight: 400, textTransform: 'none', marginLeft: '6px', color: '#94a3b8' }}>
            (opcional — RG, certidão de casamento, matrícula em PDF, etc.)
          </span>
        </label>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? '#7c3aed' : 'var(--border)'}`,
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            backgroundColor: dragOver ? '#f5f3ff' : 'var(--surface-2)',
            transition: 'all 0.15s ease',
          }}
        >
          <Upload size={18} style={{ color: '#7c3aed', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Arraste documentos ou <span style={{ color: '#7c3aed', fontWeight: 600 }}>clique para selecionar</span>
            <span style={{ display: 'block', fontSize: '11px', marginTop: '2px', color: '#94a3b8' }}>
              PDF, JPG, PNG ou TIFF — RG, CNH, certidão, matrícula digitalizada
            </span>
          </span>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Lista de arquivos */}
        {arquivosRef.length > 0 && (
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {arquivosRef.map((f, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  backgroundColor: '#f5f3ff',
                  border: '1px solid #ddd6fe',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#4c1d95',
                }}
              >
                <Paperclip size={12} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.name}
                </span>
                <span style={{ color: '#94a3b8', flexShrink: 0 }}>
                  {(f.size / 1024).toFixed(0)} KB
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); removerArquivo(i); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#6b7280' }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botão conferir */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleConferir}
          disabled={!podeConferir}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 24px',
            backgroundColor: podeConferir ? '#7c3aed' : '#e2e8f0',
            color: podeConferir ? '#fff' : '#94a3b8',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: podeConferir ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s ease',
            boxShadow: podeConferir ? '0 2px 8px rgba(124,58,237,0.3)' : 'none',
          }}
        >
          <FileText size={16} />
          {analisando ? 'Conferindo...' : 'Conferir Minuta'}
          {!analisando && modelo === 'gemini-4-argon' && (
            <span style={{ fontSize: '11px', opacity: 0.8, fontWeight: 400 }}>· Argon</span>
          )}
          {!analisando && modelo === 'gemini-3.8-flash' && (
            <span style={{ fontSize: '11px', opacity: 0.8, fontWeight: 400 }}>· Flash</span>
          )}
        </button>
      </div>
    </div>
  );
}
