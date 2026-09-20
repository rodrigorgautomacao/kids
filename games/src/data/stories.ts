// Historinhas de capítulo por níveis (1-10). Cada cena tem 2 escolhas:
// `good` (certa) e `bad` (errada), com consequências curtas para leitura.

export interface StoryScenario {
  /** Título curto da cena */
  title: string;
  /** História em 1-2 frases */
  story: string;
  good: string;
  goodEmoji: string;
  bad: string;
  badEmoji: string;
  goodOutcome: string;
  badOutcome: string;
}

export const MOEDA_SCENARIOS: StoryScenario[] = [
  {
    title: 'A moeda do pátio',
    story: 'Você acha uma moeda de R$ 1 no chão do pátio. O dono está ali perto, procurando.',
    good: 'Devolver ao dono',
    goodEmoji: '🙂',
    bad: 'Guardar no bolso',
    badEmoji: '🤫',
    goodOutcome:
      'O dono agradece com um sorriso e vocês viram amigos! Deus viu seu coração honesto.',
    badOutcome:
      'A moeda esquentava o bolso… O dono foi embora triste e você ficou desconfiado.',
  },
  {
    title: 'O troco a mais',
    story: 'Na cantina, o moço te devolve R$ 5 a mais no troco. Ele nem percebeu.',
    good: 'Devolver o troco a mais',
    goodEmoji: '💵',
    bad: 'Pegar e sair rápido',
    badEmoji: '🏃',
    goodOutcome:
      'Você devolveu e o moço ficou tão feliz que te deu um doce. Honestidade vale ouro!',
    badOutcome:
      'Você saiu rápido, mas com o coração remoendo. O dinheiro a mais não trouxe paz.',
  },
  {
    title: 'O lanche esquecido',
    story: 'Seu amigo esqueceu o lanche na mesa e você está com muita fome.',
    good: 'Chamar ele para comer junto',
    goodEmoji: '🍞',
    bad: 'Comer escondido',
    badEmoji: '😋',
    goodOutcome:
      'Vocês dividiram o lanche e ninguém ficou de fora. Dividir faz tudo render!',
    badOutcome:
      'Você comeu escondido, mas quando ele descobriu, a confiança rachou como ovo.',
  },
  {
    title: 'A carteira achada',
    story: 'No parquinho, você acha uma carteira com dinheiro e documentos.',
    good: 'Entregar para um adulto',
    goodEmoji: '👮',
    bad: 'Guardar escondida',
    badEmoji: '🕳️',
    goodOutcome:
      'O adulto achou o dono e você salvou o dia de alguém. Que recompensa boa!',
    badOutcome:
      'A carteira pesava como pedra na mochila. Guardar algo que não é seu pesa o coração.',
  },
  {
    title: 'O brinquedo do irmão',
    story: 'Seu irmão esqueceu o brinquedo favorito na rua. Só você viu.',
    good: 'Pegar e devolver para ele',
    goodEmoji: '🚗',
    bad: 'Esconder para brincar sozinho',
    badEmoji: '🙊',
    goodOutcome:
      'Você devolveu e ele ficou tão grato que deixou você brincar junto. Confiança cresce!',
    badOutcome:
      'Brincar escondido com o brinquedo alheio não durou: quando ele notou, o clima ficou feio.',
  },
  {
    title: 'O tablet do tio',
    story: 'O tio pediu: "não mexam no meu tablet". Ele foi atender o telefone.',
    good: 'Não mexer',
    goodEmoji: '🙅',
    bad: 'Mexer escondido',
    badEmoji: '🎮',
    goodOutcome:
      'Você não tocou e o tio confiou ainda mais em você. Confiança se constrói obediendo.',
    badOutcome:
      'Você mexeu e derrubou o tablet! Agora o tio sabe quem foi. Mentira não apaga isso.',
  },
  {
    title: 'O lápis quebrado',
    story: 'Você pega o lápis emprestado do colega e ele quebra sem querer.',
    good: 'Contar logo a verdade',
    goodEmoji: '✏️',
    bad: 'Devolver calado',
    badEmoji: '🤐',
    goodOutcome:
      'Você contou e ele disse: "sem problema, acontece!". A verdade resolve tudo.',
    badOutcome:
      'Ele descobriu dias depois e ficou magoado. Uma quebra de confiança dói mais que lápis.',
  },
  {
    title: 'A nota no mercado',
    story: 'No mercado, você acha uma nota de R$ 50 no chão, pertinho do caixa.',
    good: 'Entregar no caixa',
    goodEmoji: '💛',
    bad: 'Guardar rápido',
    badEmoji: '🥷',
    goodOutcome:
      'No caixa, acharam o dono! Alguns adultos até quiseram te recompensar. Deus abençoa a verdade.',
    badOutcome:
      'Você guardou, mas teve que ficar escondendo o tempo todo. Dinheiro errado dá frio na barriga.',
  },
  {
    title: 'O dinheiro emprestado',
    story: 'O amigo te emprestou R$ 2 para o lanche. Ele pede de volta.',
    good: 'Pedir desculpas e devolver aos poucos',
    goodEmoji: '🤝',
    bad: 'Dizer que não lembra',
    badEmoji: '😏',
    goodOutcome:
      'Você devolveu aos poucos até zerar. Ele já sabe: pode confiar em você para sempre.',
    badOutcome:
      'Você fingiu que não lembrava. Ele ficou triste e emprestou para outro colega depois.',
  },
  {
    title: 'O doce a mais',
    story: 'Na fila, o vendedor te dá dois doces por engano. Você só pagou um.',
    good: 'Devolver o doce extra',
    goodEmoji: '🍭',
    bad: 'Guardar e calar',
    badEmoji: '🥸',
    goodOutcome:
      'Você devolveu o doce e o vendedor riu: "trouxe um bom amigo hoje!". Justo é melhor que fácil.',
    badOutcome:
      'Cada mordida no doce extra tinha gosto de culpa. O que é desonesto nunca satisfaz.',
  },
];

