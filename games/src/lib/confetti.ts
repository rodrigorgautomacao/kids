/** Número de peças de confete conforme o aparelho (evita travar no clímax). */
export function confettiPieces(): number {
  if (typeof navigator === 'undefined') return 200;

  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = nav.deviceMemory;
  const cores = nav.hardwareConcurrency ?? 4;
  const smallScreen = typeof window !== 'undefined' && Math.min(window.innerWidth, window.innerHeight) < 500;

  if (memory !== undefined && memory <= 2) return 80;
  if (cores <= 2) return 80;
  if (cores <= 4) return 140;
  if (smallScreen) return 160;
  return 280;
}

/** Gravidade proporcional: em tela pequena as peças caem mais devagar. */
export function confettiGravity(): number {
  if (typeof window === 'undefined') return 0.14;
  return Math.min(window.innerWidth, window.innerHeight) < 500 ? 0.1 : 0.14;
}
