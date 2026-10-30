import { FAIXAS, type Faixa } from '../data/games';

/**
 * Rótulo curtíssimo da faixa: só os números, com meia-risca ("3–4").
 *
 * O casco do fliperama não usa mais os nomes (Pequeninos, Exploradores…):
 * na tela de seleção a criança reconhece a própria idade antes de saber ler.
 */
export function faixaNumero(id: Faixa): string {
  return id.replace('-', '–');
}

/** A faixa existe no catálogo? (usado ao ler a rota `#jogos/3-4`). */
export function ehFaixa(value: string | null | undefined): value is Faixa {
  return FAIXAS.some((f) => f.id === value);
}
