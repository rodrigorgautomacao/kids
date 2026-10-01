// A Palavra Certa — conteúdo bíblico (150 cartas).
//
// 10 fases × 5 encontros (4 pessoas + 1 guardião) × 3 variantes de situação.
// Regra de ouro (`jogos-biblicos` §3): toda carta traz `Livro cap.vers (NAA)`.
// Opções "muito parecidas" (pedido do dono): mudam 1 detalhe — a criança declara
// a Palavra exata. Distratores são erros plausíveis de criança, nunca pegadinhas.
// Tom de graça (`jogos-biblicos` §5): erro ensina e convida a tentar de novo.
//
// Licença: NAA — Nova Almeida Atualizada® © 2017 Sociedade Bíblica do Brasil.
// Usada com permissão.

import type { BiomeId, NpcLookCanvas } from '../lib/palavracerta/types';
import { shuffle } from '../lib/minigame';

export interface Carta {
  /** situação do NPC (muda por variante, sempre coerente com o personagem) */
  s: string;
  /** pergunta bíblica */
  q: string;
  /** 3 declarações quase iguais — só uma verdadeira */
  o: [string, string, string];
  /** índice da certa em `o` (posição embaralhada em jogo) */
  c: number;
  ref: string;
  /** feedback de graça (≤ 8 palavras, narrado) */
  msg: string;
}

export interface Encontro {
  id: string;
  nome: string;
  guardiao?: boolean;
  look: NpcLookCanvas;
  /** fala ao ser convencido pela Palavra (guardião) */
  vitoria?: string;
  variantes: Carta[];
}

export interface Fase {
  n: number;
  nome: string;
  sub: string;
  biome: BiomeId;
  encontros: Encontro[];
}

const hairShort: NpcLookCanvas['hairStyle'] = 'short';
const hairLong: NpcLookCanvas['hairStyle'] = 'long';
const hairWavy: NpcLookCanvas['hairStyle'] = 'wavy';
const hairBuzz: NpcLookCanvas['hairStyle'] = 'buzz';

