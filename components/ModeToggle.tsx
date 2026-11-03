'use client';

interface ModeToggleProps {
  modo: 'qualificacao' | 'conferencia';
  onChange: (modo: 'qualificacao' | 'conferencia') => void;
}

export default function ModeToggle({ modo, onChange }: ModeToggleProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        borderRadius: '10px',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--surface-2)',
        padding: '3px',
        gap: '2px',
      }}
    >
      <button
        onClick={() => onChange('qualificacao')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: '7px 16px',
          borderRadius: '7px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          transition: 'all 0.18s ease',
          backgroundColor: modo === 'qualificacao' ? 'var(--brand)' : 'transparent',
          color: modo === 'qualificacao' ? '#fff' : 'var(--text-secondary)',
          boxShadow: modo === 'qualificacao' ? '0 1px 4px rgba(37,99,235,0.25)' : 'none',
        }}
      >
        <span style={{ fontSize: '15px' }}>⚖️</span>
        Qualificação Registral
      </button>

      <button
        onClick={() => onChange('conferencia')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: '7px 16px',
          borderRadius: '7px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          transition: 'all 0.18s ease',
          backgroundColor: modo === 'conferencia' ? '#7c3aed' : 'transparent',
          color: modo === 'conferencia' ? '#fff' : 'var(--text-secondary)',
          boxShadow: modo === 'conferencia' ? '0 1px 4px rgba(124,58,237,0.25)' : 'none',
        }}
      >
        <span style={{ fontSize: '15px' }}>📝</span>
        Conferência de Minuta
      </button>
    </div>
  );
}
