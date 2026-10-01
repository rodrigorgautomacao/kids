// "A Grande Jornada" — as 12 etapas do platformer (GAME_DESIGN.md §2.6).
//
// Cada etapa declara seu marco de Bunyan e sua referência NAA. 🔒 Nenhum texto
// de versículo entra aqui: só a REFERÊNCIA (regra de ouro, ADR-010 D41).
// Bunyan é inspiração; a Bíblia é a autoridade.
//
// Legenda do mapa (skill `jogos-platformer` §3):
//   . ar · # chão · = plataforma · ? Rocha que Responde · x Muro de Espinhos
//   w Muro que Cai (Jericó) · o Semente · E Escudo · g Rocha do Marco
//   ! Portão · c Cancelinha · S Espinho · b Bichinho · n Serpente
//   d Grande Desespero · ~ água (cair nela volta ao Marco)
//
// Mapa em 11 linhas × 64 colunas. A linha 8 é a "rua" (entidades/portão),
// as linhas 9–10 são o chão. A 1ª `g` é o ponto de partida da etapa.

import type { PlatformerLevel } from '../lib/jornada/types';

/** Cada parte de `row()` tem 16 colunas — o teste `jornada.test.ts` valida 64. */
function row(...parts: string[]): string {
  const pattern = parts.join('');
  return pattern.length >= 64 ? pattern.slice(0, 64) : pattern + '.'.repeat(64 - pattern.length);
}

const D = '................';

