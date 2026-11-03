'use client';

import { useState } from 'react';
import { AlertTriangle, AlertCircle, Lightbulb, CheckCircle2, Hash, Shield, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import type { ResultadoConferencia, Apontamento } from '@/types/conferencia';
import TextoAnotado from './TextoAnotado';
import PainelRegrasConferidor from './PainelRegrasConferidor';
import ModalAjustarRegraConferidor from './ModalAjustarRegraConferidor';
// ── Pluralização em português ─────────────────────────────────
function plural(palavra: string, qtd: number): string {
  if (qtd === 1) return `1 ${palavra}`;
  if (palavra.endsWith('ão')) return `${qtd} ${palavra.slice(0, -2)}ões`;
  if (palavra.endsWith('al')) return `${qtd} ${palavra.slice(0, -2)}ais`;
  return `${qtd} ${palavra}s`;
}

// ── Card compacto de apontamento ─────────────────────────────
function CardCompacto({ a, onAjustar }: { a: Apontamento; onAjustar: (a: Apontamento) => void }) {
  const corBg   = a.gravidade === 'ERRO' ? '#fef2f2' : a.gravidade === 'ATENCAO' ? '#fffbeb' : '#eff6ff';
  const corBord = a.gravidade === 'ERRO' ? '#fecaca' : a.gravidade === 'ATENCAO' ? '#fed7aa' : '#bfdbfe';
  const corBadge = a.gravidade === 'ERRO' ? '#ef4444' : a.gravidade === 'ATENCAO' ? '#f59e0b' : '#3b82f6';
  const labelBadge = a.gravidade === 'ERRO' ? 'ERRO' : a.gravidade === 'ATENCAO' ? 'ATENÇÃO' : 'SUGESTÃO';

  return (
    <div style={{
      backgroundColor: corBg, border: `1px solid ${corBord}`,
      borderRadius: '8px', padding: '12px 14px',
      display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
      {/* Linha 1: badge + código + descrição */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <span style={{
          backgroundColor: corBadge, color: '#fff',
          fontSize: '9px', fontWeight: 800, padding: '2px 6px',
          borderRadius: '3px', letterSpacing: '0.06em', flexShrink: 0, marginTop: '1px',
        }}>
          {labelBadge}
        </span>
        <span style={{ fontSize: '11px', color: '#6b7280', flexShrink: 0, marginTop: '1px', fontWeight: 600 }}>
          {a.codigo}
        </span>
        <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: 500, lineHeight: 1.4, flex: 1 }}>
          {a.descricao}
        </span>
      </div>

      {/* Linha 2: encontrado vs esperado */}
      {(a.valor_encontrado || a.valor_esperado) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {a.valor_encontrado && (
            <div style={{ backgroundColor: '#fee2e2', borderRadius: '4px', padding: '5px 8px' }}>
              <p style={{ fontSize: '9px', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Encontrado</p>
              <p style={{ fontSize: '11px', color: '#7f1d1d', fontWeight: 500 }}>{a.valor_encontrado}</p>
            </div>
          )}
          {a.valor_esperado && (
            <div style={{ backgroundColor: '#dcfce7', borderRadius: '4px', padding: '5px 8px' }}>
              <p style={{ fontSize: '9px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Esperado</p>
              <p style={{ fontSize: '11px', color: '#14532d', fontWeight: 500 }}>{a.valor_esperado}</p>
            </div>
          )}
        </div>
      )}

      {/* Linha 3: sugestão */}
      {a.sugestao_correcao && (
        <p style={{ fontSize: '12px', color: '#374151', lineHeight: 1.5, borderTop: `1px solid ${corBord}`, paddingTop: '7px', margin: 0 }}>
          💡 {a.sugestao_correcao}
        </p>
      )}

      {/* Linha 4: botão de ajuste com IA */}
      <div style={{ borderTop: `1px solid ${corBord}`, paddingTop: '7px' }}>
        <button
          onClick={() => onAjustar(a)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '4px 10px', borderRadius: '5px', border: '1px solid #c4b5fd',
            backgroundColor: '#f5f3ff', color: '#7c3aed',
            fontSize: '11px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          ✦ Personalizar regra no cartório
        </button>
      </div>
    </div>
  );
}

interface PainelConferenciaProps {
  resultado: ResultadoConferencia;
  textoMinuta: string;
  modelo: 'gemini-4-argon' | 'gemini-3.8-flash';
  onNova: () => void;
}

export default function PainelConferencia({ resultado, textoMinuta, modelo, onNova }: PainelConferenciaProps) {
  const [okAberto, setOkAberto] = useState(false);
  const [regrasAberto, setRegrasAberto] = useState(false);
  const [apontamentoAjustando, setApontamentoAjustando] = useState<Apontamento | null>(null);

  const totalErros = resultado.erros.length;
  const totalAtencoes = resultado.atencoes.length;
  const totalSugestoes = resultado.sugestoes.length;
  const totalOk = resultado.itens_ok.length;
  const semProblemas = totalErros === 0 && totalAtencoes === 0;

  // Todos os apontamentos para anotar o texto
  const todosApontamentos: Apontamento[] = [
    ...resultado.erros,
    ...resultado.atencoes,
    ...resultado.sugestoes,
  ];

  const bannerBg = semProblemas ? '#f0fdf4' : totalErros > 0 ? '#fef2f2' : '#fffbeb';
  const bannerBord = semProblemas ? '#bbf7d0' : totalErros > 0 ? '#fecaca' : '#fed7aa';
  const bannerIcone = semProblemas
    ? <CheckCircle2 size={20} style={{ color: '#16a34a' }} />
    : totalErros > 0
      ? <AlertTriangle size={20} style={{ color: '#ef4444' }} />
      : <AlertCircle size={20} style={{ color: '#f59e0b' }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* ── Banner compacto ─────────────────────────────────── */}
      <div style={{
        backgroundColor: bannerBg, border: `1px solid ${bannerBord}`,
        borderRadius: '10px', padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {bannerIcone}
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
              {semProblemas ? 'Minuta sem divergências identificadas' : totalErros > 0 ? 'Divergências encontradas na minuta' : 'Pontos de atenção na minuta'}
            </p>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>
              {resultado.tipo_ato}
              {resultado.numero_ato_minuta && ` · ${resultado.numero_ato_minuta}`}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Contadores */}
          {totalErros > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: '#ef4444' }}>
              <AlertTriangle size={12} /> {plural('erro', totalErros)}
            </span>
          )}
          {totalAtencoes > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: '#f59e0b' }}>
              <AlertCircle size={12} /> {plural('atenção', totalAtencoes)}
            </span>
          )}
          {totalSugestoes > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: '#3b82f6' }}>
              <Lightbulb size={12} /> {plural('sugestão', totalSugestoes)}
            </span>
          )}
          {totalOk > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>
              <CheckCircle2 size={12} /> {totalOk} OK
            </span>
          )}
          {/* Tag modelo */}
          <span style={{
            fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
            backgroundColor: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe',
          }}>
            {modelo === 'gemini-4-argon' ? '🔬 Argon' : '⚡ Flash'}
          </span>
          {/* Botão regras */}
          <button
            onClick={() => setRegrasAberto(true)}
            title="Personalizar regras e exceções do conferidor"
            style={{
              padding: '4px 10px', backgroundColor: 'transparent',
              border: '1px solid #c4b5fd', borderRadius: '6px',
              fontSize: '12px', fontWeight: 600, color: '#7c3aed', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}
          >
            <Settings size={12} /> Regras
          </button>
          {/* Botão nova */}
          <button onClick={onNova} style={{
            padding: '4px 12px', backgroundColor: 'transparent',
            border: '1px solid #7c3aed', borderRadius: '6px',
            fontSize: '12px', fontWeight: 600, color: '#7c3aed', cursor: 'pointer',
          }}>
            Nova conferência
          </button>
        </div>
      </div>

      {/* Continuidade / Selos */}
      {(resultado.numero_ato_esperado || resultado.ultimo_selo_matricula) && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {resultado.numero_ato_esperado && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '5px 10px', backgroundColor: 'var(--surface-2)', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <Hash size={12} style={{ color: '#7c3aed' }} />
              <span style={{ color: '#374151' }}>Esperado: <strong>{resultado.numero_ato_esperado}</strong></span>
            </div>
          )}
          {resultado.ultimo_selo_matricula && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '5px 10px', backgroundColor: 'var(--surface-2)', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <Shield size={12} style={{ color: '#7c3aed' }} />
              <span style={{ color: '#374151' }}>Último selo: <strong>{resultado.ultimo_selo_matricula}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* ── Resumo da IA ────────────────────────────────────── */}
      {resultado.resumo_ia && (
        <div style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {resultado.resumo_ia}
          </p>
        </div>
      )}

      {/* ── Cards de erros críticos (compactos) ────────────── */}
      {resultado.erros.length > 0 && (
        <section>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <AlertTriangle size={13} /> Erros críticos
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {resultado.erros.map((a, i) => <CardCompacto key={i} a={a} onAjustar={setApontamentoAjustando} />)}
          </div>
        </section>
      )}

      {/* ── Cards de atenções ────────────────────────────────── */}
      {resultado.atencoes.length > 0 && (
        <section>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <AlertCircle size={13} /> Atenções
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {resultado.atencoes.map((a, i) => <CardCompacto key={i} a={a} onAjustar={setApontamentoAjustando} />)}
          </div>
        </section>
      )}

      {/* ── Texto da minuta com anotações ───────────────────── */}
      <TextoAnotado texto={textoMinuta} apontamentos={todosApontamentos} />

      {/* ── Itens OK (colapsável) ────────────────────────────── */}
      {totalOk > 0 && (
        <div style={{ border: '1px solid #bbf7d0', borderRadius: '8px', overflow: 'hidden' }}>
          <button
            onClick={() => setOkAberto(!okAberto)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', background: '#f0fdf4', border: 'none', cursor: 'pointer',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>
              <CheckCircle2 size={13} /> {totalOk} {totalOk === 1 ? 'item verificado OK' : 'itens verificados OK'}
            </span>
            {okAberto ? <ChevronUp size={14} style={{ color: '#16a34a' }} /> : <ChevronDown size={14} style={{ color: '#16a34a' }} />}
          </button>
          {okAberto && (
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '5px', backgroundColor: '#f8fffe' }}>
              {resultado.itens_ok.map((ok, i) => (
                <p key={i} style={{ fontSize: '12px', color: '#166534', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <CheckCircle2 size={13} style={{ color: '#16a34a', flexShrink: 0, marginTop: '1px' }} />
                  {ok}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Painel lateral de regras do conferidor ── */}
      {regrasAberto && <PainelRegrasConferidor onFechar={() => setRegrasAberto(false)} />}

      {/* ── Modal de ajuste de regra via IA ── */}
      {apontamentoAjustando && (
        <ModalAjustarRegraConferidor
          apontamento={apontamentoAjustando}
          onFechar={() => setApontamentoAjustando(null)}
          onSucesso={() => setApontamentoAjustando(null)}
        />
      )}
    </div>
  );
}
