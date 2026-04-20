import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  titulo: string;
  subtitulo: string;
  botaoLabel?: string;
  destino?: string;
  onClose: () => void;
}

export default function SuccessPopup({ titulo, subtitulo, botaoLabel = 'Ver meus acordos', destino = '/meus-acordos', onClose }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleBotao() {
    onClose();
    navigate(destino);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200,
        animation: 'fadeInBackdrop 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: '2.5rem 2rem',
          width: '90%', maxWidth: 420,
          textAlign: 'center',
          animation: 'slideUpModal 0.25s ease',
        }}
      >
        {/* Ícone verde */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: '#22c55e',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--brand-text)', marginBottom: '0.5rem' }}>
          {titulo}
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--brand-text-muted)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          {subtitulo}
        </p>

        <button
          onClick={handleBotao}
          style={{
            background: 'var(--brand-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '0.7rem 1.75rem',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {botaoLabel}
        </button>
      </div>
    </div>
  );
}
