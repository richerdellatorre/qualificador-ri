'use client';

import { useState, useRef, useEffect } from 'react';
import type { Apontamento, GravidadeApontamento } from '@/types/conferencia';

const COR_GRAVIDADE: Record<GravidadeApontamento, { bg: string; borda: string; texto: string; label: string }> = {
  ERRO:     { bg: '#fee2e2', borda: '#fca5a5', texto: '#991b1b', label: 'Erro' },
  ATENCAO:  { bg: '#fef9c3', borda: '#fde047', texto: '#713f12', label: 'Atenção' },
  SUGESTAO: { bg: '#dbeafe', borda: '#93c5fd', texto: '#1e40af', label: 'Sugestão' },
};

interface Segmento {
  texto: string;
  apontamento?: Apontamento;
}

function anotarTexto(texto: string, apontamentos: Apontamento[]): Segmento[] {
  // Filtra apenas apontamentos com trecho válido e que existem no texto
  interface Marcacao extends Apontamento { inicio: number; fim: number }
  const marcacoes: Marcacao[] = [];

  for (const a of apontamentos) {
    if (!a.trecho_minuta) continue;
    const idx = texto.indexOf(a.trecho_minuta);
    if (idx < 0) continue;
    marcacoes.push({ ...a, inicio: idx, fim: idx + a.trecho_minuta.length });
  }

  // Ordena por posição; remove sobreposições (maior gravidade ganha)
  const prioridade: Record<GravidadeApontamento, number> = { ERRO: 3, ATENCAO: 2, SUGESTAO: 1 };
  marcacoes.sort((a, b) => a.inicio - b.inicio || prioridade[b.gravidade] - prioridade[a.gravidade]);

  const definitivas: Marcacao[] = [];
  let ultimoFim = 0;
  for (const m of marcacoes) {
    if (m.inicio >= ultimoFim) {
      definitivas.push(m);
      ultimoFim = m.fim;
    }
  }

  // Constrói segmentos
  const segmentos: Segmento[] = [];
  let pos = 0;
  for (const m of definitivas) {
    if (m.inicio > pos) segmentos.push({ texto: texto.slice(pos, m.inicio) });
    segmentos.push({ texto: texto.slice(m.inicio, m.fim), apontamento: m });
    pos = m.fim;
  }
  if (pos < texto.length) segmentos.push({ texto: texto.slice(pos) });

  return segmentos;
}

interface TooltipState {
  x: number;
  y: number;
  apontamento: Apontamento;
}

interface TextoAnotadoProps {
  texto: string;
  apontamentos: Apontamento[];
}

