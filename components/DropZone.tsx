'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Image as ImageIcon, X, UploadCloud } from 'lucide-react';

interface ArquivoLocal {
  id: string;
  file: File;
  nome: string;
  tamanho: string;
  tipo: 'pdf' | 'imagem';
}

interface DropZoneProps {
  onArquivosChange: (arquivos: File[]) => void;
  desabilitado?: boolean;
}

const TIPOS_ACEITOS = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/tiff': ['.tif', '.tiff'],
};

function formatarTamanho(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DropZone({ onArquivosChange, desabilitado }: DropZoneProps) {
  const [arquivos, setArquivos] = useState<ArquivoLocal[]>([]);

  const onDrop = useCallback((novos: File[]) => {
    const lista: ArquivoLocal[] = novos.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      file: f,
      nome: f.name,
      tamanho: formatarTamanho(f.size),
      tipo: f.type === 'application/pdf' ? 'pdf' : 'imagem',
    }));
    const atualizado = [...arquivos, ...lista];
    setArquivos(atualizado);
    onArquivosChange(atualizado.map((a) => a.file));
  }, [arquivos, onArquivosChange]);

  const remover = (id: string) => {
    const atualizado = arquivos.filter((a) => a.id !== id);
    setArquivos(atualizado);
    onArquivosChange(atualizado.map((a) => a.file));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: TIPOS_ACEITOS, disabled: desabilitado, multiple: true,
  });

  return (
    <div className="space-y-3">
      {/* Zona de drop */}
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${isDragActive ? '#1e40af' : '#cbd5e1'}`,
          borderRadius: 16,
          padding: '40px 24px',
          textAlign: 'center',
          cursor: desabilitado ? 'not-allowed' : 'pointer',
          background: isDragActive ? '#eff6ff' : '#f8fafc',
          transition: 'all 0.2s ease',
          opacity: desabilitado ? 0.5 : 1,
        }}
      >
        <input {...getInputProps()} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: isDragActive ? '#dbeafe' : '#e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}>
            <UploadCloud size={26} color={isDragActive ? '#1e40af' : '#64748b'} />
          </div>
          {isDragActive ? (
            <p style={{ color: '#1e40af', fontWeight: 600, fontSize: 16, margin: 0 }}>
              Solte os arquivos aqui
            </p>
          ) : (
            <>
              <div>
                <p style={{ color: '#0f172a', fontWeight: 600, fontSize: 16, margin: '0 0 4px' }}>
                  Arraste os documentos ou <span style={{ color: '#1e40af' }}>clique para selecionar</span>
                </p>
                <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>
                  Matrícula + título — PDF, JPG, PNG ou TIFF
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Arquivos adicionados */}
      {arquivos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {arquivos.map((arq) => (
            <div key={arq.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#fff', border: '1px solid #e2e8f0',
              borderRadius: 10, padding: '10px 14px',
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                background: arq.tipo === 'pdf' ? '#fef2f2' : '#eff6ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {arq.tipo === 'pdf'
                  ? <FileText size={16} color="#dc2626" />
                  : <ImageIcon size={16} color="#2563eb" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {arq.nome}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>{arq.tamanho}</p>
              </div>
              {!desabilitado && (
                <button onClick={() => remover(arq.id)} title="Remover"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', color: '#94a3b8', transition: 'color 0.15s' }}
                  onMouseOver={e => (e.currentTarget.style.color = '#dc2626')}
                  onMouseOut={e => (e.currentTarget.style.color = '#94a3b8')}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
