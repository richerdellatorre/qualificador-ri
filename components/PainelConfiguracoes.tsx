'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Settings, X, Save, RefreshCw, Plus, Trash2,
  CheckCircle2, AlertCircle, ToggleLeft, ToggleRight,
  GitCommit, ChevronDown, ChevronUp, Info,
} from 'lucide-react';
import type { CustomizacoesConfig, RegraCustomizacao } from '@/lib/github';

// ── Regras conhecidas do sistema (exibidas mesmo sem estar no JSON) ──
const REGRAS_CONHECIDAS: { codigo: string; descricao: string; categoria: string }[] = [
  // Saneamento objetivo
  { codigo: 'SO-01', descricao: 'Cadastro imobiliário (imóvel urbano)', categoria: 'Saneamento Objetivo' },
  { codigo: 'SO-02', descricao: 'CCIR (imóvel rural)', categoria: 'Saneamento Objetivo' },
  { codigo: 'SO-03', descricao: 'ITR (imóvel rural)', categoria: 'Saneamento Objetivo' },
  { codigo: 'SO-04', descricao: 'CAR (imóvel rural)', categoria: 'Saneamento Objetivo' },
  // Saneamento subjetivo
  { codigo: 'SS-01', descricao: 'CPF/RG ausente na matrícula (parte vendedora)', categoria: 'Saneamento Subjetivo' },
  // Qualificação das partes
  { codigo: 'QUAL-01', descricao: 'Qualificação incompleta (nome, CPF, RG, estado civil, profissão, endereço)', categoria: 'Qualificação' },
  { codigo: 'QUAL-02', descricao: 'Estado civil divergente da matrícula', categoria: 'Qualificação' },
  { codigo: 'QUAL-03', descricao: 'Declaração de união estável ausente', categoria: 'Qualificação' },
  // Imposto
  { codigo: 'ITBI-01', descricao: 'ITBI não recolhido ou comprovante ausente', categoria: 'Imposto' },
  // Continuidade
  { codigo: 'CONT-01', descricao: 'Quebra de continuidade (transmitente não é titular)', categoria: 'Continuidade' },
  // Averbação
  { codigo: 'AV-01', descricao: 'Mancomunhão não averbada', categoria: 'Averbação' },
  { codigo: 'AV-02', descricao: 'Alteração de estado civil não averbada', categoria: 'Averbação' },
  // Desmembramento
  { codigo: 'AL-01', descricao: 'Imóvel com histórico de desmembramento', categoria: 'Alerta' },
  { codigo: 'NM-01', descricao: 'Alienação total de imóvel desmembrado — necessária nova matrícula', categoria: 'Nova Matrícula' },
  // Escritura digital
  { codigo: 'EDIGIT-01', descricao: 'Assinatura digital — matrícula notarial eletrônica', categoria: 'Escritura Digital' },
  { codigo: 'EDIGIT-02', descricao: 'Arquivo não está em formato PDF/A', categoria: 'Escritura Digital' },
  // Procuração
  { codigo: 'PROC-01', descricao: 'Procuração — verificação de poderes', categoria: 'Procuração' },
  // Pessoa jurídica
  { codigo: 'PJ-01', descricao: 'Empresa adquirindo imóvel rural — apresentar contrato social', categoria: 'Pessoa Jurídica' },
];

const CATEGORIAS = [...new Set(REGRAS_CONHECIDAS.map((r) => r.categoria))];

