// Render de verdade da tela do "Devocional da Semana" — o teste que **dirige** o
// jogo como a criança (biblioteca → capa → dia → marcar → próximo → apagar).
//
// POR QUE ISTO EXISTE (e não é o teste do dado)
// `data/devocionalSemanal.test.ts` trava a CURADORIA (6 dias, `ref` presente,
// `versiculo.texto` vazio, ordem, ISO). Este trava a TELHA: que as três telas
// renderizam sem quebrar, que o texto bíblico **não aparece no DOM** (a regra do
// ADR-001 virada em asserção), que marcar lido leva ao próximo dia e que apagar
// o histórico pede consentimento. O primeiro bug real da tela (ir para o dia
// errado depois de marcar) foi achado aqui, não no typecheck.
//
// 🔒 Vitest deste repo só coleta `src/**/*.test.ts` (não `.tsx`), então o JSX vem
// por `createElement` — sem JSX, sem arquivo extra, sem config nova.
// O `act` vem do próprio React 18.3 (o de `react-dom/test-utils` está deprecado).

import { createElement as h, act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, describe, expect, it } from 'vitest';
import GameDevocionalDaSemana from './GameDevocionalDaSemana';

// O `act` do React 18 exige avisar que o ambiente é de teste (silencia o warning).
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Cria a tela montada e devolve a raiz para consulta. */
function montar(id: string): { raiz: HTMLElement; root: Root } {
  const anterior = document.getElementById(id);
  if (anterior) anterior.remove();
  const raiz = document.createElement('div');
  raiz.id = id;
  document.body.appendChild(raiz);
  const root = createRoot(raiz);
  act(() => root.render(h(GameDevocionalDaSemana, { onExit: () => {} })));
  return { raiz, root };
}

/** Primeiro botão cujo texto contém `texto` e que não está desabilitado. */
function porTexto(raiz: HTMLElement, texto: string): HTMLButtonElement {
  const achado = Array.from(raiz.querySelectorAll('button')).find(
    (b) => (b.textContent ?? '').includes(texto) && !b.disabled,
  );
  if (!achado) throw new Error(`botão não achado: "${texto}"`);
  return achado as HTMLButtonElement;
}

/** jsdom não tem `<canvas>`: com "reduzir movimento" ligado o confete nem monta
 *  (mesmo caminho de quem pediu menos animação no aparelho). */
