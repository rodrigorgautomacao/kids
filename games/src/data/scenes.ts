// Catálogo de cenas-teatro da Aventura (Fase 6/7).
//
// Cada estação da Aventura passa a oferecer VÁRIAS histórias sobre o seu
// personagem — falando com o NPC, a criança escolhe sobre qual história
// quer "assistir como uma peça de teatro" (ver ADR-004 e a referência
// `teologia/cenas-personagens.md` no segundo cérebro).
//
// Regras de conteúdo (skills jogos-biblicos + jogos-game-design §12):
//  · toda cena cita a referência bíblica (NAA) do trecho narrado;
//  · tom de graça: Deus cuida, salva e ama — nada de castigo/medo como ponto;
//  · falas curtas (lidas e narradas); na dúvida, menos palavras;
//  · erros nunca punem o jogador (o quiz é "conta e confirma", não prova);
//  · personagens com múltiplas cenas seguem a linha do tempo do personagem.

export type BackdropId =
  | 'arca' // construção da arca, na beira do mar
  | 'diluvio' // chuva forte e água subindo
  | 'arco-iris' // arca no mar, arco-íris no céu
  | 'noite' // céu estrelado, colinas escuras (anúncio aos pastores, sonho)
  | 'deserto' // dunas e sol (alimento de Elias)
  | 'sarca' // deserto com a sarça em chamas
  | 'mar-aberto' // mar com ondas e um barquinho (fuga de Jonas, naufrágio)
  | 'peixe' // dentro do grande peixe (tons escuros e acolhedores)
  | 'mar-separado' // duas paredes de água, caminho seco no meio
  | 'monte' // montanha com fogo/relâmpagos e fumaça
  | 'rio' // rio com juncos (cesto de Moisés, Jordão)
  | 'cidade' // portão de cidade antiga (Nínive)
  | 'muralha' // muralha de pedra com portões (Jericó)
  | 'palacio' // salão do palácio (harpa de Davi, corte)
  | 'casa' // quarto simples e quente (anunciação, Sarepta)
  | 'estabulo' // estrebaria com estrela (Natal, magos)
  | 'fornalha' // fornalha com fogo dentro de casa aparente
  | 'cova' // cova escura dos leões
  | 'estrada' // caminho com feixe de luz do céu (Damasco)
  | 'prisao' // cela escura com grade
  | 'vale' // vale aberto entre montanhas (Golias, sol parado)
  | 'campo' // campina com grama e árvores (amizade)

export interface SceneChoice {
  t: string;
  e: string;
}

export interface Scene {
  /** id único (slug). Prefixo por personagem: n-, c-, e-, ... */
  id: string;
  /** id da estação na Aventura ('noe', 'criacao', 'elias', ...) */
  characterId: string;
  title: string;
  /** referência bíblica exata do trecho (Livro cap.vers (NAA)) */
  ref: string;
  backdrop: BackdropId;
  /** adereços em cena (emoji decorativo posicionado perto do personagem) */
  props: string[];
  /** falas narradas da peça (curtas, na ordem da história) */
  acts: string[];
  q: string;
  right: SceneChoice;
  wrongs: SceneChoice[];
  /** emoji da figurinha colecionável desta cena */
  sticker: string;
}

/** Estações da Aventura — precisa bater com os `id` de STORIES. */
export const CHARACTER_IDS = [
  'noe',
  'criacao',
  'elias',
  'jonas',
  'eliseu',
  'daniel',
  'natal',
  'moises',
  'josue',
  'davi',
  'salomao',
  'paulo',
] as const;