// ────────────────────────────────────────────────────────────────
export default function PainelConfiguracoes({ onFechar }: { onFechar: () => void }) {
  const [config, setConfig] = useState<CustomizacoesConfig | null>(null);
  const [sha, setSha] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'erro'; msg: string } | null>(null);
  const [novaInstrucao, setNovaInstrucao] = useState('');
  const [categoriaAberta, setCategoriaAberta] = useState<string | null>(CATEGORIAS[0]);

  // ── Carrega do GitHub ────────────────────────────────────
  const carregar = useCallback(async () => {
    setCarregando(true);
    setFeedback(null);
    try {
      const resp = await fetch('/api/customizacoes');
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.erro);
      setConfig(data.config as CustomizacoesConfig);
      setSha(data.sha as string);
    } catch (e) {
      setFeedback({ tipo: 'erro', msg: e instanceof Error ? e.message : 'Erro ao carregar.' });
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // ── Salva no GitHub ──────────────────────────────────────
  const salvar = async () => {
    if (!config) return;
    setSalvando(true);
    setFeedback(null);
    try {
      const resp = await fetch('/api/customizacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, sha }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.erro);
      setSha(data.sha as string);
      setFeedback({ tipo: 'ok', msg: 'Configurações salvas com sucesso no GitHub! Commit criado automaticamente.' });
    } catch (e) {
      setFeedback({ tipo: 'erro', msg: e instanceof Error ? e.message : 'Erro ao salvar.' });
    } finally {
      setSalvando(false);
    }
  };

  // ── Helpers de estado ───────────────────────────────────
  const getRgra = (codigo: string): RegraCustomizacao =>
    config?.regras[codigo] ?? { ativo: true };

  const setRegra = (codigo: string, patch: Partial<RegraCustomizacao>) => {
    if (!config) return;
    setConfig({
      ...config,
      regras: {
        ...config.regras,
        [codigo]: { ...getRgra(codigo), ...patch },
      },
    });
  };

  const toggleAtivo = (codigo: string) => {
    const atual = getRgra(codigo);
    setRegra(codigo, { ativo: !atual.ativo });
  };

  const adicionarInstrucao = () => {
    if (!config || !novaInstrucao.trim()) return;
    setConfig({
      ...config,
      instrucoes_adicionais: [...config.instrucoes_adicionais, novaInstrucao.trim()],
    });
    setNovaInstrucao('');
  };

  const removerInstrucao = (idx: number) => {
    if (!config) return;
    setConfig({
      ...config,
      instrucoes_adicionais: config.instrucoes_adicionais.filter((_, i) => i !== idx),
    });
  };

  // ────────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      backgroundColor: 'rgba(15,23,42,0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
    }} onClick={onFechar}>
      {/* Painel lateral direito */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '560px', height: '100vh',
          backgroundColor: 'var(--surface)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
          animation: 'slideInRight 0.25s ease',
        }}
      >
        {/* Header do painel */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: '12px',
          flexShrink: 0,
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            backgroundColor: 'var(--brand-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Settings size={18} style={{ color: 'var(--brand)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Configurações de Regras
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
              Customizações salvas no GitHub · {config?.cartorio ?? '…'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={carregar}
              disabled={carregando}
              title="Recarregar do GitHub"
              style={{
                width: '32px', height: '32px', borderRadius: '7px',
                border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)',
                cursor: carregando ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <RefreshCw size={14} style={{ animation: carregando ? 'spin 1s linear infinite' : 'none' }} />
            </button>
            <button
              onClick={onFechar}
              style={{
                width: '32px', height: '32px', borderRadius: '7px',
                border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Conteúdo scrollável */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Loading */}
          {carregando && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px 0' }}>
              <RefreshCw size={16} style={{ color: 'var(--brand)', animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Carregando do GitHub…</span>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div style={{
              backgroundColor: feedback.tipo === 'ok' ? 'var(--green-bg)' : 'var(--red-bg)',
              border: `1px solid ${feedback.tipo === 'ok' ? 'var(--green-border)' : 'var(--red-border)'}`,
              borderRadius: '8px', padding: '10px 14px',
              display: 'flex', alignItems: 'flex-start', gap: '8px',
            }}>
              {feedback.tipo === 'ok'
                ? <CheckCircle2 size={15} style={{ color: 'var(--green)', flexShrink: 0, marginTop: '1px' }} />
                : <AlertCircle size={15} style={{ color: 'var(--red)', flexShrink: 0, marginTop: '1px' }} />}
              <p style={{ fontSize: '13px', color: feedback.tipo === 'ok' ? 'var(--green-text)' : 'var(--red-text)', lineHeight: 1.5 }}>
                {feedback.msg}
              </p>
            </div>
          )}

          {/* Info box */}
          {!carregando && config && (
            <div style={{
              backgroundColor: 'var(--brand-light)', border: '1px solid var(--blue-border)',
              borderRadius: '8px', padding: '10px 14px',
              display: 'flex', gap: '8px',
            }}>
              <Info size={14} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '12px', color: 'var(--blue-text)', lineHeight: 1.6 }}>
                Alterações são salvas diretamente no GitHub como commits. Cada salvamento cria um histórico versionado e auditável. As mudanças entram em vigor na próxima análise.
              </p>
            </div>
          )}

          {/* Regras por categoria */}
          {!carregando && config && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Regras de qualificação
              </h3>

              {CATEGORIAS.map((cat) => {
                const regrasCategoria = REGRAS_CONHECIDAS.filter((r) => r.categoria === cat);
                const isAberta = categoriaAberta === cat;

                return (
                  <div key={cat} style={{
                    border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden',
                  }}>
                    {/* Header da categoria */}
                    <button
                      onClick={() => setCategoriaAberta(isAberta ? null : cat)}
                      style={{
                        width: '100%', padding: '11px 14px',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: isAberta ? 'var(--brand-light)' : 'var(--surface-2)',
                        border: 'none', cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 600, color: isAberta ? 'var(--brand)' : 'var(--text-primary)', flex: 1 }}>
                        {cat}
                      </span>
                      <span style={{
                        fontSize: '11px', fontWeight: 700, padding: '1px 7px', borderRadius: '99px',
                        backgroundColor: 'var(--border)', color: 'var(--text-muted)',
                      }}>
                        {regrasCategoria.filter((r) => !getRgra(r.codigo).ativo).length > 0
                          ? `${regrasCategoria.filter((r) => !getRgra(r.codigo).ativo).length} off`
                          : `${regrasCategoria.length}`}
                      </span>
                      {isAberta ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
                    </button>

                    {/* Regras */}
                    {isAberta && (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {regrasCategoria.map((regra, idx) => {
                          const r = getRgra(regra.codigo);
                          const isUltimo = idx === regrasCategoria.length - 1;

                          return (
                            <div
                              key={regra.codigo}
                              style={{
                                padding: '12px 14px',
                                borderTop: '1px solid var(--border)',
                                backgroundColor: r.ativo ? 'var(--surface)' : '#fafafa',
                                display: 'flex', flexDirection: 'column', gap: '8px',
                              }}
                            >
                              {/* Linha principal: toggle + label + código */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {/* Toggle */}
                                <button
                                  onClick={() => toggleAtivo(regra.codigo)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                                  title={r.ativo ? 'Clique para desativar' : 'Clique para ativar'}
                                >
                                  {r.ativo
                                    ? <ToggleRight size={24} style={{ color: 'var(--green)' }} />
                                    : <ToggleLeft size={24} style={{ color: 'var(--text-muted)' }} />}
                                </button>

                                {/* Descrição */}
                                <div style={{ flex: 1 }}>
                                  <span style={{ fontSize: '13px', color: r.ativo ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 500 }}>
                                    {regra.descricao}
                                  </span>
                                </div>

                                {/* Código */}
                                <span style={{
                                  fontSize: '10px', fontWeight: 700, fontFamily: 'monospace',
                                  color: 'var(--text-muted)', backgroundColor: 'var(--surface-2)',
                                  border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 6px',
                                  flexShrink: 0,
                                }}>
                                  {regra.codigo}
                                </span>
                              </div>

                              {/* Motivo de desativação */}
                              {!r.ativo && (
                                <input
                                  type="text"
                                  placeholder="Motivo da desativação (opcional)…"
                                  value={r.motivo_desativacao ?? ''}
                                  onChange={(e) => setRegra(regra.codigo, { motivo_desativacao: e.target.value })}
                                  style={{
                                    width: '100%', fontSize: '12px', padding: '6px 10px',
                                    border: '1px solid var(--border)', borderRadius: '6px',
                                    backgroundColor: 'var(--surface-2)', color: 'var(--text-secondary)',
                                    outline: 'none',
                                  }}
                                />
                              )}

                              {/* Observação adicional (quando ativo) */}
                              {r.ativo && (
                                <textarea
                                  placeholder={`Observação do cartório sobre ${regra.codigo} (opcional)…\nEx: "Aceitar também certidão negativa quando imóvel isento"`}
                                  value={r.observacao ?? ''}
                                  onChange={(e) => setRegra(regra.codigo, { observacao: e.target.value })}
                                  rows={r.observacao ? 2 : 1}
                                  style={{
                                    width: '100%', fontSize: '12px', padding: '7px 10px',
                                    border: '1px solid var(--border)', borderRadius: '6px',
                                    backgroundColor: r.observacao ? 'var(--brand-light)' : 'var(--surface-2)',
                                    color: 'var(--text-secondary)',
                                    outline: 'none', resize: 'vertical', lineHeight: 1.5,
                                    borderColor: r.observacao ? 'var(--blue-border)' : 'var(--border)',
                                  }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Instruções adicionais livres */}
          {!carregando && config && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Instruções adicionais do cartório
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Regras extras que não se encaixam nas categorias acima. A IA vai considerá-las em todas as análises.
              </p>

              {/* Lista */}
              {config.instrucoes_adicionais.map((inst, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '8px',
                  backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: '8px', padding: '10px 12px',
                }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1, lineHeight: 1.5 }}>
                    {inst}
                  </span>
                  <button
                    onClick={() => removerInstrucao(i)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)', flexShrink: 0 }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              {/* Adicionar nova */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Ex: Verificar se imóvel está em APP antes de registrar…"
                  value={novaInstrucao}
                  onChange={(e) => setNovaInstrucao(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && adicionarInstrucao()}
                  style={{
                    flex: 1, fontSize: '12px', padding: '8px 12px',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    backgroundColor: 'var(--surface)', color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={adicionarInstrucao}
                  disabled={!novaInstrucao.trim()}
                  style={{
                    padding: '8px 12px', borderRadius: '8px', border: 'none',
                    backgroundColor: novaInstrucao.trim() ? 'var(--brand)' : 'var(--border)',
                    color: novaInstrucao.trim() ? '#fff' : 'var(--text-muted)',
                    cursor: novaInstrucao.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '12px', fontWeight: 600,
                  }}
                >
                  <Plus size={13} /> Adicionar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer com botão salvar */}
        {!carregando && config && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: '10px',
            flexShrink: 0,
            backgroundColor: 'var(--surface)',
          }}>
            <button
              onClick={salvar}
              disabled={salvando}
              style={{
                width: '100%', padding: '13px',
                borderRadius: '9px', border: 'none',
                backgroundColor: salvando ? 'var(--border)' : 'var(--brand)',
                color: salvando ? 'var(--text-muted)' : '#fff',
                fontSize: '14px', fontWeight: 700,
                cursor: salvando ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              {salvando
                ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Salvando no GitHub…</>
                : <><GitCommit size={15} /> Salvar e criar commit no GitHub</>}
            </button>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
              Última atualização: {config.ultima_atualizacao
                ? new Date(config.ultima_atualizacao).toLocaleString('pt-BR')
                : '—'}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
