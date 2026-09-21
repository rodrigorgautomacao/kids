// Coleção de figurinhas das cenas-teatro da Aventura (Fase 8).
//
// Cada cena do catálogo (`data/scenes.ts`) tem uma figurinha. Colecionar é
// puramente um GANHO de coleção — nada é bloqueado por falta de figurinha
// (tom de graça: coleção motiva, nunca exclui).
//
// Chave: `kids-scenes-v1` → JSON array de ids colecionados.

const KEY = 'kids-scenes-v1';

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

/** Notifica quando a coleção muda (Hub e livrinho reagem). Retorna o cancelamento. */
export function subscribeStickers(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function loadStickers(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === 'string'));
  } catch {
    return new Set();
  }
}

export function hasSticker(id: string): boolean {
  return loadStickers().has(id);
}

/** Marca uma figurinha como colecionada (idempotente). Retorna o novo conjunto. */
export function collectSticker(id: string): Set<string> {
  const next = loadStickers();
  if (next.has(id)) return next;
  next.add(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...next]));
  } catch {
    /* armazenamento indisponível */
  }
  emit();
  return next;
}

/** Quantas figurinhas já foram colecionadas. */
export function stickerCount(): number {
  return loadStickers().size;
}