export default function TextoAnotado({ texto, apontamentos }: TextoAnotadoProps) {
  const [selecionado, setSelecionado] = useState<Apontamento | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const segmentos = anotarTexto(texto, apontamentos);
  const totalAnotados = segmentos.filter((s) => s.apontamento).length;

  // Fechar tooltip ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setTooltip(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (totalAnotados === 0) {
    // Nenhum trecho localizado no texto — exibe o texto puro
    return (
      <div style={{
        backgroundColor: '#f8fafc', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '18px 20px',
      }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
          Texto da minuta
        </p>
        <pre style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
          {texto}
        </pre>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Texto da minuta anotado
        </p>
        {/* Legenda */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {(['ERRO', 'ATENCAO', 'SUGESTAO'] as GravidadeApontamento[]).map((g) => (
            <span key={g} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b' }}>
              <span style={{
                display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px',
                backgroundColor: COR_GRAVIDADE[g].bg, border: `1px solid ${COR_GRAVIDADE[g].borda}`,
              }} />
              {COR_GRAVIDADE[g].label}
            </span>
          ))}
        </div>
      </div>

      {/* Texto anotado */}
      <div style={{
        backgroundColor: '#fff', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '20px',
        fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.85,
        fontFamily: 'inherit', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        position: 'relative',
      }}>
        {segmentos.map((seg, i) => {
          if (!seg.apontamento) {
            return <span key={i}>{seg.texto}</span>;
          }

          const a = seg.apontamento;
          const cfg = COR_GRAVIDADE[a.gravidade];
          const ativo = selecionado?.codigo === a.codigo;

          return (
            <mark
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setSelecionado(ativo ? null : a);
                setTooltip(null);
              }}
              onMouseEnter={(e) => {
                if (!ativo) {
                  const rect = (e.target as HTMLElement).getBoundingClientRect();
                  const containerRect = containerRef.current!.getBoundingClientRect();
                  setTooltip({
                    x: rect.left - containerRect.left,
                    y: rect.top - containerRect.top - 8,
                    apontamento: a,
                  });
                }
              }}
              onMouseLeave={() => setTooltip(null)}
              style={{
                backgroundColor: cfg.bg,
                borderBottom: `2px solid ${cfg.borda}`,
                borderRadius: '2px',
                cursor: 'pointer',
                padding: '0 2px',
                transition: 'all 0.1s',
                outline: ativo ? `2px solid ${cfg.borda}` : 'none',
              }}
            >
              {seg.texto}
            </mark>
          );
        })}

        {/* Tooltip flutuante */}
        {tooltip && (
          <div
            style={{
              position: 'absolute',
              left: `${Math.min(tooltip.x, 500)}px`,
              top: `${tooltip.y - 52}px`,
              backgroundColor: '#1e293b',
              color: '#f1f5f9',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: 500,
              lineHeight: 1.4,
              maxWidth: '260px',
              pointerEvents: 'none',
              zIndex: 50,
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              whiteSpace: 'normal',
            }}
          >
            <span style={{ fontWeight: 700, color: COR_GRAVIDADE[tooltip.apontamento.gravidade].bg }}>
              {tooltip.apontamento.codigo}
            </span>
            {' '}· {tooltip.apontamento.descricao.slice(0, 120)}{tooltip.apontamento.descricao.length > 120 ? '…' : ''}
            <br />
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Clique para expandir</span>
          </div>
        )}
      </div>

      {/* Card expandido do item selecionado */}
      {selecionado && (() => {
        const cfg = COR_GRAVIDADE[selecionado.gravidade];
        return (
          <div style={{
            backgroundColor: cfg.bg, border: `1px solid ${cfg.borda}`,
            borderRadius: '10px', padding: '14px 16px',
            display: 'flex', flexDirection: 'column', gap: '10px',
            animation: 'fadeIn 0.15s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <div>
                <span style={{
                  fontSize: '10px', fontWeight: 800, color: '#fff',
                  backgroundColor: cfg.texto === '#991b1b' ? '#ef4444' : cfg.texto === '#713f12' ? '#f59e0b' : '#3b82f6',
                  padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em',
                  marginRight: '8px',
                }}>
                  {cfg.label.toUpperCase()}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280' }}>{selecionado.codigo}</span>
              </div>
              <button
                onClick={() => setSelecionado(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '16px', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#1e293b', fontWeight: 600, lineHeight: 1.5 }}>
              {selecionado.descricao}
            </p>

            {(selecionado.valor_encontrado || selecionado.valor_esperado) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {selecionado.valor_encontrado && (
                  <div style={{ backgroundColor: '#fee2e2', borderRadius: '6px', padding: '8px 10px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
                      Encontrado
                    </p>
                    <p style={{ fontSize: '12px', color: '#7f1d1d', fontWeight: 500 }}>
                      {selecionado.valor_encontrado}
                    </p>
                  </div>
                )}
                {selecionado.valor_esperado && (
                  <div style={{ backgroundColor: '#dcfce7', borderRadius: '6px', padding: '8px 10px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
                      Esperado
                    </p>
                    <p style={{ fontSize: '12px', color: '#14532d', fontWeight: 500 }}>
                      {selecionado.valor_esperado}
                    </p>
                  </div>
                )}
              </div>
            )}

            {selecionado.sugestao_correcao && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '8px 12px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
                  Sugestão de correção
                </p>
                <p style={{ fontSize: '12px', color: '#166534', lineHeight: 1.6 }}>
                  {selecionado.sugestao_correcao}
                </p>
              </div>
            )}
          </div>
        );
      })()}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