function semMovimento() {
  window.matchMedia = ((q: string) => ({
    matches: true,
    media: q,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

const tela = (raiz: HTMLElement): string => raiz.textContent ?? '';

describe('Devocional da Semana — a tela funciona de ponta a ponta', () => {
  beforeEach(() => localStorage.clear());

  it('entra pela biblioteca e abre a capa da semana', () => {
    const { raiz } = montar('devocional-1');
    expect(tela(raiz)).toContain('Esta semana');
    expect(tela(raiz)).toContain('Gratidão, cuidado e amor');
    expect(tela(raiz)).toContain('28 de set – 3 de out');
    expect(tela(raiz)).toContain('Começar');
    expect(tela(raiz)).toContain('Por semana');
    expect(tela(raiz)).toContain('Por tema');

    act(() => porTexto(raiz, 'Começar').click());
    expect(tela(raiz)).toContain('Salmos 119.160'); // versículo da capa
    expect(tela(raiz)).toContain('Os 6 dias da semana');
    expect(tela(raiz)).toContain('Ler segunda-feira');
  });

  it('marcar lido leva ao PRÓXIMO dia não lido (e não volta pro começo)', () => {
    const { raiz } = montar('devocional-2');
    act(() => porTexto(raiz, 'Começar').click());
    act(() => porTexto(raiz, 'Terça').click());
    expect(tela(raiz)).toContain('Para que serve isso');

    act(() => porTexto(raiz, 'Marcar como lido').click());
    // terça lida → o próximo não lido é quarta (o erro seria voltar para segunda)
    expect(tela(raiz)).toContain('Deus se importa');
    expect(tela(raiz)).not.toContain('Gratidão e adoração');
    expect(localStorage.getItem('kids-leitura-v1')).toContain('2026-09-28/ter');
  });

  it('🔒 o texto bíblico nunca aparece na tela — só a referência', () => {
    const { raiz } = montar('devocional-3');
    act(() => porTexto(raiz, 'Começar').click());
    for (const dia of ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']) {
      act(() => porTexto(raiz, dia).click());
      expect(tela(raiz)).toContain('Abra a Bíblia em casa e leia');
      expect(tela(raiz)).toContain('Mensagem de hoje');
      // a redação da NAA nunca é renderizada (só o endereço)
      expect(tela(raiz)).not.toContain('MUITAS VEZES');
      act(() => porTexto(raiz, 'Capa da semana').click());
    }
  });

  it('a caixa "Eu pratiquei" marca o dia e a marca fica quando volta nele', () => {
    const { raiz } = montar('devocional-4');
    act(() => porTexto(raiz, 'Começar').click());
    act(() => porTexto(raiz, 'Quarta').click());
    expect(tela(raiz)).toContain('PRATICANDO');
    expect(tela(raiz)).toContain('Eu pratiquei');

    act(() => porTexto(raiz, 'Eu pratiquei').click());
    expect(tela(raiz)).toContain('Você praticou!');
    act(() => porTexto(raiz, 'Marcar como lido').click());
    expect(localStorage.getItem('kids-leitura-v1')).toContain('praticado');

    act(() => porTexto(raiz, 'Capa da semana').click());
    act(() => porTexto(raiz, 'Quarta').click());
    expect(tela(raiz)).toContain('Você praticou!');
    expect(tela(raiz)).toContain('Você já leu este dia');
  });

  it('terça não ganha bloco PRATICANDO (o material não tem) — nem a tela inventa', () => {
    const { raiz } = montar('devocional-5');
    act(() => porTexto(raiz, 'Começar').click());
    act(() => porTexto(raiz, 'Terça').click());
    expect(tela(raiz)).not.toContain('PRATICANDO');
    expect(tela(raiz)).not.toContain('Eu pratiquei');
    // o caixote extra do dia aparece com título, texto e narração
    expect(tela(raiz)).toContain('Para que serve tudo isso?');
    expect(raiz.querySelectorAll('button[aria-label^="Ouvir"]').length).toBeGreaterThanOrEqual(2);
  });

  it('ler os 6 dias volta para a capa com o resumo da semana', () => {
    semMovimento();
    const { raiz } = montar('devocional-6');
    act(() => porTexto(raiz, 'Começar').click());
    const seis = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    for (let i = 0; i < seis.length; i++) {
      if (i > 0) act(() => porTexto(raiz, 'Capa da semana').click());
      act(() => porTexto(raiz, seis[i]).click());
      expect(tela(raiz)).toContain(seis[i]);
      act(() => porTexto(raiz, 'Marcar como lido').click());
    }
    expect(tela(raiz)).toContain('Você leu os 6 dias desta semana!');
    expect((tela(raiz).match(/✅ lido/g) ?? []).length).toBe(6);

    act(() => porTexto(raiz, 'Voltar à biblioteca').click());
    expect(tela(raiz)).toContain('Continuar (6/6 dias)');
    expect(tela(raiz)).not.toContain('Você leu os 6 dias desta semana!');
  });

  it('apagar o histórico pede consentimento e só sai se a criança confirmar', () => {
    const { raiz } = montar('devocional-7');
    act(() => porTexto(raiz, 'Começar').click());
    act(() => porTexto(raiz, 'Segunda').click());
    act(() => porTexto(raiz, 'Marcar como lido').click());
    act(() => porTexto(raiz, 'Capa da semana').click());
    act(() => porTexto(raiz, 'Voltar à biblioteca').click());
    expect(tela(raiz)).toContain('Continuar (1/6 dias)');

    act(() => porTexto(raiz, 'Recomeçar').click());
    expect(tela(raiz)).toContain('Apagar o que você já leu?');
    act(() => porTexto(raiz, 'Não, quero guardar').click());
    expect(tela(raiz)).not.toContain('Apagar o que você já leu?');
    expect(localStorage.getItem('kids-leitura-v1')).toContain('2026-09-28/seg');

    act(() => porTexto(raiz, 'Recomeçar').click());
    act(() => porTexto(raiz, 'Sim, apagar').click());
    expect(localStorage.getItem('kids-leitura-v1')).not.toContain('2026-09-28/seg');
    expect(tela(raiz)).toContain('Começar');
  });
});