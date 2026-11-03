'use client';

import { AlertTriangle, AlertCircle, Info, CheckCircle2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { Pendencia } from '@/types/qualificacao';
import SaneamentoPendencia from './SaneamentoPendencia';
import ModalAjustarRegra from './ModalAjustarRegra';

interface PendenciaCardProps {
  pendencia: Pendencia;
  numero: number;
  contextoAnalise?: {
    tipo_titulo: string;
    natureza_imovel: string;
    resumo_ia: string;
  };
}

const CONFIG = {
  IMPERATIVA: {
    bgCard: 'var(--red-bg)',
    border: 'var(--red-border)',
    badgeBg: 'var(--red)',
    badgeText: '#fff',
    iconColor: 'var(--red)',
    labelColor: 'var(--red-text)',
    label: 'IMPEDITIVA',
    Icone: AlertTriangle,
    detalheBg: '#fff5f5',
    detalheBorder: 'var(--red-border)',
  },
  EXIGENCIA: {
    bgCard: 'var(--amber-bg)',
    border: 'var(--amber-border)',
    badgeBg: 'var(--amber)',
    badgeText: '#fff',
    iconColor: 'var(--amber)',
    labelColor: 'var(--amber-text)',
    label: 'EXIGÊNCIA',
    Icone: AlertCircle,
    detalheBg: '#fffef5',
    detalheBorder: 'var(--amber-border)',
  },
  ALERTA: {
    bgCard: 'var(--blue-bg)',
    border: 'var(--blue-border)',
    badgeBg: 'var(--blue)',
    badgeText: '#fff',
    iconColor: 'var(--blue)',
    labelColor: 'var(--blue-text)',
    label: 'ALERTA',
    Icone: Info,
    detalheBg: '#f5f8ff',
    detalheBorder: 'var(--blue-border)',
  },
};

export default function PendenciaCard({ pendencia, numero, contextoAnalise }: PendenciaCardProps) {
  const [expandido, setExpandido] = useState(pendencia.gravidade === 'IMPERATIVA');
  const [modalAjusteAberto, setModalAjusteAberto] = useState(false);
  const [avisoCustomizacao, setAvisoCustomizacao] = useState<string | null>(null);
  const cfg = CONFIG[pendencia.gravidade];
  const { Icone } = cfg;

  return (
    <div style={{
      backgroundColor: cfg.bgCard,
      border: `1px solid ${cfg.border}`,
      borderRadius: '10px',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Cabeçalho sempre visível */}
      <button
        onClick={() => setExpandido(!expandido)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '14px 16px',
          textAlign: 'left',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {/* Ícone colorido */}
        <div style={{ marginTop: '2px', flexShrink: 0 }}>
          <Icone size={17} style={{ color: cfg.iconColor }} />
        </div>

        {/* Conteúdo */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: cfg.badgeBg,
              color: cfg.badgeText,
              letterSpacing: '0.04em',
            }}>
              {cfg.label}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 600 }}>
              {pendencia.codigo}
            </span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.5 }}>
            {pendencia.descricao}
          </p>
        </div>

        {/* Chevron */}
        <div style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }}>
          {expandido ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {/* Detalhes expandidos */}
      {expandido && (
        <div style={{
          padding: '0 16px 16px',
          borderTop: `1px solid ${cfg.border}`,
          paddingTop: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {pendencia.fundamento && (
            <div style={{
              backgroundColor: cfg.detalheBg,
              border: `1px solid ${cfg.detalheBorder}`,
              borderRadius: '8px',
              padding: '10px 12px',
            }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>
                Fundamento Legal
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {pendencia.fundamento}
              </p>
            </div>
          )}

          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '10px 12px',
          }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>
              Como Sanar
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {pendencia.como_sanar}
            </p>
          </div>

          {/* Ações contextuais da pendência */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            paddingTop: '6px',
            borderTop: '1px dashed var(--border)',
          }}>
            {/* Saneamento inline — só para IMPERATIVA e EXIGENCIA */}
            {contextoAnalise && pendencia.gravidade !== 'ALERTA' && (
              <SaneamentoPendencia
                pendencia={pendencia}
                contexto={contextoAnalise}
              />
            )}

            {/* Botão de personalização com IA */}
            <button
              type="button"
              onClick={() => setModalAjusteAberto(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border-strong)',
                borderRadius: '6px',
                padding: '5px 10px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                marginTop: contextoAnalise && pendencia.gravidade !== 'ALERTA' ? '10px' : '0',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--brand-light)';
                e.currentTarget.style.color = 'var(--brand)';
                e.currentTarget.style.borderColor = 'var(--blue-border)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-strong)';
              }}
            >
              <Sparkles size={12} style={{ color: 'var(--brand)' }} />
              Personalizar exigência no cartório
            </button>
          </div>

          {/* Notificação se a regra foi personalizada agora */}
          {avisoCustomizacao && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--brand)',
              backgroundColor: 'var(--brand-light)',
              border: '1px solid var(--blue-border)',
              borderRadius: '6px',
              padding: '6px 10px',
            }}>
              <CheckCircle2 size={13} />
              {avisoCustomizacao}
            </div>
          )}
        </div>
      )}

      {/* Modal de personalização com IA e commit no GitHub */}
      {modalAjusteAberto && (
        <ModalAjustarRegra
          pendencia={pendencia}
          onFechar={() => setModalAjusteAberto(false)}
          onSucesso={(codigo, novaRegra) => {
            const detalhe = novaRegra.ativo === false
              ? 'Exigência desativada no GitHub para o cartório'
              : 'Nova diretriz registrada no GitHub';
            setAvisoCustomizacao(`Regra ${codigo}: ${detalhe}. A IA aplicará nas próximas análises.`);
          }}
        />
      )}
    </div>
  );
}

