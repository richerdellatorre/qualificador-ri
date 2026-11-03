'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2, Save, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ConfigConferidor } from '@/lib/github';

const CONFIG_VAZIA: ConfigConferidor = {
  excecoes: [],
  instrucoes_adicionais: [],
};

// ── Sugestões padrão de exceções comuns ─────────────────────
const EXCECOES_SUGERIDAS: { codigo: string; descricao: string }[] = [
  { codigo: 'EX-ORGAO', descricao: 'Ignorar divergências no órgão expedidor do RG (ex: SESDC vs SSDC)' },
  { codigo: 'EX-BAIRRO', descricao: 'Ignorar divergências de bairro/logradouro do endereço das partes (endereços mudam sem averbação)' },
  { codigo: 'EX-MAIUSC', descricao: 'Ignorar variações de maiúsculas/minúsculas em nomes de partes em atos já registrados' },
  { codigo: 'EX-LOTE', descricao: 'Ignorar divergências no código do lote do selo digital (apenas o número sequencial importa)' },
  { codigo: 'EX-ESTCIV', descricao: 'Aceitar certidão de estado civil como referencial supremo, sem questionar correspondência com requerimento' },
];

// ────────────────────────────────────────────────────────────
export default function PainelRegrasConferidor({ onFechar }: { onFechar: () => void }) {
  const [config, setConfig] = useState<ConfigConferidor>(CONFIG_VAZIA);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'erro'; msg: string } | null>(null);
  const [novaInstrucao, setNovaInstrucao] = useState('');
  const [novaExcecao, setNovaExcecao] = useState('');

  // Carrega do GitHub (mesmo endpoint de customizacoes, campo conferidor)
  const carregar = useCallback(async () => {
    setCarregando(true);
    setFeedback(null);
    try {
      const resp = await fetch('/api/customizacoes');
      if (!resp.ok) throw new Error('Falha ao carregar');
      const data = await resp.json();
      // Lê o subcampo conferidor se existir
      const conf: ConfigConferidor = data.config?.conferidor ?? CONFIG_VAZIA;
      setConfig({
        excecoes: Array.isArray(conf.excecoes) ? conf.excecoes : [],
        instrucoes_adicionais: Array.isArray(conf.instrucoes_adicionais) ? conf.instrucoes_adicionais : [],
      });
    } catch {
      setConfig(CONFIG_VAZIA);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const salvar = async () => {
    setSalvando(true);
    setFeedback(null);
    try {
      // Busca o config completo atual
      const respGet = await fetch('/api/customizacoes');
      if (!respGet.ok) throw new Error('Falha ao obter config atual');
      const data = await respGet.json();

      // Merge: mantém campos existentes, atualiza só "conferidor"
      const configAtualizado = {
        ...(data.config ?? {}),
        conferidor: config,
      };

      const respPut = await fetch('/api/customizacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: configAtualizado, sha: data.sha }),
      });

      if (!respPut.ok) throw new Error('Falha ao salvar');
      setFeedback({ tipo: 'ok', msg: 'Regras do conferidor salvas com sucesso!' });
    } catch (e) {
      setFeedback({ tipo: 'erro', msg: e instanceof Error ? e.message : 'Erro ao salvar' });
    } finally {
      setSalvando(false);
    }
  };

  const toggleExcecao = (idx: number) => {
    setConfig(prev => ({
      ...prev,
      excecoes: prev.excecoes.map((e, i) => i === idx ? { ...e, ativo: !e.ativo } : e),
    }));
  };

  const removerExcecao = (idx: number) => {
    setConfig(prev => ({ ...prev, excecoes: prev.excecoes.filter((_, i) => i !== idx) }));
  };

  const adicionarExcecaoSugerida = (s: { codigo: string; descricao: string }) => {
    if (config.excecoes.some(e => e.codigo === s.codigo)) return;
    setConfig(prev => ({
      ...prev,
      excecoes: [...prev.excecoes, { codigo: s.codigo, descricao: s.descricao, tipo: 'excecao', ativo: true }],
    }));
  };

  const adicionarExcecaoManual = () => {
    const texto = novaExcecao.trim();
    if (!texto) return;
    const codigo = `EX-${String(config.excecoes.length + 1).padStart(2, '0')}`;
    setConfig(prev => ({
      ...prev,
      excecoes: [...prev.excecoes, { codigo, descricao: texto, tipo: 'excecao', ativo: true }],
    }));
    setNovaExcecao('');
  };

  const adicionarInstrucao = () => {
    const texto = novaInstrucao.trim();
    if (!texto) return;
    setConfig(prev => ({ ...prev, instrucoes_adicionais: [...prev.instrucoes_adicionais, texto] }));
    setNovaInstrucao('');
  };

  const removerInstrucao = (idx: number) => {
    setConfig(prev => ({ ...prev, instrucoes_adicionais: prev.instrucoes_adicionais.filter((_, i) => i !== idx) }));
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.3)',
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}
    >
      <div style={{
        width: '480px', maxWidth: '100vw',
        height: '100vh', overflowY: 'auto',
        backgroundColor: 'var(--surface)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideRight 0.2s ease',
      }}>

        {/* Header */}
        <div style={{
          padding: '18px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, backgroundColor: 'var(--surface)', zIndex: 1,
        }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#7c3aed' }}>
              ⚙️ Regras do Conferidor
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Exceções e instruções para personalizar a análise
            </p>
          </div>
          <button onClick={onFechar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        {carregando ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: '#7c3aed' }} />
            <p style={{ marginTop: '10px', fontSize: '13px' }}>Carregando configurações...</p>
          </div>
        ) : (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>

            {/* ── SEÇÃO 1: Exceções padrão sugeridas ── */}
            <section>
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                Exceções comuns (clique para adicionar)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {EXCECOES_SUGERIDAS.map((s) => {
                  const jaAdicionada = config.excecoes.some(e => e.codigo === s.codigo);
                  return (
                    <button
                      key={s.codigo}
                      onClick={() => adicionarExcecaoSugerida(s)}
                      disabled={jaAdicionada}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 10px', borderRadius: '7px', textAlign: 'left',
                        border: `1px solid ${jaAdicionada ? '#bbf7d0' : '#e2e8f0'}`,
                        backgroundColor: jaAdicionada ? '#f0fdf4' : 'var(--surface-2)',
                        cursor: jaAdicionada ? 'default' : 'pointer',
                        color: jaAdicionada ? '#16a34a' : 'var(--text-primary)',
                        fontSize: '12px', lineHeight: 1.4,
                        transition: 'all 0.15s',
                      }}
                    >
                      {jaAdicionada
                        ? <CheckCircle2 size={14} style={{ color: '#16a34a', flexShrink: 0 }} />
                        : <Plus size={14} style={{ color: '#7c3aed', flexShrink: 0 }} />
                      }
                      <span><strong style={{ color: jaAdicionada ? '#15803d' : '#7c3aed' }}>{s.codigo}</strong> — {s.descricao}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ── SEÇÃO 2: Exceções ativas ── */}
            <section>
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                Exceções ativas ({config.excecoes.length})
              </h3>

              {config.excecoes.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Nenhuma exceção cadastrada. Adicione acima ou crie uma personalizada abaixo.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {config.excecoes.map((e, idx) => (
                    <div key={idx} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 10px', borderRadius: '7px',
                      border: `1px solid ${e.ativo ? '#ddd6fe' : '#e2e8f0'}`,
                      backgroundColor: e.ativo ? '#f5f3ff' : '#f8fafc',
                    }}>
                      <button
                        onClick={() => toggleExcecao(idx)}
                        title={e.ativo ? 'Desativar' : 'Ativar'}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: e.ativo ? '#7c3aed' : '#94a3b8', flexShrink: 0,
                          fontSize: '18px', lineHeight: 1,
                        }}
                      >
                        {e.ativo ? '●' : '○'}
                      </button>
                      <span style={{ flex: 1, fontSize: '12px', color: e.ativo ? '#4c1d95' : '#94a3b8', lineHeight: 1.4 }}>
                        <strong>{e.codigo}</strong> — {e.descricao}
                      </span>
                      <button
                        onClick={() => removerExcecao(idx)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', flexShrink: 0 }}
                        title="Remover"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Adicionar exceção manual */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                <input
                  value={novaExcecao}
                  onChange={e => setNovaExcecao(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') adicionarExcecaoManual(); }}
                  placeholder="Descreva uma nova exceção personalizada..."
                  style={{
                    flex: 1, padding: '7px 10px', borderRadius: '6px', fontSize: '12px',
                    border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)',
                    color: 'var(--text-primary)', outline: 'none',
                  }}
                />
                <button
                  onClick={adicionarExcecaoManual}
                  disabled={!novaExcecao.trim()}
                  style={{
                    padding: '7px 12px', borderRadius: '6px', border: 'none',
                    backgroundColor: novaExcecao.trim() ? '#7c3aed' : '#e2e8f0',
                    color: novaExcecao.trim() ? '#fff' : '#94a3b8',
                    cursor: novaExcecao.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '12px', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}
                >
                  <Plus size={13} /> Adicionar
                </button>
              </div>
            </section>

            {/* ── SEÇÃO 3: Instruções adicionais ── */}
            <section>
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                Instruções adicionais ({config.instrucoes_adicionais.length})
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Regras contextuais do seu cartório que a IA deve considerar na conferência.
              </p>

              {config.instrucoes_adicionais.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Nenhuma instrução adicional cadastrada.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {config.instrucoes_adicionais.map((inst, idx) => (
                    <div key={idx} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '8px',
                      padding: '8px 10px', borderRadius: '7px',
                      border: '1px solid #e0e7ff', backgroundColor: '#eef2ff',
                    }}>
                      <span style={{ fontSize: '12px', color: '#3730a3', flex: 1, lineHeight: 1.4 }}>{inst}</span>
                      <button
                        onClick={() => removerInstrucao(idx)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', flexShrink: 0, marginTop: '1px' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                <textarea
                  value={novaInstrucao}
                  onChange={e => setNovaInstrucao(e.target.value)}
                  placeholder="Ex: Quando houver cessão fiduciária, sempre verificar se a alienação fiduciária foi averbada antes..."
                  rows={2}
                  style={{
                    flex: 1, padding: '7px 10px', borderRadius: '6px', fontSize: '12px',
                    border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)',
                    color: 'var(--text-primary)', outline: 'none', resize: 'vertical',
                    fontFamily: 'inherit', lineHeight: 1.4,
                  }}
                />
                <button
                  onClick={adicionarInstrucao}
                  disabled={!novaInstrucao.trim()}
                  style={{
                    padding: '7px 12px', borderRadius: '6px', border: 'none', alignSelf: 'flex-start',
                    backgroundColor: novaInstrucao.trim() ? '#4f46e5' : '#e2e8f0',
                    color: novaInstrucao.trim() ? '#fff' : '#94a3b8',
                    cursor: novaInstrucao.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '12px', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}
                >
                  <Plus size={13} /> Adicionar
                </button>
              </div>
            </section>

          </div>
        )}

        {/* Footer fixo com botão salvar */}
        {!carregando && (
          <div style={{
            padding: '14px 20px', borderTop: '1px solid var(--border)',
            position: 'sticky', bottom: 0, backgroundColor: 'var(--surface)',
            display: 'flex', flexDirection: 'column', gap: '8px',
          }}>
            {feedback && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '12px', fontWeight: 600,
                color: feedback.tipo === 'ok' ? '#16a34a' : '#dc2626',
                padding: '6px 10px', borderRadius: '6px',
                backgroundColor: feedback.tipo === 'ok' ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${feedback.tipo === 'ok' ? '#bbf7d0' : '#fecaca'}`,
              }}>
                {feedback.tipo === 'ok' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {feedback.msg}
              </div>
            )}
            <button
              onClick={salvar}
              disabled={salvando}
              style={{
                width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
                backgroundColor: salvando ? '#a78bfa' : '#7c3aed',
                color: '#fff', fontWeight: 700, fontSize: '13px', cursor: salvando ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              {salvando ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
              {salvando ? 'Salvando...' : 'Salvar regras no GitHub'}
            </button>
          </div>
        )}

        <style>{`
          @keyframes slideRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
