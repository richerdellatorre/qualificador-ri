'use client';

import { AlertTriangle, AlertCircle, Lightbulb, CheckCircle2, FileWarning, Hash, Shield } from 'lucide-react';
import type { ResultadoConferencia } from '@/types/conferencia';
import ApontamentoCard, { ItemOk } from './ApontamentoCard';

interface PainelConferenciaProps {
  resultado: ResultadoConferencia;
  modelo: 'gemini-4-argon' | 'gemini-3.8-flash';
  onNova: () => void;
}

export default function PainelConferencia({ resultado, modelo, onNova }: PainelConferenciaProps) {
  const totalErros = resultado.erros.length;
  const totalAtencoes = resultado.atencoes.length;
  const totalSugestoes = resultado.sugestoes.length;
  const totalOk = resultado.itens_ok.length;
  const semProblemas = totalErros === 0 && totalAtencoes === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Banner de resultado */}
      <div
        style={{
          backgroundColor: semProblemas ? '#f0fdf4' : totalErros > 0 ? '#fef2f2' : '#fffbeb',
          border: `1px solid ${semProblemas ? '#bbf7d0' : totalErros > 0 ? '#fecaca' : '#fed7aa'}`,
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {semProblemas
              ? <CheckCircle2 size={22} style={{ color: '#16a34a' }} />
              : totalErros > 0
                ? <AlertTriangle size={22} style={{ color: '#ef4444' }} />
                : <AlertCircle size={22} style={{ color: '#f59e0b' }} />
            }
            <div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
                {semProblemas ? 'Minuta aprovada na conferência' : totalErros > 0 ? 'Erros encontrados na minuta' : 'Minuta com pontos de atenção'}
              </p>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {resultado.tipo_ato}
                {resultado.numero_ato_minuta && ` · ${resultado.numero_ato_minuta}`}
              </p>
            </div>
          </div>

          {/* Modelo */}
          <span style={{
            fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '20px',
            backgroundColor: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe',
          }}>
            {modelo === 'gemini-4-argon' ? '🔬 Argon' : '⚡ Flash'}
          </span>
        </div>

        {/* Contadores */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {totalErros > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>
              <AlertTriangle size={13} /> {totalErros} erro{totalErros > 1 ? 's' : ''}
            </span>
          )}
          {totalAtencoes > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 700, color: '#f59e0b' }}>
              <AlertCircle size={13} /> {totalAtencoes} atenção{totalAtencoes > 1 ? 'ões' : ''}
            </span>
          )}
          {totalSugestoes > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 700, color: '#3b82f6' }}>
              <Lightbulb size={13} /> {totalSugestoes} sugestão{totalSugestoes > 1 ? 'ões' : ''}
            </span>
          )}
          {totalOk > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>
              <CheckCircle2 size={13} /> {totalOk} OK
            </span>
          )}
        </div>

        {/* Continuidade e Selos */}
        {(resultado.numero_ato_minuta || resultado.numero_ato_esperado || resultado.selo_minuta) && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
            {resultado.numero_ato_esperado && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '4px 10px', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.07)' }}>
                <Hash size={12} style={{ color: '#7c3aed' }} />
                <span style={{ color: '#374151' }}>Esperado: <strong>{resultado.numero_ato_esperado}</strong></span>
              </div>
            )}
            {resultado.ultimo_selo_matricula && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '4px 10px', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.07)' }}>
                <Shield size={12} style={{ color: '#7c3aed' }} />
                <span style={{ color: '#374151' }}>Último selo: <strong>{resultado.ultimo_selo_matricula}</strong></span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resumo da IA */}
      {resultado.resumo_ia && (
        <div style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            📝 Parecer da conferência
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {resultado.resumo_ia}
          </p>
        </div>
      )}

      {/* Documentos ausentes */}
      {resultado.documentos_ausentes && resultado.documentos_ausentes.length > 0 && (
        <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '14px 16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FileWarning size={13} /> Documentos referenciados mas não enviados
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {resultado.documentos_ausentes.map((doc, i) => (
              <p key={i} style={{ fontSize: '12px', color: '#9a3412', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <span style={{ marginTop: '1px' }}>•</span> {doc}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Erros */}
      {resultado.erros.length > 0 && (
        <section>
          <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={14} /> Erros ({resultado.erros.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {resultado.erros.map((a, i) => (
              <ApontamentoCard key={a.codigo + i} apontamento={a} numero={i + 1} />
            ))}
          </div>
        </section>
      )}

      {/* Atenções */}
      {resultado.atencoes.length > 0 && (
        <section>
          <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} /> Atenções ({resultado.atencoes.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {resultado.atencoes.map((a, i) => (
              <ApontamentoCard key={a.codigo + i} apontamento={a} numero={i + 1} />
            ))}
          </div>
        </section>
      )}

      {/* Sugestões */}
      {resultado.sugestoes.length > 0 && (
        <section>
          <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lightbulb size={14} /> Sugestões de estilo ({resultado.sugestoes.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {resultado.sugestoes.map((a, i) => (
              <ApontamentoCard key={a.codigo + i} apontamento={a} numero={i + 1} />
            ))}
          </div>
        </section>
      )}

      {/* Itens OK */}
      {resultado.itens_ok.length > 0 && (
        <section>
          <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} /> Verificados OK ({resultado.itens_ok.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {resultado.itens_ok.map((ok, i) => (
              <ItemOk key={i} texto={ok} />
            ))}
          </div>
        </section>
      )}

      {/* Botão nova conferência */}
      <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={onNova}
          style={{
            padding: '9px 22px',
            backgroundColor: 'transparent',
            border: '1px solid #7c3aed',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#7c3aed',
            cursor: 'pointer',
          }}
        >
          Nova conferência
        </button>
      </div>
    </div>
  );
}
