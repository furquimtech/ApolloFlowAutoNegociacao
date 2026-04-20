interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export default function Loading({ message = 'Carregando...', fullScreen = false }: LoadingProps) {
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div
        style={{
          width: 40,
          height: 40,
          border: '3px solid var(--brand-accent-light)',
          borderTop: '3px solid var(--brand-accent)',
          borderRadius: '50%',
        }}
        className="animate-spin"
      />
      <p style={{ color: 'var(--brand-text-muted)', fontSize: '0.9rem' }}>{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.85)',
          zIndex: 9999,
          backdropFilter: 'blur(4px)',
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
      {content}
    </div>
  );
}