export const MENTIRA_SCENARIOS: StoryScenario[] = [
  {
    title: 'O vaso quebrado',
    story: 'A bola acertou o vaso favorito do adulto. Ele pergunta: "quem foi?"',
    good: 'Contar a verdade',
    goodEmoji: '💬',
    bad: 'Dizer que não foi você',
    badEmoji: '🙈',
    goodOutcome:
      'Você contou e o adulto disse: "a verdade vale mais que o vaso". Alívio no coração!',
    badOutcome:
      'A mentira virou uma sombra. O adulto descobriu depois e a confiança rachou.',
  },
  {
    title: 'A desculpa do recreio',
    story: 'Você voltou tarde do recreio e a professora pergunta o motivo.',
    good: 'Contar a verdade',
    goodEmoji: '⏰',
    bad: 'Inventar uma desculpa',
    badEmoji: '🎭',
    goodOutcome:
      'Você explicou e ela disse para prestar atenção no horário. Com a verdade, fica leve.',
    badOutcome:
      'A desculpa foi bonita, mas por dentro você sabia. Mentira cansa de carregar.',
  },
  {
    title: 'A bagunça do irmão',
    story: 'Quem bagunçou o quarto foi você, mas o irmãozinho toma a culpa pelo cachorro.',
    good: 'Assumir a bagunça',
    goodEmoji: '🧹',
    bad: 'Deixar o cachorro levar a culpa',
    badEmoji: '🐶',
    goodOutcome:
      'Você assumiu, arrumou tudo e o irmãozinho te achou um herói. Coragem é dizer a verdade.',
    badOutcome:
      'O pobre cachorro foi xingado. Guardar uma injustiça assim faz mal para a alma.',
  },
  {
    title: 'O doce antes do almoço',
    story: 'Você prometeu não comer doce antes do almoço… e comeu. Papai pergunta.',
    good: 'Dizer a verdade',
    goodEmoji: '🍬',
    bad: 'Negar com a boca cheia',
    badEmoji: '😛',
    goodOutcome:
      'Você confessou e papai riu da cara de lerdo. Errar é humano, mentir não precisa.',
    badOutcome:
      'Negar com a boca cheia não funciona! A verdade escapa quando você menos espera.',
  },
  {
    title: 'O segredo do amigo',
    story: 'Seu melhor amigo conta um segredo. Outra criança pergunta por ele.',
    good: 'Dizer que é segredo',
    goodEmoji: '🤐',
    bad: 'Contar o segredo',
    badEmoji: '🗣️',
    goodOutcome:
      'Você guardou o segredo e o amigo confiou ainda mais. Amigo de verdade protege.',
    badOutcome:
      'Você contou e agora é amigo de quem? Falar demais quebra amizades.',
  },
  {
    title: 'O desenho premiado',
    story: 'A monitora elogia um desenho lindo achando que é seu. Na verdade é do colega.',
    good: 'Explicar que não foi você',
    goodEmoji: '🎨',
    bad: 'Aceitar o elogio',
    badEmoji: '😏',
    goodOutcome:
      'Você apontou o colega e todos o aplaudiram. Honrar o outro é uma honra.',
    badOutcome:
      'Você aceitou o elogio, mas todo mundo descobriu. Fama roubada não dura.',
  },
  {
    title: 'O botão do elevador',
    story: 'Você apertou o botão do elevador várias vezes. Ninguém viu, ninguém sabe.',
    good: 'Dizer que foi você',
    goodEmoji: '🛗',
    bad: 'Deixar que culpe o irmão',
    badEmoji: '😇',
    goodOutcome:
      'Você contou e todo mundo entendeu: criança curiosa! Erro confessado quase completa o perdão.',
    badOutcome:
      'O irmão levou a bronca no seu lugar. Levar culpa dos outros é viver no castigo.',
  },
  {
    title: 'A lição esquecida',
    story: 'Você esqueceu a lição em casa. A professora pergunta onde está.',
    good: 'Dizer que esqueceu',
    goodEmoji: '📚',
    bad: 'Dizer que não tinha lição',
    badEmoji: '📭',
    goodOutcome:
      'Você falou a verdade e ela te deu um dia extra. Simples assim!',
    badOutcome:
      '"Não tinha lição" não combina com o caderno cheio. Mentira tem perna curta.',
  },
  {
    title: 'O biscoito do amigo',
    story: 'Você comeu o biscoito do lanche do amigo sem pedir. Ele pergunta.',
    good: 'Pedir desculpas e contar',
    goodEmoji: '🍪',
    bad: 'Dizer que não sabe',
    badEmoji: '🤔',
    goodOutcome:
      'Você pediu desculpas e dividiu o seu. Ele até ofereceu: "quer mais?".',
    badOutcome:
      'Você disse "não sei" com farinha na bochecha! Pedir desculpas é mais fácil.',
  },
  {
    title: 'A mentirinha do dia',
    story: 'Sem querer, você disse que já tinha arrumado a cama. A mãe pergunta de novo.',
    good: 'Contar a verdade e arrumar',
    goodEmoji: '🛏️',
    bad: 'Repetir a mentirinha',
    badEmoji: '🔁',
    goodOutcome:
      'Você contou, arrumou numa boa e a mãe viu seu coração. Verdade dá paz.',
    badOutcome:
      'A mentirinha pediu mais uma, e mais outra… Até virar uma bola de neve.',
  },
];

