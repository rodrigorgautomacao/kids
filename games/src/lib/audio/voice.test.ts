// cleanForSpeech converte texto de tela em fala para a narração.
// Este teste garante que referências NAA e emojis viram algo falável.
//
// A segunda parte trava a decisão do dono (2026-09-30): a narração da jornada
// é SEMPRE masculina. Antes, Francisca/Thalita/Luciana (femininas) ganhavam da
// voz masculina e a mesma fase falava em duas vozes.

import { afterEach, describe, expect, it } from 'vitest';
import { cleanForSpeech, refreshVoice } from './voice';

function voz(nome: string, lang = 'pt-BR'): SpeechSynthesisVoice {
  return { name: nome, voiceURI: nome, lang, default: false, localService: true } as SpeechSynthesisVoice;
}

/** Instala um `speechSynthesis` falso com a lista de vozes do aparelho. */
function comVozes(nomes: string[]): void {
  (window as unknown as { speechSynthesis: unknown }).speechSynthesis = {
    getVoices: () => nomes.map((n) => voz(n)),
  };
}

afterEach(() => {
  delete (window as unknown as { speechSynthesis?: unknown }).speechSynthesis;
});

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
describe('escolha da voz (só masculina)', () => {
  it('nunca escolhe voz de mulher, mesmo com vozes femininas "natural"', () => {
    comVozes([
      'Microsoft Francisca Online (Natural) - Portuguese (Brazil)',
      'Microsoft Thalita Online (Natural) - Portuguese (Brazil)',
      'Microsoft Maria Online (Natural) - Portuguese (Brazil)',
      'Microsoft Elza Online (Natural) - Portuguese (Brazil)',
      'Luciana',
      'Microsoft Antonio Online (Natural) - Portuguese (Brazil)',
    ]);
    const v = refreshVoice();
    expect(v).not.toBeNull();
    expect(v!.name).not.toMatch(/francisca|thalita|maria|elza|luciana/i);
  });

  it('prefere voz masculina neural quando existe', () => {
    comVozes(['Microsoft Antonio Online (Natural) - Portuguese (Brazil)', 'Daniel']);
    expect(refreshVoice()!.name).toMatch(/antonio/i);
  });

  it('descarta nomes femininos mesmo sem rede Microsoft', () => {
    comVozes(['Maria', 'Patricia', 'Juliana', 'Rodrigo']);
    expect(refreshVoice()!.name).toMatch(/rodrigo/i);
  });

  it('ignora voz que não é pt-BR', () => {
    comVozes(['Microsoft Antonio Online (Natural) - Portuguese (Brazil)', 'Daniel']);
    expect(refreshVoice()!.name).not.toMatch(/english/i);
  });
});
