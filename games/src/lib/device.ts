import { useEffect, useState } from 'react';

/** `true` quando o app está rodando instalado (PWA na tela de início). */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    return window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches || iosStandalone;
  } catch {
    return false;
  }
}

/** iPhone/iPad — muda a dica de instalação (Compartilhar → Adicionar à Tela). */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document);
}

/** `true` em aparelho de toque pequeno (celular), não em tablet/desktop. */
export function isPhone(): boolean {
  if (typeof window === 'undefined') return false;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const shortSide = Math.min(window.screen?.width ?? window.innerWidth, window.screen?.height ?? window.innerHeight);
  return coarse && shortSide <= 600;
}

/** Hook genérico de media query (seguro no SSR/testes). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    try {
      return window.matchMedia(query).matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      const mq = window.matchMedia(query);
      const onChange = () => setMatches(mq.matches);
      onChange();
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    } catch {
      return;
    }
  }, [query]);

  return matches;
}

/**
 * `true` quando é celular (iPhone/Android) em pé.
 *
 * Nos jogos de mundo (Aventura) e nos quizzes isso importa: em pé a área útil
 * fica estreita demais. Em vez de girar a câmera, avisamos para virar o
 * aparelho (ADR-002, D1) — tablet e desktop não são afetados.
 */
export function useIsPortraitPhone(): boolean {
  const portrait = useMediaQuery('(orientation: portrait)');
  const [phone, setPhone] = useState(isPhone);

  useEffect(() => {
    const update = () => setPhone(isPhone());
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return portrait && phone;
}
