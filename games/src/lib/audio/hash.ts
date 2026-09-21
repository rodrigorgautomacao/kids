// Hash estável de texto (FNV-1a 32 bits) — usado para nomear os áudios
// pré-gerados. O MESMO algoritmo roda no script de geração (`scripts/gen-voice.mjs`)
// e no app (`lib/audio/voice.ts`), então a chave sempre bate.
export function hashText(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}
