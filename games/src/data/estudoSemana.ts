// "Estudo da Semana" — o currículo de Escola Bíblica infantil (outubro/2026,
// Pentateuco + tema especial do mês) curado para dentro do jogo.
//
// FONTES (depositadas no brain-jogos, `Estudo do Mês/`, extraídas com
// `pdftotext -layout`, conferidas página a página):
//   • `2026 - outubro - idade Baby- LIÇÕES PENTATEUCO.pdf`      → trilho baby, 4 lições
//   • `2026 - outubro - idade de 4 a 6 - LIÇÕES PENTATEUCO 2.pdf` → trilho 4-6, 4 lições
//   • `2026 - outubro - idade de 7 a 9 - LIÇÕES PENTATEUCO 2.pdf` → trilho 7-9, 4 lições
//   • `2026 - outubro - REFORMA PROTESTANTE 1 - Planejamento e Materiais (2).pdf`
//     → tema especial do mês, Sola Scriptura (vale para todas as faixas)
//
// REGRA CENTRAL: cada PDF é UM mês e cada lição é UMA SEMANA desse mês.
// Lição 1 = semana 1 … Lição 4 = semana 4. O tema especial do mês usa semana 0.
//
// REGRAS DE CONTEÚDO (verticais — não negociáveis):
//   1. `referencias[].texto` só recebe o que está CITADO na fonte. Na dúvida,
//      fica só a `ref` (texto vazio). Nada de texto bíblico inventado.
//   2. Toda lição cita a referência bíblica que a sustenta.
//   3. Tom de graça e esperança: erro escurece o caminho, mas Deus continua
//      esperando. Nada de medo, castigo ou culpa como mecânica.
//   4. SEM marca de igreja, SEM oferta/dízimo/colete/loja/revista/caderneta.
//      As atividades foram reescritas para happen em CASA, com a família e sem
//      dinheiro. O material do professor (RECEPÇÃO, DICA PARA O MINISTRANTE,
//      LANÇANDO A SEMENTE - OFERTA, SUGESTÕES DE LOUVORES, MOMENTO INTERAÇÃO)
//      NÃO vai para a criança — dele só foi extraído o conteúdo.
//   5. Linguagem por trilho: baby 4–8 palavras, 4-6 de 6–12, 7-9 de 8–16.
//
// NOTA SOBRE `texto` (verificada na curadoria): os versículos de memorização
// aparecem no material como *palavra de estudo*, impressos em caixa alta — a
// redação é do MATERIAL, não uma tradução, e Gênesis 12.3 vem marcado
// "(ADAPTADO)". Como a vertical é NAA (ADR-001), esses textos foram esvaziados:
// fica só a `ref`, e quem tem Bíblia em casa lê a redação certa. A ÚNICA
// passagem com "NAA" atestada na fonte — 2 Timóteo 3.16-17 — mantém o texto.
//
// Consequência de projeto (é o que a tela mostra): o jogo **nunca mostra texto
// bíblico**. Ele mostra a referência + a mensagem curada + o "abra a Bíblia em
// casa e leia". Isso não é limitação: é o convite ao hábito que o jogo existe
// para ensinar.
//
// Crédito da versão bíblica (ADR-001, versão NAA):
//   NAA — Nova Almeida Atualizada® © 2017 Sociedade Bíblica do Brasil. Usada com permissão.

export interface Versiculo {
  /** Só preencha se o versículo estiver citado na fonte. Nunca invente. */
  texto: string;
  /** Referência bíblica (NAA), ex.: 'Gênesis 1.1'. */
  ref: string;
}

/** 'baby' (0–3) · '4-6' · '7-9' · 'todos' (tema que serve a todas as faixas) */
export type TrilhoEstudo = 'baby' | '4-6' | '7-9' | 'todos';

export interface PerguntaEstudo {
  /** Pergunta curta, uma ideia. */
  enunciado: string;
  /** Exatamente 3 opções, curtas. */
  alternativas: string[];
  /** Índice da alternativa correta (0, 1 ou 2). */
  correta: number;
  /** Explicação curta e doce do porquê. Nunca "errou!". */
  explicacao: string;
}

