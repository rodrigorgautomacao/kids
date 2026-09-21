import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { Compass, Sparkles } from 'lucide-react';
import GameShell from '../GameShell';
import { bestScore, completeLevel, submitScore } from '../../lib/progress';
import { playCorrect, playPop, playWin, playWrong } from '../../lib/sound';

interface GameProps {
  onExit: () => void;
}

interface Choice {
  t: string;
  e: string; // emoji
}

interface Story {
  id: string;
  title: string;
  npc: string;
  emoji: string;
  scene: string; // emoji decorativo do cenário
  book: string; // livro da Bíblia onde a história acontece
  pos: { x: number; y: number };
  speak: string[];
  q: string;
  right: Choice;
  wrongs: Choice[];
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const GAME_ID = 'aventura-biblia';
const WORLD_W = 2400;
const WORLD_H = 1300;
const PLAYER = 44;
const SPEED = 190;
const PROX = 95;
const STORY_PTS = 150;
const BONUS_FIRST = 50;
const PICKUP_PTS = 25;

const START = { x: 150, y: 700 };

const STORIES: Story[] = [
  {
    id: 'noe',
    title: 'Noé e a arca',
    npc: 'Noé',
    emoji: '🧓',
    scene: '🚢',
    book: 'Gênesis',
    pos: { x: 300, y: 430 },
    speak: [
      'Deus viu que o mundo estava cheio de maldade…',
      'E me pediu para construir uma arca enorme.',
      'Entraram os animais, dois de cada, e veio a chuva!',
    ],
    q: 'O que Noé construiu para salvar os animais?',
    right: { t: 'Uma arca', e: '🚢' },
    wrongs: [
      { t: 'Uma barraca', e: '⛺' },
      { t: 'Um castelo', e: '🏰' },
      { t: 'Uma piscina', e: '🏊' },
      { t: 'Uma casa na árvore', e: '🌳' },
    ],
  },
  {
    id: 'criacao',
    title: 'A criação do mundo',
    npc: 'Anjo',
    emoji: '👼',
    scene: '🌍',
    book: 'Gênesis',
    pos: { x: 2160, y: 240 },
    speak: [
      'No princípio, a terra era vazia e escura…',
      'Deus disse: "Haja luz!", e fez o céu, o mar e os animais.',
      'No fim, Deus criou o ser humano à sua imagem, e viu que tudo era bom!',
    ],
    q: 'Quem criou o céu e a terra no princípio?',
    right: { t: 'Deus', e: '🌍' },
    wrongs: [
      { t: 'Os anjos', e: '😇' },
      { t: 'O rei Salomão', e: '🦉' },
      { t: 'O profeta Elias', e: '⚡' },
      { t: 'Um gigante', e: '🧌' },
    ],
  },
  {
    id: 'elias',
    title: 'Elias e o carro de fogo',
    npc: 'Elias',
    emoji: '🧔',
    scene: '🔥',
    book: '2 Reis',
    pos: { x: 700, y: 520 },
    speak: [
      'Eu orava ao Deus verdadeiro com fé.',
      'Do céu desceu fogo para responder a minha oração!',
      'E no fim, um carro de fogo me levou para o céu!',
    ],
    q: 'O que levou Elias para o céu?',
    right: { t: 'Um carro de fogo', e: '🔥' },
    wrongs: [
      { t: 'Uma nuvem', e: '☁️' },
      { t: 'Um barco', e: '🚢' },
      { t: 'Uma escada', e: '🪜' },
      { t: 'Uma pipa', e: '🪁' },
    ],
  },
  {
    id: 'jonas',
    title: 'Jonas e o grande peixe',
    npc: 'Jonas',
    emoji: '🙋',
    scene: '🌊',
    book: 'Jonas',
    pos: { x: 1180, y: 380 },
    speak: [
      'Deus me chamou para ir a Nínive, mas eu fugi.',
      'No mar, um grande peixe me engoliu!',
      'Dentro dele eu orei, e Deus salvou a minha vida.',
    ],
    q: 'O que engoliu Jonas quando ele fugiu de Deus?',
    right: { t: 'Um grande peixe', e: '🐳' },
    wrongs: [
      { t: 'Um crocodilo', e: '🐊' },
      { t: 'Um tubarão', e: '🦈' },
      { t: 'Uma serpente', e: '🐍' },
      { t: 'Um hipopótamo', e: '🦛' },
    ],
  },
  {
    id: 'eliseu',
    title: 'Eliseu e a ursa',
    npc: 'Eliseu',
    emoji: '🧥',
    scene: '🐻',
    book: '2 Reis',
    pos: { x: 1600, y: 660 },
    speak: [
      'Eu sou o profeta que recebeu o manto de Elias.',
      'Um dia, uns garotos zombavam de mim no caminho.',
      'Então uma ursa apareceu e os fez correr!',
    ],
    q: 'Quem mandou a ursa afastar os garotos zombadores?',
    right: { t: 'Eliseu', e: '🐻' },
    wrongs: [
      { t: 'Elias', e: '⚡' },
      { t: 'Moisés', e: '🗿' },
      { t: 'Samuel', e: '📜' },
      { t: 'Daniel', e: '🦁' },
    ],
  },
  {
    id: 'daniel',
    title: 'Daniel e a cova dos leões',
    npc: 'Daniel',
    emoji: '🧑',
    scene: '🦁',
    book: 'Daniel',
    pos: { x: 250, y: 830 },
    speak: [
      'Os inimigos me jogaram na cova dos leões.',
      'Mas Deus fechou a boca dos leões.',
      'Eu saí de lá sem nenhum arranhão!',
    ],
    q: 'O que aconteceu com Daniel na cova dos leões?',
    right: { t: 'Deus o protegeu', e: '🦁' },
    wrongs: [
      { t: 'Foi devorado', e: '😱' },
      { t: 'Ficou preso lá', e: '🪤' },
      { t: 'Saiu fugindo', e: '🏃' },
      { t: 'Virou o rei', e: '👑' },
    ],
  },
  {
    id: 'natal',
    title: 'O nascimento de Jesus',
    npc: 'Maria',
    emoji: '👩',
    scene: '⭐',
    book: 'Lucas',
    pos: { x: 1095, y: 460 },
    speak: [
      'Na cidade de Belém, numa estrebaria…',
      'Nasceu o Salvador do mundo, o menino Jesus!',
      'Os pastores e os sábios vieram adorá-lo.',
    ],
    q: 'Onde nasceu o menino Jesus?',
    right: { t: 'Numa manjedoura', e: '👶' },
    wrongs: [
      { t: 'Num castelo', e: '🏰' },
      { t: 'Num navio', e: '🚢' },
      { t: 'Numa tenda', e: '⛺' },
      { t: 'Numa escola', e: '🏫' },
    ],
  },
  {
    id: 'moises',
    title: 'Moisés e o Mar Vermelho',
    npc: 'Moisés',
    emoji: '🗿',
    scene: '🌊',
    book: 'Êxodo',
    pos: { x: 700, y: 1180 },
    speak: [
      'O povo de Israel estava preso como escravo no Egito…',
      'Deus me mandou estender meu cajado sobre o mar.',
      'O Mar Vermelho abriu no meio, e o povo passou andando no seco!',
    ],
    q: 'O que Moisés abriu para o povo de Israel atravessar?',
    right: { t: 'O Mar Vermelho', e: '🌊' },
    wrongs: [
      { t: 'O rio Jordão', e: '🏞️' },
      { t: 'O mar Morto', e: '🧂' },
      { t: 'O deserto', e: '🏜️' },
      { t: 'Uma montanha', e: '⛰️' },
    ],
  },
  {
    id: 'josue',
    title: 'Josué e as muralhas de Jericó',
    npc: 'Josué',
    emoji: '📯',
    scene: '🏰',
    book: 'Josué',
    pos: { x: 2120, y: 1150 },
    speak: [
      'Eu cercava a cidade de Jericó com o povo de Israel.',
      'No sétimo dia, tocamos as trombetas e gritamos bem alto!',
      'E as muralhas de Jericó caíram por terra!',
    ],
    q: 'O que caiu quando Josué tocou as trombetas?',
    right: { t: 'As muralhas de Jericó', e: '🏰' },
    wrongs: [
      { t: 'As torres da cidade', e: '🗼' },
      { t: 'O muro do templo', e: '🛕' },
      { t: 'A ponte do rio', e: '🌉' },
      { t: 'A porta do castelo', e: '🚪' },
    ],
  },
  {
    id: 'davi',
    title: 'Davi e o gigante Golias',
    npc: 'Davi',
    emoji: '🎯',
    scene: '🪨',
    book: '1 Samuel',
    pos: { x: 1360, y: 1195 },
    speak: [
      'Eu era só um pastorzinho com uma funda e cinco pedras…',
      'O gigante Golias desafiava todo o exército de Israel.',
      'Com uma pedra e a ajuda de Deus, venci o gigante!',
    ],
    q: 'Qual gigante Davi venceu com uma pedra?',
    right: { t: 'Golias', e: '🎯' },
    wrongs: [
      { t: 'O forte Sansão', e: '💪' },
      { t: 'O rei Saul', e: '👑' },
      { t: 'O profeta Samuel', e: '📜' },
      { t: 'O juiz Gideão', e: '🌿' },
    ],
  },
  {
    id: 'salomao',
    title: 'Salomão pede sabedoria',
    npc: 'Salomão',
    emoji: '🦉',
    scene: '🏛️',
    book: '1 Reis',
    pos: { x: 1960, y: 700 },
    speak: [
      'Eu era só um rapaz quando virei rei de Israel…',
      'Então pedi a Deus: "Dá-me sabedoria para governar!"',
      'Deus ficou tão feliz que me deu sabedoria e também riquezas!',
    ],
    q: 'O que o rei Salomão pediu a Deus?',
    right: { t: 'Sabedoria', e: '🦉' },
    wrongs: [
      { t: 'Riquezas', e: '💰' },
      { t: 'Guerra', e: '⚔️' },
      { t: 'Fama', e: '📸' },
      { t: 'Vida longa', e: '⏳' },
    ],
  },
  {
    id: 'paulo',
    title: 'Paulo no caminho de Damasco',
    npc: 'Paulo',
    emoji: '📜',
    scene: '🛤️',
    book: 'Atos',
    pos: { x: 2250, y: 450 },
    speak: [
      'Eu me chamava Saulo e perseguia os cristãos…',
      'No caminho de Damasco, uma luz do céu me derrubou.',
      'Jesus falou comigo, me converti e virei o apóstolo Paulo!',
    ],
    q: 'O que aconteceu com Paulo no caminho de Damasco?',
    right: { t: 'Ele viu Jesus', e: '✨' },
    wrongs: [
      { t: 'Ele dormiu', e: '😴' },
      { t: 'Ele se perdeu', e: '🧭' },
      { t: 'Ele ficou doente', e: '🤒' },
      { t: 'Ele voltou para casa', e: '🏠' },
    ],
  },
];

const WALLS: Rect[] = [
  { x: 70, y: 140, w: 340, h: 230 }, // mar da arca
  { x: 560, y: 90, w: 90, h: 90 }, // rochedo ao norte
  { x: 900, y: 60, w: 180, h: 70 }, // árvores do norte
  { x: 1250, y: 120, w: 320, h: 190 }, // lago de Jonas
  { x: 1560, y: 60, w: 120, h: 200 }, // penhasco leste
  { x: 1780, y: 60, w: 240, h: 90 }, // árvores do nordeste
  { x: 520, y: 640, w: 80, h: 80 }, // rocha de Elias
  { x: 1010, y: 520, w: 170, h: 90 }, // estábulo
  { x: 1250, y: 640, w: 120, h: 90 }, // bosque central
  { x: 1450, y: 720, w: 260, h: 100 }, // toca dos ursos
  { x: 90, y: 900, w: 220, h: 130 }, // cova dos leões
  { x: 2000, y: 150, w: 110, h: 80 }, // monte da criação
  { x: 1980, y: 540, w: 260, h: 100 }, // palácio de Salomão
  { x: 60, y: 1090, w: 520, h: 150 }, // mar vermelho
  { x: 2060, y: 960, w: 260, h: 130 }, // muralha de Jericó
  { x: 1180, y: 1130, w: 150, h: 100 }, // campo de Davi
  { x: 1720, y: 1000, w: 200, h: 100 }, // colinas do sul
];

const PICKUPS: { x: number; y: number }[] = [
  { x: 300, y: 600 },
  { x: 500, y: 300 },
  { x: 700, y: 180 },
  { x: 620, y: 420 },
  { x: 900, y: 760 },
  { x: 1100, y: 900 },
  { x: 1300, y: 500 },
  { x: 1560, y: 400 },
  { x: 1680, y: 900 },
  { x: 460, y: 960 },
  { x: 900, y: 1120 },
  { x: 1750, y: 300 },
  { x: 1900, y: 220 },
  { x: 2250, y: 450 },
  { x: 1800, y: 1160 },
  { x: 1000, y: 1210 },
];

const DECOR = [
  { e: '🌷', x: 460, y: 220 },
  { e: '🌿', x: 760, y: 300 },
  { e: '🪴', x: 980, y: 820 },
  { e: '🌷', x: 1200, y: 900 },
  { e: '🌿', x: 1450, y: 430 },
  { e: '🪴', x: 1680, y: 560 },
  { e: '🌷', x: 320, y: 760 },
  { e: '🌿', x: 880, y: 240 },
  { e: '🌷', x: 850, y: 1160 },
  { e: '🌿', x: 1250, y: 350 },
  { e: '🪴', x: 2050, y: 330 },
  { e: '🌷', x: 1650, y: 980 },
  { e: '🌿', x: 1960, y: 130 },
  { e: '🪴', x: 2300, y: 800 },
  { e: '🌷', x: 640, y: 1080 },
  { e: '🌿', x: 1600, y: 300 },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

function overlaps(rect: Rect, walls: Rect[]): boolean {
  return walls.some(
    (w) =>
      rect.x < w.x + w.w && rect.x + rect.w > w.x && rect.y < w.y + w.h && rect.y + rect.h > w.y,
  );
}

type Dir = { up: boolean; down: boolean; left: boolean; right: boolean };

export default function GameAventuraBiblia({ onExit }: GameProps) {
  const [pos, setPos] = useState(START);
  const [view, setView] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const [score, setScore] = useState(0);
  const [record, setRecord] = useState(() => bestScore(GAME_ID));
  const [done, setDone] = useState<Set<string>>(new Set());
  const [picks, setPicks] = useState<Set<number>>(new Set());
  const [near, setNear] = useState<Story | null>(null);
  const [talk, setTalk] = useState<{ s: Story; step: number } | null>(null);
  const [quiz, setQuiz] = useState<{ s: Story; options: Choice[] } | null>(null);
  const [fails, setFails] = useState(0);
  const [toast, setToast] = useState<{ text: string; good: boolean } | null>(null);
  const [finished, setFinished] = useState(false);

  const posRef = useRef(START);
  const keys = useRef<Dir>({ up: false, down: false, left: false, right: false });
  const nearRef = useRef<string | null>(null);
  const doneRef = useRef<Set<string>>(new Set());
  const picksRef = useRef<Set<number>>(new Set());
  const scoreRef = useRef(0);
  const lock = useRef({ talk: false, quiz: false, finished: false });
  const ePress = useRef<() => void>(() => {});

  useEffect(() => {
    lock.current.talk = !!talk;
  }, [talk]);
  useEffect(() => {
    lock.current.quiz = !!quiz;
  }, [quiz]);
  useEffect(() => {
    lock.current.finished = finished;
  }, [finished]);

  useEffect(() => {
    const onResize = () => setView({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  function addPoints(points: number) {
    scoreRef.current += points;
    setScore(scoreRef.current);
    setRecord(submitScore(GAME_ID, scoreRef.current));
  }

  function openTalk(s: Story) {
    setTalk({ s, step: 0 });
  }

  function nextStep() {
    if (!talk) return;
    if (talk.step + 1 < talk.s.speak.length) {
      playPop();
      setTalk({ ...talk, step: talk.step + 1 });
    } else {
      setQuiz({ s: talk.s, options: shuffle([talk.s.right, ...talk.s.wrongs]) });
      setTalk(null);
    }
  }

  function toggleEpress() {
    const st = STORIES.find((s) => s.id === nearRef.current);
    if (st && !lock.current.talk && !lock.current.quiz && !lock.current.finished) openTalk(st);
  }
  useEffect(() => {
    ePress.current = toggleEpress;
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      const k = keys.current;
      switch (e.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
          k.up = true;
          break;
        case 's':
        case 'S':
        case 'ArrowDown':
          k.down = true;
          break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
          k.left = true;
          break;
        case 'd':
        case 'D':
        case 'ArrowRight':
          k.right = true;
          break;
        case 'e':
        case 'E':
          ePress.current();
          break;
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = keys.current;
      switch (e.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
          k.up = false;
          break;
        case 's':
        case 'S':
        case 'ArrowDown':
          k.down = false;
          break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
          k.left = false;
          break;
        case 'd':
        case 'D':
        case 'ArrowRight':
          k.right = false;
          break;
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  /* ----------------------------- física ----------------------------- */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let lastPaint = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      const p = posRef.current;
      const locked = lock.current.talk || lock.current.quiz || lock.current.finished;

      if (!locked) {
        const k = keys.current;
        let dx = (k.left ? -1 : 0) + (k.right ? 1 : 0);
        let dy = (k.up ? -1 : 0) + (k.down ? 1 : 0);
        if (dx !== 0 && dy !== 0) {
          dx *= 0.7071;
          dy *= 0.7071;
        }
        const nx = clamp(p.x + dx * SPEED * dt, 0, WORLD_W - PLAYER);
        const ny = clamp(p.y + dy * SPEED * dt, 0, WORLD_H - PLAYER);

        if (!overlaps({ x: nx, y: p.y, w: PLAYER, h: PLAYER }, WALLS)) p.x = nx;
        if (!overlaps({ x: p.x, y: ny, w: PLAYER, h: PLAYER }, WALLS)) p.y = ny;

        for (let i = 0; i < PICKUPS.length; i++) {
          const pk = PICKUPS[i];
          if (!picksRef.current.has(i) && dist(p.x, p.y, pk.x, pk.y) < 48) {
            picksRef.current.add(i);
            setPicks(new Set(picksRef.current));
            addPoints(PICKUP_PTS);
            playCorrect();
            setToast({ text: `⭐ +${PICKUP_PTS} pts!`, good: true });
          }
        }

        let nearStory: Story | null = null;
        let best = PROX;
        for (const s of STORIES) {
          if (doneRef.current.has(s.id)) continue;
          const d = dist(p.x, p.y, s.pos.x, s.pos.y);
          if (d < best) {
            best = d;
            nearStory = s;
          }
        }
        const nextId = nearStory ? nearStory.id : null;
        if (nearRef.current !== nextId) {
          nearRef.current = nextId;
          setNear(nearStory);
        }
      }

      if (t - lastPaint >= 33) {
        lastPaint = t;
        setPos({ x: p.x, y: p.y });
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --------------------------- ações do jogo --------------------------- */
  function completeStory(s: Story, wrongs: number) {
    const stars = wrongs === 0 ? 3 : wrongs === 1 ? 2 : 1;
    completeLevel(GAME_ID, STORIES.indexOf(s) + 1, stars);
    const earned = STORY_PTS + (wrongs === 0 ? BONUS_FIRST : 0);
    addPoints(earned);
    playWin();
    doneRef.current.add(s.id);
    setDone(new Set(doneRef.current));
    setQuiz(null);
    setTalk(null);
    setFails(0);
    setToast({ text: `📖 ${s.title} concluído! +${earned} pts`, good: true });
    if (doneRef.current.size === STORIES.length) {
      lock.current.finished = true;
      setFinished(true);
    }
  }

  function answerQuiz(opt: Choice) {
    if (!quiz) return;
    if (opt === quiz.s.right) {
      completeStory(quiz.s, fails);
    } else {
      playWrong();
      setFails((f) => f + 1);
      setToast({ text: 'Ops! Quase… tente de novo! 💪', good: false });
    }
  }

  function restart() {
    doneRef.current.clear();
    picksRef.current.clear();
    posRef.current = { ...START };
    scoreRef.current = 0;
    setPos({ ...START });
    setDone(new Set());
    setPicks(new Set());
    setScore(0);
    setRecord(bestScore(GAME_ID));
    setFinished(false);
    setTalk(null);
    setQuiz(null);
    setToast(null);
    setFails(0);
  }

  function setDir(k: keyof Dir, on: boolean) {
    keys.current[k] = on;
  }

  /* ------------------------------- render ------------------------------- */
  const camX = view.w >= WORLD_W ? (WORLD_W - view.w) / 2 : clamp(pos.x + PLAYER / 2 - view.w / 2, 0, WORLD_W - view.w);
  const camY = view.h >= WORLD_H ? (WORLD_H - view.h) / 2 : clamp(pos.y + PLAYER / 2 - view.h / 2, 0, WORLD_H - view.h);

  const canInteract = !talk && !quiz && !finished;
  const dot = { x: pos.x + PLAYER / 2, y: pos.y + PLAYER / 2 };
  const target = STORIES.find((s) => !done.has(s.id));
  const ang = target ? Math.atan2(target.pos.y - dot.y, target.pos.x - dot.x) : 0;
  const allDone = done.size === STORIES.length;

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  return (
    <GameShell
      title="Aventura na Bíblia"
      subtitle="Ande pelo mundo, converse com os heróis e colete os selos das 6 histórias!"
      onExit={onExit}
      bg="bg-gradient-to-b from-sky-950 via-sky-800 to-emerald-300"
      titleClass="text-amber-300"
    >
      {finished ? (
        <Confetti recycle={false} numberOfPieces={500} gravity={0.14} />
      ) : null}

      {/* ------- câmera / HUD ------- */}
      <div className="absolute top-16 right-2 z-30 flex flex-col items-end gap-1.5">
        <span className="rounded-full bg-black/50 px-4 py-1.5 text-base font-black text-yellow-200 shadow backdrop-blur-sm">
          ⭐ {score} pts
        </span>
        <span className="rounded-full bg-black/50 px-4 py-1.5 text-sm font-black text-white shadow backdrop-blur-sm">
          📚 {done.size}/{STORIES.length} selos
          {record > 0 ? <span className="ml-1.5">· 🏆 {record}</span> : null}
        </span>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {/* mundo */}
        <div
          className="absolute top-0 left-0"
          style={{ width: WORLD_W, height: WORLD_H, transform: `translate(${-camX}px, ${-camY}px)` }}
        >
          {/* chão */}
          <div className="absolute inset-0 bg-gradient-to-b from-lime-300 via-emerald-300 to-green-400" />
          <div className="absolute inset-0 opacity-25 [background-image:repeating-linear-gradient(0deg,transparent,transparent_44px,#166534_44px,#166534_46px),repeating-linear-gradient(90deg,transparent,transparent_44px,#166534_44px,#166534_46px)]" />

          {/* mar da arca */}
          <div className="absolute rounded-b-3xl bg-gradient-to-b from-sky-400 to-blue-500" style={{ left: 70, top: 140, width: 340, height: 230 }}>
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl drop-shadow-lg">🚢</span>
          </div>

          {/* lago de Jonas */}
          <div className="absolute rounded-3xl bg-gradient-to-b from-sky-300 to-blue-400" style={{ left: 1250, top: 120, width: 320, height: 190 }}>
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl drop-shadow-lg">🐳</span>
            <span className="absolute top-2 left-6 animate-pulse text-2xl">💦</span>
            <span className="absolute right-4 bottom-3 animate-pulse text-2xl">💦</span>
          </div>

          {/* parede (visível) */}
          <span className="absolute text-6xl drop-shadow" style={{ left: 560, top: 80 }}>🪨</span>

          {/* estábulo */}
          <div className="absolute flex items-center justify-center rounded-2xl bg-gradient-to-b from-amber-200 to-amber-400 shadow-inner" style={{ left: 1010, top: 520, width: 170, height: 90 }}>
            <span className="text-5xl">🏠</span>
          </div>

          {/* toca dos ursos */}
          <div className="absolute flex items-center justify-center rounded-full bg-gradient-to-b from-lime-700 to-green-800" style={{ left: 1450, top: 720, width: 260, height: 100 }}>
            <span className="text-5xl">🐻</span>
          </div>

          {/* cova dos leões */}
          <div className="absolute rounded-t-full rounded-b-3xl bg-gradient-to-b from-stone-600 to-stone-800" style={{ left: 90, top: 900, width: 220, height: 130 }}>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-5xl">🦁</span>
          </div>

          {/* mar vermelho */}
          <div className="absolute rounded-3xl bg-gradient-to-b from-sky-400 to-blue-600" style={{ left: 60, top: 1090, width: 520, height: 150 }}>
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl drop-shadow-lg">🌊</span>
            <span className="absolute top-3 left-8 animate-pulse text-2xl">💦</span>
            <span className="absolute bottom-3 right-8 animate-pulse text-2xl">💦</span>
          </div>

          {/* muralha de Jericó */}
          <div className="absolute flex items-center justify-center rounded-2xl bg-gradient-to-b from-amber-600 to-amber-800 shadow-inner" style={{ left: 2060, top: 960, width: 260, height: 130 }}>
            <span className="text-6xl drop-shadow-lg">🏰</span>
          </div>

          {/* palácio de Salomão */}
          <div className="absolute flex items-center justify-center rounded-2xl bg-gradient-to-b from-violet-300 to-violet-500 shadow-inner" style={{ left: 1980, top: 540, width: 260, height: 100 }}>
            <span className="text-5xl drop-shadow">🏛️</span>
          </div>

          {/* monte da criação */}
          <div className="absolute flex items-end justify-center rounded-t-full bg-gradient-to-b from-emerald-600 to-green-800 shadow-inner" style={{ left: 2000, top: 150, width: 110, height: 80 }}>
            <span className="text-3xl">🌍</span>
          </div>

          {/* campo de Davi */}
          <div className="absolute flex items-center justify-center rounded-3xl bg-gradient-to-b from-stone-400 to-stone-600" style={{ left: 1180, top: 1130, width: 150, height: 100 }}>
            <span className="text-4xl">🪨</span>
          </div>

          {/* colinas do sul */}
          <div className="absolute rounded-t-full bg-gradient-to-b from-lime-500 to-green-700" style={{ left: 1720, top: 1000, width: 200, height: 100 }}>
            <span className="absolute top-4 left-1/2 -translate-x-1/2 text-3xl">🌄</span>
          </div>

          {/* penhasco */}
          <span className="absolute text-6xl" style={{ left: 1550, top: 40 }}>⛰️</span>
          <span className="absolute text-5xl" style={{ left: 1620, top: 80 }}>🌲</span>

          {/* decoração não sólida */}
          {DECOR.map((d, i) => (
            <span key={i} className="absolute text-4xl" style={{ left: d.x, top: d.y }}>
              {d.e}
            </span>
          ))}

          {/* estrelas coletáveis */}
          {PICKUPS.map((pk, i) =>
            picks.has(i) ? null : (
              <span
                key={i}
                className="absolute animate-bounce text-3xl drop-shadow-[0_0_8px_rgba(253,224,71,0.9)]"
                style={{ left: pk.x - 16, top: pk.y - 16 }}
              >
                ⭐
              </span>
            ),
          )}

          {/* NPCs */}
          {STORIES.map((s) => {
            const collected = done.has(s.id);
            return (
              <div
                key={s.id}
                className="absolute flex flex-col items-center"
                style={{ left: s.pos.x - 34, top: s.pos.y - 34 }}
              >
                <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-black text-emerald-900 shadow-lg">
                  {s.npc}
                </span>
                <span
                  className={`flex h-16 w-16 items-center justify-center rounded-full border-4 text-3xl shadow-lg transition-transform ${
                    near?.id === s.id && canInteract
                      ? 'scale-110 border-amber-300 bg-amber-100'
                      : 'border-white/70 bg-white/80'
                  }`}
                >
                  {s.emoji}
                </span>
                <span className="rounded-full bg-amber-200/95 px-2 py-0.5 text-[10px] font-black text-amber-900 shadow-lg ring-1 ring-amber-400/60">
                  📖 {s.book}
                </span>
                {collected ? (
                  <span className="absolute -top-2 -right-4 animate-pop text-3xl">🎉</span>
                ) : null}
                {collected ? (
                  <span className="mt-0.5 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white shadow">
                    ✅ selo
                  </span>
                ) : null}
              </div>
            );
          })}

          {/* seta da missão */}
          {canInteract && !allDone && target ? (
            <div
              className="absolute z-20"
              style={{
                left: dot.x,
                top: dot.y - 34,
                transform: `translate(-50%, -100%) rotate(${ang}rad)`,
              }}
            >
              <Compass className="h-8 w-8 animate-pulse text-amber-500 drop-shadow-[0_0_8px_rgba(253,224,71,0.9)]" />
            </div>
          ) : null}

          {/* jogador */}
          <div
            className="absolute z-30 flex items-center justify-center rounded-full border-4 border-sky-200 bg-gradient-to-b from-sky-400 to-indigo-500 text-2xl shadow-xl"
            style={{ left: pos.x, top: pos.y, width: PLAYER, height: PLAYER }}
          >
            🧒
          </div>
        </div>

        {/* ------- botão falar ------- */}
        {near && canInteract ? (
          <div className="absolute bottom-24 left-1/2 z-40 -translate-x-1/2 animate-pop">
            <button
              type="button"
              onClick={() => openTalk(near)}
              className="flex items-center gap-3 rounded-full bg-amber-400 px-8 py-4 text-2xl font-black text-amber-950 shadow-[0_8px_0_rgba(202,138,4,0.9)] transition-transform hover:scale-105 active:translate-y-1 active:shadow-none"
            >
              💬 Falar com {near.npc}
            </button>
          </div>
        ) : null}

        {/* ------- toast ------- */}
        {toast ? (
          <p
            className={`animate-pop absolute bottom-6 left-1/2 z-40 max-w-md -translate-x-1/2 rounded-3xl px-6 py-3 text-center text-lg font-black shadow-xl ${
              toast.good ? 'bg-amber-300/95 text-amber-900' : 'bg-red-600/95 text-white'
            }`}
          >
            {toast.text}
          </p>
        ) : null}

        {/* ------- diálogo ------- */}
        {talk ? (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex w-full max-w-lg flex-col items-center gap-4 rounded-3xl bg-white/95 p-6 text-center shadow-2xl">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-5xl shadow-inner">
                {talk.s.emoji}
              </span>
              <p className="text-sm font-black text-emerald-700 uppercase">
                {talk.s.npc} conta · 📖 livro de {talk.s.book}
              </p>
              <p className="min-h-16 text-xl font-extrabold text-slate-800">{talk.s.speak[talk.step]}</p>
              <div className="flex gap-2">
                {talk.s.speak.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2.5 w-2.5 rounded-full ${i === talk.step ? 'bg-amber-400' : 'bg-slate-200'}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={nextStep}
                className="w-full rounded-full bg-emerald-500 px-8 py-4 text-2xl font-black text-white shadow-[0_8px_0_rgba(5,150,105,0.9)] transition-transform hover:scale-105 active:translate-y-1 active:shadow-none"
              >
                {talk.step + 1 < talk.s.speak.length ? 'Continuar ▶' : 'Pergunta! 🤔'}
              </button>
            </div>
          </div>
        ) : null}

        {/* ------- quiz ------- */}
        {quiz ? (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex w-full max-w-2xl flex-col items-center gap-4 rounded-3xl bg-white/95 p-6 shadow-2xl">
              <p className="text-sm font-black text-emerald-700 uppercase">
                {quiz.s.title} · 📖 livro de {quiz.s.book}
              </p>
              <p className="text-center text-xl font-black text-indigo-900">{quiz.s.q}</p>
              <div className="grid w-full grid-cols-2 gap-3">
                {quiz.options.map((opt) => (
                  <button
                    key={opt.t}
                    type="button"
                    onClick={() => answerQuiz(opt)}
                    className="flex min-h-20 flex-col items-center justify-center gap-1 rounded-3xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-bold text-slate-600 shadow-md transition-transform hover:scale-105 active:scale-95"
                  >
                    <span className="text-3xl">{opt.e}</span> {opt.t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* ------- vitória ------- */}
        {finished ? (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="animate-pop flex w-full max-w-lg flex-col items-center gap-5 rounded-3xl bg-white/95 p-8 text-center shadow-2xl">
              <p className="text-6xl">👑</p>
              <p className="text-3xl font-black text-amber-500">Jornada completa!</p>
              <p className="text-lg font-extrabold text-emerald-700">
                Você conheceu as 6 histórias e colecionou todos os selos!
              </p>
              <p className="text-2xl font-black text-indigo-900">
                ⭐ {score} pts
                <span className="ml-2 text-sm font-bold text-slate-500">Recorde: {record} pts</span>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={restart}
                  className="rounded-full bg-yellow-400 px-8 py-4 text-xl font-black text-amber-950 shadow-[0_8px_0_rgba(202,138,4,0.9)] transition-transform hover:scale-105 active:translate-y-1 active:shadow-none"
                >
                  🔄 Jogar de novo
                </button>
                <button
                  type="button"
                  onClick={onExit}
                  className="rounded-full bg-white px-6 py-3 text-base font-bold text-slate-700 shadow"
                >
                  Outros jogos
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* ------- d-pad (touch) ------- */}
        <div className="absolute right-3 bottom-3 z-40 grid grid-cols-3 gap-1 opacity-80 select-none">
          <span />
          <DpadBtn label="▲" onPress={() => setDir('up', true)} onRelease={() => setDir('up', false)} />
          <span />
          <DpadBtn label="◀" onPress={() => setDir('left', true)} onRelease={() => setDir('left', false)} />
          <span />
          <DpadBtn label="▶" onPress={() => setDir('right', true)} onRelease={() => setDir('right', false)} />
          <span />
          <DpadBtn label="▼" onPress={() => setDir('down', true)} onRelease={() => setDir('down', false)} />
          <span />
        </div>

        <span className="absolute bottom-3 left-3 z-30 flex items-center gap-1 text-xs font-bold text-white/80">
          <Sparkles className="h-4 w-4 text-amber-300" /> ande pelo mundo e fale com os heróis!
        </span>
      </div>
    </GameShell>
  );
}

function DpadBtn({
  label,
  onPress,
  onRelease,
}: {
  label: string;
  onPress: () => void;
  onRelease: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      onPointerUp={onRelease}
      onPointerLeave={onRelease}
      onPointerCancel={onRelease}
      className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/25 text-2xl font-black text-white shadow backdrop-blur-sm active:bg-amber-300 active:text-amber-950"
    >
      {label}
    </button>
  );
}