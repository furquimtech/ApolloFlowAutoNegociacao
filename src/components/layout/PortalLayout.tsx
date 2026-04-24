import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useNegociacao } from '../../contexts/NegociacaoContext';
import { useIdleTimeout } from '../../hooks/useIdleTimeout';
import { useViewport } from '../../hooks/useViewport';
import FloatingWhatsAppButton from '../ui/FloatingWhatsAppButton';

function MenuButton({
  label,
  active,
  badge,
  onClick,
  fill,
}: {
  label: string;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
  fill?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 38,
        minWidth: 128,
        padding: '0 1rem',
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.95)',
        background: fill || active ? '#ff5168' : 'transparent',
        color: '#fff',
        fontWeight: 800,
        fontSize: '0.8rem',
        cursor: onClick ? 'pointer' : 'default',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.45rem',
        position: 'relative',
      }}
    >
      {badge && (
        <span
          style={{
            position: 'absolute',
            top: -9,
            left: 10,
            minWidth: 26,
            height: 26,
            borderRadius: '50%',
            background: '#fff200',
            color: '#6a5900',
            fontSize: '0.7rem',
            fontWeight: 900,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
          }}
        >
          {badge}
        </span>
      )}
      {label}
    </button>
  );
}

export default function PortalLayout() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { cliente, resetFlow } = useNegociacao();
  const { isMobile } = useViewport();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleIdle = useCallback(() => {
    resetFlow();
    navigate('/');
  }, [resetFlow, navigate]);

  useIdleTimeout(handleIdle, !!cliente);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const isAuth = !!cliente;
  const isOportunidades = location.pathname === '/oportunidades';
  const isMeusAcordos = location.pathname === '/meus-acordos';
  const isLanding = location.pathname === '/' && !isAuth;
  const nomeTopo = cliente?.nome ? cliente.nome.split(' ')[0] : '';

  function handleLogout() {
    resetFlow();
    navigate('/');
  }

  function UserMenuContent() {
    const items = [
      { label: 'Meus dados', onClick: () => navigate('/meus-dados') },
      { label: 'Politicas de Privacidade', onClick: () => navigate('/privacidade') },
      { label: 'Termos de uso', onClick: () => navigate('/termos-de-uso') },
    ];

    return (
      <div
        style={{
          background: '#fff',
          borderRadius: 22,
          border: '1px solid #ece7f1',
          boxShadow: '0 18px 34px rgba(35, 27, 54, 0.18)',
          padding: '0.65rem',
          minWidth: 200,
        }}
      >
        {items.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              border: 'none',
              background: 'transparent',
              color: '#66666d',
              fontWeight: 700,
              fontSize: '0.84rem',
              padding: '0.7rem 0.75rem',
              borderRadius: 12,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span style={{ width: 16, color: '#8a8a90' }}>•</span>
            {item.label}
          </button>
        ))}
        <div style={{ height: 1, background: '#eee8f2', margin: '0.25rem 0' }} />
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            border: 'none',
            background: 'transparent',
            color: '#66666d',
            fontWeight: 700,
            fontSize: '0.84rem',
            padding: '0.7rem 0.75rem',
            borderRadius: 12,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span style={{ width: 16, color: '#8a8a90' }}>↪</span>
          Sair
        </button>
      </div>
    );
  }

  const authHeader = !isLanding && isAuth;
  const authFooter = !isLanding && isAuth;

  return (
    <div style={{ minHeight: '100vh', background: '#efedf3', display: 'flex', flexDirection: 'column' }}>
      {!isLanding && (
        <header
          style={{
            background: authHeader ? '#fa3650' : '#e9e9ea',
            margin: isMobile ? '0.75rem 0.75rem 0' : '0.8rem 0.85rem 0',
            borderRadius: 8,
            padding: isMobile ? '0.8rem 0.85rem' : '0.78rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            boxShadow: authHeader ? '0 10px 24px rgba(250, 54, 80, 0.16)' : 'none',
          }}
        >
          <div
            style={{ cursor: isAuth ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}
            onClick={() => isAuth && navigate('/oportunidades')}
          >
            <img
              src={theme.logoUrl}
              alt={theme.companyName}
              style={{ height: isMobile ? 26 : 34, objectFit: 'contain', maxWidth: isMobile ? 158 : 'none', filter: authHeader ? 'brightness(0) invert(1)' : 'none' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>

          {isAuth && isMobile && (
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              title="Menu"
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.75)',
                background: 'transparent',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginLeft: 'auto',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
          )}

          {isAuth && !isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
              <MenuButton label="Minhas Ofertas" active={isOportunidades} onClick={() => navigate('/oportunidades')} />
              <MenuButton label="Meus Acordos" active={isMeusAcordos} onClick={() => navigate('/meus-acordos')} />
              <MenuButton label="Meus Contratos" onClick={() => navigate('/selecionar-contrato')} />

              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen((current) => !current)}
                  style={{
                    height: 38,
                    padding: '0 0.9rem',
                    borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.95)',
                    background: 'transparent',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.76 0 5-2.46 5-5.5S14.76 1 12 1 7 3.46 7 6.5 9.24 12 12 12Zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5Z" />
                  </svg>
                  Ola, {nomeTopo}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: 48, zIndex: 40 }}>
                    <UserMenuContent />
                  </div>
                )}
              </div>
            </div>
          )}

          {isAuth && isMobile && mobileMenuOpen && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.55rem', paddingTop: '0.25rem' }}>
              <MenuButton label="Minhas Ofertas" active={isOportunidades} onClick={() => navigate('/oportunidades')} />
              <MenuButton label="Meus Acordos" active={isMeusAcordos} onClick={() => navigate('/meus-acordos')} />
              <MenuButton label="Meus Contratos" onClick={() => navigate('/selecionar-contrato')} />
              <button
                onClick={() => setUserMenuOpen((current) => !current)}
                style={{
                  height: 40,
                  width: '100%',
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.95)',
                  background: 'transparent',
                  color: '#fff',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Ola, {nomeTopo}
              </button>
              {userMenuOpen && <UserMenuContent />}
            </div>
          )}
        </header>
      )}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>

      {!isLanding && (
        <footer
          style={{
            background: authFooter ? '#e4e1e6' : '#f0f0f2',
            borderTop: authFooter ? 'none' : '1px solid #e2e2e7',
            padding: isMobile ? '0.9rem 0.85rem' : '0.95rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? '1rem' : '2.4rem',
            flexWrap: 'wrap',
            color: '#66666b',
            fontSize: isMobile ? '0.68rem' : '0.72rem',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#7d7a82',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.58rem',
              }}
            >
              ✉
            </span>
            sac@twcapital
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#7d7a82',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.58rem',
              }}
            >
              ☎
            </span>
            SAC - 0800 729 32 88
          </span>
        </footer>
      )}

      <FloatingWhatsAppButton bottom={isLanding ? 24 : (isMobile ? 24 : 26)} />
    </div>
  );
}
