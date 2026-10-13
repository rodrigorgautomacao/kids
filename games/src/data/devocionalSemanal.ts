// O Devocional da Semana — curadoria a partir do material do dono.
//
// FONTE
// Duas semanas vieram do dono como PDF de 7 páginas cada (capa + segunda a
// sábado): "Devocionais 28 set a 03 outubro" (semana 40) e "Devocionais 05 a
// 10 outubro" (semana 41). A terceira, "devocionais do dia 12 a 17 outubro
// 2026" (semana 42), veio como **7 PNGs** (capa + 2ª a sábado) — sem PDF, então
// o texto foi lido por OCR (tesseract por) e conferido linha a linha. A página
// traz, por dia: o **versículo do dia** (só a referência), um **parágrafo de
// mensagem** em caixa-alta (texto do AUTOR, não é citação bíblica), o bloco
// **PRATICANDO**, as leituras extras da semana e, às vezes, caixotes extras
// ("Culto da Família", "Manual da vida", "Conectando"), **MEMORIZE** e
// sugestões de música.
//
// REGRA DE REFERÊNCIA (a que vale para todo o arquivo)
// - `versiculo.ref` é a referência tal como no material, normalizada no formato
//   da vertical: `Livro cap.vers` com ponto (ex.: 'Salmos 104.1').
// - 🔒 `versiculo.texto` fica **VAZIO em toda a semana**. O material **não cita
//   o texto de nenhum versículo**: ele dá a referência e em seguida parafraseia o
//   versículo em caixa-alta (ex.: o texto de 'Salmos 104.1' no PDF começa com
//   "MUITAS VEZES, PRECISAMOS LEMBRAR A NOSSA PRÓPRIA ALMA DE..."). Como a
//   vertical é NAA (ADR-001 / jogos-biblicos §2), escrever o versículo aqui
//   seria **inventar texto bíblico**. `texto` só será preenchido se o dono
//   entregar o texto NAA com a devida permissão da SBB:
//   `NAA — Nova Almeida Atualizada® © 2017 Sociedade Bíblica do Brasil. Usada
//   com permissão.`
//   Única exceção possível e **não usada**: a capa de 28/09. Ali o versículo
//   (Salmos 119.160) vem citado por extenso, mas numa redação que **não é a
//   da NAA** e cujo o material não identifica. Na dúvida, cita-se só a `ref`.
//   A capa de 05/10, por sua vez, **não traz versículo algum** (conferido na
//   arte do PDF): `ref` fica vazia de propósito e a tela omite o bloco —
//   exceção listada no teste (`CAPA_SEM_VERSICULO`), como `praticando`.
//   A capa de 12/10 (PNG) é só arte/script decorativo — o OCR não devolve
//   nenhum versículo legível, então `ref` também fica vazia de propósito e a
//   semana entra em `CAPA_SEM_VERSICULO`. Se o dono entregar a capa com o
//   versículo, é só preencher e tirar da lista.
//   O rodapé do material ("Todos os seus filhos serão ensinados pelo SENHOR…
//   Isaías 54:13") se repete em TODAS as artes da semana 42: é elemento
//   gráfico do template, não o versículo do dia, e por isso é ignorado.
//
// CURAÇÃO DE LINGUAGEM
// - O material foi escrito para leitor maduro. `texto` e `praticando` foram
//   adaptados para a linguagem da criança (frases curtas, uma ideia por frase)
//   **sem mudar o sentido teológico**: a graça continua sendo graça.
// - Tom de graça e esperança (jogos-biblicos §5): nada de medo, culpa, castigo
//   ou julgamento como ponto. O erro de quem lê não pune.
// - Nada de loja, app, celular, rede social, dízimo, oferta ou "assine".
// - Sem marca de igreja: **o material não traz nome de igreja, ministério ou
//   líder** (conferido página a página), então nada foi removido por esse motivo.
//
// CAMPOS VAZIOS DE PROPÓSITO (legibilidade da fonte)
// - Terça e Quinta saíram do PDF em outra diagramação e **não têm bloco
//   PRATICANDO**; onde a fonte é vaga, o campo fica vazio em vez de inventado
//   (`praticando: ''`).
// - Os caixotes de Terça **da semana 40** saíram só com o TÍTULO (o corpo está
//   na imagem do PDF). Dois foram resolvidos e um foi descartado:
//     · "Manual da vida: para que serve tudo isso?" — a RESPOSTA estava no
//       caixote ilegível, e o dia é uma pergunta sem resolução (quebra o
//       contrato da lição: a criança precisa sair sabendo). A resposta foi
//       escrita por conta própria a partir do VERSÍCULO ÂNCORA do dia
//       (1 Coríntios 10.31 — tudo o que se faz pode ser para glorificar a
//       Deus), **sem reproduzir a redação da NAA**; ver o comentário no campo.
//     · "Conectando" — era o cabeçalho do próprio texto do dia, já em
//       `texto`. Duplicaria na tela.
//     · "Culto da Família" — atividade da igreja, fora do produto (ADR-001).
// - Semana 41: Terça traz "Culto da Família" (excluído), "SPOILER da vida:
//   Deus tem um plano para mim?" (virou o `tema` do dia — a resposta está no
//   próprio `texto`, como o "Conectando" da semana 40 virou cabeçalho) e a
//   sugestão "Jesus em Tua Presença — Asaph Borba" (ignorada, mesma regra).
//   Quinta é a página MEMORIZE + OBJETIVO, só material do professor: a
//   mensagem foi reescrita na linguagem da criança e a referência do MEMORIZE
//   (Isaías 45.18) virou o `versiculo.ref` — a citação em caixa-alta do
//   material não é a redação da NAA e não entra no campo `texto`.
// - Semana 42: Terça é a página do caixote **CONECTANDO** (a história da
//   camisa do time rival) e não traz **PRATICANDO** — o que há embaixo é a
//   sugestão de música "Não mais escravos (No Longer Slaves) — Fernandinho,
//   Bethel Music", ignorada (mesma regra). O texto do dia é a própria história
//   do caixote. Quinta é a página **MEMORIZE + OBJETIVO** (só material do
//   professor): a mensagem foi reescrita na linguagem da criança a partir do
//   OBJETIVO e a referência do MEMORIZE (Isaías 45.18) virou o
//   `versiculo.ref` — a citação em caixa-alta do material não é a redação da
//   NAA e não entra no campo `texto`; por isso também não há `praticando`.
// - As sugestões de música do material (ex.: "Canção ao Cordeiro — Israel
//   Salazar, Ana Paula Valadão"; "Jesus em Tua Presença — Asaph Borba") foram
//   **ignoradas**: o esquema não tem campo
//   de louvor. Se um dia entra, é como `extras`, nunca como marca de igreja.
//
// HISTÓRICO
// `DEVOCIONAIS` é um histórico: o dono acrescenta uma `SemanaDevocional` nova
// simplesmente inserindo mais um objeto no array, do mais antigo para o mais
// recente. `DEVOCIONAL_INICIO_ATUAL` e `semanasPorTema()` são derivados — não
// duplicam dado à mão.

