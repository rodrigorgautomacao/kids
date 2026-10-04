// Histórico de leitura — para os jogos que a criança **lê**, não joga
// ("Devocional da Semana" e "Estudo da Semana").
//
// POR QUE ESTA LIB É DIFERENTE DE `lib/progress.ts`
// `progress.ts` guarda nível por **número** (1..N) e faz sentido para jogo: o
// nível 3 é o terceiro e não muda quando entra conteúdo novo. Aqui a unidade é
// a **unidade de leitura** — um dia do devocional (`2026-09-28/seg`) ou uma
// lição do mês (`2026-10-7-9-s1`) — e ela tem **id textual estável**. Isso é o
// que faz o histórico sobreviver ao dono entregar mais material: acrescentar
// outubro/2027 em `DEVOCIONAIS` ou `MESES_ESTUDO` cria unidades novas e **não
// embaralha** as já lidas. Um id numérico quebraria tudo isso.
//
// REGRA DA CASA: ler não pune e não reprova. `starsForWrong` continua valendo
// (0 erro = 3 ⭐), e a estrela só sobe, nunca desce.

import { starsForWrong } from './minigame';

export interface UnidadeLeitura {
  /** Melhor estrela conquistada (0–3). 0 = nunca concluída. */
  best: number;
  /** Quantas vezes a unidade foi concluída. */
  plays: number;
  /** 'AAAA-MM-DD' da última vez que a criança abriu a unidade. */
  visto: string;
  /** Marcas livres por papel: 'lido', 'praticado', 'respondido'. */
  marcas: string[];
}

/** chave = `${gameId}/${unidadeId}` */
export type LeituraStore = Record<string, UnidadeLeitura>;

const KEY = 'kids-leitura-v1';

export function unidadeVazia(): UnidadeLeitura {
  return { best: 0, plays: 0, visto: '', marcas: [] };
}

/** 'AAAA-MM-DD' no fuso do aparelho (o jogo roda offline, sem servidor). */
export function hoje(): string {
  const d = new Date();
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Chave composta. O `gameId` vem do catálogo e o `unidadeId` do dado curado. */
export function chave(gameId: string, unidadeId: string): string {
  return `${gameId}/${unidadeId}`;
}

/* ------------------------------- leitura ------------------------------- */

export function loadLeitura(): LeituraStore {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as LeituraStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function unidade(store: LeituraStore, gameId: string, unidadeId: string): UnidadeLeitura {
  return store[chave(gameId, unidadeId)] ?? unidadeVazia();
}

export function temMarca(u: UnidadeLeitura, marca: string): boolean {
  return u.marcas.includes(marca);
}

/* ------------------------------- gravação ------------------------------ */

function salvar(next: LeituraStore): LeituraStore {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* armazenamento indisponível: segue sem persistir */
  }
  return next;
}

/** Marca a unidade como lida (sem estrela). Idempotente. */
export function marcar(store: LeituraStore, gameId: string, unidadeId: string, marca: string): LeituraStore {
  const k = chave(gameId, unidadeId);
  const prev = store[k] ?? unidadeVazia();
  if (prev.marcas.includes(marca)) {
    return prev.visto === hoje() ? store : salvar({ ...store, [k]: { ...prev, visto: hoje() } });
  }
  return salvar({
    ...store,
    [k]: { ...prev, marcas: [...prev.marcas, marca], visto: hoje() },
  });
}

/**
 * Conclui a unidade. `errados` = quantas vezes a criança errou **naquela
 * passada** (0–2, como nos outros jogos). A estrela nunca desce.
 */
export function concluir(
  store: LeituraStore,
  gameId: string,
  unidadeId: string,
  errados: number,
  marca?: string,
): LeituraStore {
  const k = chave(gameId, unidadeId);
  const prev = store[k] ?? unidadeVazia();
  const stars = starsForWrong(errados);
  const marcas = marca && !prev.marcas.includes(marca) ? [...prev.marcas, marca] : prev.marcas;
  return salvar({
    ...store,
    [k]: { best: Math.max(prev.best, stars), plays: prev.plays + 1, visto: hoje(), marcas },
  });
}

/** Apaga o histórico de um jogo (usado pelo botão "recomeçar" das telas). */
export function limparJogo(store: LeituraStore, gameId: string): LeituraStore {
  const prefixo = `${gameId}/`;
  const next: LeituraStore = {};
  for (const [k, v] of Object.entries(store)) {
    if (!k.startsWith(prefixo)) next[k] = v;
  }
  return salvar(next);
}

/* ------------------------------- agregados ------------------------------ */

/**
 * Progresso de um jogo **sobre uma lista concreta de unidades** — o total vem
 * da lista, não de um número fixo, então o material novo entra no histórico
 * sem desfazer o que já foi lido.
 */
export function progresso(
  store: LeituraStore,
  gameId: string,
  unidadeIds: string[],
): { lidos: number; estrelas: number; maxEstrelas: number; percent: number } {
  let lidos = 0;
  let estrelas = 0;
  for (const id of unidadeIds) {
    const u = unidade(store, gameId, id);
    if (u.best > 0) lidos += 1;
    estrelas += u.best;
  }
  const total = unidadeIds.length;
  return {
    lidos,
    estrelas,
    maxEstrelas: total * 3,
    percent: total === 0 ? 0 : Math.round((lidos / total) * 100),
  };
}

/* ------------------------------ assinatura ------------------------------ */

const ouvintes = new Set<() => void>();

/** Notifica a UI quando o histórico muda (mesmo contrato de `lib/stickers`). */
export function subscribeLeitura(cb: () => void): () => void {
  ouvintes.add(cb);
  return () => {
    ouvintes.delete(cb);
  };
}

export function avisarLeitura(): void {
  for (const cb of ouvintes) cb();
}