import { beforeEach, describe, expect, it } from 'vitest';
import { detectArcadeMode, enableArcadeMode } from './arcade';

/** Troca a URL sem recarregar (jsdom não navega de verdade). */
function setUrl(search: string) {
  window.history.replaceState({}, '', `/kids/${search}`);
}

describe('modo sala (fliperama do FestKids)', () => {
  beforeEach(() => {
    localStorage.clear();
    setUrl('');
  });

  it('não liga sozinho no uso normal', () => {
    expect(detectArcadeMode()).toBe(false);
  });

  it('liga com ?arcade=1 e lembra no aparelho', () => {
    setUrl('?arcade=1');
    expect(detectArcadeMode()).toBe(true);

    setUrl('');
    expect(detectArcadeMode()).toBe(true);
  });

  it('desliga com ?arcade=0 (mesmo já estando ligado)', () => {
    enableArcadeMode(true);
    setUrl('?arcade=0');

    expect(detectArcadeMode()).toBe(false);
    setUrl('');
    expect(detectArcadeMode()).toBe(false);
  });

  it('aceita os apelidos do evento: ?sala e ?festkids', () => {
    setUrl('?sala');
    expect(detectArcadeMode()).toBe(true);

    localStorage.clear();
    setUrl('?festkids=1');
    expect(detectArcadeMode()).toBe(true);
  });
});