export interface Versiculo {
  /** Texto corrido na linguagem da criança. Só preencha se o versículo estiver citado na fonte. */
  texto: string;
  /** Referência bíblica (NAA), ex.: 'Salmos 104.1'. */
  ref: string;
}

export interface CaixaDevocional {
  titulo: string;
  texto: string;
}

export interface DiaDevocional {
  /** 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' */
  id: string;
  /** 'Segunda' */
  dia: string;
  /** Data impressa no material, ex.: '28 de setembro'. */
  data: string;
  /** Tema curto do dia (2 a 4 palavras), ex.: 'Gratidão e adoração'. */
  tema: string;
  /** O versículo do dia. */
  versiculo: Versiculo;
  /** O parágrafo do devocional (texto do autor, não é citação bíblica). */
  texto: string;
  /** Bloco PRATICANDO. */
  praticando: string;
  /** Leitura extra da semana, ex.: ['Esdras 5-6', 'Salmos 93', '2 João']. */
  leituras: string[];
  /** Caixotes extras do dia (Culto da Família, Manual da vida, Conectando). */
  extras: CaixaDevocional[];
}

export interface SemanaDevocional {
  /** Semana ISO 8601. 28/09/2026 é a semana ISO 40. */
  semana: number;
  /** Segunda-feira, 'AAAA-MM-DD'. */
  inicio: string;
  /** Sábado, 'AAAA-MM-DD'. */
  fim: string;
  /** Igual a `inicio` — '2026-09-28'. */
  id: string;
  /** Tema geral da semana, 2 a 5 palavras. */
  tema: string;
  capa: { titulo: string; versiculo: Versiculo };
  dias: DiaDevocional[];
}

