import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { BookHeart, BookOpen, Sparkles, Star, Volume2 } from 'lucide-react';
import GameShell from '../GameShell';
import LevelHUD from '../LevelHUD';
import LevelDone from '../LevelDone';
import LevelMap from '../LevelMap';
import PauseOverlay from '../PauseOverlay';
import HandHint from '../HandHint';
import { Hero } from '../art';
import {
  completeLevel,
  isLevelUnlocked,
  levelBest,
  loadLevels,
  nextUnfinishedLevel,
  bestScore,
  submitScore,
  type ProgressMap,
} from '../../lib/progress';
import { usePrefersReducedMotion } from '../../lib/motion';
import { confettiGravity, confettiPieces } from '../../lib/confetti';
import { music, sfx, voice } from '../../lib/audio';
import { burst, flyNumber, shake } from '../../lib/fx';
import { isFirstTime, isSmallKidsMode, markPlayed } from '../../lib/prefs';

interface GameProps {
  onExit: () => void;
}

interface Choice {
  t: string;
  e: string; // emoji
}

interface Question {
  q: string;
  right: Choice; // resposta certa
  wrongs: Choice[]; // distratores (4)
  /** Referência bíblica que fundamenta a lição (Livro cap.vers + versão) */
  ref: string;
}

interface PreparedQuestion extends Question {
  options: Choice[]; // as 5 opções embaralhadas
}

const STEPS = 5;
const TOTAL_TRECHOS = 3;
const QUESTIONS_PER_TRECHO = 10;
const MAX_VIDAS = 3;
const PTS_CORRETO = 100;
const PTS_BONUS_SEQUENCIA = 25;

/** Nome curto de cada trecho — usado no mapa de escolha. */
const TRECHOS = [
  { label: 'Trecho 1', sublabel: 'Heróis da fé', emoji: '🦁' },
  { label: 'Trecho 2', sublabel: 'Grandes missões', emoji: '🚢' },
  { label: 'Trecho 3', sublabel: 'Reis e profetas', emoji: '👑' },
];