export interface LicaoEstudo {
  /** 'AAAA-MM' + trilho + semana, ex.: '2026-10-baby-s1'. */
  id: string;
  /** 'AAAA-MM' */
  mes: string;
  ano: number;
  /** 1–12 */
  mesNumero: number;
  /** Semana do mês (1–4). Para o tema especial, 0. */
  semana: number;
  trilho: TrilhoEstudo;
  titulo: string;
  /** Tema curto (2–5 palavras), usado no seletor "escolher por tema". */
  tema: string;
  /** Referências bíblicas (NAA) que sustentam a lição. */
  referencias: Versiculo[];
  /** A história/contagem da lição reescrita para a criança. */
  historia: string;
  /** UMA mensagem só, em uma frase. */
  ideia: string;
  /** Uma pergunta de revisão (coleta > resolver problema). */
  pergunta: PerguntaEstudo;
  /** Ação concreta para fazer (o bloco PRATICANDO / EU APRENDO BRINCANDO). */
  praticando: string;
  /** Leitura/leituras extra. */
  leituras: string[];
}

export interface MesEstudo {
  /** 'AAAA-MM' */
  id: string;
  /** 'Outubro 2026' */
  nome: string;
  /** Tema do mês, ex.: 'Sola Scriptura'. */
  tema: string;
  /** Primeiro dia do mês, 'AAAA-MM-DD'. */
  inicio: string;
  licoes: LicaoEstudo[];
}

export interface TrilhoInfo { id: TrilhoEstudo; nome: string; idade: string; }

// ─── Dados ────────────────────────────────────────────────────────────────────

export const TRILHOS: TrilhoInfo[] = [
  { id: 'baby', nome: 'Primeirinha', idade: '0–3 anos' },
  { id: '4-6', nome: 'Criança', idade: '4–6 anos' },
  { id: '7-9', nome: 'Estudante', idade: '7–9 anos' },
  { id: 'todos', nome: 'Tema do mês', idade: 'Todas as idades' },
];

