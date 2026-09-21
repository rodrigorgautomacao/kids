import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { CloudFog, Crown, Sparkles, Star, Sun, Volume2 } from 'lucide-react';
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

/** Nome curto de cada trecho — é o que aparece no mapa para a criança escolher. */
const TRECHOS = [
  { label: 'Trecho 1', sublabel: 'Escolhas do dia a dia', emoji: '🌤️' },
  { label: 'Trecho 2', sublabel: 'Verdade e tesouro do céu', emoji: '💛' },
  { label: 'Trecho 3', sublabel: 'Amor, perdão e a Luz', emoji: '🌟' },
];

// 30 perguntas da lição: 3 trechos × 10 (cada uma com 5 opções)
const QUESTIONS: Question[] = [
  { q: 'Você encontra uma moeda no chão…', right: { t: 'Devolvo ao dono', e: '🙂' }, wrongs: [{ t: 'Guardo escondido', e: '😜' }, { t: 'Jogo no lixo', e: '🗑️' }, { t: 'Piso por cima', e: '👟' }, { t: 'Dou para o primeiro que vejo', e: '🎲' }], ref: 'Êxodo 23.4 (NAA)' },
  { q: 'O vaso quebrou sem querer…', right: { t: 'Conto a verdade', e: '💛' }, wrongs: [{ t: 'Digo que não fui eu', e: '🙈' }, { t: 'Escondo os cacos', e: '🕳️' }, { t: 'Culpo o gato', e: '🐱' }, { t: 'Saio correndo', e: '🏃' }], ref: 'Efésios 4.25 (NAA)' },
  { q: 'Tem 3 doces e 3 amigos…', right: { t: 'Divido um pra cada', e: '🍬' }, wrongs: [{ t: 'Pego tudo pra mim', e: '🫣' }, { t: 'Divido só com um amigo', e: '🤏' }, { t: 'Escondo os doces', e: '🎁' }, { t: 'Corro e abro tudo', e: '⚡' }], ref: 'Hebreus 13.16 (NAA)' },
  { q: 'A turma quer deixar um amigo de fora…', right: { t: 'Fico com o amigo', e: '🤝' }, wrongs: [{ t: 'Vou junto e deixo ele', e: '🏃' }, { t: 'Rio dele junto com a turma', e: '🤭' }, { t: 'Finjo que não vi', e: '🙈' }, { t: 'Fico quieto e não ajudo', e: '🤐' }], ref: 'Provérbios 17.17 (NAA)' },
  { q: 'Quando você conta mentira…', right: { t: 'O coração pesa', e: '💙' }, wrongs: [{ t: 'Fica leve e feliz', e: '🎈' }, { t: 'Ninguém nunca fica sabendo', e: '🕵️' }, { t: 'É só uma brincadeira', e: '🪀' }, { t: 'Deus nem percebe', e: '🌫️' }], ref: 'Salmos 32.3 (NAA)' },
  { q: 'Uma boa escolha brilha como…', right: { t: 'Uma estrela', e: '⭐' }, wrongs: [{ t: 'Uma pedra', e: '🪨' }, { t: 'Uma nuvem cinza', e: '☁️' }, { t: 'Uma meia velha', e: '🧦' }, { t: 'Um brinquedo quebrado', e: '🧸' }], ref: 'Mateus 5.16 (NAA)' },
  { q: 'Seu nome está guardado no…', right: { t: 'Livro da Vida', e: '📖' }, wrongs: [{ t: 'Chão do quarto', e: '🪑' }, { t: 'Caderno do colega', e: '📓' }, { t: 'Lixo da escola', e: '🗑️' }, { t: 'Bolo do aniversário', e: '🎂' }], ref: 'Apocalipse 3.5 (NAA)' },
  { q: 'Quando você erra, Deus…', right: { t: 'Sempre pronto a perdoar', e: '🥹' }, wrongs: [{ t: 'Vai embora pra sempre', e: '😢' }, { t: 'Para de te amar', e: '💔' }, { t: 'Esquece de você', e: '🫥' }, { t: 'Grita com você', e: '📢' }], ref: '1 João 1.9 (NAA)' },
  { q: 'O caminho da luz leva para…', right: { t: 'Perto de Deus', e: '☀️' }, wrongs: [{ t: 'Para longe de Deus', e: '🌫️' }, { t: 'Uma caverna escura', e: '🕳️' }, { t: 'Uma casa abandonada', e: '🏚️' }, { t: 'O fim do mundo', e: '🌍' }], ref: 'João 8.12 (NAA)' },
  { q: 'A alegria fica maior quando…', right: { t: 'A gente divide', e: '🎉' }, wrongs: [{ t: 'Fica sozinho', e: '🔒' }, { t: 'Esconde o brinquedo', e: '🎠' }, { t: 'Guarda tudo no armário', e: '🚪' }, { t: 'Não chama ninguém', e: '🙅' }], ref: 'Atos 20.35 (NAA)' },
  { q: 'O moço te deu troco a mais…', right: { t: 'Devolvo o troco', e: '💵' }, wrongs: [{ t: 'Guardo e saio', e: '🏃' }, { t: 'Compro balas com ele', e: '🍭' }, { t: 'Faço de conta que não vi', e: '😶' }, { t: 'Divido com os amigos', e: '👥' }], ref: 'Lucas 19.8 (NAA)' },
  { q: 'Você acha uma carteira no parque…', right: { t: 'Entrego a um adulto', e: '👮' }, wrongs: [{ t: 'Escondo para mim', e: '🥷' }, { t: 'Abro para olhar', e: '🔍' }, { t: 'Deixo no mesmo lugar', e: '🪑' }, { t: 'Jogo longe', e: '⚽' }], ref: 'Deuteronômio 22.1-3 (NAA)' },
  { q: 'Nota de 50 no chão do mercado…', right: { t: 'Entrego no caixa', e: '💛' }, wrongs: [{ t: 'Pego bem rápido', e: '🫥' }, { t: 'Escondo no bolso', e: '🥋' }, { t: 'Compro doces', e: '🍬' }, { t: 'Conto para todo mundo', e: '📣' }], ref: 'Lucas 16.10 (NAA)' },
  { q: 'O vendedor te deu um doce a mais…', right: { t: 'Devolvo o doce', e: '🍭' }, wrongs: [{ t: 'Como e fico quieto', e: '🤫' }, { t: 'Guardo para depois', e: '🎁' }, { t: 'Reparto escondido', e: '🤐' }, { t: 'Digo que veio assim', e: '🙄' }], ref: 'Levítico 19.11 (NAA)' },
  { q: 'Contar a verdade deixa Deus…', right: { t: 'Feliz!', e: '😄' }, wrongs: [{ t: 'Triste e longe', e: '😞' }, { t: 'Bravo com você', e: '😤' }, { t: 'Indiferente', e: '😐' }, { t: 'Confuso', e: '😵' }], ref: 'Provérbios 12.22 (NAA)' },
  { q: 'Quem é digno de confiança?', right: { t: 'Quem diz a verdade', e: '🫶' }, wrongs: [{ t: 'Quem engana', e: '🎭' }, { t: 'Quem esconde tudo', e: '🫥' }, { t: 'Quem culpa os outros', e: '👉' }, { t: 'Quem inventa histórias', e: '🪄' }], ref: 'Provérbios 13.5 (NAA)' },
  { q: 'A mentirinha de todo dia…', right: { t: 'Cresce e pesa', e: '🌱' }, wrongs: [{ t: 'Desaparece sozinha', e: '🪄' }, { t: 'Faz bem para todos', e: '😇' }, { t: 'É só uma conversa', e: '🗨️' }, { t: 'Ajuda nas brincadeiras', e: '🎠' }], ref: 'Provérbios 12.19 (NAA)' },
  { q: 'O que é tesouro no céu?', right: { t: 'As boas ações', e: '🏆' }, wrongs: [{ t: 'O dinheiro escondido', e: '💰' }, { t: 'Os brinquedos novos', e: '🎮' }, { t: 'As fotos famosas', e: '📸' }, { t: 'O que é guardado a sete chaves', e: '🗄️' }], ref: 'Mateus 6.20 (NAA)' },
  { q: 'Quem você deve amar?', right: { t: 'Todos, até quem erra', e: '💕' }, wrongs: [{ t: 'Só quem é igual a você', e: '🚫' }, { t: 'Só quem te dá presente', e: '🎁' }, { t: 'Só quem é bonzinho', e: '😇' }, { t: 'Só quem mora perto', e: '🏠' }], ref: 'Mateus 5.44 (NAA)' },
  { q: 'Um colega novo chegou na escola…', right: { t: 'Chamo para brincar', e: '🫂' }, wrongs: [{ t: 'Deixo ele de fora', e: '🙄' }, { t: 'Fico olhando de longe', e: '👀' }, { t: 'Finjo que não vi', e: '🙈' }, { t: 'Vou brincar em outro lugar', e: '🏃' }], ref: 'Romanos 12.13 (NAA)' },
  { q: 'O menorzinho quer jogar com vocês…', right: { t: 'Deixo ele jogar', e: '🤗' }, wrongs: [{ t: 'Digo que não alcança', e: '😤' }, { t: 'Mando pedir outro dia', e: '📅' }, { t: 'Escondo a bola', e: '⚽' }, { t: 'Digo que a vez é minha', e: '🙋' }], ref: 'Romanos 12.10 (NAA)' },
  { q: 'A turma ri de um colega…', right: { t: 'Defendo o colega', e: '🛡️' }, wrongs: [{ t: 'Rio junto', e: '🤭' }, { t: 'Fico olhando calado', e: '🤐' }, { t: 'Tiro foto da cena', e: '📸' }, { t: 'Mudo de lugar', e: '🪑' }], ref: 'Provérbios 31.8-9 (NAA)' },
  { q: 'Perdoar quem te magoou…', right: { t: 'É obedecer a Deus', e: '🕊️' }, wrongs: [{ t: 'É ser fraco', e: '💪' }, { t: 'É perder tempo', e: '⏳' }, { t: 'É dar o braço a torcer', e: '🙅' }, { t: 'É aceitar qualquer coisa', e: '🤷' }], ref: 'Colossenses 3.13 (NAA)' },
  { q: 'Deus prometeu recompensa…', right: { t: 'Eterna, junto dele', e: '👑' }, wrongs: [{ t: 'Só de brinquedo', e: '🎁' }, { t: 'Só de doces', e: '🍬' }, { t: 'Só de medalhas', e: '🏅' }, { t: 'Nunca vai chegar', e: '🌀' }], ref: 'Mateus 25.46 (NAA)' },
  { q: 'O coração que pede perdão…', right: { t: 'Fica leve de novo', e: '🕊️' }, wrongs: [{ t: 'Vira pedra', e: '🪨' }, { t: 'Fica mais pesado', e: '⚓' }, { t: 'Esconde a vergonha', e: '😳' }, { t: 'Afasta-se de Deus', e: '🌫️' }], ref: 'Salmos 32.5 (NAA)' },
  { q: 'Quem faz o bem sem esperar nada…', right: { t: 'Recebe a bênção de Deus', e: '🌈' }, wrongs: [{ t: 'Perde tempo', e: '⏳' }, { t: 'Fica sem nada', e: '🍽️' }, { t: 'É enganado pelos outros', e: '🎭' }, { t: 'Ninguém percebe', e: '🫥' }], ref: 'Provérbios 19.17 (NAA)' },
  { q: 'A maior lição de Jesus foi…', right: { t: 'Amar uns aos outros', e: '❤️' }, wrongs: [{ t: 'Ganhar sempre', e: '🥇' }, { t: 'Guardar tesouros', e: '💰' }, { t: 'Ter muitos amigos', e: '👥' }, { t: 'Gritar mais alto', e: '📢' }], ref: 'João 13.34 (NAA)' },
  { q: 'Seu amigo confiou um segredo…', right: { t: 'Você guarda também', e: '🤐' }, wrongs: [{ t: 'Conta para a turma', e: '🗣️' }, { t: 'Escreve no mural', e: '📝' }, { t: 'Posta no grupo', e: '📱' }, { t: 'Ri com os outros', e: '🤭' }], ref: 'Provérbios 11.13 (NAA)' },
  { q: 'Você quebrou algo sem querer…', right: { t: 'Assumo na hora', e: '🙋' }, wrongs: [{ t: 'Culpo o irmãozinho', e: '😈' }, { t: 'Escondo os pedaços', e: '🕳️' }, { t: 'Saio andando', e: '🚶' }, { t: 'Digo que já estava quebrado', e: '🪚' }], ref: 'Provérbios 28.13 (NAA)' },
  { q: 'O final da Estrada da Luz é…', right: { t: 'Estar com Deus para sempre', e: '🌟' }, wrongs: [{ t: 'Caminhar sem fim', e: '🌀' }, { t: 'Voltar para o começo', e: '↩️' }, { t: 'Parar no escuro', e: '🌑' }, { t: 'Acordar de um sonho', e: '💤' }], ref: 'Apocalipse 21.3-4 (NAA)' },
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

export default function GameEstradaDaLuz({ onExit }: GameProps) {
  const [trecho, setTrecho] = useState(() =>
    nextUnfinishedLevel(loadLevels(), 'estrada-da-luz', TOTAL_TRECHOS),
  );
  const [queue, setQueue] = useState<PreparedQuestion[]>(() => shuffle(pathOf(trecho)));
  const [step, setStep] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [won, setWon] = useState(false);
  const [msg, setMsg] = useState<{ text: string; good: boolean; ref?: string } | null>(null);
  const [paused, setPaused] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [levels, setLevels] = useState<ProgressMap>(loadLevels);
  // Onboarding sem texto: só na primeiríssima vez que a criança abre um jogo.
  const [showHand, setShowHand] = useState(isFirstTime);
  // Modo pequeninos: pré-leitores escolhem entre 3 opções grandes (G9).
  const [smallKids] = useState(isSmallKidsMode);
  const reducedMotion = usePrefersReducedMotion();
  const recorded = useRef<Set<number>>(new Set());
  const stageRef = useRef<HTMLDivElement>(null);

  const isLast = trecho === TOTAL_TRECHOS;
  const heroState = won ? 'happy' : step > 0 ? 'walk' : 'idle';

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
    return errCount === 0 ? 3 : errCount <= 3 ? 2 : 1;
  }

  function answer(chosen: Choice, ev: { currentTarget: HTMLElement }) {
    if (won || paused || queue.length === 0) return;

    if (showHand) {
      setShowHand(false);
      markPlayed();
    }

    const isRight = chosen === current.right;
    const stage = stageRef.current;
    const { x, y } = localPoint(ev);

    if (isRight) {
      sfx.correct(streak);
      burst(stage, x, y, { kind: 'spark', count: streak >= 3 ? 18 : 12 });
      flyNumber(stage, x, y, '+1');
      const next = Math.min(STEPS, step + 1);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setMsg({
        good: true,
        ref: current.ref,
        text:
          nextStreak >= 4
            ? 'Você está brilhando como estrela! 🌟'
            : nextStreak >= 2
              ? `Caminho certo ×${nextStreak}!`
              : 'Mais perto da luz! ✨',
      });
      if (next === STEPS) {
        setStep(next);
        finishTrecho();
        return;
      }
      if (next === 2 || next === 3) sfx.pop();
      setStep(next);
    } else {
      sfx.wrong();
      burst(stage, x, y, { kind: 'puff', count: 8, spread: 24 });
      shake(stage);
      setWrongCount((c) => c + 1);
      setStreak(0);
      // Punição única (G7): o erro só escurece o cenário e zera a sequência —
      // não recua o passo nem tira pontos. Castigo triplo desanima, não ensina.
      setMsg({
        good: false,
        ref: current.ref,
        text: 'Opa… o erro escurece o caminho um pouquinho. Mas Deus continua te esperando — escolha o certo e siga! 🙏',
      });
    }

    // próxima pergunta (reembaralha o trecho quando a fila acaba)
    setQueue((qu) => {
      const rest = qu.slice(1);
      return rest.length > 0 ? rest : shuffle(pathOf(trecho));
    });
  }

  function finishTrecho() {
    const stars = starsFrom(wrongCount);
    if (!recorded.current.has(trecho)) {
      recorded.current.add(trecho);
      setLevels(completeLevel('estrada-da-luz', trecho, stars));
      // Capítulo completo tem jingle próprio; nível comum tem fanfarra curta.
      if (isLast) sfx.withDuck(sfx.chapter, 1.9);
      else sfx.withDuck(sfx.win, 1.3);
      sfx.star(stars);
    }
    markPlayed();
    music.playVictory('game');
    voice.speak(
      isLast
        ? 'Parabéns! Você chegou ao fim da Estrada da Luz!'
        : `Trecho ${trecho} concluído! Você ganhou ${stars} ${stars === 1 ? 'estrela' : 'estrelas'}.`,
    );
    setWon(true);
  }

  /** Troca de trecho — vale tanto para "Próximo nível" quanto para o mapa. */
  function goToTrecho(t: number) {
    setTrecho(t);
    setQueue(shuffle(pathOf(t)));
    setStep(0);
    setStreak(0);
    setWrongCount(0);
    setWon(false);
    setMsg(null);
    setMapOpen(false);
    setPaused(false);
    music.play('game');
  }

  const current = queue[0];

  // Opções exibidas: mantém a certa sempre presente e reduz para 3 no modo
  // pequeninos. Fica em estado para NÃO reembaralhar a cada render (a criança
  // veria os botões trocarem de lugar enquanto pensa).
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

  // Música adaptativa: as camadas sobem conforme os acertos seguidos.
  useEffect(() => {
    music.setIntensity(streak >= 3 ? 3 : streak >= 2 ? 2 : streak >= 1 ? 1 : 0);
  }, [streak]);

  // Pausa de verdade: sem narração, sem música de fundo e sem aceitar resposta.
  useEffect(() => {
    if (paused) {
      voice.stopSpeaking();
      music.pause();
    } else {
      music.play('game');
    }
  }, [paused]);

  // Narração do feedback (declarada antes da pergunta para marcar o horário).
  const lastFeedback = useRef(0);
  useEffect(() => {
    if (!msg) return;
    lastFeedback.current = performance.now();
    voice.speak(msg.text);
  }, [msg]);

  // Narração da pergunta: se acabou de sair um feedback, espera ele terminar.
  useEffect(() => {
    if (won || paused || !current) return;
    const recent = performance.now() - lastFeedback.current < 3000;
    const id = window.setTimeout(() => voice.speak(current.q), recent ? 2400 : 400);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.q, won, paused]);

  // Sai de cena sem deixar a voz falando sozinha.
  useEffect(() => () => voice.stopSpeaking(), []);

  return (
    <GameShell
      title="A Estrada da Luz"
      subtitle="3 trechos · Responda certo e caminhe até a luz!"
      onExit={onExit}
      onPause={() => setPaused(true)}
      bg="bg-gradient-to-b from-indigo-950 via-violet-800 to-amber-200"
      titleClass="text-yellow-300"
    >
      {won && !reducedMotion ? (
        <Confetti recycle={false} numberOfPieces={confettiPieces()} gravity={confettiGravity()} />
      ) : null}

      <div aria-live="polite" className="sr-only">
        {won
          ? 'Trecho concluído!'
          : msg
            ? msg.text
            : `${step} de ${STEPS} passos em direção à luz`}
      </div>

      <div
        className="pointer-events-none fixed inset-0 bg-gradient-to-r from-indigo-950 via-slate-950 to-slate-900 transition-opacity duration-1000"
        style={{ opacity: wrongCount > 0 ? Math.min(wrongCount * 0.07, 0.4) : 0 }}
      />

      <div
        ref={stageRef}
        className="relative flex w-full flex-1 flex-col items-center justify-center gap-5 overflow-hidden px-4 pb-8"
      >
        {/* parallax: nuvens em duas velocidades + estrelas piscando */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <span
            className="animate-drift absolute top-10 left-[6%] text-5xl opacity-25"
            style={{ animationDuration: '12s' }}
          >
            ☁️
          </span>
          <span
            className="animate-drift absolute top-28 right-[10%] text-3xl opacity-20"
            style={{ animationDuration: '16s', animationDelay: '1.4s' }}
          >
            ☁️
          </span>
          <span className="animate-twinkle absolute top-6 right-[38%] text-xl">✨</span>
          <span
            className="animate-twinkle absolute bottom-20 left-[18%] text-lg opacity-80"
            style={{ animationDelay: '0.9s' }}
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

        {/* ------- trilha ------- */}
        <div className="relative h-60 w-full max-w-2xl">
          {/* escuridão (fica mais escura a cada erro) */}
          <div className="absolute bottom-2 left-0 z-10 flex flex-col items-start gap-1">
            <div className="flex items-center gap-1">
              <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-2xl shadow-[0_0_16px_rgba(100,116,139,0.6)]">
                <CloudFog className="h-7 w-7 text-slate-400" />
                {wrongCount >= 3 ? (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 animate-ping rounded-full bg-slate-400/90" />
                ) : null}
              </span>
              {Array.from({ length: Math.min(wrongCount, 3) }).map((_, i) => (
                <span
                  key={i}
                  className="animate-pop text-2xl drop-shadow-[0_0_8px_rgba(100,116,139,0.8)]"
                  style={{ animationDelay: `${i * 130}ms` }}
                >
                  🌫️
                </span>
              ))}
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-black shadow ${
                wrongCount > 0
                  ? 'animate-pulse bg-slate-600/90 text-white'
                  : 'bg-slate-800/80 text-slate-300'
              }`}
            >
              escuridão
            </span>
          </div>

          {/* portão de luz */}
          <div className="absolute top-[26%] right-1 flex flex-col items-center">
            <Sun
              className={`h-14 w-14 text-yellow-300 drop-shadow-[0_0_18px_rgba(253,224,71,0.9)] ${
                won ? 'animate-spin' : 'animate-pulse'
              }`}
            />
            <Crown className="-mt-2 h-7 w-7 text-amber-300" />
            <span className="mt-1 rounded-full bg-yellow-300/20 px-3 py-1 text-xs font-bold text-yellow-100">
              A Luz
            </span>
          </div>

          {/* trilha */}
          <div className="absolute top-[52%] left-[4%] right-[4%] h-4 rounded-full bg-gradient-to-r from-slate-700 via-slate-500 to-yellow-300 shadow-lg" />

          {/* marcadores de passo */}
          {Array.from({ length: STEPS }, (_, i) => i + 1).map((i) => {
            const reached = i <= step;
            return (
              <span
                key={i}
                className={`absolute top-[46%] flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                  reached
                    ? 'scale-110 border-yellow-300 bg-yellow-300 shadow-[0_0_14px_rgba(253,224,71,0.9)]'
                    : 'border-slate-500 bg-slate-600/60'
                }`}
                style={{ left: `${trailPct(i)}%` }}
              >
                {reached ? (
                  <Star className="h-5 w-5 fill-amber-600 text-amber-600" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
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
                    ? 'border-yellow-200 bg-gradient-to-b from-yellow-300 to-amber-400'
                    : 'border-sky-200 bg-gradient-to-b from-sky-400 to-indigo-500'
                }`}
              >
                <Hero state={heroState} size={52} className="drop-shadow" />
              </span>
            </div>
          </div>
        </div>

        {/* badges de gamificação */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-full bg-black/45 px-4 py-1.5 text-base font-black text-yellow-200 shadow">
            Ponto {Math.min(step, STEPS)}/{STEPS}
          </span>
          {streak >= 2 && !won ? (
            <span className="animate-pop rounded-full bg-orange-500/80 px-4 py-1.5 text-sm font-black text-white shadow">
              🔥 {streak} seguidas!
            </span>
          ) : null}
          {wrongCount >= 2 && !won ? (
            <span className="animate-pulse rounded-full bg-slate-600/90 px-4 py-1.5 text-sm font-black text-white shadow-[0_0_14px_rgba(100,116,139,0.7)]">
              🌫️ O caminho ficou escuro — escolha a Luz!
            </span>
          ) : null}
        </div>

        {/* mensagem de feedback */}
        {msg && !won ? (
          <p
            className={`animate-pop max-w-md rounded-3xl px-6 py-3 text-center text-base font-extrabold shadow-lg ${
              msg.good
                ? 'bg-yellow-200/90 text-amber-800'
                : 'bg-slate-800/80 text-slate-100'
            }`}
          >
            {msg.text}
            {msg.ref ? (
              <span className="mt-1 block text-xs font-bold opacity-80">📖 {msg.ref}</span>
            ) : null}
          </p>
        ) : null}

        {/* ------- pergunta + respostas ------- */}
        {!won && current ? (
          <div className="relative flex w-full max-w-2xl flex-col items-center gap-4">
            <div className="relative w-full rounded-3xl bg-white/95 px-6 py-4 shadow-xl">
              <p className="pr-10 text-center text-xl font-black text-indigo-900">{current.q}</p>
              <button
                type="button"
                onClick={() => voice.speak(current.q)}
                aria-label="Ouvir a pergunta de novo"
                className="absolute top-1/2 -right-2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg transition-transform active:scale-95"
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

            {/* onboarding sem texto: a mãozinha mostra onde tocar na 1ª vez */}
            {showHand && step === 0 ? (
              <HandHint className="absolute -bottom-2 left-1/2 -translate-x-1/2" size={54} />
            ) : null}
          </div>
        ) : null}

        {/* ------- trecho vencido ------- */}
        {won ? (
          <div className="animate-pop flex flex-col items-center gap-4">
            <p className="rounded-3xl bg-white/95 px-8 py-4 text-center text-2xl font-black text-amber-500 shadow-[0_0_30px_rgba(253,224,71,0.8)] sm:text-3xl">
              🏆 Você chegou à Luz! 🏆
              <span className="mt-1 block text-base font-extrabold text-indigo-700">
                Se você errou no caminho? A luz sempre te espera de volta! 💛
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
                  ? 'Você chegou ao fim da Estrada da Luz! Quem faz o certo tem a recompensa eterna pertinho de Deus! 👑'
                  : undefined
              }
            />
          </div>
        ) : null}

        <span className="flex items-center gap-1 rounded-full bg-black/45 px-4 py-1 text-xs font-bold text-white/90">
          <Sparkles className="h-4 w-4 text-yellow-300" /> cada passo certo é a luz de Deus no caminho
        </span>
      </div>

      {mapOpen ? (
        <LevelMap
          title="Escolha o trecho"
          subtitle="Pode rejogar qualquer trecho para conquistar as 3 estrelas!"
          items={TRECHOS.map((t, i) => {
            const n = i + 1;
            const stars = levelBest(levels, 'estrada-da-luz', n);
            return {
              id: String(n),
              label: t.label,
              sublabel: t.sublabel,
              emoji: t.emoji,
              stars,
              maxStars: 3,
              done: stars > 0,
              locked: !isLevelUnlocked(levels, 'estrada-da-luz', n),
            };
          })}
          onPick={(id) => goToTrecho(Number(id))}
          onClose={() => setMapOpen(false)}
        />
      ) : null}

      {paused ? (
        <PauseOverlay
          onResume={() => setPaused(false)}
          onRestart={() => goToTrecho(trecho)}
          onExit={onExit}
        />
      ) : null}
    </GameShell>
  );
}