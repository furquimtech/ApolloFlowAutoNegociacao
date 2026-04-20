import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`btn-${variant}`}
      disabled={disabled ?? loading}
      style={{ width: fullWidth ? '100%' : undefined, ...style }}
      {...rest}
    >
      {loading ? (
        <>
          <span
            style={{
              width: 16,
              height: 16,
              border: '2px solid rgba(255,255,255,0.4)',
              borderTop: '2px solid #fff',
              borderRadius: '50%',
              display: 'inline-block',
            }}
            className="animate-spin"
          />
          Aguarde...
        </>
      ) : (
        children
      )}
    </button>
  );
}