// 30 perguntas da lição: 3 trechos × 10 (cada uma com 5 opções parecidas)
const QUESTIONS: Question[] = [
  // ------- Trecho 1: grandes histórias do Antigo Testamento -------
  { q: 'Quem construiu a arca para salvar os animais do dilúvio?', right: { t: 'Noé', e: '🕊️' }, wrongs: [{ t: 'Moisés', e: '🗿' }, { t: 'Abraão', e: '🏕️' }, { t: 'Davi', e: '🎯' }, { t: 'Elias', e: '⚡' }], ref: 'Gênesis 6.14 (NAA)' },
  { q: 'Depois do dilúvio, Deus mostrou um arco-íris. Em qual livro está essa história?', right: { t: 'Gênesis', e: '🌈' }, wrongs: [{ t: 'Êxodo', e: '🏜️' }, { t: 'Levítico', e: '📜' }, { t: 'Números', e: '🔢' }, { t: 'Deuteronômio', e: '📖' }], ref: 'Gênesis 9.13 (NAA)' },
  { q: 'Quem foi chamado por Deus para sair da sua terra e virar pai de uma grande nação?', right: { t: 'Abraão', e: '🌟' }, wrongs: [{ t: 'Isaque', e: '🐑' }, { t: 'Jacó', e: '🪜' }, { t: 'José', e: '🌾' }, { t: 'Noé', e: '🕊️' }], ref: 'Gênesis 12.1 (NAA)' },
  { q: 'Quem foi vendido pelos irmãos e depois salvou o Egito da fome?', right: { t: 'José', e: '🌾' }, wrongs: [{ t: 'Moisés', e: '🗿' }, { t: 'Samuel', e: '📜' }, { t: 'Davi', e: '🎯' }, { t: 'Josué', e: '⚔️' }], ref: 'Gênesis 37.28 (NAA)' },
  { q: 'A história de José do Egito está em qual livro?', right: { t: 'Gênesis', e: '📖' }, wrongs: [{ t: 'Êxodo', e: '🏜️' }, { t: 'Números', e: '🔢' }, { t: 'Josué', e: '⚔️' }, { t: 'Juízes', e: '🎗️' }], ref: 'Gênesis 37.28 (NAA)' },
  { q: 'Quem foi colocado num cesto no rio e depois libertou Israel do Egito?', right: { t: 'Moisés', e: '🗿' }, wrongs: [{ t: 'Arão', e: '🪔' }, { t: 'José', e: '🌾' }, { t: 'Josué', e: '⚔️' }, { t: 'Gideão', e: '🌿' }], ref: 'Êxodo 2.3 (NAA)' },
  { q: 'Em qual livro a Bíblia conta a saída do Egito?', right: { t: 'Êxodo', e: '🏜️' }, wrongs: [{ t: 'Gênesis', e: '🌀' }, { t: 'Levítico', e: '📜' }, { t: 'Deuteronômio', e: '📖' }, { t: 'Josué', e: '⚔️' }], ref: 'Êxodo 12.41 (NAA)' },
  { q: 'Quem tocou as trombetas e as muralhas de Jericó caíram?', right: { t: 'Josué', e: '⚔️' }, wrongs: [{ t: 'Moisés', e: '🗿' }, { t: 'Sansão', e: '💪' }, { t: 'Gideão', e: '🌿' }, { t: 'Samuel', e: '📜' }], ref: 'Josué 6.20 (NAA)' },
  { q: 'Quem derrubou o gigante Golias com uma pedra e uma funda?', right: { t: 'Davi', e: '🎯' }, wrongs: [{ t: 'Saul', e: '👑' }, { t: 'Salomão', e: '🦉' }, { t: 'Sansão', e: '💪' }, { t: 'Josué', e: '⚔️' }], ref: '1 Samuel 17.49 (NAA)' },
  { q: 'A história de Davi e Golias está em qual livro?', right: { t: '1 Samuel', e: '📖' }, wrongs: [{ t: '2 Samuel', e: '📜' }, { t: '1 Reis', e: '👑' }, { t: '2 Reis', e: '🏰' }, { t: '1 Crônicas', e: '📚' }], ref: '1 Samuel 17.49 (NAA)' },
  // ------- Trecho 2: profetas, reis e escolhidos -------
  { q: 'Quem foi engolido por um grande peixe quando fugiu de Deus?', right: { t: 'Jonas', e: '🐋' }, wrongs: [{ t: 'Elias', e: '⚡' }, { t: 'Eliseu', e: '🐻' }, { t: 'Daniel', e: '🦁' }, { t: 'Jeremias', e: '😢' }], ref: 'Jonas 1.17 (NAA)' },
  { q: 'A história de Jonas dentro do grande peixe está em qual livro?', right: { t: 'Jonas', e: '🐋' }, wrongs: [{ t: 'Oseias', e: '🤍' }, { t: 'Joel', e: '🌾' }, { t: 'Amós', e: '🐑' }, { t: 'Miqueias', e: '🏔️' }], ref: 'Jonas 1.17 (NAA)' },
  { q: 'Quem subiu ao céu num carro de fogo?', right: { t: 'Elias', e: '⚡' }, wrongs: [{ t: 'Eliseu', e: '🐻' }, { t: 'Moisés', e: '🗿' }, { t: 'Samuel', e: '📜' }, { t: 'Davi', e: '🎯' }], ref: '2 Reis 2.11 (NAA)' },
  { q: 'Depois que Elias subiu ao céu, quem recebeu o seu manto?', right: { t: 'Eliseu', e: '🧥' }, wrongs: [{ t: 'Isaías', e: '📖' }, { t: 'Samuel', e: '📜' }, { t: 'Jeremias', e: '😢' }, { t: 'Ezequiel', e: '👁️' }], ref: '2 Reis 2.13 (NAA)' },
  { q: 'As histórias de Elias e Eliseu estão em qual livro?', right: { t: '2 Reis', e: '🏰' }, wrongs: [{ t: '1 Reis', e: '👑' }, { t: '2 Samuel', e: '📖' }, { t: '1 Crônicas', e: '📚' }, { t: '2 Crônicas', e: '🗞️' }], ref: '2 Reis 2.11 (NAA)' },
  { q: 'Quem mandou uma ursa atacar os garotos que zombavam dele?', right: { t: 'Eliseu', e: '🐻' }, wrongs: [{ t: 'Elias', e: '⚡' }, { t: 'Josué', e: '⚔️' }, { t: 'Sansão', e: '💪' }, { t: 'Gideão', e: '🌿' }], ref: '2 Reis 2.24 (NAA)' },
  { q: 'Quem foi lançado na cova dos leões e saiu vivo porque confiou em Deus?', right: { t: 'Daniel', e: '🦁' }, wrongs: [{ t: 'Jonas', e: '🐋' }, { t: 'Sadraque', e: '🔥' }, { t: 'José', e: '🌾' }, { t: 'Davi', e: '🎯' }], ref: 'Daniel 6.22 (NAA)' },
  { q: 'A história de Daniel na cova dos leões está em qual livro?', right: { t: 'Daniel', e: '🦁' }, wrongs: [{ t: 'Ezequiel', e: '👁️' }, { t: 'Jeremias', e: '😢' }, { t: 'Jonas', e: '🐋' }, { t: 'Oseias', e: '🤍' }], ref: 'Daniel 6.22 (NAA)' },
  { q: 'Quem foi o rei mais sábio de Israel, filho de Davi?', right: { t: 'Salomão', e: '🦉' }, wrongs: [{ t: 'Saul', e: '👑' }, { t: 'Josias', e: '📖' }, { t: 'Ezequias', e: '🙏' }, { t: 'Davi', e: '🎯' }], ref: '1 Reis 3.12 (NAA)' },
  { q: 'Qual livro traz os conselhos sábios de Salomão?', right: { t: 'Provérbios', e: '📜' }, wrongs: [{ t: 'Salmos', e: '🎵' }, { t: 'Eclesiastes', e: '🍃' }, { t: 'Cantares', e: '💕' }, { t: 'Jó', e: '🤔' }], ref: 'Provérbios 1.7 (NAA)' },
  // ------- Trecho 3: Jesus, apóstolos e o Novo Testamento -------
  { q: 'Quem nasceu numa manjedoura em Belém?', right: { t: 'Jesus', e: '🎄' }, wrongs: [{ t: 'João Batista', e: '🐫' }, { t: 'Pedro', e: '🎣' }, { t: 'Paulo', e: '📜' }, { t: 'José', e: '🪚' }], ref: 'Lucas 2.7 (NAA)' },
  { q: 'Quem contou sobre os pastores que visitaram o menino Jesus?', right: { t: 'Lucas', e: '📖' }, wrongs: [{ t: 'Mateus', e: '📜' }, { t: 'Marcos', e: '⚒️' }, { t: 'João', e: '🕊️' }, { t: 'Atos', e: '⛵' }], ref: 'Lucas 2.8-16 (NAA)' },
  { q: 'Quem contou sobre os sábios do Oriente que seguiram a estrela?', right: { t: 'Mateus', e: '⭐' }, wrongs: [{ t: 'Lucas', e: '📖' }, { t: 'Marcos', e: '⚒️' }, { t: 'João', e: '🕊️' }, { t: 'Apocalipse', e: '🌟' }], ref: 'Mateus 2.1-2 (NAA)' },
  { q: 'Quem batizou Jesus no rio Jordão?', right: { t: 'João Batista', e: '🐫' }, wrongs: [{ t: 'Pedro', e: '🎣' }, { t: 'Paulo', e: '📜' }, { t: 'André', e: '🫂' }, { t: 'Tomé', e: '🤔' }], ref: 'Mateus 3.13-16 (NAA)' },
  { q: 'Quem andou sobre as águas com Jesus depois de sair do barco?', right: { t: 'Pedro', e: '🚶' }, wrongs: [{ t: 'João', e: '🕊️' }, { t: 'Tiago', e: '⚓' }, { t: 'Tomé', e: '🤔' }, { t: 'Judas', e: '🪙' }], ref: 'Mateus 14.29 (NAA)' },
  { q: 'Quem traiu Jesus por 30 moedas de prata?', right: { t: 'Judas', e: '🪙' }, wrongs: [{ t: 'Pedro', e: '🎣' }, { t: 'João', e: '🕊️' }, { t: 'Tomé', e: '🤔' }, { t: 'Filipe', e: '👥' }], ref: 'Mateus 26.15 (NAA)' },
  { q: 'Em qual livro o Espírito Santo desceu sobre os discípulos?', right: { t: 'Atos', e: '⛵' }, wrongs: [{ t: 'Romanos', e: '✉️' }, { t: '1 Coríntios', e: '✉️' }, { t: 'Gálatas', e: '✉️' }, { t: 'Efésios', e: '✉️' }], ref: 'Atos 2.1-4 (NAA)' },
  { q: 'A criação do céu e da terra está em qual livro?', right: { t: 'Gênesis', e: '🌀' }, wrongs: [{ t: 'Êxodo', e: '🏜️' }, { t: 'Salmos', e: '🎵' }, { t: 'Jó', e: '🤔' }, { t: 'Apocalipse', e: '🌟' }], ref: 'Gênesis 1.1 (NAA)' },
  { q: 'Quem viu Jesus no caminho de Damasco e virou apóstolo?', right: { t: 'Paulo', e: '📜' }, wrongs: [{ t: 'Pedro', e: '🎣' }, { t: 'Barnabé', e: '🤝' }, { t: 'Estêvão', e: '🪨' }, { t: 'Mateus', e: '📖' }], ref: 'Atos 9.3-6 (NAA)' },
  { q: 'Qual é o último livro da Bíblia, que fala do novo céu e da nova terra?', right: { t: 'Apocalipse', e: '🌟' }, wrongs: [{ t: 'Gênesis', e: '🌀' }, { t: 'Atos', e: '⛵' }, { t: 'Romanos', e: '✉️' }, { t: 'Salmos', e: '🎵' }], ref: 'Apocalipse 21.1 (NAA)' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Monta a pergunta com as 5 opções já embaralhadas (a certa muda de posição). */
function prepare(q: Question): PreparedQuestion {
  return { ...q, options: shuffle([q.right, ...q.wrongs]) };
}

function pathOf(trecho: number): PreparedQuestion[] {
  return QUESTIONS.slice((trecho - 1) * QUESTIONS_PER_TRECHO, trecho * QUESTIONS_PER_TRECHO).map(
    prepare,
  );
}

/** Posição (%) de um passo na trilha, com folga para não encostar nas bordas. */
function trailPct(step: number): number {
  return 4 + (step / STEPS) * 92;
}

export default function GameHeroisDaBiblia({ onExit }: GameProps) {
  const [trecho, setTrecho] = useState(() =>
    nextUnfinishedLevel(loadLevels(), 'herois-da-biblia', TOTAL_TRECHOS),
  );
  const [queue, setQueue] = useState<PreparedQuestion[]>(() => shuffle(pathOf(trecho)));
  const [step, setStep] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [vidas, setVidas] = useState(MAX_VIDAS);
  const [score, setScore] = useState(0);
  const [record, setRecord] = useState(() => bestScore('herois-da-biblia'));
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [msg, setMsg] = useState<{ text: string; good: boolean; ref?: string } | null>(null);
  const [paused, setPaused] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [levels, setLevels] = useState<ProgressMap>(loadLevels);
  const [showHand, setShowHand] = useState(isFirstTime);
  const [smallKids] = useState(isSmallKidsMode);
  const reducedMotion = usePrefersReducedMotion();
  const recorded = useRef<Set<number>>(new Set());
  const stageRef = useRef<HTMLDivElement>(null);

  const isLast = trecho === TOTAL_TRECHOS;
  const heroState = won ? 'happy' : gameOver ? 'sad' : step > 0 ? 'walk' : 'idle';

  /** Ponto do elemento clicado convertido para o espaço do palco (base do fx). */
  function localPoint(ev: { currentTarget: HTMLElement }) {
    const box = stageRef.current?.getBoundingClientRect();
    const r = ev.currentTarget.getBoundingClientRect();
    return {
      x: r.left + r.width / 2 - (box?.left ?? 0),
      y: r.top + r.height / 2 - (box?.top ?? 0),
    };
  }

  function starsFrom(errCount: number): number {
    return errCount === 0 ? 3 : errCount === 1 ? 2 : 1;
  }

  function answer(chosen: Choice, ev: { currentTarget: HTMLElement }) {
    if (won || paused || gameOver || queue.length === 0) return;

    if (showHand) {
      setShowHand(false);
      markPlayed();
    }

    const isRight = chosen === current.right;
    const stage = stageRef.current;
    const { x, y } = localPoint(ev);

    if (isRight) {
      sfx.correct(streak);
      const next = Math.min(STEPS, step + 1);
      const nextStreak = streak + 1;
      const gained = PTS_CORRETO + Math.min(Math.max(nextStreak - 1, 0), 4) * PTS_BONUS_SEQUENCIA;
      burst(stage, x, y, { kind: 'spark', count: nextStreak >= 3 ? 18 : 12 });
      flyNumber(stage, x, y, `+${gained}`);
      setStreak(nextStreak);
      setScore((s) => s + gained);
      setMsg({
        good: true,
        ref: current.ref,
        text:
          nextStreak >= 4
            ? `Você conhece a Bíblia demais! 🌟 +${gained} pts`
            : nextStreak >= 2
              ? `Resposta certa ×${nextStreak}! +${gained} pts`
              : `Muito bem, continue assim! +${gained} pts`,
      });
      if (next === STEPS) {
        setStep(next);
        finishTrecho(score + gained);
        return;
      }
      if (next === 2 || next === 3) sfx.pop();
      setStep(next);
    } else {
      // Errar custa UMA coisa só: uma vida. Sem perder pontos nem voltar passo —
      // punição tripla era castigo, não jogo (G7).
      sfx.wrong();
      burst(stage, x, y, { kind: 'puff', count: 8, spread: 24 });
      shake(stage);
      setWrongCount((c) => c + 1);
      setStreak(0);
      const remaining = vidas - 1;
      setVidas(remaining);
      if (remaining <= 0) {
        setRecord(submitScore('herois-da-biblia', score));
        setGameOver(true);
        setMsg(null);
        sfx.withDuck(sfx.gentle, 1.4);
        music.setIntensity(0);
        voice.speak('Suas vidas acabaram por agora. Respire fundo e tente de novo!');
        return;
      }
      setMsg({
        good: false,
        ref: current.ref,
        text: `Quase! Você perdeu 1 vida — os pontos ficaram guardados. Respire e escolha de novo. 💪`,
      });
      sfx.gentle();
    }

    // próxima pergunta (reembaralha o trecho quando a fila acaba)
    setQueue((qu) => {
      const rest = qu.slice(1);
      return rest.length > 0 ? rest : shuffle(pathOf(trecho));
    });
  }

  function finishTrecho(finalScore: number) {
    const stars = starsFrom(wrongCount);
    if (!recorded.current.has(trecho)) {
      recorded.current.add(trecho);
      setLevels(completeLevel('herois-da-biblia', trecho, stars));
      setRecord(submitScore('herois-da-biblia', finalScore));
      if (isLast) sfx.withDuck(sfx.chapter, 1.9);
      else sfx.withDuck(sfx.win, 1.3);
      sfx.star(stars);
    }
    markPlayed();
    music.playVictory('game');
    voice.speak(
      isLast
        ? 'Parabéns! Você terminou os Heróis da Bíblia!'
        : `Trecho ${trecho} concluído! Você ganhou ${stars} ${stars === 1 ? 'estrela' : 'estrelas'}.`,
    );
    setWon(true);
  }

  function retryTrecho() {
    setQueue(shuffle(pathOf(trecho)));
    setStep(0);
    setStreak(0);
    setWrongCount(0);
    setVidas(MAX_VIDAS);
    setGameOver(false);
    setMsg(null);
    setPaused(false);
    music.play('game');
  }

  /** Troca de trecho — vale para "Próximo nível" e para o mapa. */
  function goToTrecho(t: number) {
    setTrecho(t);
    setQueue(shuffle(pathOf(t)));
    setStep(0);
    setStreak(0);
    setWrongCount(0);
    setVidas(MAX_VIDAS);
    setWon(false);
    setGameOver(false);
    setMsg(null);
    setMapOpen(false);
    setPaused(false);
    music.play('game');
  }

  const current = queue[0];

  // Opções exibidas: a certa sempre presente, 3 no modo pequeninos. Fica em
  // estado para não reembaralhar enquanto a criança pensa.
  const [options, setOptions] = useState<Choice[]>([]);
  useEffect(() => {
    if (!current) {
      setOptions([]);
      return;
    }
    const others = shuffle(current.options.filter((o) => o !== current.right));
    setOptions(shuffle([current.right, ...others.slice(0, smallKids ? 2 : 4)]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, smallKids]);

  // Música adaptativa: camadas entram conforme os acertos seguidos.
  useEffect(() => {
    music.setIntensity(streak >= 3 ? 3 : streak >= 2 ? 2 : streak >= 1 ? 1 : 0);
  }, [streak]);

  // Pausa de verdade: sem narração e sem música de fundo.
  useEffect(() => {
    if (paused) {
      voice.stopSpeaking();
      music.pause();
    } else {
      music.play('game');
    }
  }, [paused]);

  const lastFeedback = useRef(0);
  useEffect(() => {
    if (!msg) return;
    lastFeedback.current = performance.now();
    voice.speak(msg.text);
  }, [msg]);

  useEffect(() => {
    if (won || paused || gameOver || !current) return;
    const recent = performance.now() - lastFeedback.current < 3000;
    const id = window.setTimeout(() => voice.speak(current.q), recent ? 2400 : 400);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.q, won, gameOver, paused]);

  useEffect(() => () => voice.stopSpeaking(), []);

  return (
    <GameShell
      title="Heróis da Bíblia"
      subtitle="3 trechos · 3 vidas por trecho — não deixe as vidas acabarem!"
      onExit={onExit}
      onPause={() => setPaused(true)}
      bg="bg-gradient-to-b from-emerald-950 via-emerald-800 to-amber-200"
      titleClass="text-amber-300"
    >
      {won && !reducedMotion ? (
        <Confetti recycle={false} numberOfPieces={confettiPieces()} gravity={confettiGravity()} />
      ) : null}

      <div aria-live="polite" className="sr-only">
        {won
          ? 'Trecho concluído!'
          : gameOver
            ? 'Fim de jogo! Suas vidas acabaram.'
            : msg
              ? msg.text
              : `${step} de ${STEPS} passos em direção ao conhecimento`}
      </div>

      <div
        ref={stageRef}
        className="relative flex w-full flex-1 flex-col items-center justify-center gap-5 overflow-hidden px-4 pb-8"
      >
        {/* parallax: poeira de luz subindo + estrelas piscando */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <span
            className="animate-drift absolute top-16 left-[8%] text-4xl opacity-25"
            style={{ animationDuration: '13s' }}
          >
            🕊️
          </span>
          <span
            className="animate-drift absolute top-32 right-[12%] text-3xl opacity-20"
            style={{ animationDuration: '17s', animationDelay: '1.1s' }}
          >
            ✨
          </span>
          <span className="animate-twinkle absolute top-8 left-[42%] text-xl">⭐</span>
          <span
            className="animate-twinkle absolute bottom-24 right-[22%] text-lg opacity-80"
            style={{ animationDelay: '0.8s' }}
          >
            ✨
          </span>
        </div>

        <LevelHUD level={trecho} totalLevels={TOTAL_TRECHOS} step={step} steps={STEPS} />

        <button
          type="button"
          onClick={() => {
            setLevels(loadLevels());
            setMapOpen(true);
          }}
          className="ui-press absolute top-1 right-3 z-30 rounded-full bg-black/45 px-3 py-1 text-xs font-black text-white shadow"
        >
          🗺️ Mapa
        </button>

        {/* ------- trilha do conhecimento ------- */}
        <div className="relative h-56 w-full max-w-2xl">
          {/* livro aberto (começo) */}
          <div className="absolute bottom-2 left-0 z-10 flex flex-col items-start gap-1">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300/20 text-2xl shadow-[0_0_14px_rgba(252,211,77,0.5)]">
              <BookOpen className="h-7 w-7 text-amber-300" />
            </span>
            <span className="rounded-full bg-emerald-900/80 px-3 py-1 text-xs font-black text-amber-200">
              começo
            </span>
          </div>

          {/* sabedoria (fim) */}
          <div className="absolute top-[24%] right-1 flex flex-col items-center">
            <span
              className={`flex h-16 w-16 items-center justify-center rounded-full border-4 border-amber-200 bg-gradient-to-b from-amber-300 to-yellow-400 shadow-[0_0_24px_rgba(252,211,77,0.9)] ${
                won ? 'animate-bounce' : 'animate-pulse'
              }`}
            >
              <BookHeart className="h-9 w-9 text-amber-900" />
            </span>
            <span className="mt-1 rounded-full bg-amber-300/20 px-3 py-1 text-xs font-bold text-amber-100">
              Sabedoria
            </span>
          </div>

          {/* trilha */}
          <div className="absolute top-[52%] left-[4%] right-[4%] h-4 rounded-full bg-gradient-to-r from-emerald-700 via-emerald-500 to-amber-300 shadow-lg" />

          {/* marcadores de passo */}
          {Array.from({ length: STEPS }, (_, i) => i + 1).map((i) => {
            const reached = i <= step;
            return (
              <span
                key={i}
                className={`absolute top-[46%] flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                  reached
                    ? 'scale-110 border-amber-300 bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,0.9)]'
                    : 'border-emerald-500 bg-emerald-700/60'
                }`}
                style={{ left: `${trailPct(i)}%` }}
              >
                {reached ? (
                  <Star className="h-5 w-5 fill-amber-600 text-amber-600" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                )}
              </span>
            );
          })}

          {/* personagem */}
          <div
            className="absolute bottom-[26%] transition-all duration-700 ease-in-out"
            style={{ left: `${trailPct(step)}%` }}
          >
            <div className="-translate-x-1/2">
              <span
                className={`contact-shadow flex h-16 w-16 items-center justify-center rounded-full border-4 shadow-xl transition-colors duration-700 ${
                  won
                    ? 'border-amber-200 bg-gradient-to-b from-amber-300 to-yellow-400'
                    : 'border-emerald-200 bg-gradient-to-b from-emerald-400 to-teal-600'
                }`}
              >
                <Hero state={heroState} size={52} className="drop-shadow" />
              </span>
            </div>
          </div>
        </div>

        {/* badges de gamificação */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span
            className="flex items-center gap-1 rounded-full bg-black/45 px-4 py-1.5 text-base font-black text-amber-200 shadow"
            aria-label={`${vidas} de ${MAX_VIDAS} vidas`}
          >
            {Array.from({ length: MAX_VIDAS }).map((_, i) => (
              <span key={i} className={i < vidas ? '' : 'opacity-25 grayscale'} aria-hidden>
                ❤️
              </span>
            ))}
          </span>
          <span className="rounded-full bg-black/45 px-4 py-1.5 text-base font-black text-yellow-200 shadow">
            ⭐ {score} pts
          </span>
          <span className="rounded-full bg-black/45 px-4 py-1.5 text-base font-black text-amber-200 shadow">
            Ponto {Math.min(step, STEPS)}/{STEPS}
          </span>
          {streak >= 2 && !won ? (
            <span className="animate-pop rounded-full bg-orange-500/80 px-4 py-1.5 text-sm font-black text-white shadow">
              🔥 {streak} seguidas!
            </span>
          ) : null}
          {vidas === 1 && !won && !gameOver ? (
            <span className="animate-pulse rounded-full bg-red-600/90 px-4 py-1.5 text-sm font-black text-white shadow-[0_0_14px_rgba(220,38,38,0.7)]">
              ⚠️ Última vida! Tenha cuidado!
            </span>
          ) : null}
        </div>

        {/* mensagem de feedback */}
        {msg && !won ? (
          <p
            className={`animate-pop max-w-md rounded-3xl px-6 py-3 text-center text-base font-extrabold shadow-lg ${
              msg.good
                ? 'bg-amber-200/90 text-amber-800'
                : 'bg-emerald-900/80 text-emerald-100'
            }`}
          >
            {msg.text}
            {msg.ref ? (
              <span className="mt-1 block text-xs font-bold opacity-80">📖 {msg.ref}</span>
            ) : null}
          </p>
        ) : null}

        {/* ------- pergunta + respostas ------- */}
        {!won && !gameOver && current ? (
          <div className="relative flex w-full max-w-2xl flex-col items-center gap-4">
            <div className="relative w-full rounded-3xl bg-white/95 px-6 py-4 shadow-xl">
              <p className="pr-10 text-center text-xl font-black text-emerald-900">{current.q}</p>
              <button
                type="button"
                onClick={() => voice.speak(current.q)}
                aria-label="Ouvir a pergunta de novo"
                className="ui-press absolute top-1/2 -right-2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg"
              >
                <Volume2 className="h-6 w-6" />
              </button>
            </div>
            <div className="grid w-full grid-cols-2 gap-3">
              {options.map((opt, i) => (
                <button
                  key={opt.t}
                  type="button"
                  onClick={(ev) => answer(opt, ev)}
                  className={`ui-press flex min-h-20 flex-col items-center justify-center gap-1 rounded-3xl border-2 border-slate-200 bg-white px-4 py-3 font-bold text-slate-600 shadow-md hover:scale-105 ${
                    smallKids ? 'text-xl' : 'text-lg'
                  } ${i === options.length - 1 ? 'col-span-2' : ''}`}
                >
                  <span className={smallKids ? 'text-4xl' : 'text-3xl'}>{opt.e}</span> {opt.t}
                </button>
              ))}
            </div>

            {/* onboarding sem texto na primeira vez */}
            {showHand && step === 0 ? (
              <HandHint className="absolute -bottom-2 left-1/2 -translate-x-1/2" size={54} />
            ) : null}
          </div>
        ) : null}

        {/* ------- fim de jogo ------- */}
        {gameOver ? (
          <div className="animate-pop flex flex-col items-center gap-5">
            <p className="rounded-3xl bg-red-950/90 px-8 py-4 text-center text-2xl font-black text-red-200 shadow-[0_0_30px_rgba(239,68,68,0.6)] sm:text-3xl">
              😢 Fim de jogo!
              <span className="mt-1 block text-base font-extrabold text-red-100/85">
                Suas 3 vidas acabaram neste trecho…
              </span>
              <span className="mt-3 block text-xl font-black text-amber-300">
                ⭐ {score} pts
                {record > 0 ? <span className="ml-2 text-sm text-white/70">Recorde: {record} pts</span> : null}
              </span>
            </p>
            <p className="max-w-md text-center text-base font-bold text-white/85">
              Não desista! Os heróis da Bíblia também caíram e se levantaram. 🙌
            </p>
            <button
              type="button"
              onClick={retryTrecho}
              className="ui-press flex items-center gap-3 rounded-full bg-yellow-400 px-10 py-5 text-2xl font-extrabold text-amber-950 shadow-[0_8px_0_rgba(202,138,4,0.9)] hover:scale-105 sm:text-3xl"
            >
              🔄 Tentar de novo
            </button>
            <button
              type="button"
              onClick={onExit}
              className="ui-press rounded-full bg-white/70 px-6 py-2 text-sm font-bold text-slate-700 shadow"
            >
              Outros jogos
            </button>
          </div>
        ) : null}

        {/* ------- trecho vencido ------- */}
        {won ? (
          <div className="animate-pop flex flex-col items-center gap-4">
            <p className="rounded-3xl bg-white/95 px-8 py-4 text-center text-2xl font-black text-amber-500 shadow-[0_0_30px_rgba(252,211,77,0.8)] sm:text-3xl">
              🏆 Você venceu o trecho! 🏆
              <span className="mt-1 block text-base font-extrabold text-emerald-700">
                Cada história da Bíblia é uma luz para o nosso caminho! 💛
              </span>
              <span className="mt-3 block text-xl font-black text-emerald-600">
                ⭐ {score} pts
                {record > 0 ? <span className="ml-2 text-sm text-slate-500">Recorde: {record} pts</span> : null}
              </span>
            </p>
            <LevelDone
              stars={starsFrom(wrongCount)}
              onNext={isLast ? undefined : () => goToTrecho(trecho + 1)}
              onExit={onExit}
              wrong={wrongCount}
              onOpenMap={() => {
                setLevels(loadLevels());
                setMapOpen(true);
              }}
              headline={isLast ? undefined : `Trecho ${trecho} de ${TOTAL_TRECHOS} concluído!`}
              lesson={
                isLast
                  ? 'Você conheceu os heróis da fé! Agora procure cada história na sua Bíblia e guarde o livro onde ela está. 📖✨'
                  : undefined
              }
            />
          </div>
        ) : null}

        <span className="flex items-center gap-1 rounded-full bg-black/45 px-4 py-1 text-xs font-bold text-white/90">
          <Sparkles className="h-4 w-4 text-amber-300" /> cada acerto acende uma luz de sabedoria
        </span>
      </div>

      {mapOpen ? (
        <LevelMap
          title="Escolha o trecho"
          subtitle="Pode rejogar qualquer trecho para conquistar as 3 estrelas!"
          items={TRECHOS.map((t, i) => {
            const n = i + 1;
            const stars = levelBest(levels, 'herois-da-biblia', n);
            return {
              id: String(n),
              label: t.label,
              sublabel: t.sublabel,
              emoji: t.emoji,
              stars,
              maxStars: 3,
              done: stars > 0,
              locked: !isLevelUnlocked(levels, 'herois-da-biblia', n),
            };
          })}
          onPick={(id) => goToTrecho(Number(id))}
          onClose={() => setMapOpen(false)}
        />
      ) : null}

      {paused ? (
        <PauseOverlay
          onResume={() => setPaused(false)}
          onRestart={retryTrecho}
          onExit={onExit}
        />
      ) : null}
    </GameShell>
  );
}