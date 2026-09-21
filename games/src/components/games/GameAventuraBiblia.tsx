import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import Confetti from 'react-confetti';
import { Compass, Sparkles, Volume2 } from 'lucide-react';
import GameShell from '../GameShell';
import RotateHint from '../RotateHint';
import LevelMap from '../LevelMap';
import PauseOverlay from '../PauseOverlay';
import HandHint from '../HandHint';
import { Hero, Npc, StarItem } from '../art';
import {
  bestScore,
  completeLevel,
  levelBest,
  loadLevels,
  submitScore,
  type ProgressMap,
} from '../../lib/progress';
import { usePrefersReducedMotion } from '../../lib/motion';
import { useIsPortraitPhone } from '../../lib/device';
import { confettiGravity, confettiPieces } from '../../lib/confetti';
import { music, sfx, voice } from '../../lib/audio';
import { burst, flyNumber, ring, shake } from '../../lib/fx';
import { isSmallKidsMode, clearWorld, loadWorld, markPlayed, saveWorld } from '../../lib/prefs';

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
  ref: string; // referência bíblica da história (Livro cap.vers + versão)
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

/** Rosto de cada personagem (pedido do dono): chave de `LOOKS` por nome do NPC. */
const NPC_PRESET: Record<string, string> = {
  'Noé': 'noe',
  'Anjo': 'anjo',
  'Elias': 'elias',
  'Jonas': 'jonas',
  'Eliseu': 'eliseu',
  'Daniel': 'daniel',
  'Maria': 'maria',
  'Moisés': 'moises',
  'Josué': 'josue',
  'Davi': 'davi',
  'Salomão': 'salomao',
  'Paulo': 'paulo',
};

/** Espelhos d'água do mundo — usados para trocar poeira por respingo ao andar. */
const WATER: Rect[] = [
  { x: 70, y: 140, w: 340, h: 230 },
  { x: 1250, y: 120, w: 320, h: 190 },
  { x: 60, y: 1090, w: 520, h: 150 },
];

/** Manchas de bioma: dão relevo ao chão sem custo de imagem. */
const BIOMES = [
  { x: 0, y: 0, w: 1080, h: 400, color: 'rgba(252,211,77,0.34)' },
  { x: 1080, y: 0, w: 1320, h: 520, color: 'rgba(16,185,129,0.30)' },
  { x: 0, y: 640, w: 920, h: 660, color: 'rgba(251,191,36,0.20)' },
  { x: 900, y: 880, w: 1500, h: 420, color: 'rgba(34,197,94,0.22)' },
];

/** Mini-mapa (radar): o mundo inteiro cabe em poucos pixels. */
const RADAR_W = 96;
const RADAR_H = 52;