// ─── Seção de pendências ──────────────────────────────────────
interface SecaoPendenciasProps {
  titulo: string;
  pendencias: Pendencia[];
  tipo: 'IMPERATIVA' | 'EXIGENCIA' | 'ALERTA';
  defaultAberta?: boolean;
  contextoAnalise?: {
    tipo_titulo: string;
    natureza_imovel: string;
    resumo_ia: string;
  };
}

const SECAO_CFG = {
  IMPERATIVA: { color: 'var(--red)', Icone: AlertTriangle, countBg: '#fee2e2', countColor: 'var(--red-text)' },
  EXIGENCIA: { color: 'var(--amber)', Icone: AlertCircle, countBg: '#fef3c7', countColor: 'var(--amber-text)' },
  ALERTA: { color: 'var(--blue)', Icone: Info, countBg: '#dbeafe', countColor: 'var(--blue-text)' },
};

export function SecaoPendencias({
  titulo,
  pendencias,
  tipo,
  defaultAberta = true,
  contextoAnalise,
}: SecaoPendenciasProps) {
  const [aberta, setAberta] = useState(defaultAberta);
  const cfg = SECAO_CFG[tipo];
  const { Icone } = cfg;

  if (pendencias.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button
        onClick={() => setAberta(!aberta)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textAlign: 'left',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 0',
          width: '100%',
        }}
      >
        <Icone size={18} style={{ color: cfg.color, flexShrink: 0 }} />
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>
          {titulo}
        </h3>
        <span style={{
          fontSize: '12px',
          fontWeight: 700,
          padding: '2px 10px',
          borderRadius: '99px',
          backgroundColor: cfg.countBg,
          color: cfg.countColor,
          flexShrink: 0,
        }}>
          {pendencias.length}
        </span>
        <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
          {aberta ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {aberta && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '4px' }} className="fade-in">
          {pendencias.map((p, i) => (
            <PendenciaCard key={p.codigo} pendencia={p} numero={i + 1} contextoAnalise={contextoAnalise} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Seção itens OK ───────────────────────────────────────────
export function SecaoItensOK({ itens }: { itens: string[] }) {
  const [aberta, setAberta] = useState(false);

  if (itens.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button
        onClick={() => setAberta(!aberta)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textAlign: 'left',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 0',
          width: '100%',
        }}
      >
        <CheckCircle2 size={18} style={{ color: 'var(--green)', flexShrink: 0 }} />
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>
          Verificados sem pendência
        </h3>
        <span style={{
          fontSize: '12px',
          fontWeight: 700,
          padding: '2px 10px',
          borderRadius: '99px',
          backgroundColor: 'var(--green-bg)',
          color: 'var(--green-text)',
          flexShrink: 0,
        }}>
          {itens.length}
        </span>
        <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
          {aberta ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {aberta && (
        <div style={{
          backgroundColor: 'var(--green-bg)',
          border: '1px solid var(--green-border)',
          borderRadius: '10px',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }} className="fade-in">
          {itens.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle2 size={14} style={{ color: 'var(--green)', marginTop: '2px', flexShrink: 0 }} />
              <p style={{ fontSize: '13px', color: 'var(--green-text)', lineHeight: 1.5 }}>{item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