/** Uma semana por entrada. Novas semanas do material do dono entram aqui — é o HISTÓRICO. */
export const DEVOCIONAIS: SemanaDevocional[] = [
  {
    semana: 40,
    inicio: '2026-09-28',
    fim: '2026-10-03',
    id: '2026-09-28',
    tema: 'Gratidão, cuidado e amor',
    capa: {
      titulo: 'Devocionais da Semana',
      // Cita-se só a referência: a redação da capa não é a da NAA (ver topo).
      versiculo: { texto: '', ref: 'Salmos 119.160' },
    },
    dias: [
      {
        id: 'seg',
        dia: 'Segunda',
        data: '28 de setembro',
        tema: 'Gratidão e adoração',
        versiculo: { texto: '', ref: 'Salmos 104.1' },
        texto:
          'Muita gente só agradece quando está feliz. Mas Deus é o mesmo Deus bom, triste ou alegre. Deus merece toda honra, glória e louvor. A nossa alma pode agradecer e adorar sempre.',
        praticando:
          'Separe um tempinho no seu dia para falar com Jesus. Fale palavras de amor e gratidão. Ele está com você e ouve você o tempo todo.',
        leituras: ['2 João', 'Esdras 5-6', 'Salmos 93'],
        extras: [],
      },
      {
        id: 'ter',
        dia: 'Terça',
        data: '29 de setembro',
        tema: 'Para que serve isso',
        versiculo: { texto: '', ref: '1 Coríntios 10.31' },
        texto:
          'Você já parou no meio do dia e pensou: “Para que arrumar a cama, se vou bagunçar de novo à noite?” “Para que serve aprender história na escola?” Às vezes a vida parece um monte de tarefas soltas. A gente se pergunta: qual é o propósito de tudo isso?',
        // Sem PRATICANDO no material (a página saiu em outra diagramação).
        praticando: '',
        leituras: ['3 João', 'Esdras 7-8', 'Salmos 94'],
        extras: [
          {
            // O corpo do caixote está na imagem do PDF e não é legível. A
            // resolução abaixo foi escrita a partir do versículo âncora do dia
            // (1 Coríntios 10.31) — é PARÁFRASE, não citação, e por isso não
            // reproduz a redação da NAA.
            titulo: 'Para que serve tudo isso?',
            texto:
              'Para glorificar a Deus. Ele quer que a gente ame, estude, trabalhe e ajude do melhor jeito possível — e que faça tudo por amor a Ele.',
          },
        ],
      },
      {
        id: 'qua',
        dia: 'Quarta',
        data: '30 de setembro',
        tema: 'Deus se importa',
        versiculo: { texto: '', ref: 'Provérbios 31.8-9' },
        texto:
          'Deus se importa com quem não consegue se defender. Por isso, nós também devemos nos importar. Faça tudo o que estiver ao seu alcance. E não pare de fazer o bem!',
        praticando:
          'Sempre podemos ajudar alguém e fazer o bem. Separe roupas ou brinquedos para doar a quem precisa.',
        leituras: ['Judas', 'Esdras 9-10', 'Salmos 95'],
        extras: [],
      },
      {
        id: 'qui',
        dia: 'Quinta',
        data: '01 de outubro',
        // 'O ciclo da água' é o título do próprio material (quinta página).
        tema: 'O ciclo da água',
        versiculo: { texto: '', ref: 'Eclesiastes 1.7' },
        texto:
          'Até o ciclo da água mostra o cuidado de Deus. Ele cuida da gente o tempo todo. Cada etapa do ciclo mostra como ele sustenta a vida.',
        // Sem PRATICANDO no material.
        praticando: '',
        leituras: ['Apocalipse 1', 'Neemias 1-2', 'Salmos 96'],
        extras: [],
      },
      {
        id: 'sex',
        dia: 'Sexta',
        data: '02 de outubro',
        tema: 'Deus te ama',
        versiculo: { texto: '', ref: 'Romanos 8.34' },
        texto:
          'Deus te ama. E não te condena! Até Deus não te condena. Então não se preocupe com as mentiras que os outros dizem. Quem você é está em Jesus.',
        praticando:
          'Reze por alguém que já foi grosso com você. Escolha essa pessoa e escreva o nome no seu caderno de oração. Peça a Deus que abençoe ela e ajude você a amá-la.',
        leituras: ['Apocalipse 2', 'Neemias 3', 'Salmos 97'],
        extras: [],
      },
      {
        id: 'sab',
        dia: 'Sábado',
        data: '03 de outubro',
        tema: 'Evangelho e amor',
        versiculo: { texto: '', ref: 'Mateus 9.37' },
        texto:
          'Jesus ensinou que no reino dele há muita coisa para fazer. Mas poucas pessoas falam do evangelho e do amor dele. Você topa esse desafio? É lindo fazer parte com o Senhor.',
        praticando:
          'Escolha alguém que precisa conhecer o amor de Jesus. Converse com essa pessoa sobre isso, com amor. Peça ajuda ao Espírito Santo, nosso melhor amigo.',
        leituras: ['Apocalipse 3', 'Neemias 4', 'Salmos 98'],
        extras: [],
      },
    ],
  },
  {
    semana: 41,
    inicio: '2026-10-05',
    fim: '2026-10-10',
    id: '2026-10-05',
    tema: 'Louvor, plano e cuidado',
    capa: {
      titulo: 'Devocionais da Semana',
      // A arte da capa de 05/10 não traz versículo algum (conferido na imagem
      // do PDF): ref vazia de propósito, bloco omitido pela tela (ver topo).
      versiculo: { texto: '', ref: '' },
    },
    dias: [
      {
        id: 'seg',
        dia: 'Segunda',
        data: '05 de outubro',
        tema: 'O que é louvar',
        versiculo: { texto: '', ref: 'Salmos 95.2' },
        texto:
          'Você sabe o que é louvar? É falar palavras bonitas para o nosso Deus sobre o que ele é! Então, faça isso com muita alegria, todas as vezes que puder. Ele se alegra com os nossos louvores feitos com sinceridade e amor.',
        praticando:
          'Se você nunca sentiu a presença de Deus, peça ao Senhor que ele se revele a você. Não há nada melhor do que estar na presença do nosso Deus.',
        leituras: ['Apocalipse 5', 'Neemias 7.4-8.12', 'Salmos 100'],
        extras: [],
      },
      {
        id: 'ter',
        dia: 'Terça',
        data: '06 de outubro',
        tema: 'Deus tem um plano',
        versiculo: { texto: '', ref: 'Jeremias 29.11' },
        texto:
          'Você já recebeu um spoiler de um filme que queria muito ver? Alguém vai e te conta o final — às vezes é chato. Mas e se o spoiler for: “Não se preocupe, no final o herói vence e tudo fica bem”? Seria um spoiler ótimo, não é? O versículo de hoje é Deus nos dando o melhor spoiler da história: ele tem um plano para a sua vida, e o final é bom!',
        // Sem PRATICANDO no material (página em outra diagramação).
        praticando: '',
        leituras: ['Apocalipse 6', 'Neemias 8.10-9.37', 'Salmos 101'],
        extras: [],
      },
      {
        id: 'qua',
        dia: 'Quarta',
        data: '07 de outubro',
        tema: 'Ajudar os outros',
        versiculo: { texto: '', ref: 'Mateus 25.35-36' },
        texto:
          'Jesus nos ensina a ajudar aqueles que precisam. Quando ajudamos os outros, é como se estivéssemos ajudando a ele mesmo.',
        praticando:
          'Pense em algum amigo ou familiar que você pode ajudar. Pode ser um amigo que está triste, se sentindo sozinho ou que está passando por alguma necessidade.',
        leituras: ['Apocalipse 7', 'Neemias 9.38-10.39', 'Salmos 102'],
        extras: [],
      },
      {
        id: 'qui',
        dia: 'Quinta',
        data: '08 de outubro',
        // 'A Terra é perfeita para a gente' é o título da página (quinta).
        tema: 'A Terra é perfeita',
        versiculo: { texto: '', ref: 'Isaías 45.18' },
        // Página MEMORIZE + OBJETIVO: só material do professor. O parágrafo
        // abaixo é o OBJETIVO reescrito na linguagem da criança — não é a
        // citação do MEMORIZE, que é redação do material e não da NAA.
        texto:
          'A Terra tem tudo o que precisamos porque foi planejada por Deus. Quando a gente compara com outros planetas, vê como isso é real: só a Terra tem ar, água e vida. Deus preparou com carinho o lugar onde a gente vive.',
        // Sem PRATICANDO no material (página em outra diagramação).
        praticando: '',
        leituras: ['Apocalipse 8', 'Neemias 11', 'Salmos 103'],
        extras: [],
      },
      {
        id: 'sex',
        dia: 'Sexta',
        data: '09 de outubro',
        tema: 'Deus conhece seu coração',
        versiculo: { texto: '', ref: 'Salmos 142.1-2' },
        texto:
          'É maravilhoso saber que Deus já conhece tudo o que pensamos e vamos dizer, antes mesmo de falarmos! Ele conhece o seu coração e seus sentimentos. Então, seja sempre sincero com o Senhor, até nos momentos em que você não está bem.',
        praticando:
          'Que tal criar uma lista de coisas que você precisa melhorar? Peça ajuda à sua família.',
        leituras: ['Apocalipse 9', 'Neemias 12', 'Salmos 104.1-23'],
        extras: [],
      },
      {
        id: 'sab',
        dia: 'Sábado',
        data: '10 de outubro',
        tema: 'Jesus vai voltar',
        versiculo: { texto: '', ref: 'Atos 1.11' },
        texto:
          'Essa é uma promessa incrível que Deus nos deu! Ele veio ao mundo, morreu na cruz e subiu ao céu. Jesus prometeu que um dia voltará para levar para si todas as pessoas que o reconheceram como o único e suficiente Salvador.',
        praticando:
          'Convide Jesus para estar no centro da sua vida e compartilhe essa promessa com sua família.',
        leituras: ['Apocalipse 10', 'Neemias 13', 'Salmos 104.24-35'],
        extras: [],
      },
    ],
  },
  {
    semana: 42,
    inicio: '2026-10-12',
    fim: '2026-10-17',
    id: '2026-10-12',
    tema: 'Criação, amor e oração',
    capa: {
      titulo: 'Devocionais da Semana',
      // A capa do PNG é só arte/script decorativo e o OCR não devolve versículo
      // legível — ref vazia de propósito, bloco omitido pela tela (ver topo).
      versiculo: { texto: '', ref: '' },
    },
    dias: [
      {
        id: 'seg',
        dia: 'Segunda',
        data: '12 de outubro',
        tema: 'A criação de Deus',
        versiculo: { texto: '', ref: 'Salmos 8.1' },
        texto:
          'Olhe pela janela e contemple quantas coisas perfeitas o nosso Deus criou: os céus, a terra, os animais, a natureza e tudo o que há nela. Servimos a um Deus tão grande, maravilhoso e glorioso, que fez todas as coisas com a perfeição da sua glória e do seu poder.',
        praticando:
          'Pensando nisso, faça uma lista de pelo menos 6 coisas em que você pode ver a grandeza e as bênçãos de Deus!',
        leituras: ['Apocalipse 12', 'Ester 2', 'Salmos 105.26-45'],
        extras: [],
      },
      {
        id: 'ter',
        dia: 'Terça',
        data: '13 de outubro',
        tema: 'Coragem e fé',
        versiculo: { texto: '', ref: 'Josué 1.9' },
        // Página do caixote CONECTANDO: a história É o texto do dia.
        texto:
          'Imagine que você vai a uma festa e o convite diz para ir com a camisa do seu time favorito. Você chega todo animado com a camisa do seu time, mas, quando entra, percebe que todo mundo está com a camisa do time rival. Como você se sentiria? Um pouco sozinho! Com vontade de esconder a sua camisa! Às vezes, ser cristão no meio dos amigos ou na escola pode não fazer você se sentir exatamente assim.',
        // Sem PRATICANDO: a página traz só a história e a sugestão de música.
        praticando: '',
        leituras: ['Apocalipse 13', 'Ester 3-4', 'Salmos 106.1-23'],
        extras: [],
      },
      {
        id: 'qua',
        dia: 'Quarta',
        data: '14 de outubro',
        tema: 'Amar como Jesus',
        versiculo: { texto: '', ref: 'João 15.12' },
        texto:
          'Pode parecer estranho, mas você sabia que amar é diferente de gostar? Jesus nos ensina a amar todas as pessoas, mesmo aquelas com quem você não se dá tão bem ou com quem não tem tanta afinidade. Amar o próximo é cuidar, respeitar e agir com bondade como ele faz com a gente, mesmo que a pessoa já tenha errado com você.',
        praticando:
          'Pense e escreva o nome de duas pessoas que você precisa amar mais, assim como Jesus te ama.',
        leituras: ['Apocalipse 14', 'Ester 5.1-6.13', 'Salmos 106.24-48'],
        extras: [],
      },
      {
        id: 'qui',
        dia: 'Quinta',
        data: '15 de outubro',
        tema: 'Fé e ciência',
        // Página MEMORIZE + OBJETIVO (só material do professor). A referência do
        // MEMORIZE vira o `ref`; a citação em caixa-alta do material não é a
        // redação da NAA e não entra no campo `texto`.
        versiculo: { texto: '', ref: 'Isaías 45.18' },
        texto:
          'A fé e a ciência podem caminhar juntas quando Deus está no centro. Elas não são inimigas: a ciência revela a criação e a fé revela o Criador. Quem tem fé não foge da ciência — usa a ciência para glorificar a Deus.',
        // Sem PRATICANDO: a página é só MEMORIZE + OBJETIVO.
        praticando: '',
        leituras: ['Apocalipse 16', 'Ester 6.14-8.17', 'Salmos 107.1-22'],
        extras: [],
      },
      {
        id: 'sex',
        dia: 'Sexta',
        data: '16 de outubro',
        tema: 'Oração que fortalece',
        versiculo: { texto: '', ref: 'Lucas 22.46' },
        texto:
          'Jesus estava preocupado com os seus discípulos porque, em vez de orarem, eles estavam adormecidos. Era o momento de oração, e não de descansar. Jesus queria que eles orassem porque, por meio da oração, somos fortalecidos.',
        praticando:
          'Firme um compromisso com o Senhor e com a sua família sobre qual momento do dia vocês vão parar tudo o que estiverem fazendo para orar.',
        leituras: ['Apocalipse 16', 'Ester 9-10', 'Salmos 107.23-43'],
        extras: [],
      },
      {
        id: 'sab',
        dia: 'Sábado',
        data: '17 de outubro',
        tema: 'Compartilhar o amor',
        versiculo: { texto: '', ref: 'Atos 14.21' },
        texto:
          'Paulo e Barnabé pregaram o evangelho e muitos se tornaram discípulos de Jesus. Eles não pararam, mas continuaram a sua missão de espalhar a Palavra de Deus.',
        praticando:
          'Podemos compartilhar o amor de Jesus. Escolha uma pessoa que você conhece e escreva uma mensagem contando algo que você aprendeu sobre Jesus e como isso tem feito diferença na sua vida.',
        leituras: ['Apocalipse 17', 'Isaías 1-2', 'Salmos 108'],
        extras: [],
      },
    ],
  },
];

// ─── Derivados para o seletor do jogo ───────────────────────────────
// Nenhum dado duplicado à mão: tudo abaixo sai de DEVOCIONAIS.

/** Segunda-feira da semana mais recente já presente em DEVOCIONAIS. */
export const DEVOCIONAL_INICIO_ATUAL: string =
  DEVOCIONAIS.map((s) => s.inicio).sort((a, b) => b.localeCompare(a))[0] ?? '';

/** Compara temas ignorando caixa-alta e acento — o seletor não deve falhar por 'Gratidao'. */
function mesmoTema(a: string, b: string): boolean {
  const limpa = (v: string): string =>
    v
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // acentos (combining marks)
  return limpa(a) === limpa(b);
}

/** Filtra o histórico por tema da semana. */
export function semanasPorTema(tema: string): SemanaDevocional[] {
  return DEVOCIONAIS.filter((s) => mesmoTema(s.tema, tema));
}