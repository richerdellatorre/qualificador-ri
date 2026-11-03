'use client';

import { useState } from 'react';
import {
  Sparkles, X, ShieldAlert, CheckCircle2, AlertTriangle,
  GitCommit, Loader2, Edit3, SlidersHorizontal
} from 'lucide-react';
import type { Apontamento } from '@/types/conferencia';
import type { ResultadoRefinamentoRegra } from '@/types/qualificacao';

interface ModalAjustarRegraConferidorProps {
  apontamento: Apontamento;
  onFechar: () => void;
  onSucesso?: (codigo: string) => void;
}

export default function ModalAjustarRegraConferidor({
  apontamento,
  onFechar,
  onSucesso,
}: ModalAjustarRegraConferidorProps) {
  const [acao, setAcao] = useState<'EXCECAO' | 'DESATIVAR'>('EXCECAO');
  const [intencao, setIntencao] = useState('');
  const [analisando, setAnalisando] = useState(false);
  const [resultadoIA, setResultadoIA] = useState<ResultadoRefinamentoRegra | null>(null);
  const [diretrizEditavel, setDiretrizEditavel] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvoComSucesso, setSalvoComSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // ── Etapa 1: Refinar com a IA ────────────────────────────
  const analisarComIA = async () => {
    if (!intencao.trim()) return;
    setAnalisando(true);
    setErro(null);
    setResultadoIA(null);

    try {
      const resp = await fetch('/api/regras/refinar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: apontamento.codigo,
          descricaoRegra: apontamento.descricao,
          intencaoUsuario: intencao.trim(),
          acaoDesejada: acao === 'DESATIVAR' ? 'DESATIVAR' : 'OBSERVACAO',
        }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.erro || 'Erro ao analisar com IA.');

      setResultadoIA(data as ResultadoRefinamentoRegra);
      setDiretrizEditavel(data.diretriz_refinada || intencao);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha na comunicação com a IA.');
    } finally {
      setAnalisando(false);
    }
  };

  // ── Etapa 2: Salvar como exceção do Conferidor ───────────
  const salvarExcecao = async () => {
    if (!resultadoIA) return;
    setSalvando(true);
    setErro(null);

    try {
      const descricaoFinal = diretrizEditavel.trim() || intencao.trim();
      const sufixoNum = String(Date.now()).slice(-4);
      const codigoExcecao = `EX-${apontamento.codigo}-${sufixoNum}`;

      const resp = await fetch('/api/conferidor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          excecao: {
            codigo: codigoExcecao,
            descricao: descricaoFinal,
            ativo: true,
          },
        }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.erro || 'Falha ao salvar no GitHub.');

      setSalvoComSucesso(true);
      if (onSucesso) onSucesso(apontamento.codigo);
      setTimeout(onFechar, 1500);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao gravar exceção.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div
      onClick={onFechar}
      style={{
        position: 'fixed', inset: 0, zIndex: 110,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '620px',
          backgroundColor: 'var(--surface)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.25), 0 0 0 1px var(--border)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          maxHeight: '90vh',
          animation: 'modalFadeIn 0.2s ease-out',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: 'var(--surface-2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#7c3aed',
            }}>
              <Sparkles size={19} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Ajustar Regra do Conferidor
                </h3>
                <span style={{
                  fontSize: '11px', fontWeight: 700, fontFamily: 'monospace',
                  padding: '2px 8px', borderRadius: '6px',
                  backgroundColor: 'var(--surface)', border: '1px solid #ddd6fe',
                  color: '#7c3aed',
                }}>
                  {apontamento.codigo}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Ensine a IA a ignorar ou adequar este apontamento à praxe do seu cartório
              </p>
            </div>
          </div>
          <button onClick={onFechar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px', borderRadius: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* ── Corpo ── */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Apontamento original */}
          <div style={{
            backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '12px 16px',
          }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Apontamento identificado
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {apontamento.descricao}
            </p>
          </div>

          {/* Tipo de ação */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
              O que você quer fazer com este apontamento?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => { setAcao('EXCECAO'); setResultadoIA(null); }}
                style={{
                  padding: '10px 14px', borderRadius: '8px',
                  border: `1.5px solid ${acao === 'EXCECAO' ? '#7c3aed' : 'var(--border)'}`,
                  backgroundColor: acao === 'EXCECAO' ? '#f5f3ff' : 'var(--surface)',
                  color: acao === 'EXCECAO' ? '#7c3aed' : 'var(--text-secondary)',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                <SlidersHorizontal size={14} />
                Criar exceção / ajuste
              </button>
              <button
                type="button"
                onClick={() => { setAcao('DESATIVAR'); setResultadoIA(null); }}
                style={{
                  padding: '10px 14px', borderRadius: '8px',
                  border: `1.5px solid ${acao === 'DESATIVAR' ? 'var(--red)' : 'var(--border)'}`,
                  backgroundColor: acao === 'DESATIVAR' ? 'var(--red-bg)' : 'var(--surface)',
                  color: acao === 'DESATIVAR' ? 'var(--red-text)' : 'var(--text-secondary)',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                <ShieldAlert size={14} />
                Nunca mais apontar
              </button>
            </div>
          </div>

          {/* Campo de intenção */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
              {acao === 'EXCECAO'
                ? 'Como o cartório aceita ou lida com esta situação?'
                : 'Por que o cartório não quer mais este tipo de apontamento?'}
            </label>
            <textarea
              rows={3}
              value={intencao}
              onChange={(e) => setIntencao(e.target.value)}
              placeholder={
                acao === 'EXCECAO'
                  ? 'Ex: Selos de blocos diferentes são independentes e não precisam ter numeração contínua entre si...'
                  : 'Ex: O cartório já verificou manualmente e não deseja mais que a IA aponte divergências de órgão expedidor...'
              }
              style={{
                width: '100%', padding: '12px 14px', fontSize: '13px',
                borderRadius: '8px', border: '1px solid var(--border-strong)',
                backgroundColor: 'var(--surface)', color: 'var(--text-primary)',
                lineHeight: 1.5, outline: 'none', resize: 'vertical',
              }}
            />
          </div>

          {/* Botão de análise IA */}
          {!resultadoIA && (
            <button
              onClick={analisarComIA}
              disabled={!intencao.trim() || analisando}
              style={{
                width: '100%', padding: '12px', borderRadius: '9px', border: 'none',
                backgroundColor: !intencao.trim() || analisando ? 'var(--border)' : '#7c3aed',
                color: !intencao.trim() || analisando ? 'var(--text-muted)' : '#fff',
                fontSize: '14px', fontWeight: 700,
                cursor: !intencao.trim() || analisando ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: intencao.trim() && !analisando ? '0 4px 12px rgba(124,58,237,0.25)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {analisando ? (
                <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> A IA está refinando a exceção...</>
              ) : (
                <><Sparkles size={16} /> Analisar e Lapidar com IA</>
              )}
            </button>
          )}

          {/* Erro */}
          {erro && (
            <div style={{
              backgroundColor: 'var(--red-bg)', border: '1px solid var(--red-border)',
              borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'var(--red-text)',
            }}>
              ⚠️ {erro}
            </div>
          )}

          {/* Resultado da IA */}
          {resultadoIA && (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '14px',
              backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '16px',
              animation: 'modalFadeIn 0.2s ease-out',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Parecer da IA
                </span>
                {resultadoIA.status_legal === 'CONFORME' && (
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', backgroundColor: 'var(--green-bg)', color: 'var(--green-text)', border: '1px solid var(--green-border)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} /> Ajuste adequado
                  </span>
                )}
                {resultadoIA.status_legal === 'ALERTA_RISCO' && (
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', backgroundColor: 'var(--amber-bg)', color: 'var(--amber-text)', border: '1px solid var(--amber-border)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={12} /> Atenção — verifique o risco
                  </span>
                )}
                {resultadoIA.status_legal === 'IRREGULAR' && (
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', backgroundColor: 'var(--red-bg)', color: 'var(--red-text)', border: '1px solid var(--red-border)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldAlert size={12} /> Risco legal alto
                  </span>
                )}
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {resultadoIA.parecer_juridico}
              </p>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Edit3 size={11} /> Exceção que a IA aprenderá
                  </label>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Editável antes de salvar</span>
                </div>
                <textarea
                  rows={3}
                  value={diretrizEditavel}
                  onChange={(e) => setDiretrizEditavel(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', fontSize: '12px',
                    fontFamily: 'sans-serif', borderRadius: '8px',
                    border: '1px solid #ddd6fe', backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)', lineHeight: 1.5,
                  }}
                />
              </div>

              {salvoComSucesso ? (
                <div style={{
                  padding: '12px', backgroundColor: 'var(--green-bg)',
                  border: '1px solid var(--green-border)', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '8px', color: 'var(--green-text)', fontSize: '13px', fontWeight: 700,
                }}>
                  <CheckCircle2 size={16} /> Exceção gravada no GitHub com sucesso!
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setResultadoIA(null)}
                    style={{
                      padding: '10px 14px', borderRadius: '8px',
                      border: '1px solid var(--border-strong)', backgroundColor: 'var(--surface)',
                      color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Voltar / Reformular
                  </button>
                  <button
                    type="button"
                    onClick={salvarExcecao}
                    disabled={salvando}
                    style={{
                      flex: 1, padding: '10px 16px', borderRadius: '8px', border: 'none',
                      backgroundColor: '#7c3aed', color: '#fff',
                      fontSize: '13px', fontWeight: 700,
                      cursor: salvando ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
                    }}
                  >
                    {salvando ? (
                      <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Gravando no GitHub...</>
                    ) : (
                      <><GitCommit size={15} /> Confirmar e Gravar no GitHub</>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px', borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--surface-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Repositório: <strong>richerdellatorreadv/qualificador-ri-config</strong>
          </p>
          <button onClick={onFechar} style={{ background: 'none', border: 'none', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>
            Fechar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
