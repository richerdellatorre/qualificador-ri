'use client';

import { AlertTriangle, AlertCircle, Info, CheckCircle2, FileText, Landmark, RotateCcw } from 'lucide-react';
import type { ResultadoQualificacao } from '@/types/qualificacao';
import { SecaoPendencias, SecaoItensOK } from './PendenciaCard';

interface PainelResultadoProps {
  resultado: ResultadoQualificacao;
  onNova: () => void;
}

const PARECER_CONFIG = {
  APTO: {
    bgBanner: 'var(--green-bg)',
    border: 'var(--green-border)',
    textColor: 'var(--green-text)',
    iconColor: 'var(--green)',
    stripeBg: '#16a34a',
    Icone: CheckCircle2,
    label: 'APTO PARA REGISTRO',
    sub: 'Nenhuma pendência impeditiva identificada',
  },
  COM_PENDENCIAS: {
    bgBanner: 'var(--amber-bg)',
    border: 'var(--amber-border)',
    textColor: 'var(--amber-text)',
    iconColor: 'var(--amber)',
    stripeBg: '#d97706',
    Icone: AlertCircle,
    label: 'COM PENDÊNCIAS',
    sub: 'Existem exigências ou alertas a serem verificados',
  },
  INAPTO: {
    bgBanner: 'var(--red-bg)',
    border: 'var(--red-border)',
    textColor: 'var(--red-text)',
    iconColor: 'var(--red)',
    stripeBg: '#dc2626',
    Icone: AlertTriangle,
    label: 'INAPTO PARA REGISTRO',
    sub: 'Existem pendências impeditivas que devem ser sanadas',
  },
};

export default function PainelResultado({ resultado, onNova }: PainelResultadoProps) {
  const cfg = PARECER_CONFIG[resultado.parecer_geral];
  const { Icone } = cfg;

  const totalImperativas = resultado.pendencias_imperativas.length;
  const totalExigencias = resultado.exigencias.length;
  const totalAlertas = resultado.alertas.length;
  const totalOK = resultado.itens_ok.length;
  const totalPendencias = totalImperativas + totalExigencias + totalAlertas;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="fade-in">

      {/* ── Banner do Parecer ── */}
      <div style={{
        backgroundColor: cfg.bgBanner,
        border: `1px solid ${cfg.border}`,
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        {/* Faixa colorida lateral */}
        <div style={{ display: 'flex' }}>
          <div style={{ width: '5px', backgroundColor: cfg.stripeBg, flexShrink: 0 }} />
          <div style={{ padding: '20px 24px', flex: 1 }}>
            {/* Parecer */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px', height: '44px',
                  borderRadius: '50%',
                  backgroundColor: cfg.stripeBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icone size={22} style={{ color: '#fff' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: cfg.textColor, letterSpacing: '-0.01em' }}>
                    {cfg.label}
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {resultado.tipo_titulo || cfg.sub}
                  </p>
                </div>
              </div>

              {/* Tag do modelo utilizado */}
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255,255,255,0.85)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}>
                {resultado.modelo_usado === 'gemini-3.8-flash' ? '⚡ Gemini 3.8 Flash' : '🧠 Gemini 4 Argon'}
              </span>
            </div>

            {/* Documentos analisados */}
            {resultado.documentos_identificados.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Documentos analisados
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {resultado.documentos_identificados.map((doc) => (
                    <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <FileText size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{doc.descricao}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contadores */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {totalImperativas > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  backgroundColor: '#fee2e2', border: '1px solid var(--red-border)',
                  borderRadius: '8px', padding: '6px 12px',
                }}>
                  <AlertTriangle size={13} style={{ color: 'var(--red)' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--red-text)' }}>
                    {totalImperativas} Impeditiva{totalImperativas !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
              {totalExigencias > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  backgroundColor: '#fef3c7', border: '1px solid var(--amber-border)',
                  borderRadius: '8px', padding: '6px 12px',
                }}>
                  <AlertCircle size={13} style={{ color: 'var(--amber)' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--amber-text)' }}>
                    {totalExigencias} Exigência{totalExigencias !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
              {totalAlertas > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  backgroundColor: '#dbeafe', border: '1px solid var(--blue-border)',
                  borderRadius: '8px', padding: '6px 12px',
                }}>
                  <Info size={13} style={{ color: 'var(--blue)' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--blue-text)' }}>
                    {totalAlertas} Alerta{totalAlertas !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
              {totalOK > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  backgroundColor: 'var(--green-bg)', border: '1px solid var(--green-border)',
                  borderRadius: '8px', padding: '6px 12px',
                }}>
                  <CheckCircle2 size={13} style={{ color: 'var(--green)' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green-text)' }}>
                    {totalOK} OK
                  </span>
                </div>
              )}
              {totalPendencias === 0 && totalOK === 0 && (
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Nenhum item verificado
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Análise da IA ── */}
      {resultado.resumo_ia && (
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Landmark size={15} style={{ color: 'var(--text-muted)' }} />
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Análise do sistema
            </p>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {resultado.resumo_ia}
          </p>
        </div>
      )}

      {/* ── Pendências ── */}
      {totalPendencias > 0 && (
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <SecaoPendencias
            titulo="Pendências Impeditivas"
            pendencias={resultado.pendencias_imperativas}
            tipo="IMPERATIVA"
            defaultAberta={true}
            contextoAnalise={{
              tipo_titulo: resultado.tipo_titulo,
              natureza_imovel: resultado.natureza_imovel,
              resumo_ia: resultado.resumo_ia,
            }}
          />
          <SecaoPendencias
            titulo="Exigências"
            pendencias={resultado.exigencias}
            tipo="EXIGENCIA"
            defaultAberta={true}
            contextoAnalise={{
              tipo_titulo: resultado.tipo_titulo,
              natureza_imovel: resultado.natureza_imovel,
              resumo_ia: resultado.resumo_ia,
            }}
          />
          <SecaoPendencias
            titulo="Alertas"
            pendencias={resultado.alertas}
            tipo="ALERTA"
            defaultAberta={true}
          />
        </div>
      )}

      {/* ── Itens OK ── */}
      {totalOK > 0 && (
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <SecaoItensOK itens={resultado.itens_ok} />
        </div>
      )}

      {/* ── Botão Nova Análise ── */}
      <div style={{ paddingTop: '4px' }}>
        <button
          onClick={onNova}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '10px',
            border: '1.5px solid var(--border-strong)',
            backgroundColor: 'var(--surface)',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--brand)';
            (e.currentTarget as HTMLButtonElement).style.color = '#fff';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--brand)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--surface)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-strong)';
          }}
        >
          <RotateCcw size={16} />
          Nova Análise
        </button>
      </div>
    </div>
  );
}
