// Preferências de jogo que não são som nem progresso:
//  · modo pequeninos (pré-leitores): menos opções, letras maiores, narração sempre
//  · já jogou alguma vez (controla o onboarding sem texto)
//  · estado do mundo da Aventura (continuar de onde parou)

const SMALL_KIDS_KEY = 'kids-small-kids-v1';
const PLAYED_KEY = 'kids-played-v1';
const WORLD_KEY = 'kids-aventura-world-v1';

/** Estado do mundo da Aventura — o suficiente para "continuar de onde parei". */
export interface WorldState {
  x: number;
  y: number;
  /** índices coletados (0-based) */
  picks: number[];
  /** ids das histórias concluídas */
  done: string[];
  score: number;
  /** timestamp da gravação (descarta estado muito velho) */
  savedAt: number;
}

/* ---------------------------- modo pequeninos ---------------------------- */

export function isSmallKidsMode(): boolean {
  try {
    return localStorage.getItem(SMALL_KIDS_KEY) === '1';
  } catch {
    return false;
  }
}

export function setSmallKidsMode(on: boolean) {
  try {
    localStorage.setItem(SMALL_KIDS_KEY, on ? '1' : '0');
  } catch {
    /* armazenamento indisponível */
  }
}

/* ------------------------------- onboarding ------------------------------ */

/** `true` na primeira vez que a criança entra (mostra a mãozinha, sem texto). */
export function isFirstTime(): boolean {
  try {
    return localStorage.getItem(PLAYED_KEY) !== '1';
  } catch {
    return false;
  }
}

export function markPlayed() {
  try {
    localStorage.setItem(PLAYED_KEY, '1');
  } catch {
    /* ignore */
  }
}

/* --------------------------- mundo da Aventura --------------------------- */

/** Descartar depois disso evita "ressuscitar" um jogo esquecido há meses. */
const WORLD_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function loadWorld(): WorldState | null {
  try {
    const raw = localStorage.getItem(WORLD_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorldState;
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.x !== 'number' || typeof parsed.y !== 'number') return null;
    if (typeof parsed.savedAt !== 'number') return null;
    if (Date.now() - parsed.savedAt > WORLD_MAX_AGE_MS) return null;
    return {
      x: parsed.x,
      y: parsed.y,
      picks: Array.isArray(parsed.picks) ? parsed.picks : [],
      done: Array.isArray(parsed.done) ? parsed.done : [],
      score: typeof parsed.score === 'number' ? parsed.score : 0,
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}

export function saveWorld(state: Omit<WorldState, 'savedAt'>) {
  try {
    localStorage.setItem(WORLD_KEY, JSON.stringify({ ...state, savedAt: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function clearWorld() {
  try {
    localStorage.removeItem(WORLD_KEY);
  } catch {
    /* ignore */
  }
}
