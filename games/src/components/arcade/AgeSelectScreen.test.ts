import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import AgeSelectScreen from './AgeSelectScreen';

const html = renderToStaticMarkup(
  createElement(AgeSelectScreen, { onSelect: () => undefined, onBack: () => undefined }),
);

describe('AgeSelectScreen', () => {
  it('mostra as três faixas etárias só pelos números', () => {
    expect(html).toContain('3–4');
    expect(html).toContain('5–6');
    expect(html).toContain('7–9');
  });

  it('não expõe os nomes das faixas', () => {
    for (const nome of ['Pequeninos', 'Exploradores', 'Íntimos']) {
      expect(html).not.toContain(nome);
    }
  });

  it('é uma escolha única com três blocos e um caminho de volta', () => {
    expect(html).toContain('role="radiogroup"');
    expect(html.match(/role="radio"/g)).toHaveLength(3);
    expect(html).toContain('Voltar');
  });
});
