'use client';

import { AlertTriangle, AlertCircle, Lightbulb, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { Apontamento, GravidadeApontamento } from '@/types/conferencia';

const CONFIG_GRAVIDADE: Record<GravidadeApontamento, {
  bg: string; border: string; badgeBg: string; badgeText: string; iconColor: string;
  label: string; Icone: React.ElementType;
}> = {
  ERRO: {
    bg: '#fef2f2',
    border: '#fecaca',
    badgeBg: '#ef4444',
    badgeText: '#fff',
    iconColor: '#ef4444',
    label: 'ERRO',
    Icone: AlertTriangle,
  },
  ATENCAO: {
    bg: '#fffbeb',
    border: '#fed7aa',
    badgeBg: '#f59e0b',
    badgeText: '#fff',
    iconColor: '#f59e0b',
    label: 'ATENÇÃO',
    Icone: AlertCircle,
  },
  SUGESTAO: {
    bg: '#eff6ff',
    border: '#bfdbfe',
    badgeBg: '#3b82f6',
    badgeText: '#fff',
    iconColor: '#3b82f6',
    label: 'SUGESTÃO',
    Icone: Lightbulb,
  },
};

interface ApontamentoCardProps {
  apontamento: Apontamento;
  numero: number;
}

export default function ApontamentoCard({ apontamento, numero }: ApontamentoCardProps) {
  const [aberto, setAberto] = useState(true);
  const cfg = CONFIG_GRAVIDADE[apontamento.gravidade];
  const Icone = cfg.Icone;

  return (
    <div
      style={{
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      {/* Cabeçalho */}
      <button
        onClick={() => setAberto(!aberto)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 14px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <Icone size={16} style={{ color: cfg.iconColor, flexShrink: 0 }} />

        {/* Badge gravidade */}
        <span
          style={{
            backgroundColor: cfg.badgeBg,
            color: cfg.badgeText,
            fontSize: '10px',
            fontWeight: 800,
            padding: '2px 7px',
            borderRadius: '4px',
            letterSpacing: '0.05em',
            flexShrink: 0,
          }}
        >
          {cfg.label}
        </span>

        {/* Código */}
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#6b7280',
            flexShrink: 0,
          }}
        >
          {apontamento.codigo}
        </span>

        {/* Descrição resumida */}
        <span
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#1e293b',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: aberto ? 'normal' : 'nowrap',
          }}
        >
          {apontamento.descricao}
        </span>

        {aberto ? <ChevronUp size={14} style={{ color: '#94a3b8', flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />}
      </button>

      {/* Detalhes */}
      {aberto && (
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* Trecho da minuta */}
          {apontamento.trecho_minuta && (
            <div
              style={{
                backgroundColor: 'rgba(0,0,0,0.04)',
                borderRadius: '6px',
                padding: '8px 12px',
              }}
            >
              <p
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '4px',
                }}
              >
                Trecho da minuta
              </p>
              <p
                style={{
                  fontSize: '12px',
                  color: '#374151',
                  fontFamily: 'ui-monospace, monospace',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                &ldquo;{apontamento.trecho_minuta}&rdquo;
              </p>
            </div>
          )}

          {/* Encontrado vs Esperado */}
          {(apontamento.valor_encontrado || apontamento.valor_esperado) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {apontamento.valor_encontrado && (
                <div style={{ backgroundColor: '#fee2e2', borderRadius: '6px', padding: '8px 10px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
                    Encontrado
                  </p>
                  <p style={{ fontSize: '12px', color: '#7f1d1d', fontWeight: 500 }}>
                    {apontamento.valor_encontrado}
                  </p>
                </div>
              )}
              {apontamento.valor_esperado && (
                <div style={{ backgroundColor: '#dcfce7', borderRadius: '6px', padding: '8px 10px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
                    Esperado
                  </p>
                  <p style={{ fontSize: '12px', color: '#14532d', fontWeight: 500 }}>
                    {apontamento.valor_esperado}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Sugestão de correção */}
          {apontamento.sugestao_correcao && (
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '8px 12px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                💡 Sugestão de correção
              </p>
              <p style={{ fontSize: '12px', color: '#166534', lineHeight: 1.6 }}>
                {apontamento.sugestao_correcao}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Item OK ───────────────────────────────────────────────────
export function ItemOk({ texto }: { texto: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        padding: '8px 12px',
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '8px',
      }}
    >
      <CheckCircle2 size={14} style={{ color: '#16a34a', flexShrink: 0, marginTop: '1px' }} />
      <span style={{ fontSize: '13px', color: '#166534', lineHeight: 1.5 }}>{texto}</span>
    </div>
  );
}