export const JORNADA_LEVELS: PlatformerLevel[] = [
  // ─── Ato 1 · Criação ───────────────────────────────────────────
  {
    id: 'e1',
    name: 'A Cidade de Escuridão',
    act: 1,
    ref: 'Rm 5.12 (NAA)',
    marco: 'Cidade da Destruição — de onde ele saiu',
    lesson: 'A jornada começa quando a gente decide caminhar com Deus.',
    sky: ['#1e293b', '#475569'],
    ground: ['#4b5563', '#6b7280'],
    darkness: 0.12,
    map: [
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, D, D, 'o...............'),
      row(D, D, D, D),
      row(D, '......o.........', D, D),
      row(D, '....====........', D, D),
      row('............o...', D, '....o...........', D),
      row(D, D, '............o...', D),
      row('....g...........', D, '........S.......', '....o...g...!...'),
      row('##########...###', '################', '#...#########...', '################'),
      row('##########...###', '################', '#...#########...', '################'),
    ],
  },
  {
    id: 'e2',
    name: 'O Portão Estreito',
    act: 1,
    ref: 'Jo 10.9 (NAA)',
    marco: 'Portão Estreito / Boa Vontade',
    lesson: 'O caminho é estreito, mas Jesus é a porta — e ele abre para você.',
    sky: ['#0ea5e9', '#bae6fd'],
    ground: ['#78716c', '#a8a29e'],
    map: [
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, '....o...........', D, '......o.........'),
      row(D, D, D, D),
      row('............o...', '......o.........', '........o.......', '..o.............'),
      row('....g........x..', '..g........x...', '......g...x.....', 'g...x.......!...'),
      row('######...#######', '################', '#...############', '#######...######'),
      row('######...#######', '################', '#...############', '#######...######'),
    ],
  },
  {
    id: 'e3',
    name: 'A Casa do Intérprete',
    act: 1,
    ref: '1Co 2.13-14 (NAA)',
    marco: 'A Casa do Intérprete',
    lesson: 'Deus mostra coisas lindas para quem quer aprender com ele.',
    sky: ['#8b5cf6', '#ddd6fe'],
    ground: ['#7c3aed', '#a78bfa'],
    map: [
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, D, D, D),
      row('............o...', '..............o.', D, 'o...............'),
      row('............?...', '..............?.', D, '?...............'),
      row(D, '....====........', '......====......', D),
      row(D, D, '........E.......', D),
      row('....g...........', '..........g.....', '............g...', '............!...'),
      row('################', '...#############', '########...#####', '################'),
      row('################', '...#############', '########...#####', '################'),
    ],
  },

  // ─── Ato 2 · Queda ────────────────────────────────────────────
  {
    id: 'e4',
    name: 'A Colina da Dificuldade',
    act: 2,
    ref: 'Hb 12.1-2 (NAA)',
    marco: 'A subida até o monte',
    lesson: 'A subida é pesada, mas Deus dá força para cada passo.',
    sky: ['#f59e0b', '#fde68a'],
    ground: ['#92400e', '#b45309'],
    map: [
      row(D, D, D, D),
      row(D, D, D, D),
      row('...............o', '.............o..', '...........o....', '........!.......'),
      row('..............==', '............====', '..........====..', '......======....'),
      row(D, D, D, D),
      row('.........o......', '.......o........', '.....o..........', '...o............'),
      row('........====....', '......====......', '....====........', '..====..........'),
      row(D, '........o.......', '........o.......', '..........o.....'),
      row('....g...........', 'x.........g.....', '......x.........', '....g...........'),
      row('############...#', '##############..', '.###########...#', '################'),
      row('############...#', '##############..', '.###########...#', '################'),
    ],
  },
  {
    id: 'e5',
    name: 'A Casa Bela',
    act: 2,
    ref: 'Gl 5.22-23 (NAA)',
    marco: 'A Casa Bela — os 4 companheiros',
    lesson: 'O fruto do Espírito enfeita o caminho de quem anda com Deus.',
    sky: ['#22c55e', '#bbf7d0'],
    ground: ['#166534', '#15803d'],
    map: [
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, D, D, D),
      row('.............o..', '.........o......', '.....o..........', '.o..............'),
      row(D, D, D, D),
      row('..........o.....', 'o.....o.....o...', '..o.....o.....o.', '....o...........'),
      row(D, '..............E.', D, D),
      row('....g...........', '..b...........g.', D, 'b...g.......!...'),
      row('################', '####...#########', '##########...###', '################'),
      row('################', '####...#########', '##########...###', '################'),
    ],
  },
  {
    id: 'e6',
    name: 'O Vale da Sombra',
    act: 2,
    ref: 'Sl 23.4 (NAA)',
    marco: 'O Vale da Sombra da Morte',
    lesson: 'Mesmo no escuro, Deus está com você — a luz dele não apaga.',
    sky: ['#0f172a', '#1e293b'],
    ground: ['#334155', '#475569'],
    darkness: 1,
    map: [
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, '.o..............', '...o............', D),
      row(D, '====............', '..====..........', D),
      row(D, D, 'E...............', D),
      row('............o...', '............o...', '............o...', '........o.......'),
      row('....g........S..', '....g........S..', '....g........S..', 'g...........!...'),
      row('########...#####', '########...#####', '########...#####', '####...#########'),
      row('########...#####', '########...#####', '########...#####', '####...#########'),
    ],
  },

  // ─── Ato 3 · Redenção ─────────────────────────────────────────
  {
    id: 'e7',
    name: 'A Feira das Vaidades',
    act: 3,
    ref: '1Jo 2.15-17 (NAA)',
    marco: 'A Feira das Vaidades',
    lesson: 'As coisas brilham, mas não enchem o coração — só Deus preenche.',
    sky: ['#f472b6', '#fbcfe8'],
    ground: ['#9d174d', '#be185d'],
    map: [
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, 'o...............', 'o...............', 'o...............'),
      row('.........o......', '.........o......', '.........o......', '.....o..........'),
      row('........====....', '........====....', '........====....', '....====........'),
      row(D, D, '..............E.', D),
      row('....g.........b.', '............g...', '..........b.....', '......g.....!...'),
      row('################', '##...###########', '######...#######', '################'),
      row('################', '##...###########', '######...#######', '################'),
    ],
  },
  {
    id: 'e8',
    name: 'O Castelo da Dúvida',
    act: 3,
    ref: '1Co 10.13 (NAA)',
    marco: 'O Castelo da Dúvida / Grande Desespero',
    lesson: 'Quase parou, mas não parou — Deus nunca deixa a prova maior do que você.',
    sky: ['#334155', '#0f172a'],
    ground: ['#475569', '#64748b'],
    darkness: 0.45,
    map: [
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, '...........o....', '...............o', D),
      row(D, '..........====..', '..............==', '==..............'),
      row(D, 'E...............', '........o.......', D),
      row('......o.....S...', D, '......S.........', '......o.........'),
      row('....g...........', '......d.......g.', '............d...', '......g.....!...'),
      row('##############..', '.###############', '##...###########', '##...###########'),
      row('##############..', '.###############', '##...###########', '##...###########'),
    ],
  },
  {
    id: 'e9',
    name: 'As Montanhas Deliciosas',
    act: 3,
    ref: 'Jo 10.11-15 (NAA)',
    marco: 'As Montanhas Deliciosas — os 4 Pastores',
    lesson: 'O Bom Pastor cuida de cada passo seu — e o Portão já dá para ver!',
    sky: ['#0ea5e9', '#e0f2fe'],
    ground: ['#57534e', '#78716c'],
    map: [
      row(D, D, D, '........!.......'),
      row(D, D, D, '....========....'),
      row('.............o..', '...........o....', '.........o......', '.......o........'),
      row('............====', '..........====..', '........====....', '......====......'),
      row(D, D, D, D),
      row('.......o........', '.....o..........', '...o............', 'o...............'),
      row('......====......', '....====........', '..====..........', '====............'),
      row(D, '..o.............', '..............o.', D),
      row('....g.........b.', '............g...', '..........b.....', '........g.......'),
      row('################', '####...#########', '####...#########', '##...###########'),
      row('################', '####...#########', '####...#########', '##...###########'),
    ],
  },
  {
    id: 'e10',
    name: 'O Terreno Encantado',
    act: 3,
    ref: '1Co 3.18-20 (NAA)',
    marco: 'O Terreno Encantado',
    lesson: 'Nem todo caminho bonito leva à vida — a luz mostra qual é o certo.',
    sky: ['#a855f7', '#f3e8ff'],
    ground: ['#6d28d9', '#8b5cf6'],
    darkness: 0.2,
    map: [
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, D, D, D),
      row('......o.........', '......o.........', '......o.........', '......o.........'),
      row(D, '.o..............', '.....o..........', '.....o..........'),
      row(D, '====............', '....====........', '....====........'),
      row('..............S.', D, '..........S.....', D),
      row('....g...c.......', '....g...c.......', '..S...g.........', '..c.....g...!...'),
      row('############...#', '############...#', '############...#', '################'),
      row('############...#', '############...#', '############...#', '################'),
    ],
  },

  // ─── Ato 4 · Consumação ───────────────────────────────────────
  {
    id: 'e11',
    name: 'O Rio da Morte',
    act: 4,
    ref: 'Lm 3.22-23 (NAA)',
    marco: 'A travessia do Rio',
    lesson: 'No rio mais difícil, a misericórdia de Deus se renova toda manhã.',
    sky: ['#0369a1', '#7dd3fc'],
    ground: ['#0c4a6e', '#0369a1'],
    map: [
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, D, D, D),
      row('......o.........', D, '..o.............', D),
      row(D, '....E...........', D, D),
      row('............o...', '............o...', '............o...', '.........o......'),
      row('...........====.', '...........====.', '...........====.', '........====....'),
      row('....g...........', '....g...........', '....g...........', '....g.........!.'),
      row('##########~~~~~~', '##########~~~~~~', '##########~~~~~~', '########~~~~####'),
      row('##########~~~~~~', '##########~~~~~~', '##########~~~~~~', '########~~~~####'),
    ],
  },
  {
    id: 'e12',
    name: 'A Cidade Celeste',
    act: 4,
    ref: 'Ap 21.3-5 (NAA)',
    marco: 'A chegada à Cidade Celeste',
    lesson: 'Deus fez novas todas as coisas. Ele cuidou de cada passo — agora é hora de cuidar dos outros.',
    sky: ['#fbbf24', '#fef9c3'],
    ground: ['#a16207', '#ca8a04'],
    map: [
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, D, D, D),
      row(D, D, D, D),
      row('............o...', '........o.......', '....o...........', 'o...........o...'),
      row('......o.........', '..o...........o.', '..........o.....', '......o.........'),
      row('...........o....', '.......o........', '...o...........o', D),
      row('..........====..', '......====......', '..............==', '==..............'),
      row('....g...........', '..............g.', D, '............!...'),
      row('################', '################', '################', '################'),
      row('################', '################', '################', '################'),
    ],
  },
];

/** Itens de `GameLevel` para `useLevelState` (1 rodada = 1 etapa inteira). */
export const JORNADA_GAME_LEVELS = JORNADA_LEVELS.map((lv) => ({
  id: lv.id,
  name: lv.name,
  rounds: [lv],
}));

export const JORNADA_CREDITO =
  'Inspirado em "O Peregrino", de John Bunyan (1678) — obra em domínio público. Todos os textos, arte e código são originais.';