export const SCENES: Scene[] = [
  /* ------------------------------ Noé (noe) ------------------------------ */
  {
    id: 'n-arca',
    characterId: 'noe',
    title: 'Noé constrói a arca',
    ref: 'Gênesis 6.14 (NAA)',
    backdrop: 'arca',
    props: ['🪚', '🐘'],
    acts: [
      'O mundo estava cheio de maldade…',
      'Deus pediu a Noé que construísse uma arca enorme.',
      'Noé obedeceu. A arca tinha três andares, porta e janela!',
    ],
    q: 'O que Noé construiu para obedecer a Deus?',
    right: { t: 'Uma arca enorme', e: '🚢' },
    wrongs: [
      { t: 'Uma torre', e: '🗼' },
      { t: 'Uma ponte', e: '🌉' },
      { t: 'Uma casa na árvore', e: '🌳' },
    ],
    sticker: '🚢',
  },
  {
    id: 'n-diluvio',
    characterId: 'noe',
    title: 'A grande chuva',
    ref: 'Gênesis 7.17-20 (NAA)',
    backdrop: 'diluvio',
    props: ['🌧️', '🕊️'],
    acts: [
      'Começou a chover muito, quarenta dias e quarenta noites.',
      'A água subia e cobria os montes mais altos…',
      'Mas dentro da arca, Noé e os animais estavam seguros.',
    ],
    q: 'Quem ficou protegido dentro da arca?',
    right: { t: 'Noé e os animais', e: '🚢' },
    wrongs: [
      { t: 'Os gigantes do mar', e: '🧜' },
      { t: 'Os peixes do céu', e: '🐟' },
      { t: 'Ninguém', e: '🙈' },
    ],
    sticker: '🌧️',
  },
  {
    id: 'n-pomba',
    characterId: 'noe',
    title: 'A pomba e o ramo de oliveira',
    ref: 'Gênesis 8.8-12 (NAA)',
    backdrop: 'arco-iris',
    props: ['🕊️', '🌿'],
    acts: [
      'Noé soltou uma pomba para ver se as águas já tinham baixado.',
      'A pomba voltou com um raminho de oliveira no bico!',
      'Então Noé soube que a terra estava ficando seca.',
    ],
    q: 'O que a pomba trouxe no bico?',
    right: { t: 'Um ramo de oliveira', e: '🌿' },
    wrongs: [
      { t: 'Uma flor', e: '🌸' },
      { t: 'Uma pedrinha', e: '🪨' },
      { t: 'Nada', e: '🙈' },
    ],
    sticker: '🕊️',
  },
  {
    id: 'n-arco-iris',
    characterId: 'noe',
    title: 'O arco-íris da promessa',
    ref: 'Gênesis 9.13-15 (NAA)',
    backdrop: 'arco-iris',
    props: ['🌈', '🐑'],
    acts: [
      'Quando a terra secou, Deus mostrou um arco-íris no céu.',
      '"Este é o sinal da minha promessa", disse Deus.',
      'Nunca mais o mundo todo será destruído pela água.',
    ],
    q: 'O que Deus colocou no céu como sinal da promessa?',
    right: { t: 'O arco-íris', e: '🌈' },
    wrongs: [
      { t: 'O sol', e: '☀️' },
      { t: 'A lua', e: '🌙' },
      { t: 'Uma nuvem de chuva', e: '☁️' },
    ],
    sticker: '🌈',
  },

  /* ------------------------------ Criação (criacao) ------------------------------ */
  {
    id: 'c-criacao',
    characterId: 'criacao',
    title: 'Deus cria o mundo',
    ref: 'Gênesis 1.1-3 (NAA)',
    backdrop: 'noite',
    props: ['🌟', '🌍'],
    acts: [
      'No princípio, a terra estava vazia e escura.',
      'Deus disse: "Haja luz!", e a luz apareceu.',
      'Deus fez o céu, o mar, as plantas, os animais e o ser humano. E viu que tudo era muito bom!',
    ],
    q: 'Quem criou o céu e a terra?',
    right: { t: 'Deus', e: '🌍' },
    wrongs: [
      { t: 'Os anjos', e: '😇' },
      { t: 'O sol', e: '☀️' },
      { t: 'O mar', e: '🌊' },
    ],
    sticker: '🌍',
  },
  {
    id: 'c-descanso',
    characterId: 'criacao',
    title: 'O sétimo dia de descanso',
    ref: 'Gênesis 2.1-3 (NAA)',
    backdrop: 'campo',
    props: ['🌅', '🌿'],
    acts: [
      'Deus criou tudo em seis dias: a luz, o mar, as plantas e os animais.',
      'No sétimo dia, Deus descansou do seu trabalho.',
      'E abençoou esse dia tão especial.',
    ],
    q: 'O que Deus fez no sétimo dia?',
    right: { t: 'Descansou', e: '😌' },
    wrongs: [
      { t: 'Criou os peixes', e: '🐟' },
      { t: 'Dormiu a tarde toda', e: '😴' },
      { t: 'Foi viajar', e: '🧳' },
    ],
    sticker: '🌅',
  },
  {
    id: 'c-eden',
    characterId: 'criacao',
    title: 'O jardim do Éden',
    ref: 'Gênesis 2.8-9 (NAA)',
    backdrop: 'campo',
    props: ['🌳', '🍎'],
    acts: [
      'Deus plantou um jardim lindo, cheio de árvores e frutas.',
      'Ali colocou o primeiro homem e a primeira mulher.',
      'Eles cuidavam do jardim e passeavam com Deus.',
    ],
    q: 'Como era o jardim que Deus plantou?',
    right: { t: 'Bonito e cheio de frutas', e: '🌳' },
    wrongs: [
      { t: 'Escuro e vazio', e: '🌑' },
      { t: 'Só de pedras', e: '🪨' },
      { t: 'Cheio de neve', e: '❄️' },
    ],
    sticker: '🌳',
  },
  {
    id: 'c-pastores',
    characterId: 'criacao',
    title: 'O anjo fala com os pastores',
    ref: 'Lucas 2.8-14 (NAA)',
    backdrop: 'noite',
    props: ['🐑', '⭐'],
    acts: [
      'Na noite em que Jesus nasceu, pastores cuidavam das ovelhas.',
      'De repente, um anjo apareceu com uma luz brilhante!',
      '"Não tenham medo! Hoje nasceu o Salvador!" E os anjos cantaram louvores a Deus.',
    ],
    q: 'Para quem o anjo anunciou o nascimento de Jesus?',
    right: { t: 'Uns pastores', e: '🐑' },
    wrongs: [
      { t: 'Um rei', e: '👑' },
      { t: 'Uns soldados', e: '🛡️' },
      { t: 'Ninguém', e: '🙈' },
    ],
    sticker: '🐑',
  },

  /* ------------------------------ Elias (elias) ------------------------------ */
  {
    id: 'e-corvos',
    characterId: 'elias',
    title: 'O pão trazido pelos corvos',
    ref: '1 Reis 17.4-6 (NAA)',
    backdrop: 'deserto',
    props: ['🐦', '🍞'],
    acts: [
      'Numa seca muito grande, Deus cuidava do profeta Elias.',
      'De manhã e de tarde, corvos traziam pão e carne para ele.',
      'E Elias bebia a água do riacho.',
    ],
    q: 'Quem levava comida para o profeta Elias no deserto?',
    right: { t: 'Corvos', e: '🐦' },
    wrongs: [
      { t: 'Peixes', e: '🐟' },
      { t: 'Leões', e: '🦁' },
      { t: 'Formigas', e: '🐜' },
    ],
    sticker: '🍞',
  },
  {
    id: 'e-sarepta',
    characterId: 'elias',
    title: 'A farinha e o azeite que não acabavam',
    ref: '1 Reis 17.13-16 (NAA)',
    backdrop: 'casa',
    props: ['🫙', '🥖'],
    acts: [
      'Uma viúva só tinha um pouco de farinha e de azeite.',
      'Ela fez um pão para o profeta como ele pediu.',
      'E a farinha e o azeite nunca acabaram! Deus cuidou dela e do filho.',
    ],
    q: 'O que não acabou na casa da viúva?',
    right: { t: 'A farinha e o azeite', e: '🫙' },
    wrongs: [
      { t: 'As frutas', e: '🍎' },
      { t: 'O leite', e: '🥛' },
      { t: 'O mel', e: '🍯' },
    ],
    sticker: '🫙',
  },
  {
    id: 'e-carmelo',
    characterId: 'elias',
    title: 'O fogo que respondeu a oração',
    ref: '1 Reis 18.30-39 (NAA)',
    backdrop: 'monte',
    props: ['🔥', '🪨'],
    acts: [
      'No monte Carmelo, Elias orou ao Deus verdadeiro.',
      'E mandou molhar o altar com muita água…',
      'De repente, fogo desceu do céu! E todo o povo gritou: "O Senhor é Deus!"',
    ],
    q: 'Quem respondeu à oração de Elias com fogo do céu?',
    right: { t: 'O Senhor Deus', e: '🔥' },
    wrongs: [
      { t: 'O fogo da lareira', e: '🏠' },
      { t: 'O sol forte', e: '☀️' },
      { t: 'Os profetas de Baal', e: '🙇' },
    ],
    sticker: '🔥',
  },

  {
    id: 'e-anjo',
    characterId: 'elias',
    title: 'O anjo traz pão e água',
    ref: '1 Reis 19.5-8 (NAA)',
    backdrop: 'deserto',
    props: ['🍞', '💧'],
    acts: [
      'Elias estava cansado e com medo, deitado no deserto.',
      'Um anjo do Senhor tocou nele e disse: "Levante-se e coma!"',
      'Havia pão quentinho e água. Deus cuidou de Elias outra vez.',
    ],
    q: 'Quem levou pão e água para Elias no deserto?',
    right: { t: 'Um anjo do Senhor', e: '😇' },
    wrongs: [
      { t: 'Um pastor', e: '🐑' },
      { t: 'Um rei', e: '👑' },
      { t: 'Ninguém', e: '🙈' },
    ],
    sticker: '🍞',
  },

  /* ------------------------------ Jonas (jonas) ------------------------------ */
  {
    id: 'j-fuga',
    characterId: 'jonas',
    title: 'Jonas foge de navio',
    ref: 'Jonas 1.3 (NAA)',
    backdrop: 'mar-aberto',
    props: ['⛵', '🌊'],
    acts: [
      'Deus pediu a Jonas que avisasse a cidade de Nínive.',
      'Mas Jonas não quis ir e embarcou num navio para fugir.',
      'No mar, uma tempestade muito forte pegou o navio!',
    ],
    q: 'Para onde Jonas fugiu quando não quis obedecer?',
    right: { t: 'Para outro país', e: '⛵' },
    wrongs: [
      { t: 'Para o alto da torre', e: '🗼' },
      { t: 'Para dentro do templo', e: '🛕' },
      { t: 'Para casa da mãe', e: '🏠' },
    ],
    sticker: '⛵',
  },
  {
    id: 'j-peixe',
    characterId: 'jonas',
    title: 'Dentro do grande peixe',
    ref: 'Jonas 1.17-2.10 (NAA)',
    backdrop: 'peixe',
    props: ['✨', '🙏'],
    acts: [
      'Um grande peixe engoliu Jonas!',
      'Lá dentro, no escuro, Jonas orou a Deus com todo o coração.',
      'E o peixe levou Jonas até a praia. Deus cuidou dele o tempo todo.',
    ],
    q: 'Quem ouviu a oração de Jonas dentro do peixe?',
    right: { t: 'Deus', e: '✨' },
    wrongs: [
      { t: 'O grande peixe', e: '🐳' },
      { t: 'Os marinheiros', e: '⛵' },
      { t: 'Ninguém', e: '🙈' },
    ],
    sticker: '🐳',
  },
  {
    id: 'j-ninive',
    characterId: 'jonas',
    title: 'A cidade que escutou Deus',
    ref: 'Jonas 3.5-10 (NAA)',
    backdrop: 'cidade',
    props: ['🏛️', '📣'],
    acts: [
      'Jonas obedeceu e foi até Nínive, a cidade enorme.',
      'Ele avisou: "Deus vai julgar a cidade!"',
      'O rei e o povo se arrependeram… e Deus teve muita misericórdia deles.',
    ],
    q: 'O que o povo de Nínive fez ao ouvir o aviso de Jonas?',
    right: { t: 'Se arrependeu', e: '🙏' },
    wrongs: [
      { t: 'Riu de Jonas', e: '😄' },
      { t: 'Prendeu Jonas', e: '⛓️' },
      { t: 'Nada', e: '🤷' },
    ],
    sticker: '🏛️',
  },

  {
    id: 'j-planta',
    characterId: 'jonas',
    title: 'A planta que deu sombra',
    ref: 'Jonas 4.6-11 (NAA)',
    backdrop: 'campo',
    props: ['🌿', '☀️'],
    acts: [
      'Jonas ficou emburrado e sentou fora da cidade.',
      'Deus fez crescer uma planta para dar sombra e refrescar Jonas.',
      'E ensinou: "Eu tenho cuidado até dessa planta… imagina das pessoas!"',
    ],
    q: 'O que Deus fez crescer para dar sombra a Jonas?',
    right: { t: 'Uma planta', e: '🌿' },
    wrongs: [
      { t: 'Uma casa', e: '🏠' },
      { t: 'Um guarda-sol', e: '⛱️' },
      { t: 'Uma nuvem', e: '☁️' },
    ],
    sticker: '🌿',
  },

  /* ------------------------------ Eliseu (eliseu) ------------------------------ */
  {
    id: 'l-manto',
    characterId: 'eliseu',
    title: 'O manto de Elias',
    ref: '2 Reis 2.13-14 (NAA)',
    backdrop: 'rio',
    props: ['🧥', '💧'],
    acts: [
      'Elias subiu ao céu e deixou cair o seu manto.',
      'Eliseu pegou o manto e bateu nas águas do rio Jordão.',
      'As águas se abriram, e Eliseu atravessou! O Deus de Elias estava com ele.',
    ],
    q: 'O que Eliseu pegou quando Elias subiu ao céu?',
    right: { t: 'O manto', e: '🧥' },
    wrongs: [
      { t: 'O cajado', e: '🪄' },
      { t: 'A coroa', e: '👑' },
      { t: 'A harpa', e: '🎻' },
    ],
    sticker: '🧥',
  },
  {
    id: 'l-azeite',
    characterId: 'eliseu',
    title: 'As vasilhas cheias de azeite',
    ref: '2 Reis 4.1-7 (NAA)',
    backdrop: 'casa',
    props: ['🫙', '🫗'],
    acts: [
      'A mãe de dois meninos ficou sem nada para pagar as dívidas.',
      'Eliseu pediu: "Pegue vasilhas emprestadas dos vizinhos!"',
      'O azeite encheu todas as vasilhas… e a família pagou as dívidas!',
    ],
    q: 'O que encheu todas as vasilhas da moça?',
    right: { t: 'Azeite', e: '🫗' },
    wrongs: [
      { t: 'Água do rio', e: '💧' },
      { t: 'Mel de abelha', e: '🍯' },
      { t: 'Leite', e: '🥛' },
    ],
    sticker: '🫙',
  },
  {
    id: 'l-naaman',
    characterId: 'eliseu',
    title: 'Naamã mergulha no rio',
    ref: '2 Reis 5.10-14 (NAA)',
    backdrop: 'rio',
    props: ['💦', '🌟'],
    acts: [
      'Naamã, o comandante bravo, estava doente na pele.',
      'O profeta mandou: "Mergulhe sete vezes no rio Jordão!"',
      'Naamã obedeceu… e saiu da água completamente curado!',
    ],
    q: 'Em qual rio Naamã mergulhou e ficou curado?',
    right: { t: 'No rio Jordão', e: '💦' },
    wrongs: [
      { t: 'No mar Morto', e: '🧂' },
      { t: 'No rio Nilo', e: '🐊' },
      { t: 'Na piscina', e: '🏊' },
    ],
    sticker: '💧',
  },

  {
    id: 'l-machado',
    characterId: 'eliseu',
    title: 'O machado que flutuou',
    ref: '2 Reis 6.1-7 (NAA)',
    backdrop: 'rio',
    props: ['🪓', '💧'],
    acts: [
      'Um dos ajudantes deixou o machado cair no rio fundo.',
      'Ele ficou triste: "Ai, era emprestado!"',
      'Eliseu orou, e o ferro do machado flutuou até a mão dele!',
    ],
    q: 'O que aconteceu com o machado que caiu no rio?',
    right: { t: 'Ele flutuou', e: '🪓' },
    wrongs: [
      { t: 'Virou um peixe', e: '🐟' },
      { t: 'Sumiu para sempre', e: '💨' },
      { t: 'Afundou mais', e: '⬇️' },
    ],
    sticker: '🪓',
  },

  /* ------------------------------ Daniel (daniel) ------------------------------ */
  {
    id: 'd-alimentos',
    characterId: 'daniel',
    title: 'A comida que fortalece',
    ref: 'Daniel 1.8-16 (NAA)',
    backdrop: 'palacio',
    props: ['🥕', '🥬'],
    acts: [
      'No palácio do rei, Daniel e os amigos não queriam a comida da corte.',
      'Eles pediram legumes e água por dez dias.',
      'No fim, estavam mais fortes e saudáveis que todos!',
    ],
    q: 'O que Daniel e os amigos pediram para comer?',
    right: { t: 'Legumes e água', e: '🥕' },
    wrongs: [
      { t: 'Bolo e frituras', e: '🍰' },
      { t: 'Bala e chiclete', e: '🍬' },
      { t: 'Nada, só dormir', e: '😴' },
    ],
    sticker: '🥕',
  },
  {
    id: 'd-fornalha',
    characterId: 'daniel',
    title: 'Os amigos na fornalha',
    ref: 'Daniel 3.19-27 (NAA)',
    backdrop: 'fornalha',
    props: ['😇', '🔥'],
    acts: [
      'O rei ficou bravo e lançou os amigos de Daniel na fornalha quente.',
      'Mas lá dentro apareceu um anjo do Senhor para protegê-los!',
      'Eles saíram sem nenhum ferimento. Que milagre de Deus!',
    ],
    q: 'Quem protegeu os amigos de Daniel dentro do fogo?',
    right: { t: 'Um anjo do Senhor', e: '😇' },
    wrongs: [
      { t: 'O rei', e: '👑' },
      { t: 'Um gigante', e: '🧌' },
      { t: 'Ninguém', e: '🙈' },
    ],
    sticker: '🔥',
  },
  {
    id: 'd-oracao',
    characterId: 'daniel',
    title: 'Daniel ora todos os dias',
    ref: 'Daniel 6.10-11 (NAA)',
    backdrop: 'casa',
    props: ['🙏', '🪟'],
    acts: [
      'Daniel tinha o costume de orar três vezes por dia.',
      'Ele abria a janela e agradecia a Deus, como sempre fazia.',
      'Nada conseguia tirar a amizade de Daniel com Deus.',
    ],
    q: 'Quantas vezes por dia Daniel orava?',
    right: { t: 'Três vezes', e: '🙏' },
    wrongs: [
      { t: 'Nunca', e: '🙈' },
      { t: 'Só de madrugada', e: '🌙' },
      { t: 'Uma vez por mês', e: '📅' },
    ],
    sticker: '🙏',
  },
  {
    id: 'd-cova',
    characterId: 'daniel',
    title: 'Daniel e a cova dos leões',
    ref: 'Daniel 6.16-23 (NAA)',
    backdrop: 'cova',
    props: ['🦁', '😇'],
    acts: [
      'Por inveja, lançaram Daniel na cova dos leões.',
      'Mas Deus mandou o anjo fechar a boca dos leões.',
      'De manhã, Daniel estava vivo e sem nenhum arranhão!',
    ],
    q: 'Quem fechou a boca dos leões na cova?',
    right: { t: 'Deus, pelo seu anjo', e: '🦁' },
    wrongs: [
      { t: 'O rei dormindo', e: '😴' },
      { t: 'Os guardas', e: '🛡️' },
      { t: 'Os próprios leões', e: '😼' },
    ],
    sticker: '🦁',
  },

  /* ------------------------------ Natal / Maria (natal) ------------------------------ */
  {
    id: 'm-anuncio',
    characterId: 'natal',
    title: 'O anjo visita Maria',
    ref: 'Lucas 1.26-38 (NAA)',
    backdrop: 'casa',
    props: ['🕊️', '✨'],
    acts: [
      'O anjo Gabriel apareceu para a jovem Maria.',
      '"Não tenha medo, Maria! Você vai ser a mãe do Salvador."',
      'Maria respondeu: "Que aconteça comigo como Deus falou!"',
    ],
    q: 'Quem visitou Maria para anunciar o nascimento de Jesus?',
    right: { t: 'O anjo Gabriel', e: '🕊️' },
    wrongs: [
      { t: 'Um pastor', e: '🐑' },
      { t: 'Um rei', e: '👑' },
      { t: 'Um médico', e: '🩺' },
    ],
    sticker: '🕊️',
  },
  {
    id: 'm-natal',
    characterId: 'natal',
    title: 'Jesus nasce em Belém',
    ref: 'Lucas 2.6-7 (NAA)',
    backdrop: 'estabulo',
    props: ['👶', '⭐'],
    acts: [
      'Em Belém, Maria e José procuraram um lugar para descansar.',
      'Só havia lugar numa estrebaria, junto dos animais.',
      'Ali nasceu Jesus, o Salvador do mundo.',
    ],
    q: 'Onde Jesus nasceu?',
    right: { t: 'Numa estrebaria', e: '👶' },
    wrongs: [
      { t: 'Num palácio', e: '🏰' },
      { t: 'Numa escolinha', e: '🏫' },
      { t: 'Numa barraca', e: '⛺' },
    ],
    sticker: '⭐',
  },
  {
    id: 'm-magos',
    characterId: 'natal',
    title: 'Os magos seguem a estrela',
    ref: 'Mateus 2.9-11 (NAA)',
    backdrop: 'estabulo',
    props: ['🌟', '🎁'],
    acts: [
      'A estrela guiou os magos até onde estava o menino Jesus.',
      'Eles se alegraram com muita alegria!',
      'E adoraram Jesus, oferecendo ouro, incenso e mirra.',
    ],
    q: 'O que os magos seguiram até encontrar Jesus?',
    right: { t: 'Uma estrela', e: '🌟' },
    wrongs: [
      { t: 'Um vento', e: '💨' },
      { t: 'Um sorvete', e: '🍦' },
      { t: 'Um balão', e: '🎈' },
    ],
    sticker: '🌟',
  },

  {
    id: 'm-templo',
    characterId: 'natal',
    title: 'O menino Jesus no templo',
    ref: 'Lucas 2.41-52 (NAA)',
    backdrop: 'cidade',
    props: ['📜', '👦'],
    acts: [
      'Quando Jesus era menino, a família ia todo ano a Jerusalém.',
      'Um dia, ele ficou no templo conversando com os mestres.',
      'Todos ficaram admirados com a sabedoria do menino Jesus!',
    ],
    q: 'Onde o menino Jesus ficou conversando com os mestres?',
    right: { t: 'No templo', e: '📜' },
    wrongs: [
      { t: 'Na praia', e: '🏖️' },
      { t: 'No mercado', e: '🛒' },
      { t: 'Na escola', e: '🏫' },
    ],
    sticker: '📜',
  },

  /* ------------------------------ Moisés (moises) ------------------------------ */
  {
    id: 's-cesto',
    characterId: 'moises',
    title: 'O bebê no cesto',
    ref: 'Êxodo 2.3-6 (NAA)',
    backdrop: 'rio',
    props: ['🧺', '👶'],
    acts: [
      'Para salvar o bebê Moisés, a mãe o colocou num cesto no rio.',
      'A princesa achou o cesto e teve dó daquele bebê.',
      'E Moisés até pôde crescer com a própria mãe cuidando dele!',
    ],
    q: 'Quem achou o bebê Moisés no cesto?',
    right: { t: 'A princesa', e: '👸' },
    wrongs: [
      { t: 'Um jacaré', e: '🐊' },
      { t: 'O rei', e: '👑' },
      { t: 'Um peixe', e: '🐟' },
    ],
    sticker: '🧺',
  },
  {
    id: 's-sarca',
    characterId: 'moises',
    title: 'A sarça em chamas',
    ref: 'Êxodo 3.2-6 (NAA)',
    backdrop: 'sarca',
    props: ['🔥', '🌿'],
    acts: [
      'Moisés viu uma sarça que queimava sem se apagar.',
      'Deus chamou: "Moisés, Moisés!" E ele respondeu: "Aqui estou!"',
      'Ali, Moisés tirou as sandálias e ouviu a voz de Deus.',
    ],
    q: 'De onde a voz de Deus chamou Moisés?',
    right: { t: 'De uma sarça em fogo', e: '🔥' },
    wrongs: [
      { t: 'De uma árvore', e: '🌳' },
      { t: 'De uma caverna', e: '⛰️' },
      { t: 'De um barco', e: '⛵' },
    ],
    sticker: '🔥',
  },
  {
    id: 's-mar',
    characterId: 'moises',
    title: 'A travessia do Mar Vermelho',
    ref: 'Êxodo 14.21-22 (NAA)',
    backdrop: 'mar-separado',
    props: ['🌊', '🪄'],
    acts: [
      'O Mar Vermelho estava na frente… e o exército vinha atrás.',
      'Moisés estendeu o cajado, e as águas abriram!',
      'O povo de Israel atravessou andando no chão seco.',
    ],
    q: 'O que Moisés abriu para o povo atravessar?',
    right: { t: 'O Mar Vermelho', e: '🌊' },
    wrongs: [
      { t: 'A porta da escola', e: '🚪' },
      { t: 'O muro da cidade', e: '🧱' },
      { t: 'A janela do céu', e: '🪟' },
    ],
    sticker: '🌊',
  },
  {
    id: 's-mandamentos',
    characterId: 'moises',
    title: 'Os dez mandamentos',
    ref: 'Êxodo 20.1-17 (NAA)',
    backdrop: 'monte',
    props: ['📜', '⛰️'],
    acts: [
      'No monte Sinai, o povo viu fumaça e ouviu a voz de Deus.',
      'Deus entregou ao povo os dez mandamentos.',
      'Eles ensinam a amar a Deus e a amar o próximo.',
    ],
    q: 'Onde Deus entregou os dez mandamentos a Moisés?',
    right: { t: 'No monte Sinai', e: '⛰️' },
    wrongs: [
      { t: 'No mar', e: '🌊' },
      { t: 'Na cidade', e: '🏙️' },
      { t: 'No deserto vazio', e: '🏜️' },
    ],
    sticker: '📜',
  },

  /* ------------------------------ Josué (josue) ------------------------------ */
  {
    id: 'jo-raabe',
    characterId: 'josue',
    title: 'Raabe ajuda os espias',
    ref: 'Josué 2.1-6 (NAA)',
    backdrop: 'muralha',
    props: ['🧵', '🪟'],
    acts: [
      'Josué enviou dois espias para conhecer Jericó.',
      'Raabe os escondeu no telhado e os ajudou a fugir em segurança.',
      'Ela confiou no Deus de Israel — e sua família foi salva!',
    ],
    q: 'Quem escondeu e ajudou os espias em Jericó?',
    right: { t: 'Raabe', e: '🧵' },
    wrongs: [
      { t: 'O rei da cidade', e: '👑' },
      { t: 'Um soldado', e: '🛡️' },
      { t: 'Um pastor', e: '🐑' },
    ],
    sticker: '🧵',
  },
  {
    id: 'jo-jordao',
    characterId: 'josue',
    title: 'O rio que se abriu',
    ref: 'Josué 3.14-17 (NAA)',
    backdrop: 'rio',
    props: ['💧', '🪨'],
    acts: [
      'O rio Jordão estava cheio, na frente do povo de Deus.',
      'Os sacerdotes levaram a arca até a água…',
      'E o rio se abriu! Todo o povo atravessou no seco.',
    ],
    q: 'Qual rio se abriu para o povo atravessar?',
    right: { t: 'O rio Jordão', e: '💧' },
    wrongs: [
      { t: 'O rio Nilo', e: '🐊' },
      { t: 'O rio Amarelo', e: '🌾' },
      { t: 'O ribeirão', e: '🏞️' },
    ],
    sticker: '💧',
  },
  {
    id: 'jo-muralhas',
    characterId: 'josue',
    title: 'As muralhas de Jericó',
    ref: 'Josué 6.12-20 (NAA)',
    backdrop: 'muralha',
    props: ['📯', '🎺'],
    acts: [
      'Seis dias, o povo marchou em volta de Jericó em silêncio.',
      'No sétimo dia, tocaram as trombetas e gritaram bem alto!',
      'E as muralhas caíram! O povo de Deus entrou na cidade.',
    ],
    q: 'O que caiu quando o povo tocou as trombetas?',
    right: { t: 'As muralhas de Jericó', e: '📯' },
    wrongs: [
      { t: 'A ponte do rio', e: '🌉' },
      { t: 'As torres do céu', e: '🌤️' },
      { t: 'As árvores', e: '🌳' },
    ],
    sticker: '📯',
  },
  {
    id: 'jo-sol',
    characterId: 'josue',
    title: 'O sol que parou',
    ref: 'Josué 10.12-13 (NAA)',
    backdrop: 'vale',
    props: ['☀️', '🌙'],
    acts: [
      'Numa grande batalha, Josué precisava de mais tempo.',
      'Ele orou: "Sol, pare em Gibeom!"',
      'E o sol parou, até o povo de Deus vencer!',
    ],
    q: 'O que Josué pediu a Deus que parasse?',
    right: { t: 'O sol', e: '☀️' },
    wrongs: [
      { t: 'O rio', e: '💧' },
      { t: 'O vento', e: '💨' },
      { t: 'A chuva', e: '🌧️' },
    ],
    sticker: '☀️',
  },

  /* ------------------------------ Davi (davi) ------------------------------ */
  {
    id: 'v-ungido',
    characterId: 'davi',
    title: 'Davi é escolhido por Samuel',
    ref: '1 Samuel 16.1-13 (NAA)',
    backdrop: 'campo',
    props: ['🫗', '🐑'],
    acts: [
      'Deus mandou o profeta Samuel procurar um novo rei.',
      'Samuel viu os irmãos fortes, mas Deus disse: "Deus vê o coração."',
      'Então Samuel ungiu Davi, o filho mais jovem, que cuidava das ovelhas.',
    ],
    q: 'O que Deus olha quando escolhe alguém?',
    right: { t: 'O coração', e: '💛' },
    wrongs: [
      { t: 'A altura', e: '📏' },
      { t: 'A força', e: '💪' },
      { t: 'A roupa', e: '👕' },
    ],
    sticker: '🫗',
  },
  {
    id: 'v-harpa',
    characterId: 'davi',
    title: 'A música que acalma o rei',
    ref: '1 Samuel 16.21-23 (NAA)',
    backdrop: 'palacio',
    props: ['🎼', '🎶'],
    acts: [
      'O rei Saul estava triste e assustado.',
      'Trouxeram o jovem Davi, que tocava harpa muito bem.',
      'A música acalmava o coração do rei!',
    ],
    q: 'O que Davi tocava para acalmar o rei Saul?',
    right: { t: 'A harpa', e: '🎼' },
    wrongs: [
      { t: 'O pandeiro', e: '🥁' },
      { t: 'A flauta', e: '🪈' },
      { t: 'O violão', e: '🎸' },
    ],
    sticker: '🎼',
  },
  {
    id: 'v-golias',
    characterId: 'davi',
    title: 'Davi e o gigante Golias',
    ref: '1 Samuel 17.40-50 (NAA)',
    backdrop: 'vale',
    props: ['🪨', '🛡️'],
    acts: [
      'O gigante Golias desafiava o exército de Deus.',
      'Davi subiu com sua funda e cinco pedras lisas.',
      'Ele disse: "A batalha é do Senhor!" E venceu o gigante.',
    ],
    q: 'Com o que Davi venceu o gigante?',
    right: { t: 'Uma pedra e sua funda', e: '🪨' },
    wrongs: [
      { t: 'Uma lança dos soldados', e: '🔱' },
      { t: 'Uma espada grande', e: '⚔️' },
      { t: 'Um grito na floresta', e: '📣' },
    ],
    sticker: '🪨',
  },
  {
    id: 'v-jonata',
    characterId: 'davi',
    title: 'A amizade de Jônatas',
    ref: '1 Samuel 18.1-4 (NAA)',
    backdrop: 'campo',
    props: ['🤝', '🎽'],
    acts: [
      'Depois da luta contra o gigante, Davi conheceu Jônatas.',
      'Eles viraram grandes amigos, de coração.',
      'Jônatas até deu o próprio manto e a espada para Davi.',
    ],
    q: 'Quem virou grande amigo de Davi?',
    right: { t: 'Jônatas, filho do rei', e: '🤝' },
    wrongs: [
      { t: 'O gigante Golias', e: '🧌' },
      { t: 'O rei da noite', e: '🌙' },
      { t: 'Ninguém', e: '🙈' },
    ],
    sticker: '🤝',
  },

  /* ------------------------------ Salomão (salomao) ------------------------------ */
  {
    id: 'so-sabedoria',
    characterId: 'salomao',
    title: 'O pedido de sabedoria',
    ref: '1 Reis 3.9-12 (NAA)',
    backdrop: 'noite',
    props: ['🌙', '📖'],
    acts: [
      'Deus disse ao jovem rei Salomão: "Pode pedir o que quiser!"',
      'E Salomão pediu: "Dá-me um coração com sabedoria!"',
      'Deus ficou tão feliz que deu sabedoria, riqueza e honra!',
    ],
    q: 'O que Salomão pediu a Deus?',
    right: { t: 'Sabedoria', e: '📖' },
    wrongs: [
      { t: 'Um cavalo veloz', e: '🐎' },
      { t: 'Muitas frutas', e: '🍎' },
      { t: 'Uma coroa maior', e: '👑' },
    ],
    sticker: '📖',
  },
  {
    id: 'so-juizo',
    characterId: 'salomao',
    title: 'O rei sábio e as duas mães',
    ref: '1 Reis 3.16-27 (NAA)',
    backdrop: 'palacio',
    props: ['⚖️', '👶'],
    acts: [
      'Duas mães vieram ao rei com um problema muito difícil.',
      'Cada uma dizia que o bebê era seu.',
      'Com sabedoria, Salomão descobriu a verdade — e a verdadeira mãe abraçou o filho!',
    ],
    q: 'Como Salomão encontrou a verdade no caso das duas mães?',
    right: { t: 'Com sabedoria', e: '⚖️' },
    wrongs: [
      { t: 'Com uma luta', e: '🥊' },
      { t: 'Com um sorteio', e: '🎰' },
      { t: 'Com a opinião do vento', e: '💨' },
    ],
    sticker: '⚖️',
  },
  {
    id: 'so-templo',
    characterId: 'salomao',
    title: 'O templo de Deus',
    ref: '1 Reis 6.1 (NAA)',
    backdrop: 'cidade',
    props: ['🏗️', '✨'],
    acts: [
      'Salomão construiu uma casa especial para adorar a Deus.',
      'Muitos trabalhadores cortaram pedras e madeira com cuidado.',
      'Quando ficou pronta, a glória de Deus encheu o templo!',
    ],
    q: 'O que Salomão construiu para adorar a Deus?',
    right: { t: 'O templo', e: '🏗️' },
    wrongs: [
      { t: 'Um navio', e: '⛵' },
      { t: 'Uma ponte', e: '🌉' },
      { t: 'Uma torre de frutas', e: '🍇' },
    ],
    sticker: '🏗️',
  },
  {
    id: 'so-saba',
    characterId: 'salomao',
    title: 'A rainha de Sabá',
    ref: '1 Reis 10.1-9 (NAA)',
    backdrop: 'palacio',
    props: ['🐪', '🎁'],
    acts: [
      'A rainha de Sabá ouviu falar da sabedoria de Salomão.',
      'Ela viajou com presentes e muitas perguntas curiosas.',
      'Depois ela disse: "Nem metade me contaram! Como Deus é maravilhoso!"',
    ],
    q: 'O que a rainha de Sabá veio ver de Salomão?',
    right: { t: 'A sabedoria', e: '🐪' },
    wrongs: [
      { t: 'O jardim secreto', e: '🌷' },
      { t: 'A cozinha do palácio', e: '🍳' },
      { t: 'O cavalo real', e: '🐎' },
    ],
    sticker: '🐪',
  },

  /* ------------------------------ Paulo (paulo) ------------------------------ */
  {
    id: 'p-damasco',
    characterId: 'paulo',
    title: 'A luz no caminho de Damasco',
    ref: 'Atos 9.3-6 (NAA)',
    backdrop: 'estrada',
    props: ['✨', '🌄'],
    acts: [
      'Saulo ia para Damasco perseguindo os cristãos.',
      'De repente, uma luz do céu brilhou ao redor dele!',
      'Jesus falou com ele… e Saulo nunca mais foi o mesmo. Virei Paulo, o apóstolo!',
    ],
    q: 'O que aconteceu com Saulo no caminho de Damasco?',
    right: { t: 'Ele viu a luz de Jesus', e: '✨' },
    wrongs: [
      { t: 'Ele dormiu na estrada', e: '😴' },
      { t: 'Ele perdeu o burro', e: '🫏' },
      { t: 'Ele choveu demais', e: '☔' },
    ],
    sticker: '✨',
  },
  {
    id: 'p-prisao',
    characterId: 'paulo',
    title: 'Os presos que cantavam',
    ref: 'Atos 16.25-26 (NAA)',
    backdrop: 'prisao',
    props: ['🎶', '🙌'],
    acts: [
      'Paulo e Silas estavam presos na masmorra escura.',
      'De madrugada, cantavam louvores a Deus.',
      'Um terremoto abriu as portas… e o carcereiro se encantou com aquele Deus!',
    ],
    q: 'O que Paulo e Silas cantavam na prisão?',
    right: { t: 'Louvores a Deus', e: '🎶' },
    wrongs: [
      { t: 'Canções de ninar', e: '😴' },
      { t: 'Contas de piadas', e: '😂' },
      { t: 'Músicas muito tristes', e: '🥀' },
    ],
    sticker: '🎶',
  },
  {
    id: 'p-naufragio',
    characterId: 'paulo',
    title: 'O naufrágio no mar',
    ref: 'Atos 27.20-25 (NAA)',
    backdrop: 'mar-aberto',
    props: ['🌊', '⛵'],
    acts: [
      'O navio de Paulo pegou uma tempestade muito forte.',
      'Todos tinham medo de morrer no mar.',
      'Paulo disse: "Não tenham medo! Deus vai nos salvar!" E salvou a todos.',
    ],
    q: 'Quem disse "Não tenham medo" no meio da tempestade?',
    right: { t: 'Paulo', e: '⛵' },
    wrongs: [
      { t: 'O capitão do navio', e: '🧑‍✈️' },
      { t: 'A sereia', e: '🧜‍♀️' },
      { t: 'O vento', e: '💨' },
    ],
    sticker: '⛵',
  },
  {
    id: 'p-cartas',
    characterId: 'paulo',
    title: 'As cartas de Paulo',
    ref: 'Filipenses 4.4-7 (NAA)',
    backdrop: 'prisao',
    props: ['✉️', '🕯️'],
    acts: [
      'Mesmo preso, Paulo escrevia cartas para os amigos.',
      'Ele dizia: "Alegrem-se sempre! Deus está perto."',
      'E ensinava a orar com gratidão, sem ficar com medo.',
    ],
    q: 'O que Paulo escrevia para os amigos?',
    right: { t: 'Cartas cheias de fé', e: '✉️' },
    wrongs: [
      { t: 'Listas de compras', e: '🛒' },
      { t: 'Bilhetes de fuga', e: '🏃' },
      { t: 'Nada', e: '🙈' },
    ],
    sticker: '✉️',
  },
];

/** Guarda por personagem: `SCENES_BY_CHARACTER[characterId]` na ordem do catálogo. */
export function scenesForCharacter(characterId: string): Scene[] {
  return SCENES.filter((s) => s.characterId === characterId);
}

/** Total de figurinhas colecionáveis. */
export const SCENE_COUNT = SCENES.length;