export const FASES: Fase[] = [
  // ─────────────────────────── 1 · A Vila do Amanhecer ───────────────────────────
  {
    n: 1,
    nome: 'A Vila do Amanhecer',
    sub: 'Deus cria e cuida de tudo',
    biome: 'amanhecer',
    encontros: [
      {
        id: 'f1-lucia',
        nome: 'Dona Lúcia',
        look: { skin: '#e0ac69', hair: '#6b4423', hairStyle: hairWavy, robe: '#16a34a', headwear: 'none', headwearColor: '#fff', prop: 'flower' },
        variantes: [
          { s: 'A Dona Lúcia rega as plantinhas do jardim.', q: 'O que Deus fez com as plantas?', o: ['Deus criou todas as plantas', 'Deus criou só as flores', 'Deus criou só as árvores'], c: 0, ref: 'Gênesis 1.11 (NAA)', msg: 'Deus criou toda planta bonita! 🌱' },
          { s: 'Uma sementinha virou uma árvore enorme.', q: 'Quem faz a semente crescer?', o: ['É o vento sozinho', 'É a chuva sozinha', 'É Deus que faz crescer'], c: 2, ref: '1 Coríntios 3.7 (NAA)', msg: 'Deus dá o crescimento às plantas! 🌳' },
          { s: 'As flores do jardim abriram bem cedo.', q: 'Complete: Deus viu tudo o que fez, e era…', o: ['muito bom', 'muito novo', 'muito grande'], c: 0, ref: 'Gênesis 1.31 (NAA)', msg: 'Deus viu que era muito bom! 🌼' },
        ],
      },
      {
        id: 'f1-pedrinho',
        nome: 'Pedrinho',
        look: { skin: '#fbd6ad', hair: '#3b2412', hairStyle: hairShort, robe: '#2563eb', headwear: 'none', headwearColor: '#fff', prop: 'balloon' },
        variantes: [
          { s: 'O Pedrinho viu os passarinhos comendo.', q: 'Quem cuida das aves do céu?', o: ['Deus cuida das aves', 'Deus cuida só dos grandes', 'Deus cuida só de noite'], c: 0, ref: 'Mateus 6.26 (NAA)', msg: 'Deus cuida das aves — e de você! 🐦' },
          { s: 'Uma ovelhinha se perdeu no caminho.', q: 'O que Deus quer com quem se perde?', o: ['Deus quer que volte', 'Deus quer que fique longe', 'Deus esquece de quem se perde'], c: 0, ref: 'Mateus 18.14 (NAA)', msg: 'Deus quer que nenhum se perde! 🐑' },
          { s: 'O Pedrinho olhou a mão dele bem de perto.', q: 'Quem fez cada pessoa de modo especial?', o: ['Deus nos fez com cuidado', 'A gente se fez sozinho', 'Ninguém sabe quem fez'], c: 0, ref: 'Salmos 139.13-14 (NAA)', msg: 'Deus te fez de modo admirável! 🤲' },
        ],
      },
      {
        id: 'f1-bento',
        nome: 'Seu Bento',
        look: { skin: '#c68642', hair: '#e5e7eb', hairStyle: hairShort, robe: '#b45309', headwear: 'hat', headwearColor: '#92400e', prop: 'bread' },
        variantes: [
          { s: 'O pão quentinho saiu do forno.', q: 'Como devemos viver com o que recebemos?', o: ['Agradecer a Deus em tudo', 'Agradecer só no fim', 'Nunca agradecer a Deus'], c: 0, ref: '1 Tessalonicenses 5.18 (NAA)', msg: 'Agradeça a Deus em tudo! 🍞' },
          { s: 'O Seu Bento repartiu o pão com os vizinhos.', q: 'Por que damos graças a Deus?', o: ['Porque ele é bom', 'Porque ele é forte', 'Porque ele é antigo'], c: 0, ref: 'Salmos 107.1 (NAA)', msg: 'Deus é bom para sempre! 🙌' },
          { s: 'A chuva regou a horta do Seu Bento.', q: 'De onde vem toda boa dádiva?', o: ['Vem do alto, de Deus', 'Vem do acaso sozinho', 'Vem só do nosso trabalho'], c: 0, ref: 'Tiago 1.17 (NAA)', msg: 'Toda dádiva boa vem de Deus! 🌧️' },
        ],
      },
      {
        id: 'f1-ana',
        nome: 'Ana',
        look: { skin: '#8d5524', hair: '#1f1410', hairStyle: hairLong, robe: '#db2777', headwear: 'headband', headwearColor: '#f472b6', prop: 'basket' },
        variantes: [
          { s: 'A Ana ia pela estrada nova, sozinha.', q: 'Em quem devemos confiar?', o: ['No Senhor de todo o coração', 'No Senhor só de vez em quando', 'Só em nós mesmos'], c: 0, ref: 'Provérbios 3.5 (NAA)', msg: 'Confie no Senhor inteiro! 💛' },
          { s: 'Ela ouviu um barulho e ficou com medo.', q: 'O que fazer quando o medo chega?', o: ['Confiar em Deus', 'Fugir sozinha', 'Fingir que não sente'], c: 0, ref: 'Salmos 56.3 (NAA)', msg: 'Com medo, confie em Deus! 🛡️' },
          { s: 'A Ana pensou que não dava conta.', q: 'O que Deus diz a quem tem medo?', o: ['Não temas, eu sou contigo', 'Não temas, ninguém te vê', 'Não temas, tudo é fácil'], c: 0, ref: 'Isaías 41.10 (NAA)', msg: 'Deus está contigo! ✨' },
        ],
      },
      {
        id: 'f1-ze',
        nome: 'Porteiro Zé',
        guardiao: true,
        look: { skin: '#d9a066', hair: '#64748b', hairStyle: hairBuzz, robe: '#7c3aed', headwear: 'hat', headwearColor: '#4c1d95', prop: 'staff' },
        vitoria: 'A Palavra certa abriu o caminho!',
        variantes: [
          { s: 'O Porteiro Zé guarda o portão da vila.', q: 'O que é a fé?', o: ['A certeza do que esperamos', 'A certeza do que vemos', 'A certeza do que temos'], c: 0, ref: 'Hebreus 11.1 (NAA)', msg: 'A fé é certeza do que se espera! 🚪' },
          { s: 'A jornada ia começar bem cedo.', q: 'Em quem confiar no caminho?', o: ['No Senhor de todo o coração', 'No Senhor só pela metade', 'Só na nossa força'], c: 0, ref: 'Provérbios 3.5 (NAA)', msg: 'Confie no Senhor todo! 🗺️' },
          { s: 'O Porteiro Zé ofereceu um cajado ao viajante.', q: 'Complete: O Senhor é o meu pastor; nada me…', o: ['faltará', 'sobrará', 'passará'], c: 0, ref: 'Salmos 23.1 (NAA)', msg: 'Nada me faltará com Deus! 🐑' },
        ],
      },
    ],
  },

  // ─────────────────────────── 2 · O Pomar Dourado ───────────────────────────
  {
    n: 2,
    nome: 'O Pomar Dourado',
    sub: 'Obedecer e dizer a verdade',
    biome: 'pomar',
    encontros: [
      {
        id: 'f2-rita',
        nome: 'Vovó Rita',
        look: { skin: '#fbd6ad', hair: '#d1d5db', hairStyle: hairLong, robe: '#f59e0b', headwear: 'none', headwearColor: '#fff', prop: 'basket' },
        variantes: [
          { s: 'A Vovó Rita chamou o neto para ajudar.', q: 'O que Deus prefere?', o: ['Que a gente obedeça', 'Que a gente invente', 'Que a gente esconda'], c: 0, ref: '1 Samuel 15.22 (NAA)', msg: 'Obedecer é o melhor! 💫' },
          { s: 'O neto ia correndo para a rua.', q: 'A quem devemos obedecer?', o: ['Aos pais, como agrada ao Senhor', 'Só quando quisermos', 'A ninguém, nunca'], c: 0, ref: 'Colossenses 3.20 (NAA)', msg: 'Obedecer aos pais agrada a Deus! 🏡' },
          { s: 'Ela guardou a receita da torta de maçã.', q: 'Como mostramos amor a Jesus?', o: ['Guardando os seus mandamentos', 'Falando só bonito', 'Esquecendo as regras'], c: 0, ref: 'João 14.15 (NAA)', msg: 'Amar é obedecer a Jesus! 💕' },
        ],
      },
      {
        id: 'f2-teo',
        nome: 'Téo',
        look: { skin: '#e0ac69', hair: '#2d1b0e', hairStyle: hairShort, robe: '#0ea5e9', headwear: 'none', headwearColor: '#fff', prop: 'none' },
        variantes: [
          { s: 'O Téo quebrou o vaso sem querer.', q: 'O que fazer com a verdade?', o: ['Dizer a verdade sempre', 'Dizer o que for mais fácil', 'Ficar calado para sempre'], c: 0, ref: 'Efésios 4.25 (NAA)', msg: 'A verdade é o caminho! 🗣️' },
          { s: 'Ele estava quase inventando uma desculpa.', q: 'O que Deus acha da mentira?', o: ['Os lábios mentirosos são maus', 'A mentira é só uma brincadeira', 'A mentira não faz diferença'], c: 0, ref: 'Provérbios 12.22 (NAA)', msg: 'Deus ama a verdade! 🤍' },
          { s: 'O Téo descobriu a resposta certa no caderno.', q: 'O que a verdade faz com a gente?', o: ['A verdade nos liberta', 'A verdade nos prende', 'A verdade confunde'], c: 0, ref: 'João 8.32 (NAA)', msg: 'A verdade liberta! 🕊️' },
        ],
      },
      {
        id: 'f2-lia',
        nome: 'Lia',
        look: { skin: '#fbd6ad', hair: '#a16207', hairStyle: hairWavy, robe: '#84cc16', headwear: 'headband', headwearColor: '#65a30d', prop: 'flower' },
        variantes: [
          { s: 'A Lia esperou a maçã madurar.', q: 'O que não devemos fazer?', o: ['Não nos cansar de fazer o bem', 'Não fazer o bem sempre', 'Fazer o bem só aos amigos'], c: 0, ref: 'Gálatas 6.9 (NAA)', msg: 'Continue fazendo o bem! 🍎' },
          { s: 'Ela plantou e esperou dias e dias.', q: 'O que a paciência faz?', o: ['A paciência completa a obra', 'A paciência atrapalha a obra', 'A paciência apaga a obra'], c: 0, ref: 'Tiago 1.4 (NAA)', msg: 'A paciência completa tudo! ⏳' },
          { s: 'A Lia dividiu a maçã com a irmã.', q: 'Como é o amor de Deus?', o: ['O amor é paciente', 'O amor é apressado', 'O amor é esquecido'], c: 0, ref: '1 Coríntios 13.4 (NAA)', msg: 'O amor é paciente e bondoso! ❤️' },
        ],
      },
      {
        id: 'f2-mano',
        nome: 'Sr. Mano',
        look: { skin: '#8d5524', hair: '#111827', hairStyle: hairBuzz, robe: '#a16207', headwear: 'hat', headwearColor: '#78350f', prop: 'bread' },
        variantes: [
          { s: 'O Sr. Mano colheu o dia inteiro.', q: 'Como devemos trabalhar?', o: ['De coração, como para o Senhor', 'Sem vontade, com preguiça', 'Só quando alguém olha'], c: 0, ref: 'Colossenses 3.23 (NAA)', msg: 'Trabalhe de coração! 💪' },
          { s: 'Ele achou mais frutas do que esperava.', q: 'O que vem do trabalho?', o: ['O trabalho traz proveito', 'O trabalho não serve para nada', 'O trabalho traz cansaço só'], c: 0, ref: 'Provérbios 14.23 (NAA)', msg: 'O trabalho traz fruto! 🧺' },
          { s: 'A formiguinha carregava sozinha.', q: 'O que a formiga ensina?', o: ['Trabalhar e guardar', 'Descansar o dia todo', 'Esperar os outros fazerem'], c: 0, ref: 'Provérbios 6.6 (NAA)', msg: 'A formiga é trabalhadeira! 🐜' },
        ],
      },
      {
        id: 'f2-guardiao',
        nome: 'Guardião do Pomar',
        guardiao: true,
        look: { skin: '#c68642', hair: '#374151', hairStyle: hairWavy, robe: '#ca8a04', headwear: 'hat', headwearColor: '#78350f', prop: 'staff' },
        vitoria: 'Escolhas sábias abrem o pomar!',
        variantes: [
          { s: 'O Guardião do Pomar ensinava os pequenos.', q: 'Como se educa uma criança?', o: ['No caminho em que deve andar', 'No caminho que ela quiser', 'Sem caminho nenhum'], c: 0, ref: 'Provérbios 22.6 (NAA)', msg: 'Ensine o caminho certo! 🌾' },
          { s: 'Cada família escolhia a sua trilha.', q: 'Qual a melhor escolha?', o: ['Servir ao Senhor', 'Servir só a si mesmo', 'Não escolher nada'], c: 0, ref: 'Josué 24.15 (NAA)', msg: 'Escolha servir ao Senhor! 🙏' },
          { s: 'O caminho do pomar tinha muitas curvas.', q: 'Complete: O homem planeja o caminho, mas o Senhor…', o: ['dirige os passos', 'esquece os passos', 'segura os passos'], c: 0, ref: 'Provérbios 16.9 (NAA)', msg: 'Deus dirige os teus passos! 👣' },
        ],
      },
    ],
  },

  // ─────────────────────────── 3 · O Mercado Alegre ───────────────────────────
  {
    n: 3,
    nome: 'O Mercado Alegre',
    sub: 'Honestidade e generosidade',
    biome: 'mercado',
    encontros: [
      {
        id: 'f3-fatima',
        nome: 'Dona Fátima',
        look: { skin: '#c68642', hair: '#1f1410', hairStyle: hairLong, robe: '#ef4444', headwear: 'hood', headwearColor: '#b91c1c', prop: 'basket' },
        variantes: [
          { s: 'A Dona Fátima pesou as frutas na balança.', q: 'O que não devemos fazer?', o: ['Não furtar nada', 'Furtar só um pouco', 'Furtar o que for pequeno'], c: 0, ref: 'Levítico 19.11 (NAA)', msg: 'Não pegar o que não é nosso! ⚖️' },
          { s: 'Ela guardou o troco para devolver.', q: 'Quem é fiel no pouco?', o: ['É fiel também no muito', 'É fiel só no muito', 'Nunca é fiel em nada'], c: 0, ref: 'Lucas 16.10 (NAA)', msg: 'Fiel no pouco, fiel no muito! 💰' },
          { s: 'O caderno de contas estava todo certo.', q: 'O que devemos procurar?', o: ['Proceder com honestidade', 'Proceder com jeitinho', 'Proceder com pressa'], c: 0, ref: '2 Coríntios 8.21 (NAA)', msg: 'A honestidade agrada a Deus! 📒' },
        ],
      },
      {
        id: 'f3-caio',
        nome: 'Caio',
        look: { skin: '#fbd6ad', hair: '#92400e', hairStyle: hairShort, robe: '#2563eb', headwear: 'none', headwearColor: '#fff', prop: 'none' },
        variantes: [
          { s: 'O Caio achou a carteira de um amigo.', q: 'O que fazer com o que é dos outros?', o: ['Devolver ao dono', 'Guardar para depois', 'Deixar onde achou'], c: 0, ref: 'Êxodo 23.4 (NAA)', msg: 'Devolva sempre! 🤝' },
          { s: 'Ele pegou uma moeda que não era dele.', q: 'Como consertar o erro?', o: ['Restituir o que pegou', 'Fingir que não aconteceu', 'Esperar ninguém lembrar'], c: 0, ref: 'Lucas 19.8 (NAA)', msg: 'Consertar o erro é certo! 🪙' },
          { s: 'O Caio vendeu limonada na feira.', q: 'Como Deus vê a justiça?', o: ['Deus quer pesos justos', 'Deus não liga para isso', 'Deus quer o maior preço'], c: 0, ref: 'Provérbios 11.1 (NAA)', msg: 'Deus ama a justiça! ⚖️' },
        ],
      },
      {
        id: 'f3-bia',
        nome: 'Bia',
        look: { skin: '#e0ac69', hair: '#5b3a20', hairStyle: hairWavy, robe: '#14b8a6', headwear: 'none', headwearColor: '#fff', prop: 'basket' },
        variantes: [
          { s: 'A Bia tinha dois doces na mão.', q: 'O que faz a alegria maior?', o: ['Repartir com os outros', 'Comer tudo sozinha', 'Esconder para depois'], c: 0, ref: 'Atos 20.35 (NAA)', msg: 'Dar é mais alegre! 🍬' },
          { s: 'Ela levou frutas para a escola.', q: 'Como Deus quer que a gente dê?', o: ['Com alegria', 'Com má vontade', 'Com pressa'], c: 0, ref: '2 Coríntios 9.7 (NAA)', msg: 'Deus ama quem dá feliz! 🎁' },
          { s: 'A Bia viu um colega sem lanche.', q: 'O que não esquecer de fazer?', o: ['Fazer o bem e repartir', 'Fazer o bem só depois', 'Esperar que os outros repartam'], c: 0, ref: 'Hebreus 13.16 (NAA)', msg: 'Repartir é fazer o bem! 🥨' },
        ],
      },
      {
        id: 'f3-nico',
        nome: 'Nico',
        look: { skin: '#8d5524', hair: '#111827', hairStyle: hairBuzz, robe: '#f97316', headwear: 'hat', headwearColor: '#c2410c', prop: 'bread' },
        variantes: [
          { s: 'O Nico vendia pão na barraca.', q: 'O que Deus acha da balança enganosa?', o: ['É abominável a Deus', 'É aceitável a Deus', 'É indiferente a Deus'], c: 0, ref: 'Provérbios 11.1 (NAA)', msg: 'Deus quer medidas justas! 🍞' },
          { s: 'Um cliente devolveu o troco a mais.', q: 'O que Deus nos pede?', o: ['Praticar a justiça', 'Praticar o jeitinho', 'Praticar a pressa'], c: 0, ref: 'Miquéias 6.8 (NAA)', msg: 'Pratique a justiça! 🧡' },
          { s: 'O Nico conferiu os pesos da feira.', q: 'Como devem ser os nossos pesos?', o: ['Justos e verdadeiros', 'Do jeito que der', 'Maior para nós'], c: 0, ref: 'Levítico 19.36 (NAA)', msg: 'Seja justo em tudo! ⚖️' },
        ],
      },
      {
        id: 'f3-guardiao',
        nome: 'Mestre do Mercado',
        guardiao: true,
        look: { skin: '#d9a066', hair: '#475569', hairStyle: hairShort, robe: '#b45309', headwear: 'headband', headwearColor: '#f59e0b', prop: 'book' },
        vitoria: 'A Palavra certa clareou o mercado!',
        variantes: [
          { s: 'O Mestre do Mercado tinha pouco e era feliz.', q: 'O que é grande proveito?', o: ['A piedade com contentamento', 'Ter tudo o que se quer', 'Trabalhar sem parar'], c: 0, ref: '1 Timóteo 6.6 (NAA)', msg: 'Contentamento é tesouro! 😊' },
          { s: 'Ele olhava as barracas sem inveja.', q: 'Com o que devemos nos contentar?', o: ['Com o que temos', 'Com o que os outros têm', 'Com nada nunca'], c: 0, ref: 'Hebreus 13.5 (NAA)', msg: 'Contente-se com o que tem! 🌟' },
          { s: 'O mercado fechou e sobrou pouco.', q: 'O que aprendemos com Deus?', o: ['Contentar-nos com o que temos', 'Cobrar sempre mais', 'Ficar tristes por pouco'], c: 0, ref: 'Filipenses 4.11 (NAA)', msg: 'Deus ensina o contentamento! 🙌' },
        ],
      },
    ],
  },

  // ─────────────────────────── 4 · A Escola da Colina ───────────────────────────
  {
    n: 4,
    nome: 'A Escola da Colina',
    sub: 'Palavras boas, amizade e perdão',
    biome: 'escola',
    encontros: [
      {
        id: 'f4-clara',
        nome: 'Profa. Clara',
        look: { skin: '#fbd6ad', hair: '#78350f', hairStyle: hairWavy, robe: '#7c3aed', headwear: 'none', headwearColor: '#fff', prop: 'book' },
        variantes: [
          { s: 'A Profa. Clara elogiou o desenho do aluno.', q: 'Como são as palavras boas?', o: ['Doces como favos de mel', 'Doces só no papel', 'Frias como o gelo'], c: 0, ref: 'Provérbios 16.24 (NAA)', msg: 'Palavras doces fazem bem! 🍯' },
          { s: 'Ela falou na hora certa, bem devagar.', q: 'O que vale uma palavra certa?', o: ['É boa na hora certa', 'É boa em qualquer hora', 'Não vale nada'], c: 0, ref: 'Provérbios 25.11 (NAA)', msg: 'A palavra certa vale ouro! 💬' },
          { s: 'A sala toda ficou em silêncio.', q: 'Como deve ser a nossa fala?', o: ['Amável e cheia de graça', 'Dura e cheia de pressa', 'Alta e cheia de razão'], c: 0, ref: 'Colossenses 4.6 (NAA)', msg: 'Fale com amor e graça! 🌈' },
        ],
      },
      {
        id: 'f4-rafa',
        nome: 'Rafa',
        look: { skin: '#e0ac69', hair: '#2d1b0e', hairStyle: hairShort, robe: '#0ea5e9', headwear: 'none', headwearColor: '#fff', prop: 'none' },
        variantes: [
          { s: 'Um colega novo chegou sozinho.', q: 'O que fazer com quem chega?', o: ['Acolher com alegria', 'Deixar de fora', 'Fingir que não viu'], c: 0, ref: 'Romanos 12.13 (NAA)', msg: 'Acolher é amar! 🫂' },
          { s: 'O Rafa ia fazer uma festa.', q: 'Quem devemos convidar?', o: ['Também quem não tem o que dar', 'Só quem nos dá presente', 'Só os nossos melhores amigos'], c: 0, ref: 'Lucas 14.13 (NAA)', msg: 'Chame também quem tem pouco! 🎈' },
          { s: 'O Rafa viu alguém precisando de ajuda.', q: 'Quem ajuda o próximo ajuda quem?', o: ['A Jesus mesmo', 'A si mesmo só', 'Ninguém importante'], c: 0, ref: 'Mateus 25.35 (NAA)', msg: 'Ajudar é servir a Jesus! 🤲' },
        ],
      },
      {
        id: 'f4-sofia',
        nome: 'Sofia',
        look: { skin: '#8d5524', hair: '#1f1410', hairStyle: hairLong, robe: '#ec4899', headwear: 'headband', headwearColor: '#f472b6', prop: 'none' },
        variantes: [
          { s: 'A Sofia errou e ficou pesada.', q: 'O que fazer quando erramos?', o: ['Dizer o que fizemos', 'Esconder o que fizemos', 'Culpar outra pessoa'], c: 0, ref: 'Tiago 5.16 (NAA)', msg: 'Contar o erro traz alívio! 🕊️' },
          { s: 'Ela brigou com a melhor amiga.', q: 'Como resolver uma briga?', o: ['Ir conversar e reconciliar', 'Nunca mais falar', 'Falar mal para os outros'], c: 0, ref: 'Mateus 5.23-24 (NAA)', msg: 'Reconciliar é o caminho! 🤝' },
          { s: 'A Sofia ainda estava com raiva.', q: 'O que devemos fazer com o erro alheio?', o: ['Perdoar uns aos outros', 'Guardar a mágoa', 'Cobrar para sempre'], c: 0, ref: 'Colossenses 3.13 (NAA)', msg: 'Perdoar liberta o coração! 💗' },
        ],
      },
      {
        id: 'f4-zeca',
        nome: 'Zeca',
        look: { skin: '#fbd6ad', hair: '#3b2412', hairStyle: hairBuzz, robe: '#16a34a', headwear: 'none', headwearColor: '#fff', prop: 'none' },
        variantes: [
          { s: 'O Zeca colou na prova e foi descoberto.', q: 'O que traz misericórdia?', o: ['Confessar e abandonar o erro', 'Esconder bem o erro', 'Fazer de conta que não errou'], c: 0, ref: 'Provérbios 28.13 (NAA)', msg: 'Assumir o erro traz perdão! 🌤️' },
          { s: 'Ele ia falar uma mentira na aula.', q: 'Como deve ser o nosso coração?', o: ['Falar a verdade', 'Guardar meias verdades', 'Inventar uma história'], c: 0, ref: 'Salmos 15.2 (NAA)', msg: 'A verdade mora no coração! 🤍' },
          { s: 'O Zeca precisava contar algo difícil.', q: 'Como falar a verdade?', o: ['Em amor', 'Com raiva', 'Com deboche'], c: 0, ref: 'Efésios 4.15 (NAA)', msg: 'A verdade dita com amor! 💬' },
        ],
      },
      {
        id: 'f4-guardiao',
        nome: 'Diretor Ancião',
        guardiao: true,
        look: { skin: '#d9a066', hair: '#e5e7eb', hairStyle: hairWavy, robe: '#1e3a8a', headwear: 'headband', headwearColor: '#3b82f6', prop: 'book' },
        vitoria: 'O perdão abriu as portas da escola!',
        variantes: [
          { s: 'O Diretor falava do perdão todo dia.', q: 'O que acontece quando perdoamos?', o: ['O nosso Pai também nos perdoa', 'Nada muda no céu', 'Ficamos devendo mais'], c: 0, ref: 'Mateus 6.14 (NAA)', msg: 'Perdoar atrai o perdão! 🕊️' },
          { s: 'Um aluno perguntou "quantas vezes?".', q: 'Quantas vezes devemos perdoar?', o: ['Sempre, sem contar', 'Uma vez só', 'Até ficar difícil'], c: 0, ref: 'Mateus 18.22 (NAA)', msg: 'Perdoe sempre, sem contar! ♾️' },
          { s: 'Na oração da escola, ele se lembrou de tudo.', q: 'O que devemos fazer ao orar?', o: ['Perdoar quem nos ofendeu', 'Esquecer de perdoar', 'Falar só de nós mesmos'], c: 0, ref: 'Marcos 11.25 (NAA)', msg: 'Perdoe antes de orar! 🙏' },
        ],
      },
    ],
  },

  // ─────────────────────────── 5 · À Beira do Rio ───────────────────────────
  {
    n: 5,
    nome: 'À Beira do Rio',
    sub: 'Coragem: Deus está contigo',
    biome: 'rio',
    encontros: [
      {
        id: 'f5-nara',
        nome: 'Nara',
        look: { skin: '#c68642', hair: '#1f1410', hairStyle: hairLong, robe: '#0891b2', headwear: 'none', headwearColor: '#fff', prop: 'umbrella' },
        variantes: [
          { s: 'A Nara olhava a água corrente.', q: 'O que Deus diz ao coração com medo?', o: ['Sê forte e corajoso', 'Sê forte e sozinho', 'Sê calado e escondido'], c: 0, ref: 'Josué 1.9 (NAA)', msg: 'Sê corajoso com Deus! 💪' },
          { s: 'Ela tremia antes de atravessar a ponte.', q: 'Que espírito Deus nos deu?', o: ['Espírito de poder e amor', 'Espírito de temor', 'Espírito de silêncio'], c: 0, ref: '2 Timóteo 1.7 (NAA)', msg: 'Deus deu você poder e amor! 🔥' },
          { s: 'Era noite e a estrada era escura.', q: 'A quem devemos temer?', o: ['A ninguém: Deus é nossa luz', 'A tudo o que é escuro', 'A todos os que passam'], c: 0, ref: 'Salmos 27.1 (NAA)', msg: 'Deus é a sua luz! 🏮' },
        ],
      },
      {
        id: 'f5-teofilo',
        nome: 'Teófilo',
        look: { skin: '#8d5524', hair: '#374151', hairStyle: hairShort, robe: '#0369a1', headwear: 'hat', headwearColor: '#0c4a6e', prop: 'fishing' },
        variantes: [
          { s: 'O peixe não mordia a isca do Teófilo.', q: 'O que fazer enquanto esperamos?', o: ['Esperar com coragem', 'Desistir e ir embora', 'Ficar com raiva'], c: 0, ref: 'Salmos 27.14 (NAA)', msg: 'Espere por Deus com coragem! 🎣' },
          { s: 'Ele plantou um pé de manga.', q: 'O que Deus fez com o tempo?', o: ['Deus deu tempo para tudo', 'Deus apressou tudo', 'Deus tirou o tempo'], c: 0, ref: 'Eclesiastes 3.1 (NAA)', msg: 'Tudo tem o seu tempo! 🌱' },
          { s: 'A promessa parecia demorar.', q: 'O que Deus diz da sua palavra?', o: ['A sua visão não tarda', 'A sua visão esquece', 'A sua visão se perde'], c: 0, ref: 'Habacuque 2.3 (NAA)', msg: 'A promessa de Deus chega! ⏳' },
        ],
      },
      {
        id: 'f5-duda',
        nome: 'Duda',
        look: { skin: '#fbd6ad', hair: '#6b4423', hairStyle: hairWavy, robe: '#7c3aed', headwear: 'none', headwearColor: '#fff', prop: 'lantern' },
        variantes: [
          { s: 'A Duda subia a colina pesada.', q: 'Quem é o nosso refúgio?', o: ['Deus é refúgio e fortaleza', 'Deus é refúgio de longe', 'Deus só olha de fora'], c: 0, ref: 'Salmos 46.1 (NAA)', msg: 'Deus é o seu refúgio! 🏔️' },
          { s: 'Ela não sabia de onde viria a ajuda.', q: 'De onde vem o nosso socorro?', o: ['Do Senhor que fez o céu', 'De nós mesmos', 'Do acaso do caminho'], c: 0, ref: 'Salmos 121.2 (NAA)', msg: 'O socorro vem do Senhor! 🙌' },
          { s: 'A Duda quase caiu na trilha.', q: 'Quem nos sustenta?', o: ['O Senhor nosso Deus', 'A nossa coragem', 'A nossa pressa'], c: 0, ref: 'Isaías 41.13 (NAA)', msg: 'Deus te sustenta! 🤝' },
        ],
      },
      {
        id: 'f5-teo',
        nome: 'Téo',
        look: { skin: '#e0ac69', hair: '#92400e', hairStyle: hairShort, robe: '#2563eb', headwear: 'none', headwearColor: '#fff', prop: 'none' },
        variantes: [
          { s: 'O Téo atravessou o vale escuro.', q: 'O que sente quem anda com Deus?', o: ['Não teme mal algum', 'Sente medo de tudo', 'Anda sem esperança'], c: 0, ref: 'Salmos 23.4 (NAA)', msg: 'Deus caminha com você! 🌌' },
          { s: 'Um trovão espantou todo mundo.', q: 'Quem nos protege nas tempestades?', o: ['O Altíssimo é o nosso abrigo', 'A nossa casa só', 'A nossa sorte'], c: 0, ref: 'Salmos 91.1-2 (NAA)', msg: 'Deus é o seu abrigo! ⛈️' },
          { s: 'A água subiu no meio do caminho.', q: 'O que Deus promete nas águas?', o: ['Eu estarei contigo', 'Eu ficarei distante', 'Eu te esquecerei'], c: 0, ref: 'Isaías 43.2 (NAA)', msg: 'Deus está com você nas águas! 🌊' },
        ],
      },
      {
        id: 'f5-guardiao',
        nome: 'Barqueiro',
        guardiao: true,
        look: { skin: '#c68642', hair: '#64748b', hairStyle: hairBuzz, robe: '#155e75', headwear: 'hat', headwearColor: '#164e63', prop: 'fishing' },
        vitoria: 'A Palavra certa acalmou o rio!',
        variantes: [
          { s: 'O Barqueiro cruzava o rio todo dia.', q: 'O que Deus prometeu a quem o segue?', o: ['Nunca te deixarei', 'Nunca te repreenderei', 'Nunca te ouvirei'], c: 0, ref: 'Hebreus 13.5 (NAA)', msg: 'Deus nunca te deixa! ⛵' },
          { s: 'Ele segurava a mão do passageiro.', q: 'O que Deus falou a Moisés?', o: ['Ele não te deixará', 'Ele te esconderá', 'Ele te apressará'], c: 0, ref: 'Deuteronômio 31.6 (NAA)', msg: 'Deus não te desampara! 🤲' },
          { s: 'A travessia ia terminar.', q: 'Até quando Jesus está conosco?', o: ['Todos os dias, até o fim', 'Só nos dias bons', 'Só quando pedimos'], c: 0, ref: 'Mateus 28.20 (NAA)', msg: 'Jesus está convosco sempre! 🌅' },
        ],
      },
    ],
  },

  // ─────────────────────────── 6 · A Trilha dos Pinheiros ───────────────────────────
  {
    n: 6,
    nome: 'A Trilha dos Pinheiros',
    sub: 'A Palavra ilumina o caminho',
    biome: 'floresta',
    encontros: [
      {
        id: 'f6-gui',
        nome: 'Gui',
        look: { skin: '#fbd6ad', hair: '#3b2412', hairStyle: hairShort, robe: '#15803d', headwear: 'headband', headwearColor: '#22c55e', prop: 'book' },
        variantes: [
          { s: 'O Gui lia a Bíblia à luz da lanterna.', q: 'Complete: A tua palavra é lâmpada para os meus…', o: ['pés', 'passos', 'olhos'], c: 0, ref: 'Salmos 119.105 (NAA)', msg: 'A Palavra guia os passos! 📖' },
          { s: 'Ele se perdeu entre os pinheiros.', q: 'O que ensina e dá luz?', o: ['A instrução da Palavra', 'A força dos braços', 'A pressa dos passos'], c: 0, ref: 'Provérbios 6.23 (NAA)', msg: 'A Palavra é luz! 🕯️' },
          { s: 'O Gui não sabia qual caminho seguir.', q: 'O que fazer para saber o caminho?', o: ['Ouvir e guardar a Palavra', 'Só confiar na sorte', 'Fechar os olhos e ir'], c: 0, ref: 'Provérbios 4.23 (NAA)', msg: 'Guarde a Palavra! 💚' },
        ],
      },
      {
        id: 'f6-selma',
        nome: 'Selma',
        look: { skin: '#8d5524', hair: '#1f1410', hairStyle: hairLong, robe: '#f59e0b', headwear: 'none', headwearColor: '#fff', prop: 'lantern' },
        variantes: [
          { s: 'A Selma acendeu a lanterna na trilha.', q: 'Quem é a luz do mundo?', o: ['Jesus é a luz', 'A lanterna é a luz', 'A noite é a luz'], c: 0, ref: 'João 8.12 (NAA)', msg: 'Jesus é a luz do mundo! 🌟' },
          { s: 'Ela brilhava mesmo no escuro.', q: 'O que somos neste mundo?', o: ['Somos a luz do mundo', 'Somos sombras do mundo', 'Somos sós do mundo'], c: 0, ref: 'Mateus 5.14 (NAA)', msg: 'Você também brilha! 💡' },
          { s: 'A escuridão parecia grande demais.', q: 'O que acontece com a luz?', o: ['A luz brilha nas trevas', 'A luz some nas trevas', 'A luz teme as trevas'], c: 0, ref: 'João 1.5 (NAA)', msg: 'A luz vence as trevas! 🌠' },
        ],
      },
      {
        id: 'f6-ciro',
        nome: 'Vô Ciro',
        look: { skin: '#d9a066', hair: '#d1d5db', hairStyle: hairWavy, robe: '#047857', headwear: 'none', headwearColor: '#fff', prop: 'book' },
        variantes: [
          { s: 'O Vô Ciro sabia muitos versículos.', q: 'Por que guardamos a Palavra?', o: ['Para não errar', 'Para ganhar elogios', 'Para esquecer depois'], c: 0, ref: 'Salmos 119.11 (NAA)', msg: 'Guarde a Palavra no coração! 📚' },
          { s: 'Ele contava as histórias da Bíblia.', q: 'Quem é bem-aventurado?', o: ['Quem ouve e guarda a Palavra', 'Quem só ouve e esquece', 'Quem não quer ouvir'], c: 0, ref: 'Lucas 11.28 (NAA)', msg: 'Ouvir e guardar é bênção! 👂' },
          { s: 'O Vô Ciro fechou o livro sorrindo.', q: 'Como o jovem purifica o caminho?', o: ['Guardando a Palavra', 'Esquecendo a Palavra', 'Escondendo a Palavra'], c: 0, ref: 'Salmos 119.9 (NAA)', msg: 'A Palavra limpa o caminho! ✨' },
        ],
      },
      {
        id: 'f6-maya',
        nome: 'Maya',
        look: { skin: '#e0ac69', hair: '#5b3a20', hairStyle: hairWavy, robe: '#14b8a6', headwear: 'headband', headwearColor: '#2dd4bf', prop: 'flower' },
        variantes: [
          { s: 'A Maya pensava na Bíblia o dia todo.', q: 'Em que devemos meditar?', o: ['Na lei do Senhor', 'Só nos problemas', 'Só nos brinquedos'], c: 0, ref: 'Salmos 1.2 (NAA)', msg: 'Meditar na Palavra dá alegria! 🌿' },
          { s: 'Ela marcou o versículo favorito.', q: 'O que sentimos pela Palavra?', o: ['Amor pela lei de Deus', 'Cansaço pela lei', 'Medo da lei'], c: 0, ref: 'Salmos 119.97 (NAA)', msg: 'Ame a Palavra de Deus! 💚' },
          { s: 'A Maya recitou antes de dormir.', q: 'Quantas vezes meditar na Palavra?', o: ['De dia e de noite', 'Uma vez por ano', 'Só quando é fácil'], c: 0, ref: 'Josué 1.8 (NAA)', msg: 'Na Palavra sempre! 🌙' },
        ],
      },
      {
        id: 'f6-guardiao',
        nome: 'Guardião da Trilha',
        guardiao: true,
        look: { skin: '#c68642', hair: '#475569', hairStyle: hairLong, robe: '#166534', headwear: 'hood', headwearColor: '#14532d', prop: 'staff' },
        vitoria: 'A Palavra certa iluminou a trilha!',
        variantes: [
          { s: 'O Guardião da Trilha parou no cruzamento.', q: 'Em quem confiar de todo o coração?', o: ['No Senhor', 'Na nossa cabeça', 'Na nossa sorte'], c: 0, ref: 'Provérbios 3.5 (NAA)', msg: 'Confie no Senhor todo! 🧭' },
          { s: 'Os caminhos se dividiam em dois.', q: 'Complete: Reconhece-o nos teus caminhos, e ele…', o: ['endireitará as tuas veredas', 'esconderá as tuas veredas', 'apagará as tuas veredas'], c: 0, ref: 'Provérbios 3.6 (NAA)', msg: 'Deus endireita o caminho! 🛤️' },
          { s: 'A trilha subia bem íngreme.', q: 'O que fazer com o nosso caminho?', o: ['Entregar o caminho ao Senhor', 'Guardar o caminho para nós', 'Abandonar o caminho'], c: 0, ref: 'Salmos 37.5 (NAA)', msg: 'Entregue o caminho a Deus! 🗺️' },
        ],
      },
    ],
  },

  // ─────────────────────────── 7 · A Montanha da Oração ───────────────────────────
  {
    n: 7,
    nome: 'A Montanha da Oração',
    sub: 'Deus ouve quem ora',
    biome: 'montanha',
    encontros: [
      {
        id: 'f7-duda',
        nome: 'Irmã Duda',
        look: { skin: '#fbd6ad', hair: '#78350f', hairStyle: hairLong, robe: '#a855f7', headwear: 'hood', headwearColor: '#7e22ce', prop: 'lantern' },
        variantes: [
          { s: 'A Irmã Duda orava todo dia na montanha.', q: 'O que devemos fazer na oração?', o: ['Orar sempre e não desanimar', 'Orar só quando é fácil', 'Parar de orar se demorar'], c: 0, ref: 'Lucas 18.1 (NAA)', msg: 'Ore sem desanimar! 🙏' },
          { s: 'Ela conversava com Deus no caminho.', q: 'Como devemos orar?', o: ['Sem cessar', 'Uma vez por semana', 'Só nos apuros'], c: 0, ref: '1 Tessalonicenses 5.17 (NAA)', msg: 'Fale com Deus sempre! 🗣️' },
          { s: 'A preocupação apertava o coração.', q: 'O que fazer com a ansiedade?', o: ['Não andar ansioso', 'Guardar a ansiedade', 'Correr mais depressa'], c: 0, ref: 'Filipenses 4.6 (NAA)', msg: 'Deus cuida de você! 🕊️' },
        ],
      },
      {
        id: 'f7-rafi',
        nome: 'Rafi',
        look: { skin: '#8d5524', hair: '#111827', hairStyle: hairBuzz, robe: '#15803d', headwear: 'hat', headwearColor: '#166534', prop: 'staff' },
        variantes: [
          { s: 'O Rafi pediu um desejo a Deus.', q: 'Quem nos ouve de verdade?', o: ['Deus ouve o nosso pedido', 'Ninguém nos ouve', 'Só os amigos ouvem'], c: 0, ref: '1 João 5.14 (NAA)', msg: 'Deus ouve a sua oração! 👂' },
          { s: 'Ele clamou bem alto no alto da montanha.', q: 'O que acontece quando clamamos?', o: ['Deus responde', 'Ninguém responde', 'O vento responde'], c: 0, ref: 'Jeremias 33.3 (NAA)', msg: 'Clame, que Deus responde! 🏔️' },
          { s: 'O Rafi lembrou de tudo o que Deus fez.', q: 'O que Deus faz com a nossa voz?', o: ['Deus ouve a nossa voz', 'Deus esquece a nossa voz', 'Deus apaga a nossa voz'], c: 0, ref: 'Salmos 116.1 (NAA)', msg: 'Deus ouve você! 💜' },
        ],
      },
      {
        id: 'f7-bea',
        nome: 'Bea',
        look: { skin: '#e0ac69', hair: '#a16207', hairStyle: hairWavy, robe: '#ec4899', headwear: 'none', headwearColor: '#fff', prop: 'balloon' },
        variantes: [
          { s: 'A Bea fechou os olhos e pediu.', q: 'O que acontece quando pedimos?', o: ['Ser-nos-á dado', 'Ser-nos-á escondido', 'Ser-nos-á tirado'], c: 0, ref: 'Mateus 7.7 (NAA)', msg: 'Pede a Deus! 🎈' },
          { s: 'Ela tinha dúvidas no coração.', q: 'Como devemos pedir?', o: ['Com fé, sem duvidar', 'Com medo, sem crer', 'Com pressa, sem pensar'], c: 0, ref: 'Tiago 1.6 (NAA)', msg: 'Peça com fé! 🌟' },
          { s: 'A Bea acreditou antes de ver.', q: 'O que recebemos na oração?', o: ['O que pedirmos crendo', 'O que pedirmos com pressa', 'O que pedirmos com medo'], c: 0, ref: 'Mateus 21.22 (NAA)', msg: 'Creia na oração! 🤍' },
        ],
      },
      {
        id: 'f7-tom',
        nome: 'Seu Tom',
        look: { skin: '#d9a066', hair: '#e5e7eb', hairStyle: hairShort, robe: '#b45309', headwear: 'none', headwearColor: '#fff', prop: 'bread' },
        variantes: [
          { s: 'O Seu Tom agradeceu antes do almoço.', q: 'Como apresentar os pedidos a Deus?', o: ['Com ações de graças', 'Com cobrança', 'Com silêncio frio'], c: 0, ref: 'Filipenses 4.6 (NAA)', msg: 'Agradeça sempre! 🍞' },
          { s: 'Ele orava sem pressa, todo dia.', q: 'O que acompanha a oração?', o: ['As ações de graças', 'A reclamação', 'A pressa'], c: 0, ref: 'Colossenses 4.2 (NAA)', msg: 'Oração com gratidão! 🙌' },
          { s: 'O Seu Tom entrou no templo sorrindo.', q: 'Como devemos entrar na presença de Deus?', o: ['Com ações de graças', 'Com medo e tremor', 'Com pressa e indiferença'], c: 0, ref: 'Salmos 100.4 (NAA)', msg: 'Entre com alegria! 🚪' },
        ],
      },
      {
        id: 'f7-guardiao',
        nome: 'Guardião da Montanha',
        guardiao: true,
        look: { skin: '#c68642', hair: '#94a3b8', hairStyle: hairLong, robe: '#6d28d9', headwear: 'hood', headwearColor: '#5b21b6', prop: 'staff' },
        vitoria: 'A Palavra certa acendeu a montanha!',
        variantes: [
          { s: 'O Guardião da Montanha vigiava em silêncio.', q: 'O que a paz de Deus faz?', o: ['Guarda os nossos corações', 'Apaga os nossos corações', 'Esquece os nossos corações'], c: 0, ref: 'Filipenses 4.7 (NAA)', msg: 'A paz de Deus te guarda! 🕊️' },
          { s: 'A brisa passava pelo alto da montanha.', q: 'Quem tem paz perfeita?', o: ['Quem confia em Deus', 'Quem confia na força', 'Quem nunca pensa'], c: 0, ref: 'Isaías 26.3 (NAA)', msg: 'Confiança traz paz! 🌬️' },
          { s: 'O sol se punha atrás das pedras.', q: 'O que Jesus nos deixou?', o: ['A sua paz', 'O seu medo', 'A sua pressa'], c: 0, ref: 'João 14.27 (NAA)', msg: 'A paz de Jesus fica! 🌄' },
        ],
      },
    ],
  },

  // ─────────────────────────── 8 · A Cidade das Luzes ───────────────────────────
  {
    n: 8,
    nome: 'A Cidade das Luzes',
    sub: 'O coração e o verdadeiro tesouro',
    biome: 'cidade',
    encontros: [
      {
        id: 'f8-nano',
        nome: 'Nano',
        look: { skin: '#fbd6ad', hair: '#2d1b0e', hairStyle: hairShort, robe: '#2563eb', headwear: 'none', headwearColor: '#fff', prop: 'none' },
        variantes: [
          { s: 'O Nano guardava figurinhas num cofre.', q: 'Onde guardar tesouro de verdade?', o: ['No céu, onde nada estraga', 'Embaixo da cama', 'No bolso do casaco'], c: 0, ref: 'Mateus 6.20 (NAA)', msg: 'Tesouro de verdade é no céu! ✨' },
          { s: 'Ele pensava muito no seu videogame.', q: 'Para onde vai o nosso coração?', o: ['Vai para o nosso tesouro', 'Vai para onde não quer', 'Não vai para lugar nenhum'], c: 0, ref: 'Mateus 6.21 (NAA)', msg: 'Cuide do seu coração! 💙' },
          { s: 'O Nano queria guardar o que não estraga.', q: 'O que fazer para o tesouro durar?', o: ['Fazer bolsas que não envelhecem', 'Comprar mais brinquedos', 'Esconder tudo no quarto'], c: 0, ref: 'Lucas 12.33 (NAA)', msg: 'O tesouro do céu dura! 👑' },
        ],
      },
      {
        id: 'f8-lu',
        nome: 'Dona Lu',
        look: { skin: '#8d5524', hair: '#d1d5db', hairStyle: hairLong, robe: '#f43f5e', headwear: 'hood', headwearColor: '#be123c', prop: 'basket' },
        variantes: [
          { s: 'A Dona Lu tinha dois agasalhos.', q: 'O que fazer com o que sobra?', o: ['Repartir com quem não tem', 'Guardar tudo', 'Jogar fora'], c: 0, ref: 'Lucas 3.11 (NAA)', msg: 'Repartir com quem precisa! 🧥' },
          { s: 'Ela ajudou a vizinha com pouco.', q: 'O que acontece ao ajudar o pobre?', o: ['Empresta ao Senhor', 'Perde o que deu', 'Não muda nada'], c: 0, ref: 'Provérbios 19.17 (NAA)', msg: 'Ajudar é emprestar a Deus! 🤲' },
          { s: 'A Dona Lu deu e ficou mais feliz.', q: 'O que acontece quando damos?', o: ['Receberemos de Deus', 'Ficaremos com menos', 'Nada acontece'], c: 0, ref: 'Lucas 6.38 (NAA)', msg: 'Deus devolve em dobro! 🎁' },
        ],
      },
      {
        id: 'f8-beto',
        nome: 'Beto',
        look: { skin: '#e0ac69', hair: '#3b2412', hairStyle: hairBuzz, robe: '#0d9488', headwear: 'none', headwearColor: '#fff', prop: 'book' },
        variantes: [
          { s: 'O Beto guardava bem o que aprendia.', q: 'O que devemos guardar?', o: ['Guardar o nosso coração', 'Guardar só as coisas', 'Guardar rancor'], c: 0, ref: 'Provérbios 4.23 (NAA)', msg: 'Guarde o seu coração! 💚' },
          { s: 'Ele queria ser sábio como o Vô Ciro.', q: 'O que é a coisa principal?', o: ['A sabedoria', 'A força', 'A pressa'], c: 0, ref: 'Provérbios 4.7 (NAA)', msg: 'A sabedoria é o maior tesouro! 📖' },
          { s: 'O Beto olhava as estrelas do terraço.', q: 'Em que devemos pensar?', o: ['Nas coisas do alto', 'Só nas coisas daqui', 'Só nos problemas'], c: 0, ref: 'Colossenses 3.2 (NAA)', msg: 'Pense nas coisas do céu! 🌌' },
        ],
      },
      {
        id: 'f8-cris',
        nome: 'Cris',
        look: { skin: '#c68642', hair: '#1f1410', hairStyle: hairWavy, robe: '#e11d48', headwear: 'headband', headwearColor: '#fb7185', prop: 'flower' },
        variantes: [
          { s: 'A Cris perguntou qual é o maior mandamento.', q: 'Como devemos amar a Deus?', o: ['De todo o coração', 'Só de vez em quando', 'Só com as palavras'], c: 0, ref: 'Mateus 22.37 (NAA)', msg: 'Ame a Deus com tudo! ❤️' },
          { s: 'Ela queria saber o essencial.', q: 'O que Deus pede primeiro?', o: ['Amar a Deus de todo o coração', 'Trabalhar sem parar', 'Falar muito na oração'], c: 0, ref: 'Deuteronômio 6.5 (NAA)', msg: 'Amar a Deus é o essencial! 💗' },
          { s: 'A Cris se perguntava por que amamos.', q: 'Por que conseguimos amar?', o: ['Porque Deus nos amou primeiro', 'Porque somos fortes', 'Porque é fácil'], c: 0, ref: '1 João 4.19 (NAA)', msg: 'Deus amou você primeiro! 🌹' },
        ],
      },
      {
        id: 'f8-guardiao',
        nome: 'Guardião da Cidade',
        guardiao: true,
        look: { skin: '#d9a066', hair: '#475569', hairStyle: hairShort, robe: '#b45309', headwear: 'crown', headwearColor: '#fbbf24', prop: 'staff' },
        vitoria: 'A Palavra certa acendeu a cidade!',
        variantes: [
          { s: 'O Guardião da Cidade ensinava os moradores.', q: 'Como amar o próximo?', o: ['Como a nós mesmos', 'Menos do que a nós', 'Só quando é pedido'], c: 0, ref: 'Mateus 22.39 (NAA)', msg: 'Ame o próximo como a você! 🫂' },
          { s: 'A cidade inteira se reuniu na praça.', q: 'Qual é o mandamento novo de Jesus?', o: ['Amar-vos uns aos outros', 'Cada um por si', 'Falar só dos outros'], c: 0, ref: 'João 13.34 (NAA)', msg: 'Ame uns aos outros! 💞' },
          { s: 'O Guardião olhou para cada família.', q: 'Quem ama a Deus deve amar quem?', o: ['Também o seu irmão', 'Só a Deus escondido', 'Só a si mesmo'], c: 0, ref: '1 João 4.21 (NAA)', msg: 'Amar a Deus é amar as pessoas! 🏙️' },
        ],
      },
    ],
  },

  // ─────────────────────────── 9 · A Ponte da Fé ───────────────────────────
  {
    n: 9,
    nome: 'A Ponte da Fé',
    sub: 'A fé que caminha e faz',
    biome: 'ponte',
    encontros: [
      {
        id: 'f9-lea',
        nome: 'Léa',
        look: { skin: '#fbd6ad', hair: '#6b4423', hairStyle: hairLong, robe: '#7c3aed', headwear: 'none', headwearColor: '#fff', prop: 'umbrella' },
        variantes: [
          { s: 'A Léa olhava a ponte suspensa.', q: 'O que Jesus diz ao coração com medo?', o: ['Não temas, crê somente', 'Não temas, corre depressa', 'Não temas, finge firmeza'], c: 0, ref: 'Marcos 5.36 (NAA)', msg: 'Crê e não temas! 🌉' },
          { s: 'O desafio parecia gigante.', q: 'O que a fé pequena faz?', o: ['Move o que parece impossível', 'Não faz absolutamente nada', 'Espera os outros fazerem'], c: 0, ref: 'Mateus 17.20 (NAA)', msg: 'A fé move montanhas! ⛰️' },
          { s: 'A Léa queria agradar a Deus.', q: 'O que é impossível sem fé?', o: ['Agradar a Deus', 'Falar com Deus', 'Ouvir a Deus'], c: 0, ref: 'Hebreus 11.6 (NAA)', msg: 'Sem fé é impossível agradar! 🙏' },
        ],
      },
      {
        id: 'f9-apollo',
        nome: 'Seu Apolo',
        look: { skin: '#8d5524', hair: '#374151', hairStyle: hairShort, robe: '#a16207', headwear: 'hat', headwearColor: '#78350f', prop: 'bread' },
        variantes: [
          { s: 'O Seu Apolo consertava a ponte de madeira.', q: 'O que não devemos fazer?', o: ['Não nos cansar de fazer o bem', 'Fazer o bem com pressa', 'Fazer o bem só aos amigos'], c: 0, ref: 'Gálatas 6.9 (NAA)', msg: 'Não se canse de fazer o bem! 🪵' },
          { s: 'Ele ajudava quem passava.', q: 'A quem devemos fazer o bem?', o: ['A todos', 'Só a quem merece', 'Só a quem retribui'], c: 0, ref: 'Gálatas 6.10 (NAA)', msg: 'Faça o bem a todos! 🤝' },
          { s: 'O Seu Apolo se sentia útil.', q: 'Para o que fomos criados?', o: ['Para as boas obras', 'Para ficar parados', 'Para viver sem propósito'], c: 0, ref: 'Efésios 2.10 (NAA)', msg: 'Criados para boas obras! 🌱' },
        ],
      },
      {
        id: 'f9-teo',
        nome: 'Téo',
        look: { skin: '#e0ac69', hair: '#92400e', hairStyle: hairShort, robe: '#0ea5e9', headwear: 'none', headwearColor: '#fff', prop: 'none' },
        variantes: [
          { s: 'O Téo estava cansado da travessia.', q: 'O que fazer quando cansamos?', o: ['Não desfalecer no bem', 'Parar de fazer o bem', 'Esperar os outros irem'], c: 0, ref: 'Gálatas 6.9 (NAA)', msg: 'Não desanime! 💪' },
          { s: 'A corrida era longa demais.', q: 'Como correr a corrida da fé?', o: ['Com perseverança', 'Com pressa e desespero', 'Parando a cada passo'], c: 0, ref: 'Hebreus 12.1 (NAA)', msg: 'Corra com perseverança! 🏃' },
          { s: 'O Téo enfrentou uma tentação difícil.', q: 'Quem é bem-aventurado?', o: ['Quem suporta a provação', 'Quem nunca tem luta', 'Quem foge de tudo'], c: 0, ref: 'Tiago 1.12 (NAA)', msg: 'A coroa é de quem persevera! 👑' },
        ],
      },
      {
        id: 'f9-ju',
        nome: 'Ju',
        look: { skin: '#c68642', hair: '#1f1410', hairStyle: hairWavy, robe: '#14b8a6', headwear: 'headband', headwearColor: '#2dd4bf', prop: 'book' },
        variantes: [
          { s: 'A Ju ouvia as histórias da Bíblia.', q: 'Complete: A fé vem pelo…', o: ['ouvir a Palavra de Deus', 'ver os grandes sinais de Deus', 'falar das coisas de Deus'], c: 0, ref: 'Romanos 10.17 (NAA)', msg: 'A fé vem da Palavra! 📖' },
          { s: 'Ela não queria só ouvir, mas fazer.', q: 'O que devemos ser com a Palavra?', o: ['Praticantes da Palavra', 'Ouvintes esquecidos', 'Falantes sem fazer'], c: 0, ref: 'Tiago 1.22 (NAA)', msg: 'Pratique a Palavra! 🛠️' },
          { s: 'A Ju escolheu fazer o que ouviu.', q: 'A quem Jesus compara?', o: ['A quem ouve e pratica', 'A quem só ouve e esquece', 'A quem fala e não faz'], c: 0, ref: 'Mateus 7.24 (NAA)', msg: 'Ouvir e praticar é firme! 🏠' },
        ],
      },
      {
        id: 'f9-guardiao',
        nome: 'Guardião da Ponte',
        guardiao: true,
        look: { skin: '#d9a066', hair: '#64748b', hairStyle: hairShort, robe: '#4c1d95', headwear: 'crown', headwearColor: '#c4b5fd', prop: 'staff' },
        vitoria: 'A Palavra certa firmou a ponte!',
        variantes: [
          { s: 'O Guardião da Ponte perguntava a cada um.', q: 'Como é a fé sem obras?', o: ['É morta', 'É viva', 'É completa'], c: 0, ref: 'Tiago 2.17 (NAA)', msg: 'A fé age! 🌉' },
          { s: 'Ele mostrava o corpo parado.', q: 'O que é o corpo sem espírito?', o: ['É morto', 'É forte', 'É novo'], c: 0, ref: 'Tiago 2.26 (NAA)', msg: 'Fé e ação andam juntas! 🤲' },
          { s: 'O Guardião viu a fé em ação.', q: 'O que completa a fé?', o: ['As obras', 'As palavras', 'Os pensamentos'], c: 0, ref: 'Tiago 2.22 (NAA)', msg: 'A fé completa é ativa! ✨' },
        ],
      },
    ],
  },

  // ─────────────────────────── 10 · O Portão da Luz ───────────────────────────
  {
    n: 10,
    nome: 'O Portão da Luz',
    sub: 'Deus fará tudo novo',
    biome: 'portao',
    encontros: [
      {
        id: 'f10-sol',
        nome: 'Sol',
        look: { skin: '#fbd6ad', hair: '#b45309', hairStyle: hairLong, robe: '#f59e0b', headwear: 'headband', headwearColor: '#fbbf24', prop: 'flower' },
        variantes: [
          { s: 'A Sol chorava de saudade.', q: 'O que Deus fará com as lágrimas?', o: ['Enxugará toda lágrima', 'Guardará as lágrimas', 'Esquecerá as lágrimas'], c: 0, ref: 'Apocalipse 21.4 (NAA)', msg: 'Deus enxugará seus olhos! 🌤️' },
          { s: 'Ela pensava nas coisas tristes.', q: 'O que não haverá com Deus?', o: ['Não haverá mais choro', 'Não haverá mais alegria', 'Não haverá mais luz'], c: 0, ref: 'Apocalipse 21.4 (NAA)', msg: 'Acabará todo choro! 🌈' },
          { s: 'A noite parecia longa demais.', q: 'O que vem depois da noite?', o: ['A alegria vem pela manhã', 'A noite não acaba', 'A tristeza fica para sempre'], c: 0, ref: 'Salmos 30.5 (NAA)', msg: 'A alegria vem pela manhã! 🌅' },
        ],
      },
      {
        id: 'f10-ben',
        nome: 'Vovô Ben',
        look: { skin: '#d9a066', hair: '#e5e7eb', hairStyle: hairWavy, robe: '#3730a3', headwear: 'none', headwearColor: '#fff', prop: 'book' },
        variantes: [
          { s: 'O Vovô Ben falava da cidade do céu.', q: 'Que cidade Deus preparou?', o: ['A cidade celestial', 'A cidade antiga', 'A cidade esquecida'], c: 0, ref: 'Hebreus 11.16 (NAA)', msg: 'Deus preparou uma cidade! 🏙️' },
          { s: 'Ele olhava o horizonte distante.', q: 'O que procuramos nesta jornada?', o: ['A cidade que há de vir', 'Uma cidade qualquer', 'Ficar onde já estamos'], c: 0, ref: 'Hebreus 13.14 (NAA)', msg: 'A cidade futura vem! 🌆' },
          { s: 'O Vovô Ben cantava um salmo.', q: 'O que é a cidade de Deus?', o: ['Coisas gloriosas são ditas dela', 'Ninguém fala dela', 'Ela é esquecida'], c: 0, ref: 'Salmos 87.3 (NAA)', msg: 'A cidade de Deus é gloriosa! ✨' },
        ],
      },
      {
        id: 'f10-kai',
        nome: 'Kai',
        look: { skin: '#8d5524', hair: '#111827', hairStyle: hairBuzz, robe: '#16a34a', headwear: 'none', headwearColor: '#fff', prop: 'balloon' },
        variantes: [
          { s: 'O Kai olhava o céu novinho.', q: 'O que Deus vai fazer?', o: ['Tornar novas todas as coisas', 'Guardar as coisas velhas', 'Esquecer todas as coisas'], c: 0, ref: 'Apocalipse 21.5 (NAA)', msg: 'Deus fará tudo novo! 🌟' },
          { s: 'Ele sonhava com um mundo novo.', q: 'O que Deus prometeu?', o: ['Um novo céu e uma nova terra', 'O mesmo céu de sempre', 'Um céu sem ninguém'], c: 0, ref: 'Apocalipse 21.1 (NAA)', msg: 'Um mundo novo vem! 🌍' },
          { s: 'O Kai se sentia uma pessoa nova.', q: 'Quem está em Cristo é o quê?', o: ['Uma nova criatura', 'A mesma pessoa antiga', 'Uma pessoa sem rumo'], c: 0, ref: '2 Coríntios 5.17 (NAA)', msg: 'Em Cristo, tudo se renova! 🦋' },
        ],
      },
      {
        id: 'f10-lumi',
        nome: 'Lumi',
        look: { skin: '#e0ac69', hair: '#78350f', hairStyle: hairWavy, robe: '#fbbf24', headwear: 'none', headwearColor: '#fff', prop: 'lantern' },
        variantes: [
          { s: 'A Lumi segurava a lanterna do portão.', q: 'O que Deus fará com os homens?', o: ['Habitará com eles', 'Ficará longe deles', 'Esquecerá deles'], c: 0, ref: 'Apocalipse 21.3 (NAA)', msg: 'Deus habitará com você! 🏮' },
          { s: 'A luz do portão era forte.', q: 'O que ilumina a cidade de Deus?', o: ['A glória de Deus', 'A lanterna dos homens', 'O sol do meio-dia'], c: 0, ref: 'Apocalipse 21.23 (NAA)', msg: 'A glória de Deus ilumina! 💡' },
          { s: 'A Lumi não precisou mais da lanterna.', q: 'Quem nos iluminará para sempre?', o: ['O Senhor Deus', 'A nossa lanterna', 'A nossa sabedoria'], c: 0, ref: 'Apocalipse 22.5 (NAA)', msg: 'Deus é a sua luz! 🌞' },
        ],
      },
      {
        id: 'f10-guardiao',
        nome: 'Guardião do Portão',
        guardiao: true,
        look: { skin: '#fbd6ad', hair: '#fbbf24', hairStyle: hairWavy, robe: '#fef3c7', headwear: 'crown', headwearColor: '#fde68a', prop: 'staff' },
        vitoria: 'A Palavra certa abriu o Portão da Luz!',
        variantes: [
          { s: 'O Guardião do Portão brilhava como o dia.', q: 'Quem é o luminar da cidade?', o: ['O Cordeiro', 'O sol', 'A torre'], c: 0, ref: 'Apocalipse 21.23 (NAA)', msg: 'O Cordeiro é a luz! 🐑' },
          { s: 'Ele coroava quem chegava.', q: 'O que acontece com quem vence?', o: ['Herda estas coisas', 'Perde estas coisas', 'Esquece estas coisas'], c: 0, ref: 'Apocalipse 21.7 (NAA)', msg: 'A vitória é de quem persevera! 👑' },
          { s: 'O portão se abriu de par em par.', q: 'O que veremos um dia?', o: ['Veremos a face de Deus', 'Veremos só uma sombra', 'Veremos um caminho escuro'], c: 0, ref: 'Apocalipse 22.4 (NAA)', msg: 'Veremos a face de Deus! 🌈' },
        ],
      },
    ],
  },
];

/* --------------------------------- helpers -------------------------------- */

export const TOTAL_ENCONTROS_POR_FASE = 5;

export interface CartaEmbaralhada {
  carta: Carta;
  opcoes: string[];
  certa: number;
}

/** Embaralha as 3 opções de uma carta (a certa muda de lugar). */
export function embaralharCarta(carta: Carta): CartaEmbaralhada {
  const ordem = shuffle([0, 1, 2]);
  const opcoes = ordem.map((i) => carta.o[i]);
  const certa = ordem.indexOf(carta.c);
  return { carta, opcoes, certa };
}

/** Escolhe uma variante ainda não usada do encontro (sorteio sem repetir). */
export function escolherVariante(encontro: Encontro, usadas: Set<string>): Carta {
  const livres = encontro.variantes.filter((_, i) => !usadas.has(`${encontro.id}#${i}`));
  const pool = livres.length > 0 ? livres : encontro.variantes;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Marca uma variante como usada na sessão. */
export function marcarUso(encontro: Encontro, carta: Carta, usadas: Set<string>): void {
  const i = encontro.variantes.indexOf(carta);
  if (i >= 0) usadas.add(`${encontro.id}#${i}`);
}
