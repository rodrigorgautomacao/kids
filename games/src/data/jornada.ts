// As 12 etapas de "A Grande Jornada" — inspiradas em O Peregrino (Bunyan, 1678,
// domínio público). Textos, arte e código originais.
//
// Os mapas NÃO são escritos à mão: saem de `gerarMapa()` com semente fixa, o que
// dá 192×14 tiles (~4× o tamanho antigo de 64×11) sem 30 mil caracteres de mapa
// digitados à mão. Mesma semente → mesmo mapa, então a criança aprende o trajeto.
// A referência bíblica (NAA) é a autoridade; Bunyan é só a moldura da história.

import type { PlatformerLevel } from '../lib/jornada/types';
import { gerarMapa } from '../lib/jornada/gerar';

export const JORNADA_LEVELS: PlatformerLevel[] = [
  // ─── Ato 1 · Criação ───────────────────────────────────────────
  {
    id: 'e1',
    name: 'A Cidade de Escuridão',
    act: 1,
    ref: 'Rm 5.12 (NAA)',
    marco: 'A Cidade da Destruição — de onde ele saiu',
    scenery: 'ruins',
    cenario:
      'Em Shinar a cidade é enorme e cheia de vaidades, e mesmo assim o Peregrino sente um peso no peito. Ele ainda não sabe para onde vai. Só sabe que precisa sair.',
    lesson:
      'A jornada começa quando a gente decide caminhar com Deus. Mesmo saindo da escuridão, Ele nos chama para seguir adiante.',
    sky: ['#283593', '#fdba74'],
    ground: ['#8b5a2b', '#65a30d'],
    map: gerarMapa({
      seed: 1001,
      desafio: 0.18,
      agua: false,
      espinhos: false,
      muro: false,
      desespero: false,
      cancelinha: false,
      sementes: 14,
      marcos: 3,
    }),
  },
  {
    id: 'e2',
    name: 'O Portão Estreito',
    act: 1,
    ref: 'Jo 10.9 (NAA)',
    marco: 'O Portão Estreito / A Boa Vontade',
    scenery: 'gate',
    cenario:
      'Um homem de roupas brilhantes aponta o caminho e diz: "Venha por aqui!". A multidão tenta entrar por todos os lados, mas só existe um portão — e ele é estreito.',
    lesson: 'O caminho é estreito, mas Jesus é a Porta. Ele abre o caminho certo para quem O busca.',
    sky: ['#0ea5e9', '#bae6fd'],
    ground: ['#a16207', '#4ade80'],
    map: gerarMapa({
      seed: 1002,
      desafio: 0.24,
      agua: false,
      espinhos: true,
      muro: false,

      desespero: false,
      cancelinha: true,
      sementes: 16,
      marcos: 3,
    }),
  },
  {
    id: 'e3',
    name: 'A Casa do Intérprete',
    act: 1,
    ref: 'Sl 119.105 (NAA)',
    marco: 'A Casa do Intérprete',
    scenery: 'house',
    cenario:
      'Na Casa do Intérprete um homem espera com um livro aberto na mesa. "Sente aqui, filho. Vamos ler." Pela primeira vez o Peregrino entende o que ouve.',
    lesson: 'Deus nos ajuda a entender a Sua Palavra. Ao ouvir e obedecer, o caminho fica mais claro.',
    sky: ['#7dd3fc', '#e0f7fa'],
    ground: ['#8d6748', '#22c55e'],
    map: gerarMapa({
      seed: 1003,
      desafio: 0.28,
      agua: false,
      espinhos: true,
      muro: false,
      desespero: false,
      cancelinha: true,
      sementes: 18,
      marcos: 4,
    }),
  },
  {
    id: 'e4',
    name: 'A Colina da Dificuldade',
    act: 2,
    ref: 'Mt 7.13-14 (NAA)',
    marco: 'A subida estreita da montanha',
    scenery: 'cliff',
    cenario:
      'A estrada começa a subir e não desce. A Colina da Dificuldade parece não ter fim, mas cada passo dado é um passo a mais perto do alto.',
    lesson:
      'Há degraus difíceis na jornada, mas Deus fortalece quem continua subindo, passo a passo.',
    sky: ['#a5d6ff', '#f1f5f9'],
    ground: ['#7f5539', '#84cc16'],
    map: gerarMapa({
      seed: 1004,
      desafio: 0.38,
      agua: false,
      espinhos: true,
      muro: false,
      desespero: false,
      cancelinha: true,
      sementes: 20,
      marcos: 4,
    }),
  },
  {
    id: 'e5',
    name: 'A Casa Bela',
    act: 2,
    ref: 'Hb 10.24-25 (NAA)',
    marco: 'A Casa Bela — os quatro companheiros',
    scenery: 'hearth',
    cenario:
      'O Peregrino para numa casinha aconchegante. Lá dentro mora um casal que diz: "Fique com a gente." Pela primeira vez a jornada não é solitária.',
    lesson:
      'Deus nos dá irmãos na fé para caminharmos juntos. Não precisamos fazer a jornada sozinhos.',
    sky: ['#c7e6ff', '#fef9c3'],
    ground: ['#7a5230', '#4ade80'],
    map: gerarMapa({
      seed: 1005,
      desafio: 0.36,
      agua: false,
      espinhos: true,
      muro: false,
      desespero: false,
      cancelinha: true,
      sementes: 20,
      marcos: 4,
    }),
  },
  {
    id: 'e6',
    name: 'O Vale da Sombra',
    act: 2,
    ref: 'Sl 23.4 (NAA)',
    marco: 'O Vale da Sombra da Morte',
    scenery: 'gloom',
    darkness: 0.8,
    cenario:
      'O sol desaparece e o vale é fundo, escuro e silencioso. Todos os sons sumiram. Só resta a certeza de que o Senhor caminha ao lado dele.',
    lesson:
      'Mesmo no vale mais escuro, o Senhor está conosco. O Seu cajado e o Seu bordão nos consolam e nos guiam.',
    sky: ['#4b5563', '#1e293b'],
    ground: ['#5f4327', '#3f6212'],
    map: gerarMapa({
      seed: 1006,
      desafio: 0.48,
      agua: false,
      espinhos: true,
      muro: true,
      desespero: true,
      cancelinha: true,
      sementes: 22,
      marcos: 4,
    }),
  },
  // ─── Ato 3 · Confronto ─────────────────────────────────────────
  {
    id: 'e7',
    name: 'A Feira das Vaidades',
    act: 3,
    ref: '1 Jo 2.15-17 (NAA)',
    marco: 'A Feira das Vaidades',
    scenery: 'market',
    cenario:
      'De repente a luz volta — e com ela uma praça cheia de barracas coloridas, música, balões e mercadoria reluzente. Tudo brilha, tudo promete, e nada disso fica.',
    lesson:
      'O que parece brilhar por um instante não dura para sempre. A melhor escolha é guardar o que vale para a eternidade.',
    sky: ['#93c5fd', '#fef3c7'],
    ground: ['#7a5230', '#65a30d'],
    map: gerarMapa({
      seed: 1007,
      desafio: 0.46,
      agua: false,
      espinhos: true,
      muro: true,
      desespero: true,
      cancelinha: true,
      sementes: 22,
      marcos: 4,
    }),
  },
  {
    id: 'e8',
    name: 'O Castelo da Dúvida',
    act: 3,
    ref: 'Tg 1.6-8 (NAA)',
    marco: 'O Castelo da Dúvida / O Grande Desespero',
    scenery: 'castle',
    cenario:
      'No alto fica um castelo de pedra com torres imensas. Uma voz pergunta: "E se Deus não for o que você pensa?" O Peregrino para para pensar.',
    lesson:
      'A dúvida tenta nos prender, mas Deus nos chama a confiar nEle. Quando oramos, Ele nos fortalece a seguir.',
    sky: ['#6b7280', '#111827'],
    ground: ['#654321', '#365314'],
    map: gerarMapa({
      seed: 1008,
      desafio: 0.58,
      agua: false,
      espinhos: true,
      muro: true,
      desespero: true,
      cancelinha: true,
      sementes: 24,
      marcos: 5,
    }),
  },
  {
    id: 'e9',
    name: 'As Montanhas Deliciosas',
    act: 3,
    ref: 'Is 40.31 (NAA)',
    marco: 'As Montanhas Deliciosas — os quatro pastores',
    scenery: 'mountains',
    cenario:
      'Depois do deserto vêm as montanhas. Um pastor de cajado convida o Peregrino a sentar e descansar: "Aqui o ar é bom e a vista é livre."',
    lesson: 'Depois das dificuldades, Deus nos dá descanso e ânimo. Quem espera no Senhor renova as forças.',
    sky: ['#7dd3fc', '#cffafe'],
    ground: ['#8b5a2b', '#4ade80'],
    map: gerarMapa({
      seed: 1009,
      desafio: 0.44,
      agua: false,
      espinhos: true,
      muro: false,
      desespero: false,
      cancelinha: true,
      sementes: 22,
      marcos: 5,
    }),
  },
  // ─── Ato 4 · Consumação ───────────────────────────────────────
  {
    id: 'e10',
    name: 'O Terreno Encantado',
    act: 4,
    ref: '1 Co 10.13 (NAA)',
    marco: 'O Terreno Encantado',
    scenery: 'enchanted',
    cenario:
      'O caminho passa por um jardim de árvores que brilham em verde. Tudo é lindo, as frutas parecem cair do chão... e os companheiros hesitam.',
    lesson:
      'Há lugares que parecem bonitos, mas podem desviar nosso coração. Jesus nos ajuda a escolher o caminho certo.',
    sky: ['#86efac', '#fef08a'],
    ground: ['#7f5539', '#84cc16'],
    // Ato 4 = Consumption (Ap 21.4-6): sem inimigo, sem espinho. Só o Muro de
    // Espinhos (tile 'x'), que é obstáculo, não ser vivo.
    map: gerarMapa({
      seed: 1010,
      desafio: 0.4,
      agua: false,
      espinhos: false,
      muro: true,
      desespero: false,
      cancelinha: true,
      sementes: 24,
      marcos: 5,
    }),
  },
  {
    id: 'e11',
    name: 'O Rio da Morte',
    act: 4,
    ref: '1 Co 15.55-57 (NAA)',
    marco: 'A travessia do Rio',
    scenery: 'river',
    cenario:
      'O rio corta a estrada de ponta a ponta, largo e fundo. Não há ponte. Só um barco — e, do outro lado, a Cidade.',
    lesson:
      'A travessia nos lembra que Jesus venceu a morte. Quem crê nEle atravessa com esperança e confiança.',
    sky: ['#94a3b8', '#1f2937'],
    ground: ['#6b4e2a', '#365314'],
    // Rio da Morte: a ameaça aqui é a ÁGUA (o vale), não um inimigo.
    map: gerarMapa({
      seed: 1011,
      desafio: 0.5,
      agua: true,
      espinhos: false,
      muro: true,
      desespero: false,
      cancelinha: true,
      sementes: 26,
      marcos: 5,
    }),
  },
  {
    id: 'e12',
    name: 'A Cidade Celeste',
    act: 4,
    ref: 'Ap 21.3-5 (NAA)',
    marco: 'A chegada à Cidade Celeste',
    scenery: 'celestial',
    cenario:
      'E então ele vê as muralhas: não de pedra escura, mas de luz. O portão está aberto. Ele pode, finalmente, entrar e descansar.',
    lesson:
      'Chegamos à promessa: Deus habitará com o Seu povo e fará tudo novo. É uma alegria eterna!',
    sky: ['#c9e6ff', '#fef3c7'],
    ground: ['#7d5a40', '#22c55e'],
    // Chegada: o mapa mais aberto e generoso de todos — o prêmio da jornada.
    map: gerarMapa({
      seed: 1012,
      desafio: 0.28,
      agua: false,
      espinhos: false,
      muro: false,

      desespero: false,
      cancelinha: true,
      sementes: 30,
      marcos: 5,
    }),
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