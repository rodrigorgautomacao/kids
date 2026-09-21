import { useEffect, useState } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** `true` quando o sistema pede menos movimento (ler só no cliente). */
export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
  } catch {
    return false;
  }
}

/** Acompanha a preferência do sistema em tempo real (muda se o usuário mudar). */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    try {
      const mq = window.matchMedia(REDUCED_MOTION_QUERY);
      const onChange = () => setReduced(mq.matches);
      onChange();
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    } catch {
      return;
    }
  }, []);

  return reduced;
}
