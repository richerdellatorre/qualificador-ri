'use client';

import { Upload, FileSearch, DatabaseZap, Scale, CheckCircle2 } from 'lucide-react';

type Etapa = 'uploading' | 'classificando' | 'extraindo' | 'qualificando' | 'concluido';

interface LoadingProgressProps {
  etapa: Etapa;
  mensagem: string;
}

const ETAPAS = [
  {
    id: 'uploading' as Etapa,
    label: 'Preparando',
    sublabel: 'Enviando arquivos',
    Icone: Upload,
  },
  {
    id: 'classificando' as Etapa,
    label: 'Identificando',
    sublabel: 'Reconhecendo documentos',
    Icone: FileSearch,
  },
  {
    id: 'extraindo' as Etapa,
    label: 'Extraindo',
    sublabel: 'Lendo informações',
    Icone: DatabaseZap,
  },
  {
    id: 'qualificando' as Etapa,
    label: 'Qualificando',
    sublabel: 'Análise registral',
    Icone: Scale,
  },
];

const ORDEM: Etapa[] = ['uploading', 'classificando', 'extraindo', 'qualificando'];

export default function LoadingProgress({ etapa, mensagem }: LoadingProgressProps) {
  const etapaAtual = ORDEM.indexOf(etapa);

  return (
    <div style={{
      backgroundColor: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '32px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
    }}>
      {/* Título */}
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Analisando documentos
        </p>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0', marginBottom: '28px' }}>
        {ETAPAS.map((e, i) => {
          const concluido = i < etapaAtual;
          const ativo = i === etapaAtual;
          const { Icone } = e;
          const isLast = i === ETAPAS.length - 1;

          return (
            <div key={e.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              {/* Linha conectora até o próximo step (centralizada de centro a centro) */}
              {!isLast && (
                <div style={{
                  position: 'absolute',
                  top: '19px',
                  left: '50%',
                  width: '100%',
                  height: '2px',
                  backgroundColor: concluido ? 'var(--brand)' : 'var(--border)',
                  zIndex: 1,
                  transition: 'background-color 0.4s ease',
                }} />
              )}

              {/* Círculo */}
              <div style={{
                position: 'relative',
                zIndex: 2,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                backgroundColor: concluido ? 'var(--green)' : ativo ? 'var(--brand)' : 'var(--surface-2)',
                border: concluido ? '2px solid var(--green)' : ativo ? '2px solid var(--brand)' : '2px solid var(--border)',
                boxShadow: ativo ? '0 0 0 4px var(--brand-light)' : 'none',
                transition: 'all 0.4s ease',
              }}>
                {concluido ? (
                  <CheckCircle2 size={18} style={{ color: '#fff' }} />
                ) : ativo ? (
                  /* Spinner */
                  <div style={{
                    width: '18px', height: '18px',
                    border: '2.5px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                ) : (
                  <Icone size={16} style={{ color: 'var(--text-muted)' }} />
                )}
              </div>

              {/* Label */}
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <p style={{
                  fontSize: '12px',
                  fontWeight: ativo ? 700 : 500,
                  color: concluido ? 'var(--green)' : ativo ? 'var(--brand)' : 'var(--text-muted)',
                  lineHeight: 1.2,
                }}>
                  {e.label}
                </p>
                <p style={{
                  fontSize: '11px',
                  color: ativo ? 'var(--text-secondary)' : 'var(--text-muted)',
                  marginTop: '2px',
                  display: 'none',
                }}
                  className="sm-show"
                >
                  {e.sublabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mensagem atual */}
      <div style={{
        backgroundColor: 'var(--brand-light)',
        border: '1px solid var(--blue-border)',
        borderRadius: '10px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '16px',
      }}>
        <div style={{
          width: '8px', height: '8px',
          borderRadius: '50%',
          backgroundColor: 'var(--brand)',
          flexShrink: 0,
          animation: 'pulse-dot 1.4s ease infinite',
        }} />
        <p style={{ fontSize: '14px', color: 'var(--blue-text)', fontWeight: 500 }}>
          {mensagem || 'Processando…'}
        </p>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
        A análise pode levar até 2 minutos dependendo da quantidade e tamanho dos documentos
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 640px) { .sm-show { display: block !important; } }
      `}</style>
    </div>
  );
}
