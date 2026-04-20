import { useEffect, useRef } from 'react';

const IDLE_MS = 5 * 60 * 1000; // 5 minutos
const EVENTS: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

/**
 * Chama `onIdle` após `idleMs` de inatividade.
 * Reinicia o contador a cada interação do usuário.
 * Ativo apenas quando `enabled` for true.
 */
export function useIdleTimeout(onIdle: () => void, enabled: boolean, idleMs = IDLE_MS) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    function reset() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(onIdle, idleMs);
    }

    reset();
    EVENTS.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));

    return () => {
      if (timer.current) clearTimeout(timer.current);
      EVENTS.forEach((ev) => window.removeEventListener(ev, reset));
    };
  }, [enabled, idleMs, onIdle]);
}
