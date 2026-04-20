import type { ReactNode } from 'react';

interface AlertProps {
  type?: 'error' | 'success' | 'info';
  children: ReactNode;
}

const styles = {
  error: { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b', icon: '✕' },
  success: { bg: '#dcfce7', border: '#86efac', text: '#166534', icon: '✓' },
  info: { bg: 'var(--brand-accent-light)', border: 'var(--brand-accent)', text: 'var(--brand-primary)', icon: 'ℹ' },
};

export default function Alert({ type = 'error', children }: AlertProps) {
  const s = styles[type];
  return (
    <div
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 8,
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',
        color: s.text,
        fontSize: '0.9rem',
      }}
    >
      <span style={{ fontWeight: 700, flexShrink: 0 }}>{s.icon}</span>
      <span>{children}</span>
    </div>
  );
}
