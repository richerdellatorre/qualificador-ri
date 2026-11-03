'use client';

import { useState, useCallback } from 'react';
import { Scale, Gavel, ShieldCheck, Settings, Zap } from 'lucide-react';
import DropZone from '@/components/DropZone';
import LoadingProgress from '@/components/LoadingProgress';
import PainelResultado from '@/components/PainelResultado';
import PainelConfiguracoes from '@/components/PainelConfiguracoes';
import type { ResultadoQualificacao, StatusAnalise } from '@/types/qualificacao';

type Etapa = 'uploading' | 'classificando' | 'extraindo' | 'qualificando' | 'concluido';

const TIPOS_SUPORTADOS = [
  'Matrícula',
  'Escritura de C/V',
  'Escritura de Doação',
  'Inventário e Partilha',
  'Formal de Partilha',
  'Usucapião',
  'Adjudicação Compulsória',
  'Permuta',
  'Cessão de Direitos',
  'Processo Judicial',
  'CCIR / ITR / CAR',
];

export default function Home() {
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [status, setStatus] = useState<StatusAnalise>('idle');
  const [etapaAtual, setEtapaAtual] = useState<Etapa>('uploading');
  const [mensagemEtapa, setMensagemEtapa] = useState('');
  const [resultado, setResultado] = useState<ResultadoQualificacao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [configAberto, setConfigAberto] = useState(false);
  const [modelo, setModelo] = useState<'gemini-4-argon' | 'gemini-3.8-flash'>('gemini-4-argon');

  const analisando =
    status === 'uploading' ||
    status === 'classificando' ||
    status === 'extraindo' ||
    status === 'qualificando';

  const handleArquivosChange = useCallback((novos: File[]) => {
    setArquivos(novos);
  }, []);

  const iniciarAnalise = async () => {
    if (arquivos.length === 0) return;

    setStatus('uploading');
    setEtapaAtual('uploading');
    setMensagemEtapa('Preparando arquivos...');
    setResultado(null);
    setErro(null);

    try {
      const formData = new FormData();
      arquivos.forEach((f) => formData.append('arquivos', f));
      formData.append('modelo', modelo);

      const resp = await fetch('/api/analisar', {
        method: 'POST',
        body: formData,
      });

      if (!resp.ok || !resp.body) {
        throw new Error('Falha na comunicação com o servidor.');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const linhas = buffer.split('\n');
        buffer = linhas.pop() ?? '';

        for (const linha of linhas) {
          if (!linha.trim()) continue;
          try {
            const evento = JSON.parse(linha);

            if (evento.tipo === 'status') {
              setEtapaAtual(evento.etapa as Etapa);
              setMensagemEtapa(evento.mensagem);

              if (evento.etapa === 'classificando') setStatus('classificando');
              if (evento.etapa === 'extraindo') setStatus('extraindo');
              if (evento.etapa === 'qualificando') setStatus('qualificando');
              if (evento.etapa === 'concluido') setStatus('concluido');
            } else if (evento.tipo === 'resultado') {
              setResultado(evento.dados as ResultadoQualificacao);
              setStatus('concluido');
            } else if (evento.tipo === 'erro') {
              setErro(evento.mensagem);
              setStatus('erro');
            }
          } catch {
            // linha incompleta — aguarda próximo chunk
          }
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido.';
      setErro(msg);
      setStatus('erro');
    }
  };

  const resetar = () => {
    setArquivos([]);
    setStatus('idle');
    setResultado(null);
    setErro(null);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>

      {/* ── Header ── */}
      <header style={{
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 40,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              backgroundColor: 'var(--brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Scale size={18} style={{ color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Qualificador Registral
              </h1>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.2 }}>
                Cartório de Registro de Imóveis · Rondônia
              </p>
            </div>
          </div>

          {/* Direita: badge + botão config */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              backgroundColor: 'var(--brand-light)',
              border: '1px solid var(--blue-border)',
              borderRadius: '99px', padding: '4px 10px',
            }}>
              <ShieldCheck size={12} style={{ color: 'var(--brand)' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brand)' }}>IA Assistente</span>
            </div>

            <button
              onClick={() => setConfigAberto(true)}
              title="Configurações de regras"
              style={{
                width: '34px', height: '34px', borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface-2)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--brand-light)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--brand)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--blue-border)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--surface-2)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
              }}
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Conteúdo principal ── */}
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 20px 64px' }}>

        {/* Estado: idle ou erro */}
        {(status === 'idle' || status === 'erro') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                Análise de Títulos e Matrículas
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Envie a matrícula e o(s) título(s) para qualificação registral automática com base nas normativas do CRI de Rondônia.
              </p>
            </div>

            {/* ── Seletor de Modelo de IA ── */}
            <div style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
            }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Modelo de IA:</span>
                  <span style={{ color: 'var(--brand)', fontWeight: 800 }}>
                    {modelo === 'gemini-4-argon' ? 'Gemini 4 Argon' : 'Gemini 3.8 Flash'}
                  </span>
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {modelo === 'gemini-4-argon'
                    ? 'Raciocínio jurídico profundo e alta precisão analítica (recomendado)'
                    : 'Análise ultrarrápida (ideal para triagem inicial ou títulos simples)'}
                </p>
              </div>

              <div style={{
                display: 'flex',
                backgroundColor: 'var(--surface-2)',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                gap: '3px',
              }}>
                <button
                  type="button"
                  onClick={() => setModelo('gemini-4-argon')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: modelo === 'gemini-4-argon' ? 'var(--brand)' : 'transparent',
                    color: modelo === 'gemini-4-argon' ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Scale size={13} />
                  Argon (Padrão)
                </button>

                <button
                  type="button"
                  onClick={() => setModelo('gemini-3.8-flash')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: modelo === 'gemini-3.8-flash' ? 'var(--brand)' : 'transparent',
                    color: modelo === 'gemini-3.8-flash' ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Zap size={13} />
                  Flash (Rápido)
                </button>
              </div>
            </div>

            <DropZone onArquivosChange={handleArquivosChange} desabilitado={analisando} />

            {erro && (
              <div style={{
                backgroundColor: 'var(--red-bg)', border: '1px solid var(--red-border)',
                borderRadius: '10px', padding: '12px 16px',
                display: 'flex', alignItems: 'flex-start', gap: '10px',
              }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠</span>
                <p style={{ fontSize: '14px', color: 'var(--red-text)' }}>{erro}</p>
              </div>
            )}

            <button
              onClick={iniciarAnalise}
              disabled={arquivos.length === 0}
              style={{
                width: '100%', padding: '15px', borderRadius: '10px', border: 'none',
                backgroundColor: arquivos.length === 0 ? '#e2e8f0' : 'var(--brand)',
                color: arquivos.length === 0 ? 'var(--text-muted)' : '#fff',
                fontWeight: 700, fontSize: '15px',
                cursor: arquivos.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s',
                boxShadow: arquivos.length > 0 ? '0 4px 14px rgba(30,64,175,0.3)' : 'none',
              }}
            >
              <Gavel size={18} />
              {arquivos.length === 0
                ? 'Adicione os documentos para analisar'
                : `Qualificar ${arquivos.length} documento${arquivos.length !== 1 ? 's' : ''}`}
            </button>

            <div style={{
              backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '16px 18px',
            }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                Tipos de documentos suportados
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {TIPOS_SUPORTADOS.map((t) => (
                  <span key={t} style={{
                    fontSize: '12px', fontWeight: 500, padding: '4px 10px', borderRadius: '6px',
                    backgroundColor: 'var(--brand-light)', color: 'var(--blue-text)',
                    border: '1px solid var(--blue-border)',
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Estado: analisando */}
        {analisando && (
          <LoadingProgress etapa={etapaAtual} mensagem={mensagemEtapa} />
        )}

        {/* Estado: concluido */}
        {status === 'concluido' && resultado && (
          <PainelResultado resultado={resultado} onNova={resetar} />
        )}
      </main>

      {/* ── Painel de configurações (modal lateral) ── */}
      {configAberto && (
        <PainelConfiguracoes onFechar={() => setConfigAberto(false)} />
      )}
    </div>
  );
}
