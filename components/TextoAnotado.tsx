'use client';

import { useState } from 'react';
import type { Apontamento, GravidadeApontamento } from '@/types/conferencia';

const COR_GRAVIDADE: Record<GravidadeApontamento, {
  bg: string; borda: string; texto: string; label: string;
  badgeBg: string; painelBg: string; painelBord: string;
}> = {
  ERRO: {
    bg: '#fee2e2', borda: '#fca5a5', texto: '#991b1b', label: 'Erro',
    badgeBg: '#ef4444', painelBg: '#fef2f2', painelBord: '#fecaca',
  },
  ATENCAO: {
    bg: '#fef9c3', borda: '#fde047', texto: '#713f12', label: 'Atenção',
    badgeBg: '#f59e0b', painelBg: '#fffbeb', painelBord: '#fde68a',
  },
  SUGESTAO: {
    bg: '#dbeafe', borda: '#93c5fd', texto: '#1e40af', label: 'Sugestão',
    badgeBg: '#3b82f6', painelBg: '#eff6ff', painelBord: '#bfdbfe',
  },
};

interface Segmento {
  texto: string;
  apontamento?: Apontamento;
}

function anotarTexto(texto: string, apontamentos: Apontamento[]): Segmento[] {
  interface Marcacao extends Apontamento { inicio: number; fim: number }
  const marcacoes: Marcacao[] = [];

  for (const a of apontamentos) {
    if (!a.trecho_minuta) continue;
    const idx = texto.indexOf(a.trecho_minuta);
    if (idx < 0) continue;
    marcacoes.push({ ...a, inicio: idx, fim: idx + a.trecho_minuta.length });
  }

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

interface TextoAnotadoProps {
  texto: string;
  apontamentos: Apontamento[];
}

export default function TextoAnotado({ texto, apontamentos }: TextoAnotadoProps) {
  const [selecionado, setSelecionado] = useState<Apontamento | null>(null);

  const segmentos = anotarTexto(texto, apontamentos);
  const totalAnotados = segmentos.filter((s) => s.apontamento).length;

  if (totalAnotados === 0) {
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

  const cfg = selecionado ? COR_GRAVIDADE[selecionado.gravidade] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Texto da minuta anotado
        </p>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {(['ERRO', 'ATENCAO', 'SUGESTAO'] as GravidadeApontamento[]).map((g) => (
            <span key={g} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b' }}>
              <span style={{
                display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px',
                backgroundColor: COR_GRAVIDADE[g].bg, border: `1px solid ${COR_GRAVIDADE[g].borda}`,
              }} />
              {COR_GRAVIDADE[g].label}
            </span>
          ))}
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>• Clique no trecho para ver detalhes</span>
        </div>
      </div>

      {/* Layout: texto à esquerda, painel lateral à direita */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: selecionado ? '1fr 320px' : '1fr',
        gap: '12px',
        alignItems: 'start',
        transition: 'grid-template-columns 0.2s ease',
      }}>

        {/* Texto anotado */}
        <div style={{
          backgroundColor: '#fff', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '20px',
          fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.85,
          fontFamily: 'inherit', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {segmentos.map((seg, i) => {
            if (!seg.apontamento) {
              return <span key={i}>{seg.texto}</span>;
            }

            const a = seg.apontamento;
            const c = COR_GRAVIDADE[a.gravidade];
            const ativo = selecionado?.codigo === a.codigo;

            return (
              <mark
                key={i}
                onClick={() => setSelecionado(ativo ? null : a)}
                title={a.codigo}
                style={{
                  backgroundColor: ativo ? c.borda : c.bg,
                  borderBottom: `2px solid ${c.borda}`,
                  borderRadius: '2px',
                  cursor: 'pointer',
                  padding: '0 2px',
                  outline: ativo ? `2px solid ${c.badgeBg}` : 'none',
                  outlineOffset: '1px',
                  transition: 'all 0.15s',
                  fontWeight: ativo ? 600 : 'inherit',
                }}
              >
                {seg.texto}
              </mark>
            );
          })}
        </div>

        {/* Painel lateral de detalhes — só aparece ao clicar */}
        {selecionado && cfg && (
          <div style={{
            backgroundColor: cfg.painelBg,
            border: `1px solid ${cfg.painelBord}`,
            borderRadius: '10px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            animation: 'slideIn 0.15s ease',
            alignSelf: 'start',
            position: 'sticky',
            top: '80px',
          }}>

            {/* Cabeçalho do painel */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{
                  backgroundColor: cfg.badgeBg, color: '#fff',
                  fontSize: '9px', fontWeight: 800, padding: '2px 7px',
                  borderRadius: '3px', letterSpacing: '0.07em',
                }}>
                  {cfg.label.toUpperCase()}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280' }}>
                  {selecionado.codigo}
                </span>
              </div>
              <button
                onClick={() => setSelecionado(null)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#9ca3af', fontSize: '18px', lineHeight: 1,
                  padding: '0', flexShrink: 0,
                }}
                title="Fechar"
              >
                ×
              </button>
            </div>

            {/* Descrição */}
            <p style={{ fontSize: '13px', color: '#1e293b', fontWeight: 600, lineHeight: 1.55, margin: 0 }}>
              {selecionado.descricao}
            </p>

            {/* Encontrado / Esperado */}
            {(selecionado.valor_encontrado || selecionado.valor_esperado) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selecionado.valor_encontrado && (
                  <div style={{ backgroundColor: '#fee2e2', borderRadius: '6px', padding: '7px 10px' }}>
                    <p style={{ fontSize: '9px', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
                      Encontrado
                    </p>
                    <p style={{ fontSize: '12px', color: '#7f1d1d', fontWeight: 500, lineHeight: 1.4 }}>
                      {selecionado.valor_encontrado}
                    </p>
                  </div>
                )}
                {selecionado.valor_esperado && (
                  <div style={{ backgroundColor: '#dcfce7', borderRadius: '6px', padding: '7px 10px' }}>
                    <p style={{ fontSize: '9px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
                      Esperado
                    </p>
                    <p style={{ fontSize: '12px', color: '#14532d', fontWeight: 500, lineHeight: 1.4 }}>
                      {selecionado.valor_esperado}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Sugestão de correção */}
            {selecionado.sugestao_correcao && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '8px 12px' }}>
                <p style={{ fontSize: '9px', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                  💡 Sugestão de correção
                </p>
                <p style={{ fontSize: '12px', color: '#166534', lineHeight: 1.6 }}>
                  {selecionado.sugestao_correcao}
                </p>
              </div>
            )}

            {/* Dica */}
            <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>
              Clique novamente no trecho ou × para fechar
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
