'use client';

import { useState, useRef } from 'react';
import { Paperclip, Upload, X, CheckCircle2, AlertCircle, AlertTriangle, Loader2, ChevronDown, ChevronUp, Scale } from 'lucide-react';
import type { Pendencia, ResultadoSaneamento, StatusSaneamento } from '@/types/qualificacao';

interface SaneamentoPendenciaProps {
  pendencia: Pendencia;
  contexto: {
    tipo_titulo: string;
    natureza_imovel: string;
    resumo_ia: string;
    dados_adicionais?: string;
  };
}

export default function SaneamentoPendencia({ pendencia, contexto }: SaneamentoPendenciaProps) {
  const [aberto, setAberto] = useState(false);
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [status, setStatus] = useState<StatusSaneamento>('idle');
  const [resultado, setResultado] = useState<ResultadoSaneamento | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const adicionarArquivos = (novos: FileList | null) => {
    if (!novos) return;
    const lista = Array.from(novos).filter((f) =>
      ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff', 'image/webp'].includes(f.type)
    );
    setArquivos((prev) => {
      const nomes = new Set(prev.map((f) => f.name));
      return [...prev, ...lista.filter((f) => !nomes.has(f.name))];
    });
  };

  const removerArquivo = (idx: number) => {
    setArquivos((prev) => prev.filter((_, i) => i !== idx));
  };

  const verificar = async () => {
    if (arquivos.length === 0) return;
    setStatus('analisando');
    setErro(null);
    setResultado(null);

    try {
      const formData = new FormData();
      formData.append('pendencia', JSON.stringify({
        codigo: pendencia.codigo,
        descricao: pendencia.descricao,
        como_sanar: pendencia.como_sanar,
        fundamento: pendencia.fundamento,
      }));
      formData.append('contexto', JSON.stringify(contexto));
      arquivos.forEach((f) => formData.append('arquivos', f));

      const resp = await fetch('/api/sanar', { method: 'POST', body: formData });
      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.erro ?? 'Erro ao verificar documentos.');
      }

      setResultado(data as ResultadoSaneamento);
      setStatus(data.status === 'SANADO' ? 'sanado' : data.status === 'PARCIAL' ? 'parcial' : 'pendente');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido.');
      setStatus('erro');
    }
  };

  const reiniciar = () => {
    setArquivos([]);
    setStatus('idle');
    setResultado(null);
    setErro(null);
  };

  // ── Visual do resultado ──────────────────────────────────
  const ResultadoBadge = () => {
    if (!resultado) return null;
    const cfg = {
      SANADO: { bg: 'var(--green-bg)', border: 'var(--green-border)', color: 'var(--green-text)', icon: <CheckCircle2 size={15} style={{ color: 'var(--green)' }} />, label: 'Pendência sanada' },
      PARCIAL: { bg: 'var(--amber-bg)', border: 'var(--amber-border)', color: 'var(--amber-text)', icon: <AlertCircle size={15} style={{ color: 'var(--amber)' }} />, label: 'Parcialmente sanado' },
      PENDENTE: { bg: 'var(--red-bg)', border: 'var(--red-border)', color: 'var(--red-text)', icon: <AlertTriangle size={15} style={{ color: 'var(--red)' }} />, label: 'Ainda pendente' },
    }[resultado.status];

    return (
      <div style={{
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: '8px',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          {cfg.icon}
          <span style={{ fontSize: '13px', fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
        </div>

        {/* Explicação */}
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {resultado.explicacao}
        </p>

        {/* Novas Divergências Identificadas */}
        {resultado.novas_divergencias && resultado.novas_divergencias.length > 0 && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '10px 12px',
          }}>
            <p style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#991b1b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}>
              <AlertTriangle size={13} style={{ color: '#dc2626' }} />
              Novas Divergências no Documento Apresentado
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {resultado.novas_divergencias.map((div, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#dc2626', lineHeight: 1.4 }}>•</span>
                  <p style={{ fontSize: '13px', color: '#991b1b', lineHeight: 1.5, fontWeight: 500 }}>
                    {div}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerta de Base de Cálculo / Emolumentos */}
        {resultado.alerta_base_calculo && (
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '10px 12px',
          }}>
            <p style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#1e40af',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}>
              <Scale size={13} style={{ color: '#2563eb' }} />
              Impacto na Base de Cálculo / Emolumentos Registrais
            </p>
            <p style={{ fontSize: '13px', color: '#1e3a8a', lineHeight: 1.5 }}>
              {resultado.alerta_base_calculo}
            </p>
          </div>
        )}

        {/* O que falta */}
        {resultado.o_que_falta && (
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '8px 10px',
          }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              O que ainda falta
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{resultado.o_que_falta}</p>
          </div>
        )}

        {/* Documentos reconhecidos */}
        {resultado.documentos_verificados.length > 0 && (
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Documentos reconhecidos
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {resultado.documentos_verificados.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>•</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botão para tentar novamente */}
        {resultado.status !== 'SANADO' && (
          <button
            onClick={reiniciar}
            style={{
              alignSelf: 'flex-start',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--brand)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              textDecoration: 'underline',
            }}
          >
            Tentar com outros documentos
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={{ marginTop: '10px' }}>
      {/* Botão toggle */}
      {status !== 'sanado' && (
        <button
          onClick={() => setAberto(!aberto)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--brand)',
            background: 'none',
            border: `1px solid var(--blue-border)`,
            borderRadius: '6px',
            padding: '5px 10px',
            cursor: 'pointer',
            backgroundColor: 'var(--brand-light)',
          }}
        >
          <Paperclip size={12} />
          {aberto ? 'Fechar' : 'Anexar documentos para sanar'}
          {aberto ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      )}

      {/* Badge de sanado (permanente) */}
      {status === 'sanado' && resultado && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--green-text)',
          backgroundColor: 'var(--green-bg)',
          border: '1px solid var(--green-border)',
          borderRadius: '6px',
          padding: '5px 10px',
        }}>
          <CheckCircle2 size={13} style={{ color: 'var(--green)' }} />
          Pendência sanada — {resultado.explicacao.slice(0, 60)}{resultado.explicacao.length > 60 ? '…' : ''}
        </div>
      )}

      {/* Painel de upload */}
      {aberto && status !== 'sanado' && (
        <div style={{
          marginTop: '10px',
          backgroundColor: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }} className="fade-in">

          {/* Drop area */}
          {status === 'idle' || status === 'erro' ? (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); adicionarArquivos(e.dataTransfer.files); }}
                onClick={() => inputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? 'var(--brand)' : 'var(--border-strong)'}`,
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: dragOver ? 'var(--brand-light)' : 'var(--surface)',
                  transition: 'all 0.2s',
                }}
              >
                <Upload size={18} style={{ color: 'var(--text-muted)', margin: '0 auto 6px' }} />
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Arraste os documentos de saneamento aqui
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  PDF, JPG, PNG — ex: guia de ITBI, comprovante de pagamento, certidão
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.tiff,.webp"
                style={{ display: 'none' }}
                onChange={(e) => adicionarArquivos(e.target.files)}
              />

              {/* Lista de arquivos selecionados */}
              {arquivos.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {arquivos.map((f, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '6px 10px',
                    }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1 }}>
                        📄 {f.name}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {(f.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                      <button
                        onClick={() => removerArquivo(i)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', color: 'var(--text-muted)' }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Erro */}
              {erro && (
                <p style={{ fontSize: '12px', color: 'var(--red-text)' }}>⚠ {erro}</p>
              )}

              {/* Botão verificar */}
              <button
                onClick={verificar}
                disabled={arquivos.length === 0}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: arquivos.length === 0 ? 'var(--border)' : 'var(--brand)',
                  color: arquivos.length === 0 ? 'var(--text-muted)' : '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: arquivos.length === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Verificar com a IA →
              </button>
            </>
          ) : status === 'analisando' ? (
            /* Loading */
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
              <Loader2 size={16} style={{ color: 'var(--brand)', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Verificando se os documentos sanam a pendência…
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            /* Resultado */
            <ResultadoBadge />
          )}
        </div>
      )}
    </div>
  );
}
