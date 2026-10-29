// Modo Sala de Jogos (fliperama do FestKids).
//
// Por que existe: no evento o jogo roda em tablet/quiosque, com criança
// trocando a cada partida e ninguém por perto para "instalar o PWA" ou voltar
// ao menu. O modo sala:
//   · entra direto no letreiro de atração (toque para jogar),
//   · NUNCA mostra o gate de instalação (senão o tablet do evento trava),
//   · volta sozinho para o letreiro quando a criança abandona o aparelho.
//
// Liga por URL (`?arcade=1`, `?sala`, `?festkids`) e fica salvo no aparelho.
// Desliga com `?arcade=0`. Também há saída discreta no rodapé do Hub (3 toques).

import { useEffect, useRef } from 'react';

const ARCADE_KEY = 'kids-arcade-mode-v1';

const OFF_VALUES = new Set(['0', 'off', 'false', 'nao', 'não', 'no']);

function readQuery(): boolean | null {
  if (typeof window === 'undefined') return null;
  try {
    const q = new URLSearchParams(window.location.search);
    for (const param of ['arcade', 'sala', 'festkids', 'quiosque', 'kiosk']) {
      if (!q.has(param)) continue;
      const raw = (q.get(param) ?? '').toLowerCase();
      return !OFF_VALUES.has(raw);
    }
  } catch {
    /* URL estranha: segue o que estiver salvo */
  }
  return null;
}

/** Lê o modo sala da URL (e persiste) ou do armazenamento. */
export function detectArcadeMode(): boolean {
  const fromQuery = readQuery();
  if (fromQuery !== null) {
    enableArcadeMode(fromQuery);
    return fromQuery;
  }
  try {
    return localStorage.getItem(ARCADE_KEY) === '1';
  } catch {
    return false;
  }
}

export function enableArcadeMode(on = true) {
  try {
    localStorage.setItem(ARCADE_KEY, on ? '1' : '0');
  } catch {
    /* armazenamento indisponível: o modo vale só para esta sessão */
  }
}

/** Constante de módulo: a URL não muda durante a vida do app. */
export const ARCADE_MODE = detectArcadeMode();

/**
 * Chama `onIdle` depois de `timeoutMs` sem toque/tecla/roda.
 *
 * `pointerdown` (e não o movimento do ponteiro) de propósito: o cursor parado
 * em cima da tela não deve manter o quiosque acordado — só uma intenção real
 * de jogar (ou uma tecla, que também é intenção).
 * Também reinicia quando a aba volta ao foco, para o retorno não disparar
 * imediatamente num tablet que ficou bloqueado.
 */
export function useIdle(timeoutMs: number, onIdle: () => void, enabled = true) {
  const cb = useRef(onIdle);
  cb.current = onIdle;

  useEffect(() => {
    if (!enabled || timeoutMs <= 0 || typeof window === 'undefined') return;
    let timer = 0;

    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => cb.current(), timeoutMs);
    };

    reset();
    window.addEventListener('pointerdown', reset, { passive: true });
    window.addEventListener('keydown', reset);
    window.addEventListener('wheel', reset, { passive: true });
    window.addEventListener('focus', reset);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', reset);
      window.removeEventListener('keydown', reset);
      window.removeEventListener('wheel', reset);
      window.removeEventListener('focus', reset);
    };
  }, [timeoutMs, enabled]);
}

/** Tempo sem toque para o letreiro voltar a chamar (quiosque). */
export const ATTRACT_AFTER_MS = 75_000;
/** Tempo sem toque dentro do jogo para devolver ao menu. */
export const RETURN_AFTER_MS = 240_000;

type WakeLockSentinel = { release: () => Promise<void> };
type WakeLockNavigator = Navigator & {
  wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinel> };
};

/**
 * Mantém a tela acesa no quiosque (Screen Wake Lock).
 *
 * Sem isto, o tablet do evento apaga no meio da fila e a criança precisa de um
 * adulto para acordar. O navegador pode negar (bateria fraca, aba oculta); o
 * app segue funcionando — só não segura a tela.
 */
export function useWakeLock(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined') return;
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      try {
        const api = (navigator as WakeLockNavigator).wakeLock;
        if (!api) return;
        sentinel = await api.request('screen');
        if (cancelled) {
          void sentinel.release().catch(() => undefined);
          sentinel = null;
        }
      } catch {
        /* sem permissão, bateria fraca ou navegador sem suporte */
      }
    };

    void request();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void request();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void sentinel?.release().catch(() => undefined);
    };
  }, [enabled]);
}
