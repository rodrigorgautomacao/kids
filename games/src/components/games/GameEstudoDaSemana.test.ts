// Teste de fluxo da tela "Estudo da Semana" (`GameEstudoDaSemana.tsx`).
//
// Sem biblioteca de teste de componente no repo: renderiza com
// `react-dom/client` (já é dependência) e dirige a tela por cliques. Cobre as
// invariantes que a tela promete e que o teste de dados NÃO pega:
//
//   · a biblioteca mostra o tema do mês PRIMEIRO e as semanas 1..4 depois;
//   · abrir a lição marca 'lido' e mostra referência + "abra a Bíblia";
//   · 🔒 ERRAR A PERGUNTA NÃO TRAVA E NÃO REPROVA: a explicação aparece, a
//     alternativa fica marcada como tentativa e o botão continua clicável;
//   · acertar realça a certa e só aí a estrela fecha a lição (`concluir`);
//   · a tela de conclusão leva à PRÓXIMA lição da lista, na ordem de leitura.
//
// As contagens de texto do material são soltas de propósito: quando outro mês
// entrar, este teste continua valendo sem ajuste.

import { act, createElement as h } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, describe, expect, it } from 'vitest';
import { MESES_ESTUDO, semanaDoMes } from '../../data/estudoSemana';
import GameEstudoDaSemana from './GameEstudoDaSemana';

/** O mesmo id que a tela grava no histórico (`lib/leitura`). */
const GAME_ID = 'estudo-da-semana';
const MES = MESES_ESTUDO[0].id;

