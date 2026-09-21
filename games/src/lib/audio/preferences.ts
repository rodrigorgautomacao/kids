// Preferências de som, persistidas por aparelho (localStorage).
//
// Três chaves independentes:
//   kids-sound-muted-v1  → efeitos  (nome antigo, mantido para não perder a escolha)
//   kids-music-muted-v1  → música
//   kids-voice-muted-v1  → narração (voz)
//
// `subscribe` existe porque o mudo é alternado em telas diferentes (Hub e
// GameShell) e precisa refletir imediatamente nas outras.

const SFX_KEY = 'kids-sound-muted-v1';
const MUSIC_KEY = 'kids-music-muted-v1';
const VOICE_KEY = 'kids-voice-muted-v1';

type Listener = () => void;
const listeners = new Set<Listener>();

function read(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function write(key: string, value: boolean) {
  try {
    localStorage.setItem(key, value ? '1' : '0');
  } catch {
    /* modo privado: só não persiste */
  }
}

function emit() {
  for (const listener of listeners) listener();
}

/** Notifica quando qualquer preferência de som muda. Devolve a função de cancelar. */
export function subscribeSoundPrefs(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Efeitos sonoros. */
export function isSfxMuted(): boolean {
  return read(SFX_KEY);
}

export function setSfxMuted(muted: boolean) {
  write(SFX_KEY, muted);
  emit();
}

/** Música de fundo. */
export function isMusicMuted(): boolean {
  return read(MUSIC_KEY);
}

export function setMusicMuted(muted: boolean) {
  write(MUSIC_KEY, muted);
  emit();
}

/** Narração (voz). */
export function isVoiceMuted(): boolean {
  return read(VOICE_KEY);
}

export function setVoiceMuted(muted: boolean) {
  write(VOICE_KEY, muted);
  emit();
}

/** Tudo desligado (efeitos + música + voz) — é o que o botão único alterna. */
export function isAllMuted(): boolean {
  return isSfxMuted() && isMusicMuted() && isVoiceMuted();
}

export function setAllMuted(muted: boolean) {
  write(SFX_KEY, muted);
  write(MUSIC_KEY, muted);
  write(VOICE_KEY, muted);
  emit();
}
