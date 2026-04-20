import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export default function Input({ label, error, hint, id, ...rest }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <label
        htmlFor={inputId}
        style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--brand-text)',
        }}
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`input-field${error ? ' error' : ''}`}
        {...rest}
      />
      {error && (
        <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>{error}</span>
      )}
      {hint && !error && (
        <span style={{ fontSize: '0.8rem', color: 'var(--brand-text-muted)' }}>{hint}</span>
      )}
    </div>
  );
}