export const MESES_ESTUDO: MesEstudo[] = [
  {
    id: '2026-10',
    nome: 'Outubro 2026',
    tema: 'Sola Scriptura (Somente a Escritura)',
    inicio: '2026-10-01',
    licoes: [
      // ── BABY · 0–3 anos · semana 1 ─────────────────────────────────────────
      {
        id: '2026-10-baby-s1',
        mes: '2026-10',
        ano: 2026,
        mesNumero: 10,
        semana: 1,
        trilho: 'baby',
        titulo: 'No começo de tudo',
        tema: 'Criação do mundo',
        referencias: [
          { texto: '', ref: 'Gênesis 1.1' },
          { texto: '', ref: 'Gênesis 1.26' },
          { texto: '', ref: 'Gênesis 2.1-3' },
        ],
        historia:
          'No começo, tudo era escuro. Deus fala e cria a luz, o céu, o mar e as plantas. Depois cria o sol, a lua e os passarinhos. Em seguida cria os bichos de todo tipo. No fim, Deus cria você e eu, bem lindinho. Ele olha tudo, diz que está muito bom e descansa no sétimo dia.',
        ideia: 'Tudo o que existe foi criado por Deus, e você também.',
        pergunta: {
          enunciado: 'O que Deus criou primeiro?',
          alternativas: ['Os animais da terra', 'A luz', 'As pessoas'],
          correta: 1,
          explicacao: 'No primeiro dia Deus separou a luz do escuro e chamou de dia e de noite.',
        },
        praticando:
          'Contorne a mãozinha do bebê numa folha de papel e transforme numa árvore: o contorno é o tronco e os dedinhos viram as folhas. Depois chame cada folha pelo nome: sol, lua, estrela, flor, passarinho.',
        leituras: ['Gênesis 1', 'Gênesis 2'],
      },

      // ── BABY · semana 2 ───────────────────────────────────────────────────
      {
        id: '2026-10-baby-s2',
        mes: '2026-10',
        ano: 2026,
        mesNumero: 10,
        semana: 2,
        trilho: 'baby',
        titulo: 'A escolha de Adão e Eva',
        tema: 'A escolha no jardim',
        referencias: [
          { texto: '', ref: 'João 3.16a' },
          { texto: '', ref: 'Gênesis 3' },
        ],
        historia:
          'Deus põe Adão e Eva num jardim lindo e vem falar com eles todo dia. Um dia, uma serpente chama Eva e muda a palavra de Deus. Eva prova a fruta proibida e dá ao Adão. Depois, Deus os afasta do jardim, porque escolheram desobedecer. Mas Deus não desiste: Ele amou o mundo e enviou o Filho único para nos salvar.',
        ideia: 'Mesmo quando desobedecemos, Deus continua nos amando e vem nos salvar.',
        pergunta: {
          enunciado: 'O que Deus deixou para Adão e Eva comerem no jardim?',
          alternativas: ['Só uma árvore', 'Nenhuma árvore', 'Todas as árvores menos uma'],
          correta: 2,
          explicacao: 'No jardim havia de tudo para comer, menos a árvore do bem e do mal.',
        },
        praticando:
          'Modele com massinha uma figureinha de Adão e uma de Eva. Enquanto modela, conte o que aconteceu no jardim e que Deus ainda ama a nossa família.',
        leituras: ['Gênesis 3', 'João 3.16'],
      },

      // ── BABY · semana 3 ───────────────────────────────────────────────────
      {
        id: '2026-10-baby-s3',
        mes: '2026-10',
        ano: 2026,
        mesNumero: 10,
        semana: 3,
        trilho: 'baby',
        titulo: 'Um novo começo',
        tema: 'Depois da chuva',
        referencias: [
          { texto: '', ref: 'Gênesis 6.22' },
          { texto: '', ref: 'Gênesis 6.13' },
          { texto: '', ref: 'Gênesis 9.12-13' },
        ],
        historia:
          'Noé amava a Deus e andava com Ele. As pessoas faziam muitas coisas ruins, e Deus ficou triste com tudo isso. Deus avisou Noé: a terra ia se cobrir de água. Noé creu, construiu uma arca grandona e entrou com a sua família e com os animais. Quando a água baixou, Deus apareceu no céu: foi o arco-íris, a promessa de que isso não ia se repetir.',
        ideia: 'Deus cuida de Noé e de nós, e promete um novo começo.',
        pergunta: {
          enunciado: 'O que Noé construiu por ordem de Deus?',
          alternativas: ['Uma arca de madeira', 'Uma casa de pedra', 'Um muro grande'],
          correta: 0,
          explicacao: 'Deus mandou Noé fazer uma arca bem grande para a família e os animais.',
        },
        praticando:
          'Pinte com tinta azul uma folha com a arca no meio e faça as gotinhas da chuva com os dedinhos. Quando terminar, diga em voz alta: Deus cuida de mim.',
        leituras: ['Gênesis 6-9'],
      },

      // ── BABY · semana 4 ───────────────────────────────────────────────────
      {
        id: '2026-10-baby-s4',
        mes: '2026-10',
        ano: 2026,
        mesNumero: 10,
        semana: 4,
        trilho: 'baby',
        titulo: 'Uma família com uma grande promessa',
        tema: 'A família de Deus',
        referencias: [
          // O material marca este versículo como "(ADAPTADO)".
          { texto: '', ref: 'Gênesis 12.3' },
          { texto: '', ref: 'Gênesis 15.5' },
          { texto: '', ref: 'Gênesis 32.28' },
        ],
        historia:
          'A família de Deus é bem grandona e começou com Abraão. Abraão confiava em Deus e saiu do seu lugar para uma terra nova. Deus prometeu que Abraão seria pai de uma multidão, como as estrelas do céu. Do filho Isaque veio Jacó, que Deus chamou de Israel. De Israel veio José, o povo de Deus, e muito depois veio Jesus.',
        ideia: 'Deus cumpre a promessa: por causa de Abraão, nasceu Jesus para o mundo inteiro.',
        pergunta: {
          enunciado: 'O que Deus pediu para Abraão fazer?',
          alternativas: ['Ficar sempre parado', 'Sair para uma terra nova', 'Levar uma parede junto'],
          correta: 1,
          explicacao: 'Deus chamou Abraão para sair e prometeu abençoar todas as famílias por meio dele.',
        },
        praticando:
          'Cole estrelas de papel em volta de uma árvore desenhada, para lembrar que a família de Deus é grande. Diga o nome de quem mora com você e conte que essa família também é abençoada.',
        leituras: ['Gênesis 12', 'Gênesis 15', 'Gênesis 35-37'],
      },

      // ── 4–6 ANOS · semana 1 ───────────────────────────────────────────────
      {
        id: '2026-10-4-6-s1',
        mes: '2026-10',
        ano: 2026,
        mesNumero: 10,
        semana: 1,
        trilho: '4-6',
        titulo: 'No começo de tudo',
        tema: 'Os seis dias',
        referencias: [
          { texto: '', ref: 'Gênesis 1.1' },
          { texto: '', ref: 'Gênesis 1.26' },
          { texto: '', ref: 'Gênesis 2.1-3' },
          { texto: '', ref: 'João 1.1-3' },
        ],
        historia:
          'Antes de existir o mundo, Deus já existia. Ele é tão poderoso que só de falar, tudo passou a existir. Em seis dias Ele criou o mundo e tudo o que conhecemos. No sétimo dia Deus descansou. Deus criou o homem e a mulher do mesmo jeito: à imagem e semelhança de Deus. Jesus já estava com o Pai desde o início, e tudo foi criado por Ele.',
        ideia: 'Deus criou tudo em seis dias e criou você à imagem e semelhança dEle.',
        pergunta: {
          enunciado: 'No sétimo dia, o que Deus fez?',
          alternativas: ['Criou mais animais', 'Começou tudo de novo', 'Descansou'],
          correta: 2,
          explicacao: 'Depois de criar tudo em seis dias, Deus descansou no sétimo (Gênesis 2.1-3).',
        },
        praticando:
          'Monte a criação na ordem certa: seis cartões ou seis desenhos, um dia da criação em cada um. Misture tudo e depois coloque em fila, do dia 1 ao dia 6, contando a história de cada imagem para quem mora com você.',
        leituras: ['Gênesis 1', 'Gênesis 2', 'João 1.1-3'],
      },

      // ── 4–6 ANOS · semana 2 ───────────────────────────────────────────────
      {
        id: '2026-10-4-6-s2',
        mes: '2026-10',
        ano: 2026,
        mesNumero: 10,
        semana: 2,
        trilho: '4-6',
        titulo: 'A escolha de Adão e Eva',
        tema: 'A escolha no jardim',
        referencias: [
          { texto: '', ref: 'João 3.16a' },
          { texto: '', ref: 'Gênesis 3' },
          { texto: '', ref: 'Gênesis 3.15' },
        ],
        historia:
          'Tudo ia muito bem no jardim do Éden. Adão e Eva conversavam com Deus todos os dias e podiam comer de todas as árvores. Só havia uma árvore proibida: a árvore do conhecimento do bem e do mal. A serpente distorceu o que Deus tinha dito, e Eva comeu do fruto e deu ao marido. Foi assim que o pecado entrou no mundo, e Adão e Eva foram afastados do jardim. Mas Deus já tinha um plano: enviar Jesus para nos salvar.',
        ideia: 'Quando o pecado entrou no mundo, Deus já tinha um plano para nos salvar.',
        pergunta: {
          enunciado: 'Qual era a única árvore que Adão e Eva não podiam comer?',
          alternativas: ['A árvore do bem e do mal', 'A árvore do pomar', 'A árvore da vida'],
          correta: 0,
          explicacao: 'Deus deixou todas as árvores do jardim para comer, menos a árvore do bem e do mal.',
        },
        praticando:
          'Faça a experiência do orégano: numa tigela com água, espalhe folhas de orégano e veja como fica impossível tirar tudo. Depois peça a um adulto para colocar uma gota de detergente no seu dedo: o orégano se afasta. Conte que é a figura de Deus levando o pecado para longe de nós.',
        leituras: ['Gênesis 3', 'João 3.16'],
      },

      // ── 4–6 ANOS · semana 3 ───────────────────────────────────────────────
      {
        id: '2026-10-4-6-s3',
        mes: '2026-10',
        ano: 2026,
        mesNumero: 10,
        semana: 3,
        trilho: '4-6',
        titulo: 'Um novo começo',
        tema: 'Depois da chuva',
        referencias: [
          { texto: '', ref: 'Gênesis 6.22' },
          { texto: '', ref: 'Gênesis 6.13' },
          { texto: '', ref: 'Gênesis 9.12-13' },
        ],
        historia:
          'Noé era um homem que amava a Deus e andava com Ele. Naquele tempo as pessoas obedeciam pouco, e o pecado dominava a terra. Deus, triste com tanta maldade, avisou Noé que viria uma chuva que mudaria tudo. Noé creu, construiu a arca e entrou com a família e todos os animais. Depois que a água baixou, Deus apareceu no céu: foi o arco-íris, o sinal de uma aliança que Ele nunca vai quebrar.',
        ideia: 'Deus é fiel: mesmo depois de um tempo ruim, Ele promete um novo começo.',
        pergunta: {
          enunciado: 'O que o arco-íris mostrou a Noé?',
          alternativas: ['O fim da família', 'A promessa de Deus', 'A hora de dormir'],
          correta: 1,
          explicacao: 'O arco-íris é o sinal da aliança: Deus prometeu que as águas não cobririam mais toda a terra.',
        },
        praticando:
          'Recorte desenhos de animais e cole dentro de uma arca de papelão que você mesmo faz. Combine com quem mora com você: cada animal entra na arca e depois sai para um mundo novinho.',
        leituras: ['Gênesis 6-9'],
      },

      // ── 4–6 ANOS · semana 4 ───────────────────────────────────────────────
      {
        id: '2026-10-4-6-s4',
        mes: '2026-10',
        ano: 2026,
        mesNumero: 10,
        semana: 4,
        trilho: '4-6',
        titulo: 'Uma família com uma grande promessa',
        tema: 'A família de Deus',
        referencias: [
          { texto: '', ref: 'Gênesis 12.3' },
          { texto: '', ref: 'Gênesis 15.5' },
          { texto: '', ref: 'Gênesis 35.10-12' },
          { texto: '', ref: 'Mateus 1.1-2' },
        ],
        historia:
          'Hoje vamos ouvir a história dos patriarcas do povo de Deus. Deus chamou Abraão para sair da sua terra e prometeu fazer dele uma grande nação, como as estrelas do céu. Abraão e Sara tiveram Isaque; Isaque casou com Rebeca e teve Esaú e Jacó. Jacó teve muitos filhos, e um deles era José. Deus cumpriu a promessa: por essa linhagem, muito depois, nasceu Jesus.',
        ideia: 'Deus cumpre o que promete: por essa família nasceu Jesus para abençoar todos os povos.',
        pergunta: {
          enunciado: 'O que Deus prometeu a Abraão?',
          alternativas: ['Um reino de pedra', 'Um barco novo', 'Uma descendência como as estrelas'],
          correta: 2,
          explicacao: 'Deus prometeu que Abraão teria uma descendência tão grande quanto as estrelas do céu (Gênesis 15.5).',
        },
        praticando:
          'Monte em casa a árvore da família de Deus: num papel, escreva o seu nome e o de cada pessoa que mora com você, e cole estrelas de papel ao redor, lembrando quantas bênçãos Deus prometeu a essa família.',
        leituras: ['Gênesis 12-50'],
      },

      // ── 7–9 ANOS · semana 1 ───────────────────────────────────────────────
      {
        id: '2026-10-7-9-s1',
        mes: '2026-10',
        ano: 2026,
        mesNumero: 10,
        semana: 1,
        trilho: '7-9',
        titulo: 'Start, o começo de tudo',
        tema: 'Os seis dias',
        referencias: [
          { texto: '', ref: 'Gênesis 1.1' },
          { texto: '', ref: 'Gênesis 1.26-27' },
          { texto: '', ref: 'João 1.1-3' },
          { texto: '', ref: 'João 8.58' },
        ],
        historia:
          'Antes de o mundo existir, Deus já existia. Ele criou o céu, a terra, a luz, os animais e tudo o que vemos: tudo começou pela palavra e pelo poder de Deus. Depois, Deus criou o homem e a mulher à imagem e semelhança dEle, para que o conheçam, o amem e vivam perto dEle. Jesus não começou a existir quando nasceu: Ele já estava com o Pai no princípio e participou da criação. Tudo foi criado por Ele.',
        ideia: 'Jesus já estava com Deus no princípio, e tudo foi criado por Ele.',
        pergunta: {
          enunciado: 'Segundo o texto, como aconteceu a criação?',
          alternativas: ['Pela palavra e pelo poder de Deus', 'Por acaso, sem ninguém', 'Feita só pelos seres humanos'],
          correta: 0,
          explicacao: 'O texto diz que tudo começou pela palavra e pelo poder de Deus.',
        },
        praticando:
          'Jogue a mímica da criação em casa: cada pessoa da família puxa um papel escrito com um dia da criação e representa com o corpo. Depois descubram juntos em que dia foi cada coisa.',
        leituras: ['Gênesis 1', 'Gênesis 2', 'João 1.1-18'],
      },

      // ── 7–9 ANOS · semana 2 ───────────────────────────────────────────────
      {
        id: '2026-10-7-9-s2',
        mes: '2026-10',
        ano: 2026,
        mesNumero: 10,
        semana: 2,
        trilho: '7-9',
        titulo: 'O dia em que tudo mudou',
        tema: 'A escolha de Adão e Eva',
        referencias: [
          { texto: '', ref: 'João 3.16a' },
          { texto: '', ref: 'Gênesis 3' },
          { texto: '', ref: 'Gênesis 3.15' },
        ],
        historia:
          'Deus deu uma ordem a Adão e Eva, e a serpente enganou Eva. Adão e Eva comeram do fruto proibido e escolheram não obedecer à Palavra de Deus. Depois da desobediência, o pecado entrou no mundo, e Adão e Eva sentiram vergonha e medo. O pecado separou o homem de Deus e trouxe consequências sérias. Mas Deus não abandonou o homem: em Gênesis 3.15 aparece a primeira promessa daquele que venceria o mal. Essa promessa se cumpriu em Jesus, que veio nos salvar do pecado.',
        ideia: 'Mesmo depois do pecado, Deus não abandonou você: Ele prometeu um Salvador.',
        pergunta: {
          enunciado: 'O que a promessa de Gênesis 3.15 anunciava?',
          alternativas: ['Um novo jardim', 'Um Salvador que venceria o mal', 'Mais chuva na terra'],
          correta: 1,
          explicacao: 'É a primeira promessa de um Salvador que venceria o mal, e ela se cumpriu em Jesus.',
        },
        praticando:
          'Faça a folha que rasga: rasgue um papel no meio e peça para alguém tentar puxar os dois lados, ele rasga. Depois cole uma fita vermelha atravessando o rasgo, formando uma cruz, e conte o que Deus fez para unir o homem a Ele.',
        leituras: ['Gênesis 3', 'João 3.16'],
      },

      // ── 7–9 ANOS · semana 3 ───────────────────────────────────────────────
      {
        id: '2026-10-7-9-s3',
        mes: '2026-10',
        ano: 2026,
        mesNumero: 10,
        semana: 3,
        trilho: '7-9',
        titulo: 'Reset, o recomeço de tudo',
        tema: 'Depois da chuva',
        referencias: [
          { texto: '', ref: 'Gênesis 6.22' },
          { texto: '', ref: 'Gênesis 6.13' },
          { texto: '', ref: 'Gênesis 8.20-22' },
          { texto: '', ref: 'Gênesis 9.12-13' },
        ],
        historia:
          'Na época de Noé havia muita maldade, e Noé era um homem que confiava no Senhor. Deus falou com ele e mandou que construísse uma grande arca. Noé obedeceu mesmo sem ver: fez tudo conforme Deus ordenou, entrou na arca com a família e recebeu os animais. Depois do dilúvio, Noé levantou um altar e adorou ao Senhor. Deus colocou o arco nas nuvens como sinal da sua aliança e falou que nunca mais as águas cobririam toda a terra. Deus é fiel ao que promete.',
        ideia: 'Deus é fiel: quando confiamos na Palavra dEle, Ele cumpre a promessa.',
        pergunta: {
          enunciado: 'Qual foi a resposta de Noé quando Deus mandou construir a arca?',
          alternativas: ['Esperou até ter certeza', 'Deixou para depois', 'Fez tudo como Deus ordenou'],
          correta: 2,
          explicacao: 'Noé fez tudo exatamente como Deus lhe tinha ordenado, mesmo sem ver ainda o que viria.',
        },
        praticando:
          'Jogue o "Reset ou continue?" em casa: cada pessoa pega um papel com uma atitude (estudar para a prova, brigar, ajudar em casa, deixar tudo bagunçado) e coloca na caixa "reset" ou na caixa "continue assim". Depois conversem sobre os novos começos possíveis.',
        leituras: ['Gênesis 6-9'],
      },

      // ── 7–9 ANOS · semana 4 ───────────────────────────────────────────────
      {
        id: '2026-10-7-9-s4',
        mes: '2026-10',
        ano: 2026,
        mesNumero: 10,
        semana: 4,
        trilho: '7-9',
        titulo: 'Israel, a família de Deus',
        tema: 'A família de Deus',
        referencias: [
          { texto: '', ref: 'Gênesis 12.3' },
          { texto: '', ref: 'Gênesis 15.5' },
          { texto: '', ref: 'Gênesis 32.28' },
          { texto: '', ref: 'Mateus 1.1-2' },
        ],
        historia:
          'Deus chamou Abraão para sair da sua terra e prometeu fazer dele uma grande nação. Abraão creu em Deus e seguiu o que o Senhor estava dizendo. Abraão teve Isaque; Isaque teve Jacó; Jacó teve doze filhos, e Deus mudou o nome dele para Israel. Desses filhos nasceu José, e de sua descendência veio o povo de Israel. Séculos depois, Jesus nasceu dessa linhagem: por meio dEle, a bênção e a salvação de Deus alcançam pessoas de todas as nações.',
        ideia: 'A promessa a Abraão foi cumprida: por essa linhagem nasceu Jesus, a bênção de todos os povos.',
        pergunta: {
          enunciado: 'O que aconteceu com o nome de Jacó?',
          alternativas: ['Deus o mudou para Moisés', 'O nome continuou Jacó', 'Deus o mudou para Israel'],
          correta: 2,
          explicacao: 'Deus mudou o nome de Jacó para Israel, e dele vieram as doze tribos de Israel.',
        },
        praticando:
          'Monte em casa a linha da promessa: escreva Abraão, Isaque, Jacó, José e Jesus em cartões e ligue os cartões na ordem. Depois escreva o nome de quem mora com você e coloque o cartão no fim da linha, lembrando que essa pessoa também está nessa família.',
        leituras: ['Gênesis 12', 'Gênesis 15', 'Gênesis 28', 'Gênesis 37', 'Mateus 1.1-16'],
      },

      // ── TEMA ESPECIAL DO MÊS · vale para todas as faixas · semana 0 ────────
      {
        id: '2026-10-todos-s0',
        mes: '2026-10',
        ano: 2026,
        mesNumero: 10,
        semana: 0,
        trilho: 'todos',
        titulo: 'Sola Scriptura (Somente a Escritura)',
        tema: 'Sola Scriptura',
        referencias: [
          {
            texto:
              'Toda a Escritura é inspirada por Deus e útil para o ensino, para a repreensão, para a correção, para a educação na justiça, a fim de que o servo de Deus seja perfeito e perfeitamente habilitado para toda boa obra.',
            ref: '2 Timóteo 3.16-17',
          },
          { texto: 'Toda a Escritura é inspirada por Deus.', ref: '2 Timóteo 3.16' },
        ],
        historia:
          'A muito tempo, um moço chamado Martinho Lutero foi para um mosteiro. Lá as pessoas diziam que Deus castigava, e ele ficou com muito medo. Ele foi ler as Escrituras e viu que aquilo estava errado. Lutero passou a ensinar o que tinha aprendido e separou em cinco pontos o que acreditava. O primeiro deles é este: somente as Escrituras, a Palavra de Deus.',
        ideia: 'A Bíblia é a Palavra de Deus, e é por ela que sabemos o que devemos fazer.',
        pergunta: {
          enunciado: 'O que significa somente as Escrituras?',
          alternativas: ['Que só um adulto decide', 'Que a Bíblia é a autoridade', 'Que a Bíblia é um livro antigo'],
          correta: 1,
          explicacao: 'Sola Scriptura quer dizer que a Escritura, inspirada por Deus, é a base da autoridade e do que a gente deve fazer.',
        },
        praticando:
          'Recorte um papel em forma de livrinho, com duas abas, e faça ele abrir e fechar. Decore "Toda a Escritura é inspirada por Deus" (2 Timóteo 3.16), mostre o versículo para quem mora com você e conte por que a Bíblia é a Palavra de Deus.',
        leituras: ['2 Timóteo 3.16-17'],
      },
    ],
  },
];

