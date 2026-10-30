import type { Faixa } from '../../data/games';
import { faixaNumero } from '../../lib/faixa';

/**
 * "3–4" na fonte pixel. A meia-risca do Press Start 2P é desenhada na linha de
 * base (parece um "_"), então o traço sobe para a meia-altura — sem trocar o
 * texto lido por leitor de tela.
 */
export default function FaixaNumero({ faixa }: { faixa: Faixa }) {
  const texto = faixaNumero(faixa);
  const [de, ate] = texto.split('–');
  if (!ate) return <>{texto}</>;
  return (
    <>
      {de}
      <span className="relative -top-[0.28em]">–</span>
      {ate}
    </>
  );
}