export const TURMA_SCENARIOS: StoryScenario[] = [
  {
    title: 'O colega novo',
    story: 'Um colega novo chegou na escola. A turma vai brincar e o deixa para trás.',
    good: 'Chamar ele para brincar',
    goodEmoji: '🫶',
    bad: 'Ir com a turma',
    badEmoji: '🏃',
    goodOutcome:
      'Ele sorriu o maior sorriso! Amizade que inclui é a que cresce.',
    badOutcome:
      'Ele assistiu de longe, sozinho. Um colega a menos na turma e no coração.',
  },
  {
    title: 'O tobogã cheio',
    story: 'Só têm 3 lugares para 4 coleguinhas brincarem no tobogã.',
    good: 'Revezar para caber todo mundo',
    goodEmoji: '🛝',
    bad: 'Segurar o lugar só para os 3',
    badEmoji: '🙅',
    goodOutcome:
      '"Depois é minha vez!", disse você. Todo mundo brincou e ninguém ficou de fora.',
    badOutcome:
      'O colega que ficou de fora foi embora chateado. Sobrou lugar sobrando no brinquedo.',
  },
  {
    title: 'A bola de rodas',
    story: 'Uma menina com cadeira de rodas quer entrar no time de queimada.',
    good: 'Incluir ela no time',
    goodEmoji: '⚽',
    bad: 'Dizer que ela não consegue',
    badEmoji: '🙄',
    goodOutcome:
      'Ela mandou muito bem no gol! Limite verdadeiro é o do coração.',
    badOutcome:
      'Você a deixou de fora e o jogo nem foi tão divertido assim. Todo mundo perde.',
  },
  {
    title: 'O menor da turma',
    story: 'O grupo quer jogar sem o menor da turma, "porque ele não alcança".',
    good: 'Chamar todo mundo',
    goodEmoji: '🤗',
    bad: 'Deixar o menor de fora',
    badEmoji: '😤',
    goodOutcome:
      'Você chamou, ele alcançou um monte e todo mundo vibrou. Cada um tem seu talento.',
    badOutcome:
      'O menor foi para o escorregador sozinho, olhando de longe a turma brincar.',
  },
  {
    title: 'O irmão mais novo',
    story: 'Seu irmão chega para jogar com você e os amigos.',
    good: 'Deixar ele jogar',
    goodEmoji: '🤲',
    bad: 'Dizer: "só dos grandes"',
    badEmoji: '🙅‍♂️',
    goodOutcome:
      'Você deixou e ele se divertiu demais. Deixar alguém entrar no jogo é ser grande de verdade.',
    badOutcome:
      'Ele sentou no banco olhando o jogo. Um irmão excluído é um amigo a menos.',
  },
  {
    title: 'O sotaque diferente',
    story: 'Um colega fala de um jeito diferente e a turma começa a rir.',
    good: 'Ser amigo e defender',
    goodEmoji: '🛡️',
    bad: 'Rir junto',
    badEmoji: '🤭',
    goodOutcome:
      'Você pediu: "deixa ele falar, é super legal!". Assim se ensina respeito.',
    badOutcome:
      'Sua risada doeu mais que a risada deles. Quem ri do diferente esquece que é único.',
  },
  {
    title: 'O lugar do amigo',
    story: 'A turma quer brincar num lugar onde o seu amigo alérgico nem pode ir.',
    good: 'Escolher brincadeira que todo mundo pode',
    goodEmoji: '💡',
    bad: 'Ir sem ele',
    badEmoji: '👋',
    goodOutcome:
      'Você achou uma brincadeira nova e todo mundo gostou. Criatividade que inclui!',
    badOutcome:
      'Vocês foram e ele ficou na janela. A alegria veio pela metade.',
  },
  {
    title: 'A medalha conquistada',
    story: 'Você ganhou uma medalha na corrida. Todos querem ver de perto.',
    good: 'Compartilhar a alegria com todos',
    goodEmoji: '🥇',
    bad: 'Esconder só para você',
    badEmoji: '🔒',
    goodOutcome:
      'Vocês comemoraram juntos e a vitória até brilhou mais. Alegria dividida só aumenta.',
    badOutcome:
      'Você guardou a medalha na mochila para se gabar depois. Vitória egoísta esfria rápido.',
  },
  {
    title: 'O livro da leitura',
    story: 'O grupo escolheu o livro, mas o amigo não gosta daquela história.',
    good: 'Revezar: cada um escolhe uma vez',
    goodEmoji: '📖',
    bad: 'Só o que a maioria quer',
    badEmoji: '🗳️',
    goodOutcome:
      'A vez do amigo veio e vocês conheceram uma história nova. Revezar ensina e diverte.',
    badOutcome:
      'O amigo leu entediado. Maioria que ignora um deixa o grupo pela metade.',
  },
  {
    title: 'O amigo triste',
    story: 'Um coleguinha está sentado num canto, triste, sem ninguém.',
    good: 'Convidar para brincar',
    goodEmoji: '🫂',
    bad: 'Continuar e esperar ele passar',
    badEmoji: '😶',
    goodOutcome:
      'Ele levantou animado! Um convite pode mudar o dia de alguém inteirinho.',
    badOutcome:
      'Você brincou o recreio todo sem ver o colega sozinho. Amigo de verdade olha em volta.',
  },
];