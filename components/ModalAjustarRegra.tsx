'use client';

import { useState } from 'react';
import {
  Sparkles, X, ShieldAlert, CheckCircle2, AlertTriangle,
  GitCommit, ArrowRight, Loader2, Edit3, SlidersHorizontal
} from 'lucide-react';
import type { Pendencia, ResultadoRefinamentoRegra } from '@/types/qualificacao';

interface ModalAjustarRegraProps {
  pendencia: Pendencia;
  onFechar: () => void;
  onSucesso?: (codigo: string, novaRegra: { ativo: boolean; observacao?: string; motivo_desativacao?: string }) => void;
}

export default function ModalAjustarRegra({
  pendencia,
  onFechar,
  onSucesso,
}: ModalAjustarRegraProps) {
  const [acaoDesejada, setAcaoDesejada] = useState<'OBSERVACAO' | 'DESATIVAR'>('OBSERVACAO');
  const [intencaoUsuario, setIntencaoUsuario] = useState('');
  const [analisando, setAnalisando] = useState(false);
  const [resultadoIA, setResultadoIA] = useState<ResultadoRefinamentoRegra | null>(null);
  const [diretrizEditavel, setDiretrizEditavel] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvoComSucesso, setSalvoComSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // ── Etapa 1: Analisar com a IA ────────────────────────────
  const analisarComIA = async () => {
    if (!intencaoUsuario.trim()) return;
    setAnalisando(true);
    setErro(null);
    setResultadoIA(null);

    try {
      const resp = await fetch('/api/regras/refinar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: pendencia.codigo,
          descricaoRegra: pendencia.descricao,
          intencaoUsuario: intencaoUsuario.trim(),
          acaoDesejada,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.erro || 'Erro ao analisar com IA.');

      setResultadoIA(data as ResultadoRefinamentoRegra);
      setDiretrizEditavel(data.diretriz_refinada || intencaoUsuario);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha na comunicação com a IA.');
    } finally {
      setAnalisando(false);
    }
  };

  // ── Etapa 2: Gravar no GitHub ─────────────────────────────
  const salvarNoGitHub = async () => {
    if (!resultadoIA) return;
    setSalvando(true);
    setErro(null);

    try {
      const novaRegra = acaoDesejada === 'DESATIVAR'
        ? {
            ativo: false,
            motivo_desativacao: diretrizEditavel.trim() || intencaoUsuario.trim(),
          }
        : {
            ativo: true,
            observacao: diretrizEditavel.trim(),
          };

      const resp = await fetch('/api/regras/aplicar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: pendencia.codigo,
          regra: novaRegra,
          mensagemCommit: `Customização da regra ${pendencia.codigo} via IA — CRI Rondônia`,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.erro || 'Falha ao salvar no GitHub.');

      setSalvoComSucesso(true);
      if (onSucesso) {
        onSucesso(pendencia.codigo, novaRegra);
      }
      setTimeout(() => {
        onFechar();
      }, 1500);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao gravar alteração.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div
      onClick={onFechar}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '620px',
          backgroundColor: 'var(--surface)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.25), 0 0 0 1px var(--border)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          animation: 'modalFadeIn 0.2s ease-out',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--surface-2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              border: '1px solid var(--blue-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand)',
            }}>
              <Sparkles size={19} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Ajustar Regra do Cartório
                </h3>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--brand)',
                }}>
                  {pendencia.codigo}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Ensine a IA a avaliar esta exigência de acordo com a praxe do seu cartório
              </p>
            </div>
          </div>

          <button
            onClick={onFechar}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Corpo do Modal com Scroll ── */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Card com a exigência original resumida */}
          <div style={{
            backgroundColor: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '12px 16px',
          }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Exigência atual identificada no documento
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {pendencia.descricao}
            </p>
          </div>

          {/* Abas: O que deseja fazer */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
              Qual é o objetivo para esta regra?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => { setAcaoDesejada('OBSERVACAO'); setResultadoIA(null); }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: `1.5px solid ${acaoDesejada === 'OBSERVACAO' ? 'var(--brand)' : 'var(--border)'}`,
                  backgroundColor: acaoDesejada === 'OBSERVACAO' ? 'var(--brand-light)' : 'var(--surface)',
                  color: acaoDesejada === 'OBSERVACAO' ? 'var(--brand)' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <SlidersHorizontal size={14} />
                Adicionar Exceção / Regra
              </button>

              <button
                type="button"
                onClick={() => { setAcaoDesejada('DESATIVAR'); setResultadoIA(null); }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: `1.5px solid ${acaoDesejada === 'DESATIVAR' ? 'var(--red)' : 'var(--border)'}`,
                  backgroundColor: acaoDesejada === 'DESATIVAR' ? 'var(--red-bg)' : 'var(--surface)',
                  color: acaoDesejada === 'DESATIVAR' ? 'var(--red-text)' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <ShieldAlert size={14} />
                Não Exigir Mais (Desativar)
              </button>
            </div>
          </div>

          {/* Caixa de Texto do Usuário */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
              {acaoDesejada === 'OBSERVACAO'
                ? 'Como o cartório costuma aceitar ou relevar essa pendência?'
                : 'Por que o cartório não cobra essa exigência?'}
            </label>
            <textarea
              rows={3}
              value={intencaoUsuario}
              onChange={(e) => setIntencaoUsuario(e.target.value)}
              placeholder={
                acaoDesejada === 'OBSERVACAO'
                  ? 'Ex: Aqui aceitamos também certidão de quitação emitida pela prefeitura ou comprovante de parcelamento homologado com certidão positiva com efeito de negativa...'
                  : 'Ex: Como o tabelião já conferiu a procuração e poderes no ato notarial, o RI presume a regularidade e dispensa nova apresentação...'
              }
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid var(--border-strong)',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-primary)',
                lineHeight: 1.5,
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Botão de Análise da IA */}
          {!resultadoIA && (
            <button
              onClick={analisarComIA}
              disabled={!intencaoUsuario.trim() || analisando}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '9px',
                border: 'none',
                backgroundColor: !intencaoUsuario.trim() || analisando ? 'var(--border)' : 'var(--brand)',
                color: !intencaoUsuario.trim() || analisando ? 'var(--text-muted)' : '#fff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: !intencaoUsuario.trim() || analisando ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: intencaoUsuario.trim() && !analisando ? '0 4px 12px rgba(30,64,175,0.2)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {analisando ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                  A IA está avaliando a conformidade registral...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Analisar e Lapidar com IA
                </>
              )}
            </button>
          )}

          {/* Erro */}
          {erro && (
            <div style={{
              backgroundColor: 'var(--red-bg)',
              border: '1px solid var(--red-border)',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '13px',
              color: 'var(--red-text)',
            }}>
              ⚠️ {erro}
            </div>
          )}

          {/* ── Resultado da Análise da IA ── */}
          {resultadoIA && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              backgroundColor: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '16px',
              animation: 'modalFadeIn 0.2s ease-out',
            }}>
              {/* Header do parecer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Parecer Jurídico da IA
                </span>

                {/* Status Badge */}
                {resultadoIA.status_legal === 'CONFORME' && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '99px',
                    backgroundColor: 'var(--green-bg)',
                    color: 'var(--green-text)',
                    border: '1px solid var(--green-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <CheckCircle2 size={12} /> Amparado / Baixo Risco
                  </span>
                )}
                {resultadoIA.status_legal === 'ALERTA_RISCO' && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '99px',
                    backgroundColor: 'var(--amber-bg)',
                    color: 'var(--amber-text)',
                    border: '1px solid var(--amber-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <AlertTriangle size={12} /> Alerta de Risco / Atenção
                  </span>
                )}
                {resultadoIA.status_legal === 'IRREGULAR' && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '99px',
                    backgroundColor: 'var(--red-bg)',
                    color: 'var(--red-text)',
                    border: '1px solid var(--red-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <ShieldAlert size={12} /> Risco Legal Alto
                  </span>
                )}
              </div>

              {/* Texto do parecer */}
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {resultadoIA.parecer_juridico}
              </p>

              {/* Diretriz lapidada para o prompt */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Edit3 size={11} /> Diretriz técnica que a IA aprenderá
                  </label>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Editável antes de salvar</span>
                </div>
                <textarea
                  rows={3}
                  value={diretrizEditavel}
                  onChange={(e) => setDiretrizEditavel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '12px',
                    fontFamily: 'sans-serif',
                    borderRadius: '8px',
                    border: '1px solid var(--blue-border)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)',
                    lineHeight: 1.5,
                  }}
                />
              </div>

              {/* Botões de Decisão */}
              {salvoComSucesso ? (
                <div style={{
                  padding: '12px',
                  backgroundColor: 'var(--green-bg)',
                  border: '1px solid var(--green-border)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: 'var(--green-text)',
                  fontSize: '13px',
                  fontWeight: 700,
                }}>
                  <CheckCircle2 size={16} />
                  Gravado no GitHub com sucesso!
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setResultadoIA(null)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-strong)',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--text-secondary)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Voltar / Reformular
                  </button>

                  <button
                    type="button"
                    onClick={salvarNoGitHub}
                    disabled={salvando}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: 'var(--brand)',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: salvando ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(30,64,175,0.25)',
                    }}
                  >
                    {salvando ? (
                      <>
                        <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} />
                        Gravando no GitHub...
                      </>
                    ) : (
                      <>
                        <GitCommit size={15} />
                        Confirmar e Gravar no GitHub
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--surface-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Repositório: <strong>richerdellatorreadv/qualificador-ri-config</strong>
          </p>
          <button
            onClick={onFechar}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            Fechar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