beforeEach(() => {
  localStorage.clear();
  (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

/** Monta a tela e devolve a raiz do DOM para dirigir por cliques. */
async function montar(): Promise<{ caixa: HTMLElement; root: Root }> {
  const caixa = document.createElement('div');
  document.body.appendChild(caixa);
  let root!: Root;
  await act(async () => {
    root = createRoot(caixa);
    root.render(h(GameEstudoDaSemana, { onExit: () => {} }));
  });
  return { caixa, root };
}

function botao(caixa: HTMLElement, texto: string): HTMLButtonElement {
  const alvo = Array.from(caixa.querySelectorAll('button')).find((b) =>
    (b.textContent ?? '').includes(texto),
  );
  if (!alvo) throw new Error(`botão não encontrado: "${texto}"`);
  return alvo;
}

async function clicar(caixa: HTMLElement, texto: string): Promise<void> {
  await act(async () => {
    botao(caixa, texto).click();
  });
}

function texto(caixa: HTMLElement): string {
  return caixa.textContent ?? '';
}

describe('Estudo da Semana — biblioteca', () => {
  it('lista o tema do mês primeiro, as semanas 1..4 depois, com referência e mês', async () => {
    const { caixa, root } = await montar();

    // o tema do mês (semana 0) vem antes de qualquer semana
    const cartoes = Array.from(caixa.querySelectorAll('ul > li > button')).map(
      (b) => b.textContent ?? '',
    );
    expect(cartoes.length).toBeGreaterThanOrEqual(4);
    expect(cartoes[0]).toContain('Tema do mês');
    expect(cartoes[0]).toContain(semanaDoMes(MES, 0, 'baby')?.titulo ?? '');
    expect(cartoes[1]).toContain('Semana 1 de outubro');
    expect(cartoes[1]).toContain(semanaDoMes(MES, 1, 'baby')?.titulo ?? '');
    expect(cartoes[cartoes.length - 1]).toContain('Semana 4 de outubro');

    expect(texto(caixa)).toContain('Por semana');
    expect(texto(caixa)).toContain('Por tema');
    expect(texto(caixa)).toContain('Outubro 2026');
    // referência principal visível + o convite a abrir a Bíblia
    expect(texto(caixa)).toContain('Gênesis 1.1');
    expect(texto(caixa)).toContain('Recomeçar');
    // crédito da versão bíblica (ADR-001)
    expect(texto(caixa)).toContain('Nova Almeida Atualizada');
    // o filtro "por tema" mostra o mesmo material agrupado
    await clicar(caixa, 'Por tema');
    expect(texto(caixa)).toContain('Sola Scriptura');

    await act(async () => {
      root.unmount();
    });
  });

  it('trocar a idade troca o material e a escolha fica salva para a próxima vez', async () => {
    const { caixa, root } = await montar();
    const seteANos = semanaDoMes(MES, 1, '7-9')?.titulo ?? '';
    expect(texto(caixa)).not.toContain(seteANos);

    await clicar(caixa, 'Estudante');
    expect(texto(caixa)).toContain(seteANos);

    const { caixa: outra, root: root2 } = await montar();
    expect(texto(outra)).toContain(seteANos); // faixa salva
    await act(async () => {
      root.unmount();
      root2.unmount();
    });
  });

it('"Recomeçar" só fica disponível com progresso e a confirmação avisa antes de apagar', async () => {
    const { caixa, root } = await montar();
    expect(texto(caixa)).not.toContain('Apagar o que você já estudou?');

    // sem nada guardado, o botão nem oferece a conversa
    expect(botao(caixa, 'Recomeçar').disabled).toBe(true);

    // ler uma lição cria progresso
    await clicar(caixa, semanaDoMes(MES, 1, 'baby')?.titulo ?? '');
    await clicar(caixa, '← Voltar à biblioteca');
    expect(botao(caixa, 'Recomeçar').disabled).toBe(false);

    await clicar(caixa, 'Recomeçar');
    expect(texto(caixa)).toContain('Apagar o que você já estudou?');
    // "não" fecha o diálogo e preserva o progresso
    await clicar(caixa, 'Não, voltar');
    expect(texto(caixa)).not.toContain('Apagar o que você já estudou?');
    expect(texto(caixa)).toContain('Semana 1 de outubro');

    // "sim" apaga e a lista volta ao zero
    await clicar(caixa, 'Recomeçar');
    await clicar(caixa, 'Sim, apagar e recomeçar');
    expect(texto(caixa)).toContain('0/5 lições lidas');
    expect(texto(caixa)).toContain('0 ⭐ de 15');

    await act(async () => {
      root.unmount();
    });
  });
});

describe('Estudo da Semana — a lição', () => {
  it('abre na ordem: referência → história → ideia → pergunta → praticando', async () => {
    const { caixa, root } = await montar();
    const licao = semanaDoMes(MES, 1, 'baby')!;
    await clicar(caixa, licao.titulo);

    const html = caixa.innerHTML;
    expect(html.indexOf('Abra a Bíblia em casa e leia')).toBeLessThan(
      html.indexOf(licao.historia.slice(0, 20)),
    );
    expect(html.indexOf(licao.historia.slice(0, 20))).toBeLessThan(html.indexOf(licao.ideia));
    expect(html.indexOf(licao.ideia)).toBeLessThan(html.indexOf(licao.pergunta.enunciado));
    expect(html.indexOf(licao.pergunta.enunciado)).toBeLessThan(html.indexOf('Praticando'));

    // referência (nunca o texto bíblico: só a ref) + a ideia em destaque
    expect(texto(caixa)).toContain(licao.referencias[0].ref);
    expect(texto(caixa)).not.toContain('No princípio, criou Deus');
    // faixa baby: o aviso de que o adulto lê em voz alta
    expect(texto(caixa)).toContain('Um adulto lê esta lição em voz alta');
    // marcar praticado é irreversível e visível
    await clicar(caixa, 'Eu pratiquei');
    expect(texto(caixa)).toContain('Eu pratiquei!');
    expect(JSON.parse(localStorage.getItem('kids-leitura-v1') ?? '{}')[`${GAME_ID}/${licao.id}`].marcas)
      .toContain('praticado');

    await act(async () => {
      root.unmount();
    });
  });

  it('🔒 errar revela a explicação, NÃO trava e permite tocar de novo', async () => {
    const { caixa, root } = await montar();
    const licao = semanaDoMes(MES, 1, 'baby')!;
    const p = licao.pergunta;
    const errada = p.alternativas[(p.correta + 1) % 3];
    await clicar(caixa, licao.titulo);

    expect(texto(caixa)).not.toContain(p.explicacao);
    await clicar(caixa, errada);

    // a explicação ensina e a alternativa fica marcada como tentativa
    expect(texto(caixa)).toContain(p.explicacao);
    expect(texto(caixa)).toContain('Tente de novo');
    // nada de reprovação: a pergunta continua aberta e a lição segue
    expect(texto(caixa)).toContain('Continuar');
    expect(texto(caixa)).toContain('Perguntinha');

    // insistir na mesma alternativa não trava a tela
    await clicar(caixa, errada);
    await clicar(caixa, p.alternativas[(p.correta + 2) % 3]);
    expect(texto(caixa)).toContain(p.explicacao);

    // e dá para acertar depois
    await clicar(caixa, p.alternativas[p.correta]);
    expect(texto(caixa)).toContain('Isso mesmo!');

    await act(async () => {
      root.unmount();
    });
  });
});

describe('Estudo da Semana — conclusão', () => {
  it('acertou sem errar: 3 estrelas, a ideia fica na tela e vai para a próxima lição', async () => {
    const { caixa, root } = await montar();
    const licao = semanaDoMes(MES, 1, 'baby')!;
    await clicar(caixa, licao.titulo);
    await clicar(caixa, licao.pergunta.alternativas[licao.pergunta.correta]);
    await clicar(caixa, 'Continuar');

    expect(texto(caixa)).toContain('Lição da semana 1 lida!');
    expect(texto(caixa)).toContain('A ideia que fica');
    expect(texto(caixa)).toContain(licao.ideia);
    expect(texto(caixa)).not.toContain('Perfeito'); // 3 ⭐ não mostra o selo de "hábito"
    // a estrela ficou guardada
    const guardado = JSON.parse(localStorage.getItem('kids-leitura-v1') ?? '{}');
    expect(guardado[`${GAME_ID}/${licao.id}`].best).toBe(3);

    // "Próximo nível" (do LevelDone) = próxima lição da ordem de leitura
    await clicar(caixa, 'Próximo nível');
    expect(texto(caixa)).toContain(semanaDoMes(MES, 2, 'baby')?.titulo ?? '');

    await act(async () => {
      root.unmount();
    });
  });

  it('errar uma vez ainda conclui a lição (ler não reprova) e a estrela desce honestamente', async () => {
    const { caixa, root } = await montar();
    const licao = semanaDoMes(MES, 1, 'baby')!;
    const p = licao.pergunta;
    await clicar(caixa, licao.titulo);
    await clicar(caixa, p.alternativas[(p.correta + 1) % 3]);
    await clicar(caixa, 'Continuar');

    // 1 erro = 2 estrelas (starsForWrong), e a lição está concluída
    expect(texto(caixa)).toContain('Lição da semana 1 lida!');
    expect(texto(caixa)).toContain('só 1 erro');
    const guardado = JSON.parse(localStorage.getItem('kids-leitura-v1') ?? '{}');
    expect(guardado[`${GAME_ID}/${licao.id}`].best).toBe(2);

    await act(async () => {
      root.unmount();
    });
  });
});