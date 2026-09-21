// cleanForSpeech converte texto de tela em fala para a narração.
// Este teste garante que referências NAA e emojis viram algo falável.

import { describe, expect, it } from 'vitest';
import { cleanForSpeech } from './voice';

describe('cleanForSpeech', () => {
  it('troca cap.vers por "versículo"', () => {
    expect(cleanForSpeech('Gênesis 6.14 (NAA)')).toBe('Gênesis 6 versículo 14');
    expect(cleanForSpeech('2 Reis 2.11 (NAA)')).toBe('2 Reis 2 versículo 11');
  });

  it('remove a marcação (NAA) sem tocar no texto', () => {
    expect(cleanForSpeech('Noé fez a arca (NAA)')).toBe('Noé fez a arca');
  });

  it('remove emojis', () => {
    expect(cleanForSpeech('Vamos 🚢!')).toBe('Vamos !');
    expect(cleanForSpeech('🧺 Arca 🕊️ (NAA)')).toBe('Arca');
  });

  it('colapsa espaços repetidos', () => {
    expect(cleanForSpeech('a     b')).toBe('a b');
  });

  it('deixa texto simples intacto', () => {
    expect(cleanForSpeech('Olá, pequenino!')).toBe('Olá, pequenino!');
  });
});