// ─── Helpers derivados (nada é digitado à mão duas vezes) ───────────────────

/** Mês em foco do app (o material disponível é outubro/2026). */
export const ESTUDO_MES_ATUAL: string = '2026-10';

/** Ids de mês em ordem cronológica (crescente). */
export const MESES_ESTUDO_MESES: string[] = MESES_ESTUDO.map((m) => m.id).sort();

function mes(id: string): MesEstudo | undefined {
  return MESES_ESTUDO.find((m) => m.id === id);
}

function serveAoTrilho(l: LicaoEstudo, trilho: TrilhoEstudo): boolean {
  return l.trilho === trilho || l.trilho === 'todos';
}

function porData(a: LicaoEstudo, b: LicaoEstudo): number {
  if (a.mes !== b.mes) return a.mes < b.mes ? -1 : 1;
  if (a.trilho !== b.trilho) return a.trilho < b.trilho ? -1 : 1;
  return a.semana - b.semana;
}

/** Todas as lições de um mês para um trilho, tema especial incluído. */
export function licoesDoMes(mesId: string, trilho: TrilhoEstudo): LicaoEstudo[] {
  const alvo = mes(mesId);
  if (!alvo) return [];
  return alvo.licoes.filter((l) => serveAoTrilho(l, trilho)).sort(porData);
}

/** Busca por tema (o seletor "escolher por tema"), tema especial incluído. */
export function licoesPorTema(tema: string, trilho: TrilhoEstudo): LicaoEstudo[] {
  return MESES_ESTUDO.flatMap((m) => m.licoes)
    .filter((l) => serveAoTrilho(l, trilho) && l.tema === tema)
    .sort(porData);
}

/** "Semana N do mês" de um trilho. Semana 0 devolve o tema especial do mês. */
export function semanaDoMes(
  mesId: string,
  semana: number,
  trilho: TrilhoEstudo,
): LicaoEstudo | undefined {
  const alvo = mes(mesId);
  if (!alvo) return undefined;
  return alvo.licoes
    .filter((l) => serveAoTrilho(l, trilho) && l.semana === semana)
    .sort(porData)[0];
}