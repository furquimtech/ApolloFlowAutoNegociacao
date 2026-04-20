import { useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useNegociacao } from '../../contexts/NegociacaoContext';
import { useIdleTimeout } from '../../hooks/useIdleTimeout';

export default function PortalLayout() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { cliente, resetFlow } = useNegociacao();

  const handleIdle = useCallback(() => {
    resetFlow();
    navigate('/');
  }, [resetFlow, navigate]);

  useIdleTimeout(handleIdle, !!cliente);

  const isAuth = !!cliente;
  const isOportunidades = location.pathname === '/oportunidades';
  const isMeusAcordos = location.pathname === '/meus-acordos';

  function handleLogout() {
    resetFlow();
    navigate('/');
  }

  const primeiroNome = cliente?.nome
    ? cliente.nome.split(' ').slice(0, 2).join(' ')
    : '';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--brand-bg)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid var(--brand-border)',
        padding: '0 2rem',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        {/* Logo */}
        <div
          style={{ cursor: isAuth ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}
          onClick={() => isAuth && navigate('/oportunidades')}
        >
          <img
            src={theme.logoUrl}
            alt={theme.companyName}
            style={{ height: 36, objectFit: 'contain' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>

        {/* Nav tabs — só quando autenticado */}
        {isAuth && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => navigate('/oportunidades')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1.1rem',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                background: isOportunidades ? 'var(--brand-primary)' : '#f0eaf5',
                color: isOportunidades ? '#fff' : 'var(--brand-primary)',
                transition: 'all 0.2s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2m-3.05-6.95-1.41 1.41M6.46 17.54l-1.41 1.41M17.54 17.54l1.41 1.41M6.46 6.46 5.05 5.05"/>
              </svg>
              Minhas Oportunidades
            </button>

            <button
              onClick={() => navigate('/meus-acordos')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1.1rem',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                background: isMeusAcordos ? 'var(--brand-primary)' : '#f0eaf5',
                color: isMeusAcordos ? '#fff' : 'var(--brand-primary)',
                transition: 'all 0.2s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
              Meus Acordos
            </button>
          </div>
        )}

        {/* Usuário + logout — só quando autenticado */}
        {isAuth ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--brand-primary-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--brand-text)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                {primeiroNome}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Sair"
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem',
                display: 'flex', alignItems: 'center', color: 'var(--brand-text-muted)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        ) : (
          <span style={{ fontSize: '0.82rem', color: 'var(--brand-text-muted)' }}>
            Portal de Autonegociação
          </span>
        )}
      </header>

      {/* ── Main ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer style={{
        background: '#fff',
        borderTop: '1px solid var(--brand-border)',
        padding: '1.25rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <img
          src={theme.logoUrl}
          alt={theme.companyName}
          style={{ height: 28, objectFit: 'contain' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { icon: '🌐', label: 'www.twcapital.com.br' },
            { icon: '✉', label: 'sac@twcapital' },
            { icon: '📞', label: 'Central de Negociação - 0800 729 34 11' },
            { icon: '📞', label: 'SAC - 0800 729 32 88' },
          ].map(({ icon, label }) => (
            <span key={label} style={{ fontSize: '0.75rem', color: 'var(--brand-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span>{icon}</span>{label}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['f', 'in', 'ig'].map((s) => (
            <div key={s} style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--brand-primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.65rem', fontWeight: 700, color: 'var(--brand-primary)', cursor: 'pointer',
            }}>
              {s}
            </div>
          ))}
        </div>
      </footer>

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/55"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          width: 52, height: 52, borderRadius: '50%',
          background: '#25d366',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 100, textDecoration: 'none',
        }}
        title="Fale com a gente!"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}