const STORIES: Story[] = [
  {
    id: 'noe',
    title: 'Noé e a arca',
    npc: 'Noé',
    emoji: '🧓',
    scene: '🚢',
    ref: 'Gênesis 6.14 (NAA)',
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
    ref: 'Gênesis 1.1 (NAA)',
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
    ref: '2 Reis 2.11 (NAA)',
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
    ref: 'Jonas 1.17 (NAA)',
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
    ref: '2 Reis 2.24 (NAA)',
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
    ref: 'Daniel 6.22 (NAA)',
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
    ref: 'Lucas 2.7 (NAA)',
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
    ref: 'Êxodo 14.21 (NAA)',
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
    ref: 'Josué 6.20 (NAA)',
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
    ref: '1 Samuel 17.49 (NAA)',
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
    ref: '1 Reis 3.9-12 (NAA)',
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
    ref: 'Atos 9.3-6 (NAA)',
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
  const [paused, setPaused] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [levels, setLevels] = useState<ProgressMap>(loadLevels);
  const [smallKids] = useState(isSmallKidsMode);
  // Estado do herói: muda só nas transições (parado/andando, lado), não a cada quadro.
  const [moving, setMoving] = useState(false);
  const [facing, setFacing] = useState(1);
  /** Mundo salvo para "continuar de onde parei" (null = começo limpo). */
  const [saved, setSaved] = useState(() => loadWorld());
  /** Opções erradas já descartadas na pergunta atual (dica do "quase"). */
  const [removed, setRemoved] = useState<string[]>([]);
  const reducedMotion = usePrefersReducedMotion();
  const portraitPhone = useIsPortraitPhone();
  const [rotateOk, setRotateOk] = useState(false);
  const rotateBlocking = portraitPhone && !rotateOk;

  const areaRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const arrowRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<HTMLDivElement | null>(null);
  const radarDotRef = useRef<HTMLDivElement | null>(null);
  const movingRef = useRef(false);
  const facingRef = useRef(1);
  const dustRef = useRef(0);
  const viewRef = useRef(view);
  const posRef = useRef(START);
  const keys = useRef<Dir>({ up: false, down: false, left: false, right: false });
  // Destino do toque/clique (dedo): o jogador caminha até lá sozinho.
  const targetRef = useRef<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);
  const stuck = useRef(0);
  const [showMoveHint, setShowMoveHint] = useState(true);
  const hintGone = useRef(false);
  const nearRef = useRef<string | null>(null);
  const doneRef = useRef<Set<string>>(new Set());
  const picksRef = useRef<Set<number>>(new Set());
  const scoreRef = useRef(0);
  const lock = useRef({ talk: false, quiz: false, finished: false, rotate: false, pause: false });
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
    lock.current.rotate = rotateBlocking;
  }, [rotateBlocking]);
  useEffect(() => {
    lock.current.pause = paused;
    if (paused) {
      voice.stopSpeaking();
      music.pause();
    } else {
      music.play('game');
    }
  }, [paused]);

  // A câmera usa o tamanho REAL da área de jogo (não da janela): no iOS a barra
  // do Safari muda de altura sem disparar `resize`, e as safe areas encolhem a
  // área visível. ResizeObserver + visualViewport cobrem os dois casos.
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const measure = () => {
      const next = { w: el.clientWidth, h: el.clientHeight };
      viewRef.current = next;
      setView(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('orientationchange', measure);
    window.visualViewport?.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('orientationchange', measure);
      window.visualViewport?.removeEventListener('resize', measure);
    };
  }, []);

  /** Câmera centrada no jogador, presa dentro do mundo. */
  function camera(p: { x: number; y: number }, v: { w: number; h: number }) {
    const camX = v.w >= WORLD_W ? (WORLD_W - v.w) / 2 : clamp(p.x + PLAYER / 2 - v.w / 2, 0, WORLD_W - v.w);
    const camY = v.h >= WORLD_H ? (WORLD_H - v.h) / 2 : clamp(p.y + PLAYER / 2 - v.h / 2, 0, WORLD_H - v.h);
    return { camX, camY };
  }

  /**
   * Escreve a câmera/jogador/seta direto no DOM via `transform`, em vez de
   * passar pelo estado do React. Andar deixa de re-renderizar a árvore do
   * mundo (cenário, NPCs, coletáveis) a cada quadro.
   */
  function applyFrame() {
    const p = posRef.current;
    const { camX, camY } = camera(p, viewRef.current);
    if (worldRef.current) {
      worldRef.current.style.transform = `translate3d(${-camX}px, ${-camY}px, 0)`;
    }
    if (playerRef.current) {
      playerRef.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
    }
    if (radarDotRef.current) {
      radarDotRef.current.style.transform = `translate3d(${(p.x / WORLD_W) * RADAR_W}px, ${
        (p.y / WORLD_H) * RADAR_H
      }px, 0) translate(-50%, -50%)`;
    }
    const arrow = arrowRef.current;
    if (arrow) {
      const target = STORIES.find((s) => !doneRef.current.has(s.id));
      if (target) {
        const cx = p.x + PLAYER / 2;
        const cy = p.y + PLAYER / 2;
        const ang = Math.atan2(target.pos.y - cy, target.pos.x - cx);
        arrow.style.transform = `translate3d(${cx}px, ${cy - 34}px, 0) translate(-50%, -100%) rotate(${ang}rad)`;
      }
    }
    const marker = markerRef.current;
    if (marker) {
      const dest = targetRef.current;
      if (dest) marker.style.transform = `translate3d(${dest.x + PLAYER / 2}px, ${dest.y + PLAYER / 2}px, 0)`;
      marker.style.opacity = dest ? '1' : '0';
    }
  }

  // Garante o primeiro quadro (e a posição certa depois de um resize) antes da pintura.
  useLayoutEffect(() => {
    applyFrame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  function addPoints(points: number) {
    scoreRef.current += points;
    setScore(scoreRef.current);
    setRecord(submitScore(GAME_ID, scoreRef.current));
  }

  /** Retrato do mundo no instante da chamada — base do "continuar de onde parei". */
  function snapshot() {
    return {
      x: posRef.current.x,
      y: posRef.current.y,
      picks: [...picksRef.current],
      done: [...doneRef.current],
      score: scoreRef.current,
    };
  }

  /* ------------------- andar com o dedo/mouse ------------------- */
  // Dica de boas-vindas: some no primeiro movimento ou depois de alguns segundos.
  function dismissHint() {
    if (hintGone.current) return;
    hintGone.current = true;
    setShowMoveHint(false);
  }

  useEffect(() => {
    const id = window.setTimeout(dismissHint, 8000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Converte o ponto tocado na tela para coordenadas do mundo e guarda o
  // destino. O laço de física cuida de caminhar até lá, respeitando paredes.
  function moveTo(clientX: number, clientY: number) {
    const area = areaRef.current;
    if (!area) return;
    dismissHint();
    const rect = area.getBoundingClientRect();
    const p = posRef.current;
    const { camX, camY } = camera(p, viewRef.current);
    const wx = clientX - rect.left + camX;
    const wy = clientY - rect.top + camY;
    targetRef.current = {
      x: clamp(wx - PLAYER / 2, 0, WORLD_W - PLAYER),
      y: clamp(wy - PLAYER / 2, 0, WORLD_H - PLAYER),
    };
  }

  function onStagePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (lock.current.talk || lock.current.quiz || lock.current.finished || lock.current.rotate) return;
    const el = e.target as HTMLElement | null;
    if (el?.closest('button, [data-ui]')) return;
    e.preventDefault();
    // Calcula o destino ANTES de capturar o ponteiro: no iOS o
    // setPointerCapture pode lançar e, se estivesse antes, derrubava o resto
    // do handler (era o motivo de o toque não mover o personagem).
    moveTo(e.clientX, e.clientY);
    dragging.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // sem captura o arraste segue funcionando enquanto o dedo não sair da área
    }
  }

  function onStagePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    moveTo(e.clientX, e.clientY);
  }

  function onStagePointerEnd() {
    dragging.current = false;
  }

  // Rede de segurança: se o pointerdown não chegar (toque em alguns
  // navegadores), o clique resolve — sempre ignorando botões/UI.
  function onStageClick(e: ReactMouseEvent<HTMLDivElement>) {
    if (dragging.current) return;
    if (lock.current.talk || lock.current.quiz || lock.current.finished || lock.current.rotate) return;
    const el = e.target as HTMLElement | null;
    if (el?.closest('button, [data-ui]')) return;
    moveTo(e.clientX, e.clientY);
  }

  function openTalk(s: Story) {
    targetRef.current = null;
    markPlayed();
    setTalk({ s, step: 0 });
  }

  function nextStep() {
    if (!talk) return;
    if (talk.step + 1 < talk.s.speak.length) {
      sfx.pop();
      setTalk({ ...talk, step: talk.step + 1 });
    } else {
      sfx.open();
      // Modo pequeninos usa 3 opções (a certa + 2); o padrão usa as 5.
      const others = shuffle(talk.s.wrongs);
      setRemoved([]);
      setQuiz({
        s: talk.s,
        options: shuffle([talk.s.right, ...others.slice(0, smallKids ? 2 : 4)]),
      });
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

  /* ------------------------------ narração ------------------------------ */
  // Fala do herói: cada toque em "Continuar" narra a próxima frase.
  useEffect(() => {
    if (!talk) return;
    voice.speak(talk.s.speak[talk.step]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [talk?.s.id, talk?.step]);

  // Pergunta do quiz: narra a pergunta e, no modo pequeninos, depois as opções
  // em sequência (quem ainda não lê precisa ouvir as escolhas).
  useEffect(() => {
    if (!quiz) return;
    voice.speak(quiz.s.q);
    const t = window.setTimeout(() => {
      if (smallKids) voice.speakQueue(quiz.options.map((o) => o.t));
    }, Math.min(4500, Math.max(2400, quiz.s.q.length * 30)));
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?.s.id, quiz?.options]);

  // Música adaptativa: as camadas sobem conforme os selos conquistados.
  useEffect(() => {
    music.setIntensity(done.size >= 8 ? 3 : done.size >= 4 ? 2 : 1);
  }, [done.size]);

  useEffect(() => () => voice.stopSpeaking(), []);

  // Continuar de onde parei: grava o mundo pouco depois de cada mudança e também
  // quando a página é escondida (no iOS o evento confiável é `pagehide`).
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (lock.current.finished) return;
      saveWorld(snapshot());
    }, 800);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picks, done, score]);

  useEffect(() => {
    const onHide = () => {
      if (lock.current.finished) return;
      saveWorld(snapshot());
    };
    window.addEventListener('pagehide', onHide);
    return () => window.removeEventListener('pagehide', onHide);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          dismissHint();
          break;
        case 's':
        case 'S':
        case 'ArrowDown':
          k.down = true;
          dismissHint();
          break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
          k.left = true;
          dismissHint();
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
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      const p = posRef.current;
      const locked =
        lock.current.talk ||
        lock.current.quiz ||
        lock.current.finished ||
        lock.current.rotate ||
        lock.current.pause;

      if (!locked) {
        const k = keys.current;
        let dx = (k.left ? -1 : 0) + (k.right ? 1 : 0);
        let dy = (k.up ? -1 : 0) + (k.down ? 1 : 0);
        if (dx !== 0 || dy !== 0) {
          // teclado/D-pad têm prioridade e cancelam o destino do toque
          targetRef.current = null;
          if (dx !== 0 && dy !== 0) {
            dx *= 0.7071;
            dy *= 0.7071;
          }
        } else {
          const dest = targetRef.current;
          if (dest) {
            const ax = dest.x - p.x;
            const ay = dest.y - p.y;
            const d = Math.hypot(ax, ay);
            if (d < 4) {
              targetRef.current = null;
            } else {
              dx = ax / d;
              dy = ay / d;
            }
          }
        }
        const nx = clamp(p.x + dx * SPEED * dt, 0, WORLD_W - PLAYER);
        const ny = clamp(p.y + dy * SPEED * dt, 0, WORLD_H - PLAYER);

        const px = p.x;
        const py = p.y;
        if (!overlaps({ x: nx, y: p.y, w: PLAYER, h: PLAYER }, WALLS)) p.x = nx;
        if (!overlaps({ x: p.x, y: ny, w: PLAYER, h: PLAYER }, WALLS)) p.y = ny;

        // destino inalcançável (parede no caminho): desiste em vez de empurrar
        if (targetRef.current && p.x === px && p.y === py) {
          stuck.current += dt;
          if (stuck.current > 0.4) {
            targetRef.current = null;
            stuck.current = 0;
          }
        } else {
          stuck.current = 0;
        }

        // Lado do herói + estado de caminhada: só muda quando muda de verdade,
        // então o React não re-renderiza o mundo a cada quadro.
        if (dx !== 0 || dy !== 0) {
          const f = dx < 0 ? -1 : dx > 0 ? 1 : facingRef.current;
          if (facingRef.current !== f) {
            facingRef.current = f;
            setFacing(f);
          }
        }
        const moved = p.x !== px || p.y !== py;
        if (movingRef.current !== moved) {
          movingRef.current = moved;
          setMoving(moved);
        }

        // Pegadas: poeira no chão seco, respingo dentro da água.
        dustRef.current -= dt;
        if (moved && dustRef.current <= 0) {
          dustRef.current = 0.24;
          const fx0 = p.x + PLAYER / 2;
          const fy0 = p.y + PLAYER - 6;
          const inWater = WATER.some(
            (w) => fx0 >= w.x && fx0 <= w.x + w.w && fy0 >= w.y && fy0 <= w.y + w.h,
          );
          burst(worldRef.current, fx0, fy0, {
            kind: inWater ? 'splash' : 'dust',
            count: inWater ? 5 : 3,
            spread: inWater ? 22 : 14,
          });
        }

        for (let i = 0; i < PICKUPS.length; i++) {
          const pk = PICKUPS[i];
          if (!picksRef.current.has(i) && dist(p.x, p.y, pk.x, pk.y) < 48) {
            picksRef.current.add(i);
            setPicks(new Set(picksRef.current));
            addPoints(PICKUP_PTS);
            sfx.collect();
            burst(worldRef.current, pk.x, pk.y, { kind: 'spark', count: 16 });
            ring(worldRef.current, pk.x, pk.y, '#fde047', 30);
            flyNumber(worldRef.current, pk.x, pk.y, `+${PICKUP_PTS}`);
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
      } else if (movingRef.current) {
        // pausado/dialogando: o herói para de andar (e a poeira para junto).
        movingRef.current = false;
        setMoving(false);
      }

      applyFrame();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --------------------------- ações do jogo --------------------------- */
  function completeStory(s: Story, wrongs: number) {
    const stars = wrongs === 0 ? 3 : wrongs === 1 ? 2 : 1;
    setLevels(completeLevel(GAME_ID, STORIES.indexOf(s) + 1, stars));
    const earned = STORY_PTS + (wrongs === 0 ? BONUS_FIRST : 0);
    addPoints(earned);
    sfx.withDuck(sfx.badge, 1.2);
    sfx.star(stars);
    targetRef.current = null;
    burst(worldRef.current, s.pos.x, s.pos.y, { kind: 'spark', count: 22, spread: 70 });
    ring(worldRef.current, s.pos.x, s.pos.y, '#fde047', 40);
    flyNumber(worldRef.current, s.pos.x, s.pos.y - 24, `+${earned}`);
    doneRef.current.add(s.id);
    setDone(new Set(doneRef.current));
    setQuiz(null);
    setTalk(null);
    setFails(0);
    setRemoved([]);
    setToast({ text: `📖 ${s.title} concluído! +${earned} pts`, good: true });
    const allDone = doneRef.current.size === STORIES.length;
    if (allDone) {
      lock.current.finished = true;
      setFinished(true);
      sfx.withDuck(sfx.chapter, 1.9);
      music.playVictory('game', 8);
    }
    voice.speak(
      allDone
        ? 'Parabéns! Você conheceu todas as histórias e ganhou todos os selos!'
        : `${s.title}! Leia em ${s.ref}. Você ganhou ${stars} ${stars === 1 ? 'estrela' : 'estrelas'}.`,
    );
  }

  function answerQuiz(opt: Choice, ev: { currentTarget: HTMLElement }) {
    if (!quiz) return;

    const stage = areaRef.current;
    const box = stage?.getBoundingClientRect();
    const rect = ev.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2 - (box?.left ?? 0);
    const y = rect.top + rect.height / 2 - (box?.top ?? 0);

    if (opt === quiz.s.right) {
      sfx.correct(fails === 0 ? 2 : 0);
      burst(stage, x, y, { kind: 'spark', count: 16 });
      flyNumber(stage, x, y, '✓');
      completeStory(quiz.s, fails);
      return;
    }

    sfx.wrong();
    burst(stage, x, y, { kind: 'puff', count: 8, spread: 24 });
    shake(stage);
    setFails((f) => f + 1);
    // Dica do "quase" (G4): em vez de repetir a pergunta em loop, uma opção
    // errada sai do caminho — o erro vira progresso visível.
    setRemoved((list) => (list.includes(opt.t) ? list : [...list, opt.t]));
    setToast({ text: 'Boa tentativa! Uma opção errada saiu do caminho. 💡', good: false });
    voice.speak('Boa tentativa! Uma opção errada saiu do caminho.');
  }

  function restart() {
    doneRef.current.clear();
    picksRef.current.clear();
    posRef.current = { ...START };
    scoreRef.current = 0;
    targetRef.current = null;
    movingRef.current = false;
    facingRef.current = 1;
    setMoving(false);
    setFacing(1);
    setRemoved([]);
    clearWorld();
    setDone(new Set());
    setPicks(new Set());
    setScore(0);
    setRecord(bestScore(GAME_ID));
    setFinished(false);
    setTalk(null);
    setQuiz(null);
    setToast(null);
    setFails(0);
    nearRef.current = null;
    setNear(null);
    music.play('game');
    music.setIntensity(1);
    applyFrame();
  }

  /** Leva o herói para perto de uma estação escolhida no mapa (teleporte). */
  function goToStory(s: Story) {
    targetRef.current = null;
    posRef.current = {
      x: clamp(s.pos.x - 60, 0, WORLD_W - PLAYER),
      y: clamp(s.pos.y + 96, 0, WORLD_H - PLAYER),
    };
    setMapOpen(false);
    sfx.swoosh();
    applyFrame();
  }

  /** Retoma o mundo salvo — "continuar de onde parei". */
  function resumeWorld() {
    if (!saved) return;
    posRef.current = { x: clamp(saved.x, 0, WORLD_W - PLAYER), y: clamp(saved.y, 0, WORLD_H - PLAYER) };
    picksRef.current = new Set(saved.picks);
    doneRef.current = new Set(saved.done);
    scoreRef.current = saved.score;
    setPicks(new Set(saved.picks));
    setDone(new Set(saved.done));
    setScore(saved.score);
    setSaved(null);
    markPlayed();
    sfx.pop();
    applyFrame();
  }

  function startFresh() {
    clearWorld();
    setSaved(null);
    sfx.pop();
  }

  function setDir(k: keyof Dir, on: boolean) {
    keys.current[k] = on;
    if (on) dismissHint();
  }

  /* ------------------------------- render ------------------------------- */
  const canInteract = !talk && !quiz && !finished && !paused;
  const target = STORIES.find((s) => !done.has(s.id));
  const allDone = done.size === STORIES.length;
  const heroState = finished ? 'happy' : moving ? 'walk' : 'idle';
  // Só oferece "continuar" quando há algo de fato para continuar.
  const hasSave =
    !!saved && (saved.done.length > 0 || saved.picks.length > 0 || saved.score > 0);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  return (
    <GameShell
      title="Aventura na Bíblia"
      subtitle="Ande pelo mundo, converse com os heróis e colete os selos das 12 histórias!"
      onExit={onExit}
      onPause={() => setPaused(true)}
      bg="bg-gradient-to-b from-sky-950 via-sky-800 to-emerald-300"
      titleClass="text-amber-300"
    >
      {finished && !reducedMotion ? (
        <Confetti recycle={false} numberOfPieces={confettiPieces()} gravity={confettiGravity()} />
      ) : null}

      <div
        ref={areaRef}
        onPointerDown={onStagePointerDown}
        onPointerMove={onStagePointerMove}
        onPointerUp={onStagePointerEnd}
        onPointerCancel={onStagePointerEnd}
        onClick={onStageClick}
        onContextMenu={(e) => e.preventDefault()}
        className="game-surface relative flex-1 cursor-pointer overflow-hidden"
      >
        {/* ------- placar (dentro da área de jogo, abaixo do título) ------- */}
        <div data-ui className="absolute top-2 right-2 z-40 flex flex-col items-end gap-1.5">
          <span className="rounded-full bg-black/60 px-4 py-1.5 text-base font-black text-yellow-200 shadow">
            ⭐ {score} pts
          </span>
          <span className="rounded-full bg-black/60 px-4 py-1.5 text-sm font-black text-white shadow">
            📚 {done.size}/{STORIES.length} selos
            {record > 0 ? <span className="ml-1.5">· 🏆 {record}</span> : null}
          </span>
        </div>

        <span
          data-ui
          className="absolute top-2 left-2 z-40 flex items-center gap-1 rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-white/90"
        >
          <Sparkles className="h-4 w-4 text-amber-300" /> toque no chão para andar
        </span>

        {/* ------- radar: o mundo inteiro em miniatura, com o herói dentro ------- */}
        <div data-ui className="absolute top-10 left-2 z-40 rounded-xl bg-black/45 p-1.5 shadow">
          <div
            className="relative overflow-hidden rounded-lg bg-emerald-900/70"
            style={{ width: RADAR_W, height: RADAR_H }}
            aria-hidden
          >
            {STORIES.map((s) => (
              <span
                key={s.id}
                className={`absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                  done.has(s.id) ? 'bg-emerald-400' : 'bg-amber-300'
                }`}
                style={{ left: (s.pos.x / WORLD_W) * RADAR_W, top: (s.pos.y / WORLD_H) * RADAR_H }}
              />
            ))}
            {PICKUPS.map((pk, i) =>
              picks.has(i) ? null : (
                <span
                  key={`pk${i}`}
                  className="absolute h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-200/70"
                  style={{ left: (pk.x / WORLD_W) * RADAR_W, top: (pk.y / WORLD_H) * RADAR_H }}
                />
              ),
            )}
            <span
              ref={radarDotRef}
              className="absolute top-0 left-0 h-2.5 w-2.5 rounded-full border border-white bg-sky-400 shadow"
            />
          </div>
          <p className="mt-1 text-center text-[10px] font-black text-white/80">
            {done.size}/{STORIES.length} selos
          </p>
        </div>

        <button
          type="button"
          data-ui
          onClick={() => {
            setLevels(loadLevels());
            setMapOpen(true);
          }}
          className="ui-press absolute top-[104px] left-2 z-40 rounded-full bg-black/55 px-3 py-1 text-xs font-black text-white shadow"
        >
          🗺️ Mapa
        </button>

        {/* mundo */}
        <div
          ref={worldRef}
          className="absolute top-0 left-0"
          style={{ width: WORLD_W, height: WORLD_H }}
        >
          {/* chão */}
          <div className="absolute inset-0 bg-gradient-to-b from-lime-300 via-emerald-300 to-green-400" />
          <div className="absolute inset-0 opacity-25 [background-image:repeating-linear-gradient(0deg,transparent,transparent_44px,#166534_44px,#166534_46px),repeating-linear-gradient(90deg,transparent,transparent_44px,#166534_44px,#166534_46px)]" />

          {/* biomas: manchas de deserto, mata e campos dão relevo ao chão */}
          {BIOMES.map((b, i) => (
            <div
              key={i}
              className="absolute rounded-[45%]"
              style={{ left: b.x, top: b.y, width: b.w, height: b.h, background: b.color }}
            />
          ))}

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
                className="animate-hero-bob absolute drop-shadow-[0_0_10px_rgba(253,224,71,0.95)]"
                style={{ left: pk.x - 15, top: pk.y - 15 }}
              >
                <StarItem size={30} />
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
                  className={`contact-shadow flex h-16 w-16 items-center justify-center rounded-full border-4 shadow-lg transition-transform ${
                    near?.id === s.id && canInteract
                      ? 'scale-110 border-amber-300 bg-amber-100'
                      : 'border-white/70 bg-white/80'
                  }`}
                >
                  <Npc motif={s.id} preset={NPC_PRESET[s.npc] ?? s.id} size={52} state={collected ? 'happy' : 'idle'} />
                </span>
                <span className="rounded-full bg-amber-200/95 px-2 py-0.5 text-[10px] font-black text-amber-900 shadow-lg ring-1 ring-amber-400/60">
                  📖 {s.ref}
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
            <div ref={arrowRef} className="absolute top-0 left-0 z-20">
              <Compass className="h-8 w-8 animate-pulse text-amber-500 drop-shadow-[0_0_8px_rgba(253,224,71,0.9)]" />
            </div>
          ) : null}

          {/* destino do toque/clique: marca onde o herói vai parar */}
          <div
            ref={markerRef}
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 z-20 opacity-0 transition-opacity duration-150"
          >
            <span className="absolute -top-6 -left-6 h-12 w-12 animate-ping rounded-full bg-amber-300/60" />
            <span className="absolute -top-1.5 -left-1.5 h-3 w-3 rounded-full border-2 border-white bg-amber-400 shadow" />
          </div>

          {/* jogador */}
          <div
            ref={playerRef}
            className="contact-shadow absolute top-0 left-0 z-30 flex items-center justify-center rounded-full border-4 border-sky-200 bg-gradient-to-b from-sky-400 to-indigo-500 shadow-xl"
            style={{ width: PLAYER, height: PLAYER }}
          >
            <Hero state={heroState} facing={facing < 0 ? 'left' : 'right'} size={PLAYER - 8} />
          </div>
        </div>

        {/* ------- botão falar (canto oposto ao D-pad, sem sobreposição) ------- */}
        {near && canInteract ? (
          <div data-ui className="absolute bottom-3 left-3 z-40 animate-pop">
            <button
              type="button"
              onClick={() => openTalk(near)}
              className="ui-press flex items-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-lg font-black text-amber-950 shadow-[0_6px_0_rgba(202,138,4,0.9)] hover:scale-105 sm:gap-3 sm:px-8 sm:py-4 sm:text-2xl"
            >
              💬 Falar com {near.npc}
            </button>
          </div>
        ) : null}

        {/* ------- dica de boas-vindas do movimento ------- */}
        {showMoveHint && canInteract ? (
          <div
            data-ui
            className="animate-pop pointer-events-none absolute top-1/2 left-1/2 z-40 max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-black/70 px-6 py-4 text-center shadow-2xl"
          >
            <HandHint className="mx-auto mb-1" size={44} />
            <p className="text-lg font-black text-white">👆 Toque no chão para o herói andar!</p>
            <p className="mt-1 text-sm font-bold text-white/80">
              ou arraste o dedo — as setas também valem
            </p>
          </div>
        ) : null}

        {/* ------- toast (acima do botão falar e do D-pad) ------- */}
        {toast ? (
          <p
            className={`animate-pop absolute bottom-28 left-1/2 z-40 max-w-md -translate-x-1/2 rounded-3xl px-6 py-3 text-center text-lg font-black shadow-xl ${
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
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 shadow-inner">
                <Npc motif={talk.s.id} preset={NPC_PRESET[talk.s.npc] ?? talk.s.id} size={66} state="happy" />
              </span>
              <p className="text-sm font-black text-emerald-700 uppercase">
                {talk.s.npc} conta · 📖 {talk.s.ref}
              </p>
              <p className="min-h-16 text-xl font-extrabold text-slate-800">{talk.s.speak[talk.step]}</p>
              <button
                type="button"
                onClick={() => voice.speak(talk.s.speak[talk.step])}
                aria-label="Ouvir de novo"
                className="ui-press flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-black text-sky-800 shadow"
              >
                <Volume2 className="h-4 w-4" /> Ouvir de novo
              </button>
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
                className="ui-press w-full rounded-full bg-emerald-500 px-8 py-4 text-2xl font-black text-white shadow-[0_8px_0_rgba(5,150,105,0.9)] hover:scale-105"
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
                {quiz.s.title} · 📖 {quiz.s.ref}
              </p>
              <p className="text-center text-xl font-black text-indigo-900">{quiz.s.q}</p>
              <button
                type="button"
                onClick={() => voice.speak(quiz.s.q)}
                aria-label="Ouvir a pergunta de novo"
                className="ui-press flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-black text-sky-800 shadow"
              >
                <Volume2 className="h-4 w-4" /> Ouvir a pergunta
              </button>
              <div className="grid w-full grid-cols-2 gap-3">
                {quiz.options.map((opt, i) => {
                  const gone = removed.includes(opt.t);
                  return (
                    <div
                      key={opt.t}
                      className={`relative ${!gone && i === quiz.options.length - 1 ? 'col-span-2' : ''}`}
                    >
                      <button
                        type="button"
                        disabled={gone}
                        onClick={(ev) => answerQuiz(opt, ev)}
                        aria-label={`Responder: ${opt.t}`}
                        className={`ui-press flex min-h-20 w-full flex-col items-center justify-center gap-1 rounded-3xl border-2 px-4 py-3 pr-14 font-bold shadow-md ${
                          gone
                            ? 'border-slate-200 bg-slate-100 text-slate-400 line-through opacity-60'
                            : 'border-slate-200 bg-white text-slate-600 hover:scale-105'
                        } ${smallKids ? 'text-xl' : 'text-lg'}`}
                      >
                        <span className={smallKids ? 'text-4xl' : 'text-3xl'}>{opt.e}</span> {opt.t}
                      </button>
                      {!gone ? (
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            sfx.pop();
                            voice.speak(opt.t);
                          }}
                          aria-label={`Ouvir: ${opt.t}`}
                          className="ui-press absolute top-1/2 right-2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-amber-300 text-amber-950 shadow-md"
                        >
                          <Volume2 className="h-5 w-5" />
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              {removed.length > 0 ? (
                <p className="rounded-full bg-amber-100 px-4 py-1 text-sm font-black text-amber-800">
                  💡 {removed.length} {removed.length === 1 ? 'opção errada saiu' : 'opções erradas saíram'} do
                  caminho
                </p>
              ) : null}
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
                Você conheceu as 12 histórias e colecionou todos os selos!
              </p>
              <p className="text-2xl font-black text-indigo-900">
                ⭐ {score} pts
                <span className="ml-2 text-sm font-bold text-slate-500">Recorde: {record} pts</span>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={restart}
                  className="ui-press rounded-full bg-yellow-400 px-8 py-4 text-xl font-black text-amber-950 shadow-[0_8px_0_rgba(202,138,4,0.9)] hover:scale-105"
                >
                  🔄 Jogar de novo
                </button>
                <button
                  type="button"
                  onClick={onExit}
                  className="ui-press rounded-full bg-white px-6 py-3 text-base font-bold text-slate-700 shadow"
                >
                  Outros jogos
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* ------- continuar de onde parei ------- */}
        {hasSave && !paused ? (
          <div className="absolute inset-0 z-[65] flex items-center justify-center bg-black/60 p-4">
            <div className="animate-pop flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl bg-slate-900/95 p-6 text-center shadow-2xl ring-2 ring-white/15">
              <span className="text-5xl">💾</span>
              <p className="text-xl font-black text-yellow-300">Você já começou esta aventura!</p>
              <p className="text-sm font-bold text-white/80">
                {saved?.done.length ?? 0} selos · {saved?.score ?? 0} pts
              </p>
              <button
                type="button"
                onClick={resumeWorld}
                className="ui-press w-full rounded-full bg-emerald-500 px-6 py-4 text-xl font-black text-white shadow-[0_6px_0_rgba(5,150,105,0.9)]"
              >
                ▶️ Continuar de onde parei
              </button>
              <button
                type="button"
                onClick={startFresh}
                className="ui-press w-full rounded-full bg-white/15 px-6 py-3 text-base font-black text-white"
              >
                🔄 Começar do zero
              </button>
            </div>
          </div>
        ) : null}

        {/* ------- mapa das 12 histórias ------- */}
        {mapOpen ? (
          <LevelMap
            title="Mapa das 12 histórias"
            subtitle="Toque para ir até o herói e conquistar o selo respondendo!"
            actionLabel="Ir até"
            items={STORIES.map((s, i) => {
              const stars = levelBest(levels, GAME_ID, i + 1);
              return {
                id: s.id,
                label: s.npc,
                sublabel: `📖 ${s.ref}`,
                motif: s.id,
                stars,
                maxStars: 3,
                done: done.has(s.id),
              };
            })}
            onPick={(id) => {
              const s = STORIES.find((st) => st.id === id);
              if (s) goToStory(s);
            }}
            onClose={() => setMapOpen(false)}
          />
        ) : null}

        {/* ------- pausa ------- */}
        {paused ? (
          <PauseOverlay onResume={() => setPaused(false)} onRestart={restart} onExit={onExit} />
        ) : null}

        {/* ------- aviso para virar o celular ------- */}
        <RotateHint show={rotateBlocking} onContinue={() => setRotateOk(true)} />

        {/* ------- d-pad (touch): botões de 64px, multi-toque = diagonal ------- */}
        <div data-ui className="absolute right-3 bottom-3 z-40 grid grid-cols-3 gap-1 opacity-90 select-none">
          <span />
          <DpadBtn dir="up" label="▲" onPress={() => setDir('up', true)} onRelease={() => setDir('up', false)} />
          <span />
          <DpadBtn dir="left" label="◀" onPress={() => setDir('left', true)} onRelease={() => setDir('left', false)} />
          <span />
          <DpadBtn dir="right" label="▶" onPress={() => setDir('right', true)} onRelease={() => setDir('right', false)} />
          <span />
          <DpadBtn dir="down" label="▼" onPress={() => setDir('down', true)} onRelease={() => setDir('down', false)} />
          <span />
        </div>

      </div>
    </GameShell>
  );
}

const DPAD_LABEL: Record<keyof Dir, string> = {
  up: 'Cima',
  down: 'Baixo',
  left: 'Esquerda',
  right: 'Direita',
};

function DpadBtn({
  dir,
  label,
  onPress,
  onRelease,
}: {
  dir: keyof Dir;
  label: string;
  onPress: () => void;
  onRelease: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Mover para ${DPAD_LABEL[dir]}`}
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      onPointerUp={onRelease}
      onPointerCancel={onRelease}
      onPointerLeave={onRelease}
      onContextMenu={(e) => e.preventDefault()}
      style={{ touchAction: 'none' }}
      className="ui-press flex h-16 w-16 items-center justify-center rounded-2xl bg-white/35 text-2xl font-black text-white shadow-lg select-none"
    >
      {label}
    </button>
  );
}