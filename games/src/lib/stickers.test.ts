// Coleção de figurinhas: guardada no localStorage (LGPD-first, zero servidor).

import { beforeEach, describe, expect, it } from 'vitest';
import { collectSticker, hasSticker, loadStickers, stickerCount, subscribeStickers } from './stickers';

const STICKER = 'noe-arca';

beforeEach(() => {
  localStorage.clear();
});

describe('stickers', () => {
  it('começa vazio e conta 0', () => {
    expect(loadStickers().size).toBe(0);
    expect(stickerCount()).toBe(0);
    expect(hasSticker(STICKER)).toBe(false);
  });

  it('coleciona e persiste', () => {
    collectSticker(STICKER);
    expect(hasSticker(STICKER)).toBe(true);
    expect(stickerCount()).toBe(1);
    // persistiu no localStorage
    expect(JSON.parse(localStorage.getItem('kids-scenes-v1') ?? '[]')).toContain(STICKER);
  });

  it('é idempotente (não conta duas vezes)', () => {
    collectSticker(STICKER);
    collectSticker(STICKER);
    expect(stickerCount()).toBe(1);
  });

  it('notifica assinantes', () => {
    let n = 0;
    const cancel = subscribeStickers(() => n++);
    collectSticker(STICKER);
    expect(n).toBe(1);
    cancel();
    collectSticker('jonas-baleia');
    expect(n).toBe(1); // cancelou
  